import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Loader2, User, Shield } from 'lucide-react';
import { eightbaseService } from '../services/8baseService';
import { accountBlockingService } from '../services/accountBlockingService';

export function UserStatusTest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userStatus, setUserStatus] = useState<any>(null);

  const checkUserStatus = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Get user from 8base
      const user = await eightbaseService.getUserByEmail(email);
      if (!user) {
        setError('User not found');
        return;
      }

      // Get blocking status
      const blockingStatus = await accountBlockingService.getUserBlockingStatus(email);
      
      setUserStatus({
        user,
        blockingStatus
      });

      setSuccess('User status retrieved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (isActive: boolean) => {
    if (!userStatus?.user) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Update user with is_active status
      const updateData = {
        is_active: isActive
      };

      await eightbaseService.updateUser(userStatus.user.id, updateData);
      
      setSuccess(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      
      // Refresh user status
      await checkUserStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <User className="h-5 w-5" />
            User Status Test
          </CardTitle>
          <CardDescription>
            Test user status updates with is_active field
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status-email" className="text-foreground">User Email</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="status-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user email to check status..."
                className="flex-1"
              />
              <Button 
                onClick={checkUserStatus} 
                disabled={loading || !email.trim()}
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check Status'}
              </Button>
            </div>
          </div>

          {userStatus && (
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">User Information</h3>
                <Badge variant={userStatus.user.is_active !== false ? "default" : "destructive"}>
                  {userStatus.user.is_active !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {userStatus.user.firstName} {userStatus.user.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {userStatus.user.email}
                </div>
                <div>
                  <strong>is_active:</strong> {userStatus.user.is_active?.toString() || 'undefined'}
                </div>
                <div>
                  <strong>has_paid:</strong> {userStatus.user.has_paid?.toString() || 'undefined'}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(userStatus.user.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Updated:</strong> {userStatus.user.updatedAt ? new Date(userStatus.user.updatedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium">Blocking Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {userStatus.blockingStatus.isBlocked ? 'User is blocked' : 'User is not blocked'}
                  </p>
                </div>
                <Badge variant={userStatus.blockingStatus.isBlocked ? "destructive" : "default"}>
                  {userStatus.blockingStatus.isBlocked ? 'Blocked' : 'Not Blocked'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => updateUserStatus(true)}
                  disabled={loading || userStatus.user.is_active === true}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Set Active (is_active: true)
                </Button>
                <Button
                  onClick={() => updateUserStatus(false)}
                  disabled={loading || userStatus.user.is_active === false}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                  Set Inactive (is_active: false)
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-black dark:text-white p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-black dark:text-white p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How is_active Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-2">When is_active is set to false:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The user is considered "inactive" or "blocked"</li>
              <li>The account blocking service recognizes this as a blocked user</li>
              <li>The UI shows "Blocked" or "Inactive" status</li>
              <li>Auth0 blocking should also be applied for complete blocking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">When is_active is set to true:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The user is considered "active"</li>
              <li>The user can log in normally (if not blocked in Auth0)</li>
              <li>The UI shows "Active" status</li>
            </ul>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> The account blocking service automatically sets is_active to false when blocking a user, 
              and true when unblocking a user.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
