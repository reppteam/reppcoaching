import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Loader2, Shield, ShieldOff, Lock, Unlock } from 'lucide-react';
import { accountBlockingService, UserBlockingStatus } from '../services/accountBlockingService';

export function AccountBlockingTest() {
  const [email, setEmail] = useState('');
  const [blockingStatus, setBlockingStatus] = useState<UserBlockingStatus>({ isBlocked: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const loadBlockingStatus = async () => {
    if (!email.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      const status = await accountBlockingService.getUserBlockingStatus(email);
      setBlockingStatus(status);
    } catch (error) {
      console.error('Error loading blocking status:', error);
      setError('Failed to load blocking status');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockAccount = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await accountBlockingService.blockUserAccount(
        email,
        blockReason || 'Account deactivated by administrator',
        'test-admin@example.com'
      );

      if (result.success) {
        setSuccess(result.message || 'Account blocked successfully');
        setBlockReason('');
        await loadBlockingStatus(); // Refresh status
      } else {
        setError(result.error || 'Failed to block account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to block account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockAccount = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await accountBlockingService.unblockUserAccount(
        email,
        'test-admin@example.com'
      );

      if (result.success) {
        setSuccess(result.message || 'Account unblocked successfully');
        await loadBlockingStatus(); // Refresh status
      } else {
        setError(result.error || 'Failed to unblock account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unblock account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Blocking Test
          </CardTitle>
          <CardDescription>
            Test the account blocking functionality for Auth0 and 8base integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-email" className="text-foreground">User Email</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user email to test..."
                className="flex-1"
              />
              <Button 
                onClick={loadBlockingStatus} 
                disabled={loading || !email.trim()}
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check Status'}
              </Button>
            </div>
          </div>

          {blockingStatus.isBlocked !== undefined && email && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Account Status</h3>
                <Badge variant={blockingStatus.isBlocked ? "destructive" : "default"}>
                  {blockingStatus.isBlocked ? 'Blocked' : 'Active'}
                </Badge>
              </div>
              {blockingStatus.blockedAt && (
                <p className="text-sm text-muted-foreground">
                  Blocked on: {new Date(blockingStatus.blockedAt).toLocaleString()}
                </p>
              )}
              {blockingStatus.reason && (
                <p className="text-sm text-muted-foreground">
                  Reason: {blockingStatus.reason}
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="block-reason" className="text-foreground">Block Reason (Optional)</Label>
            <Input
              id="block-reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter reason for blocking..."
              className="mt-1"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleBlockAccount}
              disabled={loading || !email.trim() || blockingStatus.isBlocked}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Block Account
            </Button>
            <Button
              onClick={handleUnblockAccount}
              disabled={loading || !email.trim() || !blockingStatus.isBlocked}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
              Unblock Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Account Blocking Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-2">When you block an account:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The user is blocked in Auth0 using the Management API</li>
              <li>The user's <code>is_active</code> status is set to <code>false</code> in 8base</li>
              <li>The user will receive an error message when trying to log in</li>
              <li>All existing sessions are invalidated</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">When you unblock an account:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The user is unblocked in Auth0</li>
              <li>The user's <code>is_active</code> status is set to <code>true</code> in 8base</li>
              <li>The user can log in normally again</li>
            </ul>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This functionality requires proper Auth0 Management API credentials 
              and 8base permissions to be configured.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
