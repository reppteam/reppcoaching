/**
 * Utility functions for notification scheduling and activity tracking
 */

export interface NotificationSchedule {
  id: string;
  userId: string;
  type: 'report_reminder' | 'lead_reminder' | 'weekly_summary';
  scheduledFor: Date;
  executed: boolean;
  metadata?: Record<string, any>;
}

export class NotificationUtils {
  /**
   * Calculate the next notification time based on last activity
   */
  static getNextNotificationTime(
    lastActivityDate: Date | null,
    thresholdDays: number = 7
  ): Date | null {
    if (!lastActivityDate) {
      // If no activity, schedule for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM
      return tomorrow;
    }

    const nextNotification = new Date(lastActivityDate);
    nextNotification.setDate(nextNotification.getDate() + thresholdDays);
    nextNotification.setHours(9, 0, 0, 0); // 9 AM

    // Only return if it's in the past (overdue)
    const now = new Date();
    return nextNotification <= now ? nextNotification : null;
  }

  /**
   * Check if user should receive a notification
   */
  static shouldNotify(
    lastActivityDate: Date | null,
    thresholdDays: number = 7
  ): boolean {
    if (!lastActivityDate) {
      return true; // Always notify if no activity
    }

    const daysSinceActivity = Math.floor(
      (new Date().getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceActivity >= thresholdDays;
  }

  /**
   * Format notification time for display
   */
  static formatNotificationTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  }

  /**
   * Get notification badge count
   */
  static getUnreadCount(notifications: Array<{ isRead: boolean }>): number {
    return notifications.filter((n) => !n.isRead).length;
  }

  /**
   * Sort notifications by priority and date
   */
  static sortNotifications<T extends { priority: string; createdAt: Date }>(
    notifications: T[]
  ): T[] {
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return notifications.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                          priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Track user activity log entry
   */
  static logActivity(
    userId: string,
    activityType: 'report_submitted' | 'lead_added' | 'goal_updated' | 'login',
    metadata?: Record<string, any>
  ): void {
    const activityLog = {
      userId,
      activityType,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Store in localStorage for now (in production, this would be in a database)
    try {
      const existingLogs = localStorage.getItem(`activity_log_${userId}`);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(activityLog);

      // Keep only last 100 entries
      const trimmedLogs = logs.slice(-100);
      localStorage.setItem(`activity_log_${userId}`, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Get user activity logs
   */
  static getActivityLogs(userId: string, limit: number = 10): any[] {
    try {
      const existingLogs = localStorage.getItem(`activity_log_${userId}`);
      if (!existingLogs) return [];

      const logs = JSON.parse(existingLogs);
      return logs.slice(-limit).reverse(); // Get last N logs, newest first
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }

  /**
   * Clear old notifications
   */
  static clearOldNotifications(
    notifications: Array<{ createdAt: Date; isRead: boolean }>,
    daysToKeep: number = 30
  ): Array<{ createdAt: Date; isRead: boolean }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return notifications.filter(
      (n) => n.createdAt >= cutoffDate || !n.isRead
    );
  }

  /**
   * Generate weekly summary data
   */
  static generateWeeklySummary(data: {
    reportsSubmitted: number;
    leadsAdded: number;
    revenue: number;
    goalsAchieved: number;
  }): string {
    const parts = [];

    if (data.reportsSubmitted > 0) {
      parts.push(`${data.reportsSubmitted} report${data.reportsSubmitted > 1 ? 's' : ''} submitted`);
    }

    if (data.leadsAdded > 0) {
      parts.push(`${data.leadsAdded} lead${data.leadsAdded > 1 ? 's' : ''} added`);
    }

    if (data.revenue > 0) {
      parts.push(`$${data.revenue.toLocaleString()} revenue`);
    }

    if (data.goalsAchieved > 0) {
      parts.push(`${data.goalsAchieved} goal${data.goalsAchieved > 1 ? 's' : ''} achieved`);
    }

    if (parts.length === 0) {
      return 'No activity this week';
    }

    return parts.join(', ');
  }

  /**
   * Schedule notification (mock implementation - in production this would use a backend scheduler)
   */
  static scheduleNotification(schedule: NotificationSchedule): void {
    try {
      const scheduledNotifications = localStorage.getItem('scheduled_notifications');
      const schedules = scheduledNotifications ? JSON.parse(scheduledNotifications) : [];
      schedules.push(schedule);
      localStorage.setItem('scheduled_notifications', JSON.stringify(schedules));
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  /**
   * Get pending scheduled notifications
   */
  static getPendingNotifications(userId: string): NotificationSchedule[] {
    try {
      const scheduledNotifications = localStorage.getItem('scheduled_notifications');
      if (!scheduledNotifications) return [];

      const schedules: NotificationSchedule[] = JSON.parse(scheduledNotifications);
      const now = new Date();

      return schedules.filter(
        (s) => s.userId === userId && !s.executed && new Date(s.scheduledFor) <= now
      );
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }
}

