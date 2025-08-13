import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth0Service } from '../services/auth0Service';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ThemeToggle } from './ThemeToggle';
import { 
  LogIn, 
  AlertTriangle,
  Shield,
  Users,
  BarChart3
} from 'lucide-react';

export function Auth0Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Use Auth0 Universal Login
      await auth0Service.login();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo192.png"
                alt="Real Estate Photographer Pro" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold text-brand-gray">
                  REAL <span className="text-brand-blue">ESTATE</span>
                </h1>
                <p className="text-sm text-brand-blue font-medium -mt-1">
                  PHOTOGRAPHER PRO
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-brand-gray">Welcome</h2>
            <p className="text-muted-foreground">
              Sign in to your account using Auth0
            </p>
          </div>

          {/* Auth Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Student Portal</CardTitle>
              <CardDescription className="text-center">
                Access your coaching dashboard and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Secure authentication with Auth0</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Role-based access control</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Progress tracking and analytics</span>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                onClick={handleLogin} 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? 'Redirecting to Auth0...' : 'Sign In with Auth0'}
              </Button>

              {/* Error Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">About Auth0 Login</CardTitle>
              <CardDescription className="text-xs">
                This uses Auth0's Universal Login for secure authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs space-y-1">
                <div>• Secure password policies</div>
                <div>• Multi-factor authentication support</div>
                <div>• Social login options</div>
                <div>• Automatic session management</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 