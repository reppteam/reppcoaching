import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { auth0UserCreationService } from '../services/auth0UserCreationService';
import { auth0TokenService } from '../services/auth0TokenService';

export function Auth0DebugPanel() {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testAuth0Token = async () => {
    setLoading(true);
    addResult('🔑 Testing Auth0 Management Token...');
    
    try {
      const token = await auth0TokenService.getManagementToken();
      addResult(`✅ Auth0 Management Token: ${token.substring(0, 20)}...`);
    } catch (error) {
      addResult(`❌ Auth0 Token Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateAuth0User = async () => {
    setLoading(true);
    addResult('👤 Testing Auth0 User Creation...');
    
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
        addResult(`✅ User Creation Success: ${result.message}`);
        addResult(`📊 Auth0 User Created: ${result.auth0UserCreated}`);
        addResult(`📧 Password Reset Sent: ${result.passwordResetSent}`);
        addResult(`📚 Role Record Created: ${result.roleSpecificRecordCreated}`);
      } else {
        addResult(`❌ User Creation Failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCheckUserExists = async () => {
    setLoading(true);
    addResult('🔍 Checking if user exists...');
    
    try {
      const result = await auth0UserCreationService.checkUserExists(testEmail);
      addResult(`📊 8base User Exists: ${result.exists}`);
      addResult(`🔐 Auth0 User Exists: ${result.auth0Exists || false}`);
    } catch (error) {
      addResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAuth0API = async () => {
    setLoading(true);
    addResult('🌐 Testing direct Auth0 API call...');
    
    try {
      const managementToken = await auth0TokenService.getManagementToken();
      
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(testEmail)}`, {
        headers: {
          'Authorization': `Bearer ${managementToken}`
        }
      });

      if (response.ok) {
        const users = await response.json();
        addResult(`✅ Direct API Success: Found ${users.length} users`);
      } else {
        const error = await response.json();
        addResult(`❌ Direct API Error: ${error.message || error.error}`);
      }
    } catch (error) {
      addResult(`❌ Direct API Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Auth0 Debug Panel</CardTitle>
        <CardDescription>
          Debug Auth0 user creation and configuration issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="debug-email">Test Email</Label>
          <Input
            id="debug-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test"
            className="mt-1"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testAuth0Token} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Auth0 Token
          </Button>
          
          <Button 
            onClick={testDirectAuth0API} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Direct API
          </Button>
          
          <Button 
            onClick={testCheckUserExists} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Check User Exists
          </Button>
          
          <Button 
            onClick={testCreateAuth0User} 
            disabled={loading}
            variant="default"
            size="sm"
          >
            Create Test User
          </Button>
          
          <Button 
            onClick={clearResults} 
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            Clear Results
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2">Environment Variables:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Auth0 Domain: {process.env.REACT_APP_AUTH0_DOMAIN || '❌ Not set'}</div>
            <div>Auth0 Client ID: {process.env.REACT_APP_AUTH0_CLIENT_ID || '❌ Not set'}</div>
            <div>Auth0 Client Secret: {process.env.REACT_APP_AUTH0_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}</div>
            <div>Auth0 Audience: {process.env.REACT_APP_AUTH0_AUDIENCE || '❌ Not set'}</div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md max-h-96 overflow-y-auto">
            <h4 className="font-semibold mb-2">Debug Results:</h4>
            <div className="space-y-1">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <h4 className="font-semibold text-yellow-900 mb-2">Common Issues & Solutions:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li><strong>Token Error:</strong> Check Auth0 Client Secret and Management API permissions</li>
            <li><strong>User Creation Fails:</strong> Verify create:users scope is granted</li>
            <li><strong>Password Reset Fails:</strong> Check email provider configuration in Auth0</li>
            <li><strong>API Errors:</strong> Verify Auth0 Domain and Client ID are correct</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
