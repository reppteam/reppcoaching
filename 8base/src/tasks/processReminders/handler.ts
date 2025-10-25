/**
 * 8base Task: Process Reminders and Send Notifications
 * Schedule: Runs every 5 minutes to check for due reminders
 * Purpose: Send notifications for reminders that are due and process recurring reminders
 */

import gql from 'graphql-tag';
import * as sgMail from '@sendgrid/mail';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

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
    const now = dayjs().utc();
    // Temporarily extended to 6 hours for testing
    const fiveMinutesFromNow = now.add(6, 'hour');

    console.log('📅 Current time (UTC):', now.toISOString());
    console.log('📅 Checking reminders due by (UTC):', fiveMinutesFromNow.toISOString());
    console.log('⚠️ TESTING MODE: Extended time window to 6 hours for testing');

    // Test database connection first
    console.log('\n🔍 Testing database connection...');
    try {
      const testQuery = gql`
        query TestConnection {
          remindersList {
            items {
              id
              title
            }
          }
        }
      `;
      const testResult = await ctx.api.gqlRequest(testQuery);
      console.log(`✅ Database connection working. Found ${testResult.remindersList?.items?.length || 0} total reminders in database`);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }

    // FORCE TEST NOTIFICATION - Create a test reminder that's due now
    console.log('\n🧪 FORCING TEST NOTIFICATION...');
    try {
      const testReminder = {
        id: 'test-reminder-' + Date.now(),
        title: 'TEST REMINDER',
        description: 'This is a test reminder to verify notifications work',
        reminderDate: dayjs().format('YYYY-MM-DD'),
        reminderTime: dayjs().toISOString(),
        isActive: true,
        isRecurring: false,
        recurringPattern: 'daily',
        reminders: {
          id: 'cmf5czx4702gq02l21xio2m63',
          firstName: 'John',
          lastName: 'student',
          email: 'tiwiseh327@filipx.com' // Use your real email for testing
        }
      };
      
      console.log('🧪 Processing test reminder:', testReminder.title);
      await sendReminderNotification(ctx, testReminder);
      console.log('🧪 Test notification sent!');
    } catch (error) {
      console.error('❌ Test notification failed:', error);
    }

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
            isActive
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
    let allReminders = remindersResult.remindersList?.items || [];

    console.log(`✅ Found ${allReminders.length} active reminders`);
    console.log('🔍 Raw query result:', JSON.stringify(remindersResult, null, 2));
    
    // If no active reminders found, try to get all reminders as fallback
    if (allReminders.length === 0) {
      console.log('\n⚠️ No active reminders found, trying to fetch all reminders...');
      const allRemindersQuery = gql`
        query GetAllReminders {
          remindersList {
            items {
              id
              title
              description
              reminderDate
              reminderTime
              isActive
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
      
      const allRemindersResult = await ctx.api.gqlRequest(allRemindersQuery);
      allReminders = allRemindersResult.remindersList?.items || [];
      console.log(`✅ Found ${allReminders.length} total reminders (including inactive)`);
      console.log('🔍 Raw fallback query result:', JSON.stringify(allRemindersResult, null, 2));
    }
    
    // Log details of each reminder for debugging
    allReminders.forEach((reminder, index) => {
      console.log(`📝 Reminder ${index + 1}:`);
      console.log(`   - Title: ${reminder.title}`);
      console.log(`   - Date: ${reminder.reminderDate}`);
      console.log(`   - Time: ${reminder.reminderTime}`);
      console.log(`   - User: ${reminder.reminders.firstName} ${reminder.reminders.lastName}`);
      console.log(`   - Active: ${reminder.isActive}`);
      console.log(`   - Recurring: ${reminder.isRecurring}`);
      
      // Check if reminder is due - handle timezone properly
      let reminderDateTime: dayjs.Dayjs;
      if (reminder.reminderTime.includes('T')) {
        // New DateTime format - already in UTC
        reminderDateTime = dayjs(reminder.reminderTime).utc();
      } else {
        // Old time format - combine with date and treat as UTC
        reminderDateTime = dayjs(`${reminder.reminderDate}T${reminder.reminderTime}`).utc();
      }
      
      const isDue = reminderDateTime.isBefore(fiveMinutesFromNow) && reminderDateTime.isAfter(now);
      const timeDiff = reminderDateTime.diff(now, 'minute');
      const minutesDiff = Math.round(timeDiff);
      
      console.log(`   - Parsed DateTime: ${reminderDateTime.toISOString()}`);
      console.log(`   - Time difference: ${minutesDiff} minutes`);
      console.log(`   - Is Due: ${isDue}`);
      console.log(`   - Current time: ${now.toISOString()}`);
      console.log(`   - Reminder time: ${reminderDateTime.toISOString()}`);
      console.log(`   - Five minutes from now: ${fiveMinutesFromNow.toISOString()}`);
    });

    let remindersProcessed = 0;
    let notificationsSent = 0;

    // Process reminders
    for (const reminder of allReminders) {
      // Handle both old time format and new DateTime format with proper timezone handling
      let reminderDateTime: dayjs.Dayjs;
      if (reminder.reminderTime.includes('T')) {
        // New DateTime format - already in UTC
        reminderDateTime = dayjs(reminder.reminderTime).utc();
      } else {
        // Old time format - combine with date and treat as UTC
        reminderDateTime = dayjs(`${reminder.reminderDate}T${reminder.reminderTime}`).utc();
      }
      
      // Check if reminder is due within the next 5 minutes
      const isDue = reminderDateTime.isBefore(fiveMinutesFromNow) && reminderDateTime.isAfter(now);
      const timeDiff = reminderDateTime.diff(now, 'minute');
      const minutesDiff = Math.round(timeDiff);
      
      console.log(`\n🔍 Checking reminder: ${reminder.title}`);
      console.log(`   - Time difference: ${minutesDiff} minutes`);
      console.log(`   - Is Due: ${isDue}`);
      
      if (isDue) {
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
    console.log(`🔔 Starting notification process for: ${reminder.title}`);
    
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
      user: { connect: { id: reminder.reminders.id } },
      type: 'REMINDER_NOTIFICATION',
      title: `Reminder: ${reminder.title}`,
      message: reminder.description || `This is a reminder for: ${reminder.title}`,
      actionLink: '/reminders',
      isRead: false,
      priority: 'high',
      sentAt: new Date().toISOString(),
    };

    console.log(`📱 Creating in-app notification with data:`, notificationData);
    const notificationResult = await ctx.api.gqlRequest(createNotificationMutation, {
      data: notificationData,
    });

    console.log(`📱 In-app notification created: ${notificationResult.notificationCreate.id}`);

    // Send email notification
    console.log(`📧 Sending email notification to: ${reminder.reminders.email}`);
    await sendReminderEmail(ctx, reminder);

    console.log(`✅ Reminder notification sent to ${reminder.reminders.email}`);
  } catch (error) {
    console.error(`❌ Error sending reminder notification:`, error);
    console.error(`❌ Error details:`, {
      message: error.message,
      stack: error.stack,
      reminder: reminder.title
    });
  }
}

/**
 * Send reminder email notification
 */
async function sendReminderEmail(ctx: any, reminder: ReminderItem) {
  try {
      // Debug: Log all available environment variables
      console.log('🔍 Available environment variables:', Object.keys(ctx.env || {}));
      console.log('🔍 Send_grid_api_key value:', ctx.env?.Send_grid_api_key ? 'SET' : 'NOT SET');
      console.log('🔍 SENDGRID_API_KEY value:', ctx.env?.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
      
      // Initialize SendGrid with API key from environment variables
      const sendGridApiKey = ctx.env?.Send_grid_api_key || ctx.env?.SENDGRID_API_KEY;
      console.log('🔍 sendGridApiKey:', sendGridApiKey ? 'SET' : 'NOT SET');
    
    if (!sendGridApiKey) {
      console.error('❌ SendGrid API key not found in environment variables');
      console.log('📧 Email sending skipped - SendGrid API key not configured');
      console.log('📧 Available env vars:', Object.keys(ctx.env || {}));
      return { success: false, message: 'SendGrid API key not configured' };
    }

    sgMail.setApiKey(sendGridApiKey);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; margin: 0; }
          .reminder-box { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 4px; }
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

    const msg = {
      to: reminder.reminders.email,
      from: 'hello@repplaunch.com', // Use a verified sender email
      subject: `🔔 Reminder: ${reminder.title}`,
      html: emailHtml,
    };

    console.log(`📧 Sending email via SendGrid to: ${reminder.reminders.email}`);
    console.log(`📧 Email subject: 🔔 Reminder: ${reminder.title}`);
    console.log(`📧 From email: ${msg.from}`);
    console.log(`📧 Message object:`, JSON.stringify(msg, null, 2));
    
    const result = await sgMail.send(msg);
    
    console.log(`📧 Email sent successfully via SendGrid:`, result);
    console.log(`📧 Email sent to ${reminder.reminders.email}: ${reminder.title}`);
    
    return { success: true, message: 'Email sent successfully via SendGrid', result };
  } catch (error) {
    console.error(`❌ Failed to send email to ${reminder.reminders.email}:`, error);
    console.error(`❌ Email error details:`, {
      message: error.message,
      stack: error.stack,
      email: reminder.reminders.email
    });
    
    return { success: false, message: 'Email sending failed', error: error.message };
  }
}

/**
 * Process recurring reminder by creating the next occurrence
 */
async function processRecurringReminder(ctx: any, reminder: ReminderItem) {
  try {
    // Handle both old time format and new DateTime format with proper timezone handling
    let currentDateTime: dayjs.Dayjs;
    if (reminder.reminderTime.includes('T')) {
      // New DateTime format - already in UTC
      currentDateTime = dayjs(reminder.reminderTime).utc();
    } else {
      // Old time format - combine with date and treat as UTC
      currentDateTime = dayjs(`${reminder.reminderDate}T${reminder.reminderTime}`).utc();
    }
    
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
        reminderDate: nextDateTime.format('YYYY-MM-DD'),
        reminderTime: nextDateTime.toISOString(), // Use full ISO string for new format
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
function calculateNextRecurrence(currentDateTime: dayjs.Dayjs, pattern: string): dayjs.Dayjs {
  let nextDateTime: dayjs.Dayjs;
  
  switch (pattern) {
    case 'daily':
      nextDateTime = currentDateTime.add(1, 'day');
      break;
    case 'weekly':
      nextDateTime = currentDateTime.add(1, 'week');
      break;
    case 'monthly':
      nextDateTime = currentDateTime.add(1, 'month');
      break;
    case 'yearly':
      nextDateTime = currentDateTime.add(1, 'year');
      break;
    default:
      nextDateTime = currentDateTime.add(1, 'day'); // Default to daily
  }
  
  return nextDateTime;
}
