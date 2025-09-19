import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { eightBaseM2MAuthService } from '../services/8baseM2MAuthService';

export function EightBaseM2MTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const test8baseM2M = async () => {
    setLoading(true);
    addResult('🔑 Testing Auth0 M2M Authentication...');
    
    try {
      const token = await eightBaseM2MAuthService.getManagementToken();
      addResult(`✅ SUCCESS: Token obtained!`);
      addResult(`   Token: ${token.substring(0, 20)}...`);
      addResult(`   Length: ${token.length} characters`);
      addResult(`   Token Type: ${token.startsWith('eyJ') ? 'JWT' : 'Other'}`);
      addResult('');
      addResult('🎉 Auth0 M2M authentication is working!');
    } catch (error) {
      addResult(`❌ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addResult('');
      addResult('🔧 To fix this:');
      addResult('1. Add REACT_APP_AUTH0_CLIENT_SECRET to your .env file');
      addResult('2. Get Client Secret from Auth0 Dashboard → Applications');
      addResult('3. Make sure your SPA app allows client_credentials grant type');
    } finally {
      setLoading(false);
    }
  };

  const testDirectAuth0M2M = async () => {
    setLoading(true);
    addResult('🌐 Testing Direct Auth0 M2M...');
    
    try {
      const token = await eightBaseM2MAuthService.getManagementToken();
      addResult(`✅ SUCCESS: Direct Auth0 M2M token obtained!`);
      addResult(`   Token: ${token.substring(0, 20)}...`);
      addResult(`   Length: ${token.length} characters`);
    } catch (error) {
      addResult(`❌ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addResult('');
      addResult('💡 This method requires REACT_APP_AUTH0_CLIENT_SECRET');
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironmentVariables = () => {
    addResult('🔍 Checking Environment Variables:');
    addResult(`   REACT_APP_AUTH0_DOMAIN: ${process.env.REACT_APP_AUTH0_DOMAIN || '❌ NOT SET'}`);
    addResult(`   REACT_APP_AUTH0_SPA_CLIENT_ID: ${process.env.REACT_APP_AUTH0_SPA_CLIENT_ID || '❌ NOT SET'}`);
    addResult(`   REACT_APP_EIGHT_BASE_M2M_AUTH_PROFILE_ID: ${process.env.REACT_APP_EIGHT_BASE_M2M_AUTH_PROFILE_ID || '❌ NOT SET'}`);
    addResult(`   REACT_APP_EIGHT_BASE_SPA_AUTH_PROFILE_ID: ${process.env.REACT_APP_EIGHT_BASE_SPA_AUTH_PROFILE_ID || '❌ NOT SET'}`);
    addResult(`   REACT_APP_AUTH0_CLIENT_SECRET: ${process.env.REACT_APP_AUTH0_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
    addResult('');
    
    if (!process.env.REACT_APP_EIGHT_BASE_M2M_AUTH_PROFILE_ID) {
      addResult('⚠️ Missing REACT_APP_EIGHT_BASE_M2M_AUTH_PROFILE_ID!');
      addResult('   This is required for 8base M2M authentication.');
    }
  };

  const testUserCreation = async () => {
    setLoading(true);
    addResult('👤 Testing User Creation with Auth0 Management API...');
    
    try {
      const managementToken = await eightBaseM2MAuthService.getManagementToken();
      
      // Check token format
      addResult(`🔍 Token Analysis:`);
      addResult(`   Length: ${managementToken.length} characters`);
      addResult(`   Starts with 'eyJ': ${managementToken.startsWith('eyJ') ? 'Yes (JWT)' : 'No'}`);
      addResult(`   Contains dots: ${managementToken.includes('.') ? 'Yes' : 'No'}`);
      
      const testUserData = {
        connection: 'Username-Password-Authentication',
        email: `test-${Date.now()}@example.com`,
        given_name: 'Test',
        family_name: 'User',
        name: 'Test User',
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
        addResult('✅ User creation successful!');
        addResult(`   User ID: ${user.user_id}`);
        addResult(`   Email: ${user.email}`);
        
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
        addResult(`   Status: ${response.status}`);
        addResult(`   Error: ${error.message || error.error}`);
        addResult(`   Error Code: ${error.code || 'N/A'}`);
        
        if (response.status === 400 && error.message?.includes('Bad HTTP authentication header format')) {
          addResult('');
          addResult('💡 This means the token format is wrong!');
          addResult('   Solution: Add REACT_APP_AUTH0_CLIENT_SECRET to .env');
        }
      }
    } catch (error) {
      addResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Auth0 M2M Authentication Test</CardTitle>
        <CardDescription>
          Test Auth0 Machine to Machine authentication for Management API access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={checkEnvironmentVariables} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Check Environment
          </Button>
          
          <Button 
            onClick={test8baseM2M} 
            disabled={loading}
            variant="default"
            size="sm"
          >
            Test 8base M2M
          </Button>
          
          <Button 
            onClick={testDirectAuth0M2M} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Direct Auth0 M2M
          </Button>
          
          <Button 
            onClick={testUserCreation} 
            disabled={loading}
            variant="outline"
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
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-1">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono whitespace-pre-wrap">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2">8base M2M Configuration:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Your Environment Variables:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>✅ REACT_APP_EIGHT_BASE_M2M_AUTH_PROFILE_ID: clwvx3afc002r09l8byzc488a</li>
              <li>✅ REACT_APP_EIGHT_BASE_SPA_AUTH_PROFILE_ID: clwvx4vyx002f09lbgec51z9f</li>
              <li>✅ REACT_APP_AUTH0_SPA_CLIENT_ID: JJJtwXaqMesAHi557D4VVX6CGRFi1hmx</li>
            </ul>
            <p className="mt-2"><strong>Next Steps:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>1. Test 8base M2M authentication</li>
              <li>2. If it works, your SaaS user creation will work</li>
              <li>3. If it fails, you may need to configure the M2M profile in 8base</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
