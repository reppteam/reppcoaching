/**
 * 8base Task: Process Reminders and Send Notifications
 * Schedule: Runs every 5 minutes to check for due reminders
 * Purpose: Send notifications for reminders that are due and process recurring reminders
 */

import gql from 'graphql-tag';

type TaskResult = {
  data: {
    success: boolean;
    message: string;
    remindersProcessed: number;
    notificationsSent: number;
  };
};

type ReminderItem = {
  id: string;
  title: string;
  description?: string;
  reminderDate: string;
  reminderTime: string;
  isRecurring: boolean;
  recurringPattern?: string;
  reminders: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default async (event: any, ctx: any): Promise<TaskResult> => {
  console.log('='.repeat(80));
  console.log('🚀 TASK STARTED: Process Reminders');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('='.repeat(80));

  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    console.log('📅 Current time:', now.toISOString());
    console.log('📅 Checking reminders due by:', fiveMinutesFromNow.toISOString());

    // Get all active reminders
    console.log('\n📋 Fetching active reminders...');
    const remindersQuery = gql`
      query GetActiveReminders {
        remindersList(filter: { isActive: { equals: true } }) {
          items {
            id
            title
            description
            reminderDate
            reminderTime
            isRecurring
            recurringPattern
            reminders {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    `;

    const remindersResult = await ctx.api.gqlRequest(remindersQuery);
    const allReminders = remindersResult.remindersList?.items || [];

    console.log(`✅ Found ${allReminders.length} active reminders`);
    
    // Log details of each reminder for debugging
    allReminders.forEach((reminder, index) => {
      console.log(`📝 Reminder ${index + 1}:`);
      console.log(`   - Title: ${reminder.title}`);
      console.log(`   - Date: ${reminder.reminderDate}`);
      console.log(`   - Time: ${reminder.reminderTime}`);
      console.log(`   - User: ${reminder.reminders.firstName} ${reminder.reminders.lastName}`);
      console.log(`   - Active: ${reminder.isActive}`);
      console.log(`   - Recurring: ${reminder.isRecurring}`);
      
      // Check if reminder is due
      let reminderDateTime: Date;
      if (reminder.reminderTime.includes('T')) {
        // New DateTime format
        reminderDateTime = new Date(reminder.reminderTime);
      } else {
        // Old time format - combine with date
        reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
      }
      
      console.log(`   - Parsed DateTime: ${reminderDateTime.toISOString()}`);
      console.log(`   - Is Due: ${reminderDateTime <= fiveMinutesFromNow && reminderDateTime > now}`);
    });

    let remindersProcessed = 0;
    let notificationsSent = 0;

    // Process reminders
    for (const reminder of allReminders) {
      // Handle both old time format and new DateTime format
      let reminderDateTime: Date;
      if (reminder.reminderTime.includes('T')) {
        // New DateTime format
        reminderDateTime = new Date(reminder.reminderTime);
      } else {
        // Old time format - combine with date
        reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
      }
      
      // Check if reminder is due within the next 5 minutes
      if (reminderDateTime <= fiveMinutesFromNow && reminderDateTime > now) {
        console.log(`\n🔔 Processing reminder: ${reminder.title} for ${reminder.reminders.firstName} ${reminder.reminders.lastName}`);
        
        // Send notification
        await sendReminderNotification(ctx, reminder);
        notificationsSent++;
        
        // Process recurring reminders
        if (reminder.isRecurring && reminder.recurringPattern) {
          await processRecurringReminder(ctx, reminder);
        }
        
        remindersProcessed++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ TASK COMPLETED SUCCESSFULLY');
    console.log(`📊 Summary:`);
    console.log(`  - Reminders processed: ${remindersProcessed}`);
    console.log(`  - Notifications sent: ${notificationsSent}`);
    console.log(`⏰ Finished at: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    return {
      data: {
        success: true,
        message: `Successfully processed ${remindersProcessed} reminders and sent ${notificationsSent} notifications`,
        remindersProcessed,
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
        remindersProcessed: 0,
        notificationsSent: 0,
      },
    };
  }
};

/**
 * Send reminder notification via email and create in-app notification
 */
async function sendReminderNotification(ctx: any, reminder: ReminderItem) {
  try {
    // Create in-app notification
    const createNotificationMutation = gql`
      mutation CreateReminderNotification($data: NotificationCreateInput!) {
        notificationCreate(data: $data) {
          id
          type
          title
          isRead
          createdAt
        }
      }
    `;

    const notificationData = {
      userId: reminder.reminders.id,
      type: 'REMINDER_NOTIFICATION',
      title: `Reminder: ${reminder.title}`,
      message: reminder.description || `This is a reminder for: ${reminder.title}`,
      actionLink: '/reminders',
      isRead: false,
      priority: 'high',
      sentAt: new Date().toISOString(),
    };

    const notificationResult = await ctx.api.gqlRequest(createNotificationMutation, {
      data: notificationData,
    });

    console.log(`📱 In-app notification created: ${notificationResult.notificationCreate.id}`);

    // Send email notification
    await sendReminderEmail(ctx, reminder);

    console.log(`✅ Reminder notification sent to ${reminder.reminders.email}`);
  } catch (error) {
    console.error(`❌ Error sending reminder notification:`, error);
  }
}

/**
 * Send reminder email notification
 */
async function sendReminderEmail(ctx: any, reminder: ReminderItem) {
  const createNotificationMutation = gql`
    mutation CreateReminderNotification($data: NotificationCreateInput!) {
      notificationCreate(data: $data) {
        id
        type
        title
        isRead
        createdAt
      }
    }
  `;
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
        .reminder-box { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; }
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
          <h1>🔔 Reminder Notification</h1>
        </div>
        <div class="content">
          <p>Hi ${reminder.reminders.firstName},</p>
          <div class="reminder-box">
            <h2>${reminder.title}</h2>
            ${reminder.description ? `<p>${reminder.description}</p>` : ''}
            <p><strong>Scheduled for:</strong> ${new Date(`${reminder.reminderDate}T${reminder.reminderTime}`).toLocaleString()}</p>
            ${reminder.isRecurring ? `<p><strong>Recurring:</strong> ${reminder.recurringPattern}</p>` : ''}
          </div>
          <a href="${ctx.env?.APP_URL || 'https://yourdomain.com'}/reminders" class="button">
            View All Reminders
          </a>
        </div>
        <div class="footer">
          <p>You received this reminder because you set it up in your coaching dashboard.</p>
          <p>Questions? Contact your coach or support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await ctx.api.gqlRequest(emailMutation, {
      to: reminder.reminders.email,
      subject: `🔔 Reminder: ${reminder.title}`,
      html: emailHtml,
    });
    console.log(`📧 Email sent to ${reminder.reminders.email}: ${reminder.title}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${reminder.reminders.email}:`, error);
  }
  
  // Send in-app notification
  try {
    const notificationData = {
      userId: reminder.reminders.id,
      type: 'REMINDER_NOTIFICATION',
      title: `Reminder: ${reminder.title}`,
      message: reminder.description || `This is a reminder for: ${reminder.title}`,
      actionLink: '/reminders',
      isRead: false,
      priority: 'high',
      sentAt: new Date().toISOString(),
    };
    
    await ctx.api.gqlRequest(createNotificationMutation, { data: notificationData });
    console.log(`📱 In-app notification sent to ${reminder.reminders.firstName} ${reminder.reminders.lastName}`);
  } catch (error) {
    console.error(`❌ Failed to send in-app notification:`, error);
  }
}

/**
 * Process recurring reminder by creating the next occurrence
 */
async function processRecurringReminder(ctx: any, reminder: ReminderItem) {
  try {
    const currentDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
    const nextDateTime = calculateNextRecurrence(currentDateTime, reminder.recurringPattern!);
    
    const updateReminderMutation = gql`
      mutation UpdateReminder($id: ID!, $data: ReminderUpdateInput!) {
        reminderUpdate(filter: { id: $id }, data: $data) {
          id
          reminderDate
          reminderTime
        }
      }
    `;

    await ctx.api.gqlRequest(updateReminderMutation, {
      id: reminder.id,
      data: {
        reminderDate: nextDateTime.toISOString().split('T')[0],
        reminderTime: nextDateTime.toTimeString().split(' ')[0].substring(0, 5),
      },
    });

    console.log(`🔄 Recurring reminder updated for next occurrence: ${nextDateTime.toISOString()}`);
  } catch (error) {
    console.error(`❌ Error processing recurring reminder:`, error);
  }
}

/**
 * Calculate next recurrence date based on pattern
 */
function calculateNextRecurrence(currentDateTime: Date, pattern: string): Date {
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
