import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { saasUserCreationService } from '../services/saasUserCreationService';

export function SaasUserCreationTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [testForm, setTestForm] = useState({
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    role: 'user' as 'user' | 'coach' | 'coach_manager' | 'super_admin',
    is_active: true,
    has_paid: false,
    assignedCoachId: 'none'
  });

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testUserCreation = async () => {
    setLoading(true);
    addResult('🚀 Testing SaaS User Creation Flow...');
    
    try {
      // Check if user exists
      addResult('🔍 Checking if user already exists...');
      const userExists = await saasUserCreationService.checkUserExists(testForm.email);
      
      if (userExists.exists) {
        addResult(`❌ User already exists in Auth0: ${userExists.auth0UserId}`);
        return;
      }
      
      addResult('✅ User does not exist, proceeding with creation...');
      
      // Create user with invitation
      addResult('👤 Creating user in Auth0...');
      const result = await saasUserCreationService.createUserWithInvitation(testForm);
      
      if (result.success) {
        addResult('✅ User creation successful!');
        addResult(`📧 Verification email sent: ${result.verificationSent}`);
        addResult(`🆔 Auth0 User ID: ${result.auth0UserId}`);
        if (result.verificationLink) {
          addResult(`🔗 Verification Link: ${result.verificationLink}`);
        }
        addResult('');
        addResult('📋 Next Steps:');
        addResult('1. Check email for verification link');
        addResult('2. User clicks link to verify email');
        addResult('3. User can log in with email and password (same as email)');
        addResult('4. 8base will auto-create profile on first login');
      } else {
        addResult(`❌ User creation failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCheckUser = async () => {
    setLoading(true);
    addResult('🔍 Checking user existence...');
    
    try {
      const result = await saasUserCreationService.checkUserExists(testForm.email);
      addResult(`📊 User exists: ${result.exists}`);
      addResult(`🔐 Auth0 exists: ${result.auth0Exists || false}`);
      if (result.auth0UserId) {
        addResult(`🆔 Auth0 User ID: ${result.auth0UserId}`);
      }
    } catch (error) {
      addResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testResendVerification = async () => {
    setLoading(true);
    addResult('📧 Testing verification email resend...');
    
    try {
      const result = await saasUserCreationService.resendVerificationEmail(testForm.email);
      
      if (result.success) {
        addResult('✅ Verification email sent successfully');
        addResult(`🔐 Password: ${testForm.email} (same as email)`);
      } else {
        addResult(`❌ Failed: ${result.error}`);
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
        <CardTitle>SaaS User Creation Test</CardTitle>
        <CardDescription>
          Test the proper SaaS user invitation flow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="test-firstName">First Name</Label>
            <Input
              id="test-firstName"
              value={testForm.firstName}
              onChange={(e) => setTestForm({...testForm, firstName: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="test-lastName">Last Name</Label>
            <Input
              id="test-lastName"
              value={testForm.lastName}
              onChange={(e) => setTestForm({...testForm, lastName: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="test-email">Email</Label>
          <Input
            id="test-email"
            type="email"
            value={testForm.email}
            onChange={(e) => setTestForm({...testForm, email: e.target.value})}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="test-role">Role</Label>
          <Select value={testForm.role} onValueChange={(value) => setTestForm({...testForm, role: value as any})}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Student</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="coach_manager">Coach Manager</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="test-is_active"
              checked={testForm.is_active}
              onCheckedChange={(checked) => setTestForm({...testForm, is_active: checked as boolean})}
            />
            <Label htmlFor="test-is_active">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="test-has_paid"
              checked={testForm.has_paid}
              onCheckedChange={(checked) => setTestForm({...testForm, has_paid: checked as boolean})}
            />
            <Label htmlFor="test-has_paid">Paid Account</Label>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testCheckUser} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Check User Exists
          </Button>
          
          <Button 
            onClick={testUserCreation} 
            disabled={loading}
            variant="default"
            size="sm"
          >
            Create Test User
          </Button>
          
          <Button 
            onClick={testResendVerification} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Resend Verification
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

        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h4 className="font-semibold text-green-900 mb-2">SaaS Flow Benefits:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>✅ Users get verification emails with password info</li>
            <li>✅ Password is same as email address (simple login)</li>
            <li>✅ 8base auto-creates user profiles on first login</li>
            <li>✅ No manual 8base user creation needed</li>
            <li>✅ Proper role metadata stored in Auth0</li>
            <li>✅ Simple verification flow</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
