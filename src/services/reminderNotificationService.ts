import { notificationService } from './notificationService';
import { todoService } from './todoService';
import { Reminder } from '../types';

export interface ReminderNotification {
  id: string;
  reminderId: string;
  userId: string;
  title: string;
  message: string;
  scheduledFor: Date;
  sentAt?: Date;
  isRead: boolean;
  type: 'reminder' | 'recurring_reminder' | 'overdue_reminder';
}

export class ReminderNotificationService {
  /**
   * Check for reminders that are due and send notifications
   */
  async processDueReminders(): Promise<{ processed: number; sent: number }> {
    try {
      const dueReminders = await todoService.getRemindersDueForNotification();
      let processed = 0;
      let sent = 0;

      for (const reminder of dueReminders) {
        await this.sendReminderNotification(reminder);
        processed++;
        
        // Process recurring reminders
        if (reminder.isRecurring) {
          await this.processRecurringReminder(reminder);
        }
        
        sent++;
      }

      return { processed, sent };
    } catch (error) {
      console.error('Error processing due reminders:', error);
      return { processed: 0, sent: 0 };
    }
  }

  /**
   * Send notification for a specific reminder
   */
  private async sendReminderNotification(reminder: Reminder): Promise<void> {
    try {
      // Create in-app notification
      const notification = {
        id: `reminder-${reminder.id}`,
        type: 'reminder' as const,
        title: `Reminder: ${reminder.title}`,
        message: reminder.description || `This is a reminder for: ${reminder.title}`,
        actionText: 'View Reminder',
        actionLink: '/reminders',
        createdAt: new Date(),
        isRead: false,
        priority: 'high' as const
      };

      // Send notification (integrate with existing notification system)
      await this.sendInAppNotification(reminder.userId, notification);
      
      // Log the reminder notification
      console.log(`Reminder notification sent for: ${reminder.title} to user: ${reminder.userId}`);
    } catch (error) {
      console.error('Error sending reminder notification:', error);
    }
  }

  /**
   * Process recurring reminder by updating its next occurrence
   */
  private async processRecurringReminder(reminder: Reminder): Promise<void> {
    try {
      if (!reminder.recurringPattern) return;

      const currentDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
      const nextDateTime = this.calculateNextRecurrence(currentDateTime, reminder.recurringPattern);
      
      // Update the reminder with the next occurrence
      await todoService.updateReminder(reminder.id, {
        reminderDate: nextDateTime.toISOString().split('T')[0],
        reminderTime: nextDateTime.toTimeString().split(' ')[0].substring(0, 5)
      });

      console.log(`Recurring reminder updated for next occurrence: ${nextDateTime.toISOString()}`);
    } catch (error) {
      console.error('Error processing recurring reminder:', error);
    }
  }

  /**
   * Calculate next recurrence date based on pattern
   */
  private calculateNextRecurrence(currentDateTime: Date, pattern: string): Date {
    const nextDateTime = new Date(currentDateTime);
    
    switch (pattern) {
      case 'daily':
        nextDateTime.setDate(nextDateTime.getDate() + 1);
        break;
      case 'weekly':
        nextDateTime.setDate(nextDateTime.getDate() + 7);
        break;
      case 'monthly':
        nextDateTime.setMonth(nextDateTime.getMonth() + 1);
        break;
      case 'yearly':
        nextDateTime.setFullYear(nextDateTime.getFullYear() + 1);
        break;
      default:
        nextDateTime.setDate(nextDateTime.getDate() + 1); // Default to daily
    }
    
    return nextDateTime;
  }

  /**
   * Send in-app notification (integrate with existing notification system)
   */
  private async sendInAppNotification(userId: string, notification: any): Promise<void> {
    try {
      // This would integrate with your existing notification system
      // For now, we'll log it and you can integrate with your actual notification service
      console.log('In-app notification:', {
        userId,
        notification
      });

      // You could integrate with your existing notificationService here
      // await notificationService.createNotification(notification);
    } catch (error) {
      console.error('Error sending in-app notification:', error);
    }
  }

  /**
   * Get reminder statistics for dashboard
   */
  async getReminderStatistics(userId: string): Promise<{
    total: number;
    active: number;
    recurring: number;
    dueToday: number;
    overdue: number;
    completed: number;
  }> {
    try {
      const reminders = await todoService.getRemindersByUser(userId);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const stats = {
        total: reminders.length,
        active: reminders.filter(r => r.isActive).length,
        recurring: reminders.filter(r => r.isRecurring).length,
        dueToday: reminders.filter(r => {
          const reminderDate = new Date(r.reminderDate);
          return reminderDate >= today && reminderDate < tomorrow && r.isActive;
        }).length,
        overdue: reminders.filter(r => {
          const reminderDateTime = new Date(`${r.reminderDate}T${r.reminderTime}`);
          return reminderDateTime < now && r.isActive;
        }).length,
        completed: reminders.filter(r => !r.isActive).length
      };

      return stats;
    } catch (error) {
      console.error('Error getting reminder statistics:', error);
      return {
        total: 0,
        active: 0,
        recurring: 0,
        dueToday: 0,
        overdue: 0,
        completed: 0
      };
    }
  }

  /**
   * Get reminders due today
   */
  async getRemindersDueToday(userId: string): Promise<Reminder[]> {
    try {
      const reminders = await todoService.getRemindersByUser(userId);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      return reminders.filter(reminder => {
        const reminderDate = new Date(reminder.reminderDate);
        return reminderDate >= today && reminderDate < tomorrow && reminder.isActive;
      });
    } catch (error) {
      console.error('Error getting reminders due today:', error);
      return [];
    }
  }

  /**
   * Get overdue reminders
   */
  async getOverdueReminders(userId: string): Promise<Reminder[]> {
    try {
      const reminders = await todoService.getRemindersByUser(userId);
      const now = new Date();

      return reminders.filter(reminder => {
        const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
        return reminderDateTime < now && reminder.isActive;
      });
    } catch (error) {
      console.error('Error getting overdue reminders:', error);
      return [];
    }
  }

  /**
   * Validate reminder input
   */
  validateReminderInput(input: {
    title: string;
    reminderDate: string;
    reminderTime: string;
    isRecurring?: boolean;
    recurringPattern?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length === 0) {
      errors.push('Reminder title is required');
    }

    if (!input.reminderDate) {
      errors.push('Reminder date is required');
    }

    if (!input.reminderTime) {
      errors.push('Reminder time is required');
    }

    // Validate date format and ensure it's not in the past
    if (input.reminderDate && input.reminderTime) {
      const reminderDateTime = new Date(`${input.reminderDate}T${input.reminderTime}`);
      const now = new Date();
      
      if (reminderDateTime <= now) {
        errors.push('Reminder date and time must be in the future');
      }
    }

    // Validate recurring pattern if recurring is enabled
    if (input.isRecurring && !input.recurringPattern) {
      errors.push('Recurring pattern is required when reminder is set to recurring');
    }

    // Validate title length
    if (input.title && input.title.length > 100) {
      errors.push('Reminder title must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const reminderNotificationService = new ReminderNotificationService();
