# 🕐 Cron Job Setup for Automated Notifications

## ✅ **Current Configuration**

Your 8base task is now configured to run **daily at 11:59 PM** and will automatically send notifications to students who haven't submitted reports or added leads.

## 📋 **What You Need to Do**

### 1. Deploy the Updated Configuration
```bash
cd 8base
8base deploy
```

### 2. Verify the Task is Scheduled
After deployment, check in your 8base Console:
- Go to **Functions** → **Tasks**
- Look for `checkStudentActivity` task
- Verify it shows schedule: `cron(59 23 * * ? *)` (11:59 PM daily)

### 3. Test the Task (Optional)
```bash
# Test the task manually
8base invoke checkStudentActivity

# Check logs
8base logs -t checkStudentActivity --tail 50
```

## 🎯 **What the Cron Job Does**

**Every day at 11:59 PM, the task will:**

1. **Check all students** for activity
2. **Send notifications** to students who:
   - ❌ Haven't submitted a report in 7+ days
   - ❌ Haven't added a lead in 7+ days  
   - ❌ Haven't had coach interaction in 14+ days
   - ❌ Have low activity (no reports/leads in 3+ days)

3. **Send both:**
   - 📧 **Email notifications** (to student's email)
   - 🔔 **In-app notifications** (stored in database)

## 📧 **Email Notifications**

The task will send emails with:
- **Subject**: Based on notification type
- **Content**: Personalized message with action links
- **Recipients**: Student's email address

## 🔔 **In-App Notifications**

Notifications are also stored in the `Notification` table and will appear on the student dashboard.

## ⚙️ **Cron Schedule Format**

- `cron(59 23 * * ? *)` = 11:59 PM daily
- `cron(0 9 * * ? *)` = 9:00 AM daily  
- `cron(0 12 * * MON *)` = 12:00 PM every Monday

## 🚨 **Important Notes**

1. **Email Configuration**: Make sure your 8base workspace has email sending configured
2. **Timezone**: The cron job runs in UTC time
3. **Monitoring**: Check logs regularly to ensure the task is running successfully
4. **Testing**: You can manually invoke the task to test it

## 📊 **Monitoring**

Check task execution:
```bash
# View recent logs
8base logs -t checkStudentActivity --tail 100

# View specific execution
8base logs -t checkStudentActivity --start-time "2025-01-09T23:59:00Z"
```

## 🎉 **Result**

Once deployed, students will automatically receive daily reminders at 11:59 PM if they haven't been active, helping them stay on track with their coaching goals!
