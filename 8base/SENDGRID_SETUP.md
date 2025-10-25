# SendGrid Email Setup Guide

## Overview
This guide explains how to configure SendGrid for email notifications in the reminder system.

## Prerequisites
1. A SendGrid account (free tier available)
2. A verified sender email address

## Setup Steps

### 1. Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key
1. Log into your SendGrid dashboard
2. Go to **Settings** > **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** for security
5. Give it a name like "8base Reminder System"
6. Grant **Mail Send** permissions
7. Copy the API key (you won't see it again!)

### 3. Verify Sender Email
1. Go to **Settings** > **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - **From Name**: Your App Name
   - **From Email**: noreply@yourdomain.com
   - **Reply To**: support@yourdomain.com
4. Check your email and click the verification link

### 4. Configure 8base Environment Variables
Add these environment variables to your 8base project:

```bash
# Required: Your SendGrid API Key
SENDGRID_API_KEY=SG.your_api_key_here

# Optional: Custom from email (defaults to noreply@yourdomain.com)
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Optional: Your app URL for email links
APP_URL=https://yourdomain.com
```

### 5. Set Environment Variables in 8base
1. Go to your 8base dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the variables:
   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `SENDGRID_FROM_EMAIL`: Your verified sender email
   - `APP_URL`: Your application URL

## Testing
After setup, test the email functionality:

```bash
cd 8base
8base deploy
8base invoke processReminders
```

## Email Template
The system sends beautifully formatted HTML emails with:
- Professional styling
- Reminder details
- Action buttons
- Responsive design

## Troubleshooting

### Common Issues

1. **"API key not found"**
   - Check that `SENDGRID_API_KEY` is set in environment variables
   - Verify the API key is correct

2. **"Sender not verified"**
   - Make sure your sender email is verified in SendGrid
   - Check that `SENDGRID_FROM_EMAIL` matches your verified sender

3. **"Email not delivered"**
   - Check SendGrid activity feed for delivery status
   - Verify recipient email is valid
   - Check spam folder

### SendGrid Dashboard
Monitor email delivery in your SendGrid dashboard:
- **Activity Feed**: See all email activity
- **Statistics**: Track delivery rates
- **Suppressions**: Manage bounced emails

## Security Notes
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor API key usage in SendGrid dashboard

## Free Tier Limits
SendGrid free tier includes:
- 100 emails/day
- Unlimited contacts
- Basic analytics

For production use, consider upgrading to a paid plan.
