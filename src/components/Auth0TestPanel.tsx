import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { auth0UserCreationService } from '../services/auth0UserCreationService';
import { forgotPasswordService } from '../services/forgotPasswordService';

export function Auth0TestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testPasswordReset = async () => {
    if (!testEmail) {
      setResult('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult('Testing password reset...');

    try {
      const result = await forgotPasswordService.sendPasswordResetEmail(testEmail);
      
      if (result.success) {
        setResult(`✅ Success: ${result.message}`);
      } else {
        setResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testUserExists = async () => {
    if (!testEmail) {
      setResult('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult('Checking if user exists...');

    try {
      const result = await auth0UserCreationService.checkUserExists(testEmail);
      
      setResult(`User exists in 8base: ${result.exists}\nUser exists in Auth0: ${result.auth0Exists || false}`);
    } catch (error) {
      setResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    if (!testEmail) {
      setResult('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult('Creating test user...');

    try {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        role: 'user' as const,
        is_active: true,
        has_paid: false,
        assignedCoachId: 'none'
      };

      const result = await auth0UserCreationService.createUserWithAuth0(userData);
      
      if (result.success) {
        setResult(`✅ Success: ${result.message}`);
      } else {
        setResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Auth0 Integration Test Panel</CardTitle>
        <CardDescription>
          Test Auth0 password reset and user creation functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Test Email</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test"
            className="mt-1"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testPasswordReset} 
            disabled={loading}
            variant="outline"
          >
            Test Password Reset
          </Button>
          
          <Button 
            onClick={testUserExists} 
            disabled={loading}
            variant="outline"
          >
            Check User Exists
          </Button>
          
          <Button 
            onClick={testCreateUser} 
            disabled={loading}
            variant="default"
          >
            Create Test User
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2">Environment Variables Check:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Auth0 Domain: {process.env.REACT_APP_AUTH0_DOMAIN || '❌ Not set'}</div>
            <div>Auth0 Client ID: {process.env.REACT_APP_AUTH0_CLIENT_ID || '❌ Not set'}</div>
            <div>Auth0 Client Secret: {process.env.REACT_APP_AUTH0_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-md">
          <h4 className="font-semibold text-yellow-900 mb-2">Auth0 Setup Checklist:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>✅ Enable password reset in Auth0 Dashboard</li>
            <li>✅ Configure email provider (SendGrid, etc.)</li>
            <li>✅ Enable Management API for your application</li>
            <li>✅ Grant required scopes (create:users, read:users, etc.)</li>
            <li>✅ Set up proper callback URLs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
