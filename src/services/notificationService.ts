import { eightbaseService } from './8baseService';
import { client } from '../8baseClient';
import { gql } from '@apollo/client';

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  createdAt: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}


export class NotificationService {

  /**
   * Get notifications from database (created by automated task)
   */
  async getStoredNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data } = await client.query({
        query: gql`
          query GetUserNotifications($userId: ID!) {
            notificationsList(
              filter: { 
                user: { id: { equals: $userId } }
                isRead: { equals: false }
              }
              sort: { createdAt: DESC }
              first: 10
            ) {
              items {
                id
                type
                title
                message
                actionLink
                isRead
                priority
                createdAt
              }
            }
          }
        `,
        variables: { userId },
      });

      return data?.notificationsList?.items?.map((n: any) => ({
        id: n.id,
        type: this.mapTypeToNotificationType(n.type),
        title: n.title,
        message: n.message,
        actionText: 'Take Action',
        actionLink: n.actionLink,
        createdAt: new Date(n.createdAt),
        isRead: n.isRead,
        priority: n.priority as 'high' | 'medium' | 'low',
      })) || [];
    } catch (error) {
      console.error('Error fetching stored notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await client.mutate({
        mutation: gql`
          mutation MarkNotificationRead($id: ID!) {
            notificationUpdate(
              data: { id: $id, isRead: true }
            ) {
              id
            }
          }
        `,
        variables: { id: notificationId },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Map database notification type to UI type
   */
  private mapTypeToNotificationType(type: string): Notification['type'] {
    switch (type) {
      case 'NO_REPORT_7_DAYS':
      case 'NO_LEADS_7_DAYS':
        return 'warning';
      case 'NO_COACH_CALL_14_DAYS':
      case 'STAY_FOCUSED':
        return 'info';
      default:
        return 'info';
    }
  }

  /**
   * Check user activity and generate smart notifications based on patterns and thresholds
   * Now only returns database notifications from the automated task
   */
  async checkUserActivity(userId: string): Promise<Notification[]> {
    // Static notifications removed - only database notifications from automated task
    return [];
  }

  /**
   * Get notifications about coach activity (calls, notes, etc.)
   * Static notifications removed - only database notifications from automated task
   */
  async getCoachActivityNotifications(userId: string): Promise<Notification[]> {
    return [];
  }

  /**
   * Get dashboard stats - simplified version without database queries
   * Returns default stats since we removed the complex data fetching
   */
  async getDashboardStats(userId: string): Promise<{
    totalReports: number;
    totalLeads: number;
    reportsThisWeek: number;
    leadsThisWeek: number;
    totalRevenue: number;
    avgRevenue: number;
    activeLeads: number;
    convertedLeads: number;
  }> {
    // Return default stats - can be enhanced later with actual data if needed
      return {
        totalReports: 0,
        totalLeads: 0,
        reportsThisWeek: 0,
        leadsThisWeek: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        activeLeads: 0,
        convertedLeads: 0,
      };
    }
}

export const notificationService = new NotificationService();

