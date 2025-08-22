import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { UniversalRegistration } from './UniversalRegistration';
import { userRegistrationService } from '../services/userRegistrationService';
import { User } from '../types';

export function RegistrationExample() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleRegistrationSuccess = (response: any) => {
    setCurrentUser(response.user);
    setShowRegistration(false);
    console.log('Registration successful:', response);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userRegistrationService.loginUser(loginData.email, loginData.password);
      setCurrentUser(response.user);
      console.log('Login successful:', response);
    } catch (error: any) {
      console.error('Login failed:', error.message);
    }
  };

  const handleLogout = () => {
    userRegistrationService.logout();
    setCurrentUser(null);
  };

  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome, {currentUser.firstName} {currentUser.lastName}!</CardTitle>
            <CardDescription>
              You are logged in as a {currentUser.role === 'user' ? 'Student' : 'Coach'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Email:</strong> {currentUser.email}
              </div>
              <div>
                <strong>Role:</strong> {currentUser.role}
              </div>
              <div>
                <strong>Paid Status:</strong> {currentUser.has_paid ? 'Paid' : 'Free'}
              </div>
              {currentUser.role === 'user' && (
                <div>
                  <strong>Coaching Term:</strong> {currentUser.coaching_term_start} to {currentUser.coaching_term_end}
                </div>
              )}
              <Button onClick={handleLogout} className="w-full">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRegistration) {
    return (
      <UniversalRegistration
        onSuccess={handleRegistrationSuccess}
        onCancel={() => setShowRegistration(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Real Estate Photographer Pro</CardTitle>
          <CardDescription>
            Login with existing account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="text-center">
            <span className="text-sm text-gray-500">or</span>
          </div>

          <Button 
            onClick={() => setShowRegistration(true)} 
            variant="outline" 
            className="w-full"
          >
            Create New Account
          </Button>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Demo Accounts:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Student:</strong> student@example.com / password
              </div>
              <div>
                <strong>Coach:</strong> coach@example.com / password
              </div>
              <div>
                <strong>Super Admin:</strong> superadmin@example.com / password
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 