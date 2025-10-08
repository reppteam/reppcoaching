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

export interface ActivitySummary {
  lastReportDate: Date | null;
  lastLeadDate: Date | null;
  daysSinceLastReport: number;
  daysSinceLastLead: number;
  totalReports: number;
  totalLeads: number;
  weeklyReportsCount: number;
  leadsThisWeek: number;
}

export class NotificationService {
  private readonly REPORT_WARNING_THRESHOLD = 7; // days
  private readonly LEAD_WARNING_THRESHOLD = 7; // days

  /**
   * Check user activity and generate notifications based on thresholds
   */
  async checkUserActivity(userId: string): Promise<Notification[]> {
    const notifications: Notification[] = [];

    try {
      const summary = await this.getUserActivitySummary(userId);

      // Check for no reports in 7 days
      if (summary.daysSinceLastReport >= this.REPORT_WARNING_THRESHOLD) {
        notifications.push({
          id: `report-warning-${Date.now()}`,
          type: 'warning',
          title: 'Time to Submit a Report!',
          message: `It's been ${summary.daysSinceLastReport} days since your last weekly report. Stay on track by submitting your latest progress.`,
          actionText: 'Submit Report',
          actionLink: '/reports',
          createdAt: new Date(),
          isRead: false,
          priority: 'high',
        });
      }

      // Check for no leads in 7 days
      if (summary.daysSinceLastLead >= this.LEAD_WARNING_THRESHOLD) {
        notifications.push({
          id: `lead-warning-${Date.now()}`,
          type: 'warning',
          title: 'No New Leads Recently',
          message: `You haven't received any new leads in ${summary.daysSinceLastLead} days. Time to boost your outreach efforts!`,
          actionText: 'Add Lead',
          actionLink: '/leads',
          createdAt: new Date(),
          isRead: false,
          priority: 'high',
        });
      }

      // Positive reinforcement for active users
      if (summary.weeklyReportsCount > 0 && summary.leadsThisWeek > 0) {
        notifications.push({
          id: `activity-success-${Date.now()}`,
          type: 'success',
          title: 'Great Progress!',
          message: `You've submitted ${summary.weeklyReportsCount} report(s) and added ${summary.leadsThisWeek} lead(s) this week. Keep it up!`,
          createdAt: new Date(),
          isRead: false,
          priority: 'low',
        });
      }

      return notifications;
    } catch (error) {
      console.error('Error checking user activity:', error);
      return [];
    }
  }

  /**
   * Get a summary of user's activity
   */
  async getUserActivitySummary(userId: string): Promise<ActivitySummary> {
    try {
      // Get user's weekly reports
      const reports = await this.getUserWeeklyReports(userId);
      const leads = await this.getUserLeads(userId);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Find last report date
      const sortedReports = reports.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastReportDate = sortedReports.length > 0 ? new Date(sortedReports[0].createdAt) : null;

      // Find last lead date
      const sortedLeads = leads.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastLeadDate = sortedLeads.length > 0 ? new Date(sortedLeads[0].createdAt) : null;

      // Calculate days since last activity
      const daysSinceLastReport = lastReportDate 
        ? Math.floor((now.getTime() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // Large number if no reports

      const daysSinceLastLead = lastLeadDate
        ? Math.floor((now.getTime() - lastLeadDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // Large number if no leads

      // Count weekly activity
      const weeklyReportsCount = reports.filter((r: any) => 
        new Date(r.createdAt) >= oneWeekAgo
      ).length;

      const leadsThisWeek = leads.filter((l: any) => 
        new Date(l.createdAt) >= oneWeekAgo
      ).length;

      return {
        lastReportDate,
        lastLeadDate,
        daysSinceLastReport,
        daysSinceLastLead,
        totalReports: reports.length,
        totalLeads: leads.length,
        weeklyReportsCount,
        leadsThisWeek,
      };
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      return {
        lastReportDate: null,
        lastLeadDate: null,
        daysSinceLastReport: 0,
        daysSinceLastLead: 0,
        totalReports: 0,
        totalLeads: 0,
        weeklyReportsCount: 0,
        leadsThisWeek: 0,
      };
    }
  }

  /**
   * Get user's weekly reports
   */
  private async getUserWeeklyReports(userId: string): Promise<any[]> {
    try {
      const { data } = await client.query({
        query: gql`
          query GetUserWeeklyReports($userId: ID!) {
            weeklyReportsList(filter: { weekly_Report: { id: { equals: $userId } } }) {
              items {
                id
                start_date
                end_date
                revenue
                net_profit
                paid_shoots
                status
                createdAt
                updatedAt
              }
            }
          }
        `,
        variables: { userId },
      });

      return data?.weeklyReportsList?.items || [];
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
      return [];
    }
  }

  /**
   * Get user's leads
   */
  private async getUserLeads(userId: string): Promise<any[]> {
    try {
      const { data } = await client.query({
        query: gql`
          query GetUserLeads($userId: ID!) {
            leadsList(filter: { user: { id: { equals: $userId } } }) {
              items {
                id
                lead_name
                email
                phone
                status
                lead_source
                createdAt
                updatedAt
              }
            }
          }
        `,
        variables: { userId },
      });

      return data?.leadsList?.items || [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  }

  /**
   * Get quick stats for dashboard
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
    try {
      const reports = await this.getUserWeeklyReports(userId);
      const leads = await this.getUserLeads(userId);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const reportsThisWeek = reports.filter((r: any) => 
        new Date(r.createdAt) >= oneWeekAgo
      ).length;

      const leadsThisWeek = leads.filter((l: any) => 
        new Date(l.createdAt) >= oneWeekAgo
      ).length;

      const totalRevenue = reports.reduce((sum: number, r: any) => 
        sum + (parseFloat(r.revenue) || 0), 0
      );

      const avgRevenue = reports.length > 0 ? totalRevenue / reports.length : 0;

      const activeLeads = leads.filter((l: any) => 
        l.status === 'active' || l.status === 'contacted' || l.status === 'follow_up'
      ).length;

      const convertedLeads = leads.filter((l: any) => 
        l.status === 'converted' || l.status === 'client'
      ).length;

      return {
        totalReports: reports.length,
        totalLeads: leads.length,
        reportsThisWeek,
        leadsThisWeek,
        totalRevenue,
        avgRevenue,
        activeLeads,
        convertedLeads,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
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
}

export const notificationService = new NotificationService();

