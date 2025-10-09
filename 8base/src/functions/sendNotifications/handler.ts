/**
 * 8base Custom Function: Send Notifications
 * Alternative to Tasks - can be called via GraphQL mutation or webhook
 * This can be triggered by external cron services like Zapier, IFTTT, or cron-job.org
 */

import gql from 'graphql-tag';

type FunctionResult = {
  data: {
    success: boolean;
    message: string;
    notificationsSent: number;
  };
};

type NotificationItem = {
  type: string;
  title: string;
  message: string;
  actionLink?: string;
  priority: string;
};

export default async (event: any, ctx: any): Promise<FunctionResult> => {
  console.log('Send notifications function triggered');

  try {
    // Verify authorization (optional but recommended)
    // Note: Set NOTIFICATION_SECRET_TOKEN in 8base Environment Variables
    const authHeader = event.headers?.authorization;
    const expectedToken = ctx.env?.NOTIFICATION_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      throw new Error('Unauthorized');
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Get all active students
    const studentsQuery = gql`
      query GetAllActiveStudents {
        usersList(
          filter: { 
            roles: { some: { name: { equals: "Student" } } }
            deletedAt: { is_empty: true }
          }
        ) {
          items {
            id
            email
            firstName
            lastName
          }
        }
      }
    `;

    const studentsResult = await ctx.api.gqlRequest(studentsQuery);
    const students = studentsResult.usersList?.items || [];

    let notificationsSent = 0;

    for (const student of students) {
      // Check if notification was already sent today
      const checkExistingQuery = gql`
        query CheckTodayNotifications($userId: ID!, $today: DateTime!) {
          notificationsList(
            filter: {
              user: { id: { equals: $userId } }
              createdAt: { gte: $today }
            }
          ) {
            count
          }
        }
      `;

      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const existingCheck = await ctx.api.gqlRequest(checkExistingQuery, {
        userId: student.id,
        today: todayStart.toISOString(),
      });

      // Skip if notifications already sent today
      if (existingCheck.notificationsList.count > 0) {
        console.log(`Notifications already sent today for ${student.email}`);
        continue;
      }

      const notifications: NotificationItem[] = [];

      // Check 1: No report in 7 days
      const reportsQuery = gql`
        query CheckReports($userId: ID!, $afterDate: DateTime!) {
          weeklyReportsList(
            filter: { 
              weekly_Report: { id: { equals: $userId } }
              createdAt: { gte: $afterDate }
            }
          ) {
            count
          }
        }
      `;

      const reportsResult = await ctx.api.gqlRequest(reportsQuery, {
        userId: student.id,
        afterDate: sevenDaysAgo.toISOString(),
      });

      if (reportsResult.weeklyReportsList.count === 0) {
        notifications.push({
          type: 'NO_REPORT_7_DAYS',
          title: 'Time to Submit Your Weekly Report! ⏰',
          message: `Hi ${student.firstName}, it's been 7 days since your last weekly report. Stay on track by submitting your latest progress today!`,
          actionLink: '/reports',
          priority: 'high',
        });
      }

      // Check 2: No leads in 7 days
      const leadsQuery = gql`
        query CheckLeads($userId: ID!, $afterDate: DateTime!) {
          leadsList(
            filter: { 
              user: { id: { equals: $userId } }
              createdAt: { gte: $afterDate }
            }
          ) {
            count
          }
        }
      `;

      const leadsResult = await ctx.api.gqlRequest(leadsQuery, {
        userId: student.id,
        afterDate: sevenDaysAgo.toISOString(),
      });

      if (leadsResult.leadsList.count === 0) {
        notifications.push({
          type: 'NO_LEADS_7_DAYS',
          title: 'No New Leads Recently 🎯',
          message: `Hi ${student.firstName}, you haven't added any new leads in 7 days. Time to boost your outreach efforts!`,
          actionLink: '/leads',
          priority: 'high',
        });
      }

      // Check 3: No coach call in 14 days
      const callsQuery = gql`
        query CheckCoachCalls($studentId: ID!, $afterDate: DateTime!) {
          callLogsList(
            filter: { 
              student_id: { equals: $studentId }
              call_date: { gte: $afterDate }
            }
          ) {
            count
          }
        }
      `;

      const callsResult = await ctx.api.gqlRequest(callsQuery, {
        studentId: student.id,
        afterDate: fourteenDaysAgo.toISOString(),
      });

      if (callsResult.callLogsList.count === 0) {
        notifications.push({
          type: 'NO_COACH_CALL_14_DAYS',
          title: 'Schedule Time with Your Coach 📞',
          message: `Hi ${student.firstName}, it's been 14 days since your last coaching call. Reach out to schedule a session!`,
          actionLink: '/goals',
          priority: 'medium',
        });
      }

      // Check 4: Low activity - Stay focused
      const recentActivity = await ctx.api.gqlRequest(reportsQuery, {
        userId: student.id,
        afterDate: threeDaysAgo.toISOString(),
      });

      const recentLeads = await ctx.api.gqlRequest(leadsQuery, {
        userId: student.id,
        afterDate: threeDaysAgo.toISOString(),
      });

      if (recentActivity.weeklyReportsList.count === 0 && recentLeads.leadsList.count === 0) {
        notifications.push({
          type: 'STAY_FOCUSED',
          title: 'Stay Focused on Your Goals 🎯',
          message: `Hi ${student.firstName}, remember your goals and take action today. Every small step counts!`,
          actionLink: '/goals',
          priority: 'medium',
        });
      }

      // Send all notifications
      if (notifications.length > 0) {
        for (const notif of notifications) {
          // Create notification in database
          const createMutation = gql`
            mutation CreateNotification($data: NotificationCreateInput!) {
              notificationCreate(data: $data) {
                id
                type
                title
                isRead
                createdAt
              }
            }
          `;

          const result = await ctx.api.gqlRequest(createMutation, {
            data: {
              user: { connect: { id: student.id } },
              type: notif.type,
              title: notif.title,
              message: notif.message,
              actionLink: notif.actionLink || null,
              isRead: false,
              priority: notif.priority,
              sentAt: new Date().toISOString(),
            },
          });

          console.log(`Notification created: ${result.notificationCreate.id}`);

          // Send email (implement based on your email provider)
          await sendEmail(student, notif);

          notificationsSent++;
        }

        console.log(`Sent ${notifications.length} notification(s) to ${student.email}`);
      }
    }

    return {
      data: {
        success: true,
        message: `Processed ${students.length} students, sent ${notificationsSent} notifications`,
        notificationsSent,
      },
    };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      data: {
        success: false,
        message: error.message,
        notificationsSent: 0,
      },
    };
  }
};

async function sendEmail(student: any, notification: any) {
  // TODO: Implement email sending based on your provider
  // Example with SendGrid, Mailgun, etc.
  console.log(`Would send email to ${student.email}: ${notification.title}`);
}

