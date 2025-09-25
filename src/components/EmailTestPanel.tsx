import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertCircle, CheckCircle, Loader2, Mail, Key } from 'lucide-react';
import { userInvitationService, InvitationData } from '../services/userInvitationService';
import { forgotPasswordService } from '../services/forgotPasswordService';
import { alternativeForgotPasswordService } from '../services/alternativeForgotPasswordService';

export function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTestResendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      setResult({ type: 'error', message: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Create a mock user for testing
      const mockUser = {
        id: 'test-user-id',
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        role: 'coach' as const,
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: false,
        created_at: new Date().toISOString(),
        coaching_term_start: null,
        coaching_term_end: null,
        is_active: true
      };

      const invitationData: InvitationData = {
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        role: 'coach',
        invited_by: 'Test Administrator',
        custom_message: customMessage
      };

      const result = await userInvitationService.resendInvitation(mockUser.id, invitationData);
      
      if (result.success) {
        setResult({ 
          type: 'success', 
          message: 'Resend invitation test completed successfully! Check the console for details.' 
        });
      } else {
        setResult({ 
          type: 'error', 
          message: result.error || 'Failed to send resend invitation test' 
        });
      }
    } catch (error) {
      setResult({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Test failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      setResult({ type: 'error', message: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Try the original service first
      let result = await forgotPasswordService.requestPasswordReset(testEmail);
      
      // If the original service fails due to Auth0 configuration issues, use the alternative
      if (!result.success && result.error?.includes('client_credentials')) {
        console.log('Auth0 M2M not configured, using alternative approach');
        result = await alternativeForgotPasswordService.requestPasswordReset(testEmail);
      }
      
      if (result.success) {
        setResult({ 
          type: 'success', 
          message: 'Forgot password test completed successfully! Check the console for details.' 
        });
      } else {
        setResult({ 
          type: 'error', 
          message: result.error || 'Failed to send forgot password test' 
        });
      }
    } catch (error) {
      setResult({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Test failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
          <Mail className="h-5 w-5" />
          Email Functionality Test Panel
        </CardTitle>
        <CardDescription>
          Test the resend invitation and forgot password email functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="custom-message">Custom Message (for resend invitation)</Label>
          <Textarea
            id="custom-message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Optional custom message for the invitation email..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form onSubmit={handleTestResendInvitation}>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !testEmail}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              Test Resend Invitation
            </Button>
          </form>

          <form onSubmit={handleTestForgotPassword}>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !testEmail}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Key className="mr-2 h-4 w-4" />
              Test Forgot Password
            </Button>
          </form>
        </div>

        {result && (
          <div className={`flex items-center gap-2 text-black dark:text-white p-3 rounded-md ${
            result.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm ${
              result.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.message}
            </span>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Note:</strong> This is a test panel for development purposes only.</p>
          <p><strong>Resend Invitation:</strong> Tests the resend invitation email functionality using the userInvitationService.</p>
          <p><strong>Forgot Password:</strong> Tests the password reset email functionality using the forgotPasswordService.</p>
          <p><strong>Environment Variables Required:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>REACT_APP_AUTH0_DOMAIN</li>
            <li>REACT_APP_AUTH0_CLIENT_ID</li>
            <li>REACT_APP_SENDGRID_API_KEY</li>
            <li>REACT_APP_SENDGRID_FROM_EMAIL</li>
            <li>REACT_APP_SENDGRID_COACH_TEMPLATE_ID</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
