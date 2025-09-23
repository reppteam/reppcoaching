# Email Features Implementation Guide

## Overview

This implementation adds two key email features for coaches and users:

1. **Resend Invitation Email** - Allows administrators to resend invitation emails to users
2. **Forgot Password** - Allows users to request password reset emails

## Features Implemented

### 1. Resend Invitation Email

**Location**: Available in User Management and Super Admin User Panel
**Functionality**: 
- Resends invitation emails to existing users
- Includes custom message option
- Uses existing SendGrid templates
- Sends password reset email as part of the invitation process

**How to Use**:
1. Navigate to User Management or Super Admin User Panel
2. Find the user you want to resend invitation to
3. Click the mail icon (📧) next to the user
4. Optionally add a custom message
5. Click "Send Invitation"

### 2. Forgot Password

**Location**: Available in User Management and Super Admin User Panel
**Functionality**:
- Sends password reset emails via Auth0
- Includes user validation (checks if user exists)
- Provides security by not revealing if user exists or not

**How to Use**:
1. Navigate to User Management or Super Admin User Panel
2. Find the user who needs password reset
3. Click the key icon (🔑) next to the user
4. Click "Send Reset Email"

## Technical Implementation

### Services Used

1. **userInvitationService** (`src/services/userInvitationService.ts`)
   - `resendInvitation()` method for resending invitations
   - Handles SendGrid email sending
   - Manages Auth0 password reset integration

2. **forgotPasswordService** (`src/services/forgotPasswordService.ts`)
   - `requestPasswordReset()` method for password resets
   - User existence validation
   - Auth0 password reset integration

### UI Components

1. **UserActions** (`src/components/UserActions.tsx`)
   - Reusable component with both features
   - Modal dialogs for each action
   - Error handling and success feedback

2. **EmailTestPanel** (`src/components/EmailTestPanel.tsx`)
   - Development testing component
   - Available at `/email-test` route (Super Admin only)
   - Tests both email functionalities

### Integration Points

The UserActions component has been integrated into:
- `UserManagement.tsx` - For coach managers and administrators
- `SuperAdminUserPanel.tsx` - For super administrators

## Environment Variables Required

Make sure these environment variables are set:

```env
REACT_APP_AUTH0_DOMAIN=your-auth0-domain
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
REACT_APP_AUTH0_CLIENT_SECRET=your-auth0-client-secret
REACT_APP_SENDGRID_API_KEY=your-sendgrid-api-key
REACT_APP_SENDGRID_FROM_EMAIL=your-from-email
REACT_APP_SENDGRID_COACH_TEMPLATE_ID=your-coach-template-id
REACT_APP_SENDGRID_STUDENT_TEMPLATE_ID=your-student-template-id
REACT_APP_SENDGRID_MANAGER_TEMPLATE_ID=your-manager-template-id
REACT_APP_SENDGRID_ADMIN_TEMPLATE_ID=your-admin-template-id
```

## Testing

### Manual Testing
1. Navigate to `/email-test` (Super Admin access required)
2. Enter a test email address
3. Test both "Resend Invitation" and "Forgot Password" features
4. Check console logs for detailed results

### Production Testing
1. Use the UserActions component in User Management
2. Test with real user accounts
3. Verify emails are received
4. Test password reset flow

## Security Considerations

1. **User Enumeration Protection**: The forgot password feature doesn't reveal whether a user exists
2. **Rate Limiting**: Consider implementing rate limiting for email sending
3. **Audit Logging**: Email sending actions are logged to console (can be enhanced for production)

## Future Enhancements

1. **Toast Notifications**: Add toast notifications for better user feedback
2. **Email Templates**: Customize email templates for different user types
3. **Bulk Actions**: Add bulk resend invitation functionality
4. **Email History**: Track email sending history
5. **Rate Limiting**: Implement rate limiting for email sending

## Troubleshooting

### Common Issues

1. **Email not sending**: Check environment variables and SendGrid configuration
2. **Auth0 errors**: Verify Auth0 domain and client credentials
3. **Template errors**: Ensure SendGrid template IDs are correct
4. **Permission errors**: Verify user has appropriate role permissions
5. **Auth0 M2M errors**: If you get "Grant type 'client_credentials' not allowed", see AUTH0_CONFIGURATION_FIX.md

### Auth0 Configuration Issue (Most Common)

If you see this error:
```
POST https://your-domain.auth0.com/oauth/token 403 (Forbidden)
Grant type 'client_credentials' not allowed for the client
```

**Quick Fix**: The system automatically falls back to an alternative implementation that doesn't require M2M authentication.

**Permanent Fix**: See `AUTH0_CONFIGURATION_FIX.md` for detailed instructions on configuring Auth0 for Machine-to-Machine authentication.

### Debug Steps

1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Test with the EmailTestPanel component
4. Check SendGrid dashboard for email delivery status
5. Verify Auth0 user exists and is properly configured

## Support

For issues or questions about the email features implementation, check:
1. Console logs for detailed error messages
2. Network tab for API call failures
3. SendGrid dashboard for email delivery issues
4. Auth0 dashboard for user management issues
