/**
 * 8base Task: Check Student Activity and Send Notifications
 * Schedule: Runs daily at 9:00 AM
 * Purpose: Send automated notifications to students who need reminders
 */

import gql from 'graphql-tag';

type TaskResult = {
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
};

export default async (event: any, ctx: any): Promise<TaskResult> => {
  console.log('='.repeat(80));
  console.log('🚀 TASK STARTED: Check Student Activity');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('='.repeat(80));

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    console.log('📅 Date thresholds:');
    console.log('  - 7 days ago:', sevenDaysAgo.toISOString());
    console.log('  - 14 days ago:', fourteenDaysAgo.toISOString());
    console.log('  - 3 days ago:', threeDaysAgo.toISOString());

    // Get all active students
    console.log('\n📋 Fetching students...');
    const studentsQuery = gql`
      query GetAllStudents {
        usersList(filter: { roles: { some: { name: { equals: "Student" } } } }) {
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

    console.log(`✅ Found ${students.length} students to check`);

    let notificationsSent = 0;

    for (const student of students) {
      console.log(`\n👤 Checking student: ${student.firstName} ${student.lastName} (${student.email})`);
      const notifications: NotificationItem[] = [];

      // Check 1: No report in 7 days
      let reportsCount = 0;
      try {
        const reportsQuery = gql`
          query GetStudentReports($afterDate: DateTime!) {
            weeklyReportsList(
              filter: { 
                createdAt: { gte: $afterDate }
              }
              first: 100
            ) {
              count
            }
          }
        `;

        const reportsResult = await ctx.api.gqlRequest(reportsQuery, {
          afterDate: sevenDaysAgo.toISOString(),
        });

        reportsCount = reportsResult.weeklyReportsList?.count || 0;
        console.log(`  📊 Reports in last 7 days: ${reportsCount}`);
      } catch (error) {
        console.error(`  ❌ Error checking reports:`, error.message);
        reportsCount = 0; // Assume 0 if error
      }

      if (reportsCount === 0) {
        console.log(`  ⚠️  No report in 7 days - adding notification`);
        notifications.push({
          type: 'NO_REPORT_7_DAYS',
          title: 'Time to Submit Your Weekly Report! ⏰',
          message: `Hi ${student.firstName}, it's been 7 days since your last weekly report. Stay on track by submitting your latest progress today!`,
          actionLink: '/reports',
        });
      }

      // Check 2: No leads in 7 days
      let leadsCount = 0;
      try {
        const leadsQuery = gql`
          query GetStudentLeads($userId: ID!, $afterDate: DateTime!) {
            leadsList(
              filter: { 
                user: { id: { equals: $userId } }
                createdAt: { gte: $afterDate }
              }
              first: 100
            ) {
              count
            }
          }
        `;

        const leadsResult = await ctx.api.gqlRequest(leadsQuery, {
          userId: student.id,
          afterDate: sevenDaysAgo.toISOString(),
        });

        leadsCount = leadsResult.leadsList?.count || 0;
        console.log(`  🎯 Leads in last 7 days: ${leadsCount}`);
      } catch (error) {
        console.error(`  ❌ Error checking leads:`, error.message);
        leadsCount = 0;
      }

      if (leadsCount === 0) {
        console.log(`  ⚠️  No leads in 7 days - adding notification`);
        notifications.push({
          type: 'NO_LEADS_7_DAYS',
          title: 'No New Leads Recently 🎯',
          message: `Hi ${student.firstName}, you haven't added any new leads in 7 days. Time to boost your outreach efforts and grow your business!`,
          actionLink: '/leads',
        });
      }

      // Check 3: No coach call in 14 days (Skip for now - optional)
      // Uncomment when CallLogs table is ready
      /*
      let callsCount = 0;
      try {
        const coachCallsQuery = gql`
          query GetCoachCalls($studentId: ID!, $afterDate: DateTime!) {
            callLogsList(
              filter: { 
                student_id: { equals: $studentId }
                call_date: { gte: $afterDate }
              }
              first: 100
            ) {
              count
            }
          }
        `;

        const callsResult = await ctx.api.gqlRequest(coachCallsQuery, {
          studentId: student.id,
          afterDate: fourteenDaysAgo.toISOString(),
        });

        callsCount = callsResult.callLogsList?.count || 0;
      } catch (error) {
        console.error(`  ❌ Error checking coach calls:`, error.message);
        callsCount = 0;
      }

      if (callsCount === 0) {
        notifications.push({
          type: 'NO_COACH_CALL_14_DAYS',
          title: 'Schedule Time with Your Coach 📞',
          message: `Hi ${student.firstName}, it's been 14 days since your last coaching call. Consider reaching out to your coach to schedule a session and stay on track!`,
          actionLink: '/coach-calendar',
        });
      }
      */

      // Check 4: Low activity - Stay focused on goals (simplified)
      if (reportsCount === 0 && leadsCount === 0) {
        console.log(`  ⚠️  No recent activity - adding stay focused notification`);
        notifications.push({
          type: 'STAY_FOCUSED',
          title: 'Stay Focused on Your Goals 🎯',
          message: `Hi ${student.firstName}, remember your goals and take action today. Every small step counts toward your success! Review your goals and make progress.`,
          actionLink: '/goals',
        });
      }

      // Send all notifications for this student
      if (notifications.length > 0) {
        console.log(`  📧 Creating ${notifications.length} notification(s)...`);
        for (const notification of notifications) {
          try {
            // Skip email for now - uncomment when email is configured
            // await sendEmailNotification(ctx, student, notification);
            
            // Create in-app notification record
            await createNotificationRecord(ctx, student.id, notification);
            
            notificationsSent++;
          } catch (error) {
            console.error(`  ❌ Error creating notification:`, error.message);
          }
        }

        console.log(`  ✅ Created ${notifications.length} notification(s) for ${student.email}`);
      } else {
        console.log(`  ✅ No notifications needed for this student`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ TASK COMPLETED SUCCESSFULLY');
    console.log(`📊 Summary:`);
    console.log(`  - Students checked: ${students.length}`);
    console.log(`  - Notifications sent: ${notificationsSent}`);
    console.log(`⏰ Finished at: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    return {
      data: {
        success: true,
        message: `Successfully processed ${students.length} students and sent ${notificationsSent} notifications`,
        notificationsSent,
      },
    };
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ TASK FAILED');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(80));
    return {
      data: {
        success: false,
        message: `Task failed: ${error.message}`,
        notificationsSent: 0,
      },
    };
  }
};

/**
 * Send email notification using 8base Email integration
 */
async function sendEmailNotification(ctx: any, student: any, notification: any) {
  const emailMutation = gql`
    mutation SendEmail($to: String!, $subject: String!, $html: String!) {
      system {
        sendEmail(to: $to, subject: $subject, html: $html) {
          success
        }
      }
    }
  `;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .button { 
          display: inline-block; 
          background-color: #3B82F6; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin-top: 20px;
        }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${notification.title}</h1>
        </div>
        <div class="content">
          <p>${notification.message}</p>
          ${notification.actionLink ? `
            <a href="${ctx.env?.APP_URL || 'https://yourdomain.com'}${notification.actionLink}" class="button">
              Take Action Now
            </a>
          ` : ''}
        </div>
        <div class="footer">
          <p>You received this email because you're enrolled in our coaching program.</p>
          <p>Questions? Reply to this email or contact your coach.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await ctx.api.gqlRequest(emailMutation, {
      to: student.email,
      subject: notification.title,
      html: emailHtml,
    });
    console.log(`Email sent to ${student.email}: ${notification.title}`);
  } catch (error) {
    console.error(`Failed to send email to ${student.email}:`, error);
  }
}

/**
 * Create notification record in database
 */
async function createNotificationRecord(ctx: any, userId: string, notification: NotificationItem) {
  const createNotificationMutation = gql`
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

  try {
    const result = await ctx.api.gqlRequest(createNotificationMutation, {
      data: {
        user: { connect: { id: userId } },
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionLink: notification.actionLink || null,
        isRead: false,
        priority: 'high',
        sentAt: new Date().toISOString(),
      },
    });
    console.log(`Notification record created: ${result.notificationCreate.id}`);
  } catch (error) {
    console.error('Failed to create notification record:', error);
    throw error;
  }
}

