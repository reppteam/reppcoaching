import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { auth0TokenService } from '../services/auth0TokenService';

export function Auth0ErrorDebugger() {
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
      addResult(`✅ Auth0 Management Token obtained: ${token.substring(0, 20)}...`);
      addResult(`✅ Token length: ${token.length} characters`);
    } catch (error) {
      addResult(`❌ Auth0 Token Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Additional debugging
      addResult(`🔍 Checking environment variables:`);
      addResult(`   - REACT_APP_AUTH0_DOMAIN: ${process.env.REACT_APP_AUTH0_DOMAIN || '❌ NOT SET'}`);
      addResult(`   - REACT_APP_AUTH0_CLIENT_ID: ${process.env.REACT_APP_AUTH0_CLIENT_ID || '❌ NOT SET'}`);
      addResult(`   - REACT_APP_AUTH0_CLIENT_SECRET: ${process.env.REACT_APP_AUTH0_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
      addResult(`   - REACT_APP_AUTH0_AUDIENCE: ${process.env.REACT_APP_AUTH0_AUDIENCE || '❌ NOT SET'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAuth0API = async () => {
    setLoading(true);
    addResult('🌐 Testing direct Auth0 Management API...');
    
    try {
      const managementToken = await auth0TokenService.getManagementToken();
      
      // Test the users endpoint
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users?per_page=1`, {
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Direct API Success: Can access users endpoint`);
        addResult(`   - Found ${data.length} users (showing first 1)`);
      } else {
        const error = await response.json();
        addResult(`❌ Direct API Error: ${error.message || error.error}`);
        addResult(`   - Status: ${response.status}`);
        addResult(`   - Status Text: ${response.statusText}`);
      }
    } catch (error) {
      addResult(`❌ Direct API Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);
    addResult('👤 Testing Auth0 user creation...');
    
    try {
      const managementToken = await auth0TokenService.getManagementToken();
      
      const testUserData = {
        email: `test-${Date.now()}@example.com`,
        given_name: 'Test',
        family_name: 'User',
        name: 'Test User',
        connection: 'Username-Password-Authentication',
        email_verified: false,
        app_metadata: {
          role: 'user',
          is_active: true,
          has_paid: false
        }
      };

      addResult(`📧 Creating test user: ${testUserData.email}`);

      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUserData)
      });

      if (response.ok) {
        const user = await response.json();
        addResult(`✅ User creation successful!`);
        addResult(`   - User ID: ${user.user_id}`);
        addResult(`   - Email: ${user.email}`);
        
        // Clean up - delete the test user
        try {
          await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${user.user_id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${managementToken}`
            }
          });
          addResult(`🗑️ Test user cleaned up`);
        } catch (cleanupError) {
          addResult(`⚠️ Could not clean up test user: ${cleanupError}`);
        }
      } else {
        const error = await response.json();
        addResult(`❌ User creation failed:`);
        addResult(`   - Status: ${response.status}`);
        addResult(`   - Error: ${error.message || error.error}`);
        addResult(`   - Error Code: ${error.code || 'N/A'}`);
        addResult(`   - Description: ${error.description || 'N/A'}`);
        
        // Common error solutions
        if (error.code === 'insufficient_scope') {
          addResult(`💡 Solution: Grant 'create:users' scope in Auth0 Management API`);
        } else if (error.code === 'invalid_request') {
          addResult(`💡 Solution: Check connection name and user data format`);
        } else if (response.status === 401) {
          addResult(`💡 Solution: Check Auth0 Client Secret and Management API setup`);
        }
      }
    } catch (error) {
      addResult(`❌ Exception during user creation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth0Setup = () => {
    addResult('🔍 Auth0 Setup Checklist:');
    addResult(`   - Domain: ${process.env.REACT_APP_AUTH0_DOMAIN || '❌ NOT SET'}`);
    addResult(`   - Client ID: ${process.env.REACT_APP_AUTH0_CLIENT_ID || '❌ NOT SET'}`);
    addResult(`   - Client Secret: ${process.env.REACT_APP_AUTH0_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
    addResult(`   - Audience: ${process.env.REACT_APP_AUTH0_AUDIENCE || '❌ NOT SET'}`);
    addResult('');
    addResult('📋 Required Auth0 Dashboard Setup:');
    addResult('   1. Go to Applications → APIs → Auth0 Management API');
    addResult('   2. Enable your application (Machine to Machine)');
    addResult('   3. Grant these scopes:');
    addResult('      - create:users');
    addResult('      - read:users');
    addResult('      - update:users');
    addResult('      - delete:users');
    addResult('      - read:users_by_email');
    addResult('   4. Copy Client Secret to .env file');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Auth0 Error Debugger</CardTitle>
        <CardDescription>
          Debug why Auth0 user creation is failing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={checkAuth0Setup} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Check Setup
          </Button>
          
          <Button 
            onClick={testAuth0Token} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Token
          </Button>
          
          <Button 
            onClick={testDirectAuth0API} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test API Access
          </Button>
          
          <Button 
            onClick={testCreateUser} 
            disabled={loading}
            variant="default"
            size="sm"
          >
            Test User Creation
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

        {results.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md max-h-96 overflow-y-auto">
            <h4 className="font-semibold mb-2">Debug Results:</h4>
            <div className="space-y-1">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono whitespace-pre-wrap">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-red-50 rounded-md">
          <h4 className="font-semibold text-red-900 mb-2">Common Auth0 Creation Failures:</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li><strong>401 Unauthorized:</strong> Missing or wrong Client Secret</li>
            <li><strong>403 Forbidden:</strong> Missing 'create:users' scope</li>
            <li><strong>400 Bad Request:</strong> Wrong connection name or user data format</li>
            <li><strong>Token Error:</strong> Management API not enabled for your application</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
