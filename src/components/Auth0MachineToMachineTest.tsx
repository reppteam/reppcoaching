import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { auth0TokenService } from '../services/auth0TokenService';

export function Auth0MachineToMachineTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testMachineToMachineToken = async () => {
    setLoading(true);
    addResult('🔑 Testing Machine to Machine Token...');
    
    try {
      const token = await auth0TokenService.getManagementToken();
      addResult(`✅ SUCCESS: Machine to Machine token obtained!`);
      addResult(`   Token: ${token.substring(0, 20)}...`);
      addResult(`   Length: ${token.length} characters`);
      addResult('');
      addResult('🎉 Your Auth0 Machine to Machine app is configured correctly!');
    } catch (error) {
      addResult(`❌ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addResult('');
      addResult('🔧 To fix this:');
      addResult('1. Go to Auth0 Dashboard → Applications');
      addResult('2. Create a new Machine to Machine application');
      addResult('3. Authorize Auth0 Management API');
      addResult('4. Grant required scopes (create:users, read:users, etc.)');
      addResult('5. Update your .env file with new Client ID and Secret');
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironmentVariables = () => {
    addResult('🔍 Checking Environment Variables:');
    addResult(`   REACT_APP_AUTH0_DOMAIN: ${process.env.REACT_APP_AUTH0_DOMAIN || '❌ NOT SET'}`);
    addResult(`   REACT_APP_AUTH0_CLIENT_ID: ${process.env.REACT_APP_AUTH0_CLIENT_ID || '❌ NOT SET'}`);
    addResult(`   REACT_APP_AUTH0_CLIENT_SECRET: ${process.env.REACT_APP_AUTH0_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
    addResult(`   REACT_APP_AUTH0_AUDIENCE: ${process.env.REACT_APP_AUTH0_AUDIENCE || '❌ NOT SET'}`);
    addResult('');
    
    if (!process.env.REACT_APP_AUTH0_CLIENT_SECRET) {
      addResult('⚠️ Missing REACT_APP_AUTH0_CLIENT_SECRET!');
      addResult('   This is required for Machine to Machine applications.');
    }
  };

  const testDirectTokenRequest = async () => {
    setLoading(true);
    addResult('🌐 Testing direct token request...');
    
    try {
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          client_secret: process.env.REACT_APP_AUTH0_CLIENT_SECRET,
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          grant_type: 'client_credentials'
        })
      });

      if (response.ok) {
        const data = await response.json();
        addResult('✅ Direct token request successful!');
        addResult(`   Access Token: ${data.access_token?.substring(0, 20)}...`);
        addResult(`   Token Type: ${data.token_type}`);
        addResult(`   Expires In: ${data.expires_in} seconds`);
      } else {
        const error = await response.json();
        addResult(`❌ Direct token request failed:`);
        addResult(`   Status: ${response.status}`);
        addResult(`   Error: ${error.error}`);
        addResult(`   Description: ${error.error_description}`);
        
        if (error.error === 'unauthorized_client') {
          addResult('');
          addResult('💡 This means your app is not configured as Machine to Machine!');
          addResult('   Solution: Create a new Machine to Machine application in Auth0.');
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
        <CardTitle>Auth0 Machine to Machine Test</CardTitle>
        <CardDescription>
          Test if your Auth0 Machine to Machine application is configured correctly
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
            onClick={testDirectTokenRequest} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Direct Request
          </Button>
          
          <Button 
            onClick={testMachineToMachineToken} 
            disabled={loading}
            variant="default"
            size="sm"
          >
            Test M2M Token
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

        <div className="mt-6 p-4 bg-red-50 rounded-md">
          <h4 className="font-semibold text-red-900 mb-2">Common Error: "Grant type 'client_credentials' not allowed"</h4>
          <div className="text-sm text-red-800 space-y-1">
            <p><strong>Cause:</strong> Your Auth0 app is not configured as Machine to Machine</p>
            <p><strong>Solution:</strong> Create a new Machine to Machine application in Auth0 Dashboard</p>
            <p><strong>Steps:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>1. Go to Applications → Create Application</li>
              <li>2. Select "Machine to Machine Applications"</li>
              <li>3. Authorize "Auth0 Management API"</li>
              <li>4. Grant required scopes</li>
              <li>5. Update .env with new Client ID and Secret</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
