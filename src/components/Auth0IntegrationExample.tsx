import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from './auth/Auth0Context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, User, GraduationCap, Shield } from 'lucide-react';

export function Auth0IntegrationExample() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();
  const { user, isInitialized } = useAuth();

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-black dark:text-white">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Real Estate Photographer Pro</CardTitle>
            <CardDescription>
              Sign in to access your student dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => loginWithRedirect()} className="w-full">
              Sign In with Auth0
            </Button>
            
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">How it works:</h4>
              <div className="space-y-2 text-sm">
                <div>• <strong>New users</strong> automatically become students</div>
                <div>• <strong>Coaches</strong> are invited by admins only</div>
                <div>• <strong>Admins</strong> are invited by super admins only</div>
                <div>• <strong>No manual signup</strong> - Auth0 handles everything</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appUser = user.appUser;
  const roleDisplayName = appUser?.role === 'user' ? 'Student' : 
                         appUser?.role === 'coach' ? 'Coach' : 
                         appUser?.role === 'coach_manager' ? 'Coach Manager' : 
                         appUser?.role === 'super_admin' ? 'Super Admin' : 'Unknown';

  const getRoleIcon = () => {
    switch (appUser?.role) {
      case 'user':
        return <GraduationCap className="h-5 w-5" />;
      case 'coach':
      case 'coach_manager':
        return <User className="h-5 w-5" />;
      case 'super_admin':
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            {getRoleIcon()}
            Welcome, {user.name}!
          </CardTitle>
          <CardDescription>
            You are logged in as a {roleDisplayName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth0 User Info */}
          <div className="p-4 bg-blue-50 rounded">
            <h4 className="font-medium mb-2 text-blue-900">Auth0 Profile</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Status:</strong> {user.status}</div>
            </div>
          </div>

          {/* App User Info */}
          {appUser && (
            <div className="p-4 bg-green-50 rounded">
              <h4 className="font-medium mb-2 text-green-900">App Profile</h4>
              <div className="space-y-1 text-sm text-green-800">
                <div><strong>Role:</strong> 
                  <Badge className="ml-2" variant="secondary">
                    {roleDisplayName}
                  </Badge>
                </div>
                <div><strong>Paid Status:</strong> 
                  <Badge className="ml-2" variant={appUser.has_paid ? "default" : "secondary"}>
                    {appUser.has_paid ? 'Paid' : 'Free'}
                  </Badge>
                </div>
                {appUser.role === 'user' && (
                  <div><strong>Coaching Term:</strong> {appUser.coaching_term_start} to {appUser.coaching_term_end}</div>
                )}
                {appUser.assigned_admin_id && (
                  <div><strong>Assigned Coach:</strong> {appUser.assigned_admin_id}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {appUser?.role === 'user' && (
              <Button className="w-full" variant="default">
                Go to Student Dashboard
              </Button>
            )}
            {appUser?.role === 'coach' && (
              <Button className="w-full" variant="default">
                Go to Coach Dashboard
              </Button>
            )}
            {appUser?.role === 'super_admin' && (
              <Button className="w-full" variant="default">
                Go to Admin Dashboard
              </Button>
            )}
            <Button onClick={() => logout()} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>

          {/* Info for new students */}
          {appUser?.role === 'user' && (
            <div className="p-4 bg-yellow-50 rounded">
              <h4 className="font-medium mb-2 text-yellow-900">Next Steps</h4>
              <div className="space-y-1 text-sm text-yellow-800">
                <div>• Complete your student profile</div>
                <div>• Set up your business information</div>
                <div>• Start tracking your goals and progress</div>
                <div>• Connect with your assigned coach</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 