import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Key, AlertCircle, CheckCircle, Loader2, Shield, ShieldOff, Lock, Unlock } from 'lucide-react';
import { forgotPasswordService } from '../services/forgotPasswordService';
import { alternativeForgotPasswordService } from '../services/alternativeForgotPasswordService';
import { accountBlockingService, UserBlockingStatus } from '../services/accountBlockingService';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';

interface UserActionsProps {
  user: User;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function UserActions({ user, onSuccess, onError }: UserActionsProps) {
  const { user: currentUser } = useAuth();
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [blockAccountDialogOpen, setBlockAccountDialogOpen] = useState(false);
  const [unblockAccountDialogOpen, setUnblockAccountDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [blockingStatus, setBlockingStatus] = useState<UserBlockingStatus>({ isBlocked: false });
  const [blockReason, setBlockReason] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Load blocking status when component mounts
  useEffect(() => {
    loadBlockingStatus();
  }, [user.email]);

  const loadBlockingStatus = async () => {
    try {
      setLoadingStatus(true);
      const status = await accountBlockingService.getUserBlockingStatus(user.email);
      setBlockingStatus(status);
    } catch (error) {
      console.error('Error loading blocking status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Try the original service first
      let result = await forgotPasswordService.requestPasswordReset(user.email);
      
      // If the original service fails due to Auth0 configuration issues, use the alternative
      if (!result.success && result.error?.includes('client_credentials')) {
        console.log('Auth0 M2M not configured, using alternative approach');
        result = await alternativeForgotPasswordService.requestPasswordReset(user.email);
      }
      
      if (result.success) {
        setSuccess(result.message || 'Password reset email sent successfully!');
        setForgotPasswordDialogOpen(false);
        onSuccess?.(result.message || 'Password reset email sent successfully!');
      } else {
        setError(result.error || 'Failed to send password reset email');
        onError?.(result.error || 'Failed to send password reset email');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await accountBlockingService.blockUserAccount(
        user.email,
        blockReason || 'Account deactivated by administrator',
        currentUser?.email
      );

      if (result.success) {
        setSuccess(result.message || 'Account blocked successfully');
        setBlockAccountDialogOpen(false);
        setBlockReason('');
        await loadBlockingStatus(); // Refresh status
        onSuccess?.(result.message || 'Account blocked successfully');
      } else {
        setError(result.error || 'Failed to block account');
        onError?.(result.error || 'Failed to block account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to block account';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await accountBlockingService.unblockUserAccount(
        user.email,
        currentUser?.email
      );

      if (result.success) {
        setSuccess(result.message || 'Account unblocked successfully');
        setUnblockAccountDialogOpen(false);
        await loadBlockingStatus(); // Refresh status
        onSuccess?.(result.message || 'Account unblocked successfully');
      } else {
        setError(result.error || 'Failed to unblock account');
        onError?.(result.error || 'Failed to unblock account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unblock account';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordDialogOpen} onOpenChange={setForgotPasswordDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Send Password Reset Email">
            <Key className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Send Password Reset Email
            </DialogTitle>
            <DialogDescription>
              Send a password reset email to {user.firstName} {user.lastName} ({user.email})
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                This will send a password reset email to the user. They will be able to set a new password using the link in the email.
              </p>
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForgotPasswordDialogOpen(false);
                  setError('');
                  setSuccess('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Email
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Block Account Dialog */}
      <Dialog open={blockAccountDialogOpen} onOpenChange={setBlockAccountDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            title="Block User Account"
            disabled={loadingStatus || blockingStatus.isBlocked}
          >
            <Lock className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Block User Account
            </DialogTitle>
            <DialogDescription>
              Block {user.firstName} {user.lastName} ({user.email}) from logging in
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBlockAccount} className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will prevent the user from logging in to the system. 
                They will receive an error message when attempting to log in. This action can be reversed by unblocking the account.
              </p>
            </div>

            <div>
              <Label htmlFor="block-reason" className="text-foreground">Reason for blocking (optional)</Label>
              <Textarea
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this account..."
                rows={3}
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBlockAccountDialogOpen(false);
                  setError('');
                  setSuccess('');
                  setBlockReason('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Block Account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unblock Account Dialog */}
      <Dialog open={unblockAccountDialogOpen} onOpenChange={setUnblockAccountDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            title="Unblock User Account"
            disabled={loadingStatus || !blockingStatus.isBlocked}
          >
            <Unlock className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-green-600" />
              Unblock User Account
            </DialogTitle>
            <DialogDescription>
              Restore login access for {user.firstName} {user.lastName} ({user.email})
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUnblockAccount} className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                This will restore the user's ability to log in to the system. 
                They will be able to access their account normally.
              </p>
            </div>

            {blockingStatus.blockedAt && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Account blocked on:</strong> {new Date(blockingStatus.blockedAt).toLocaleString()}
                </p>
                {blockingStatus.reason && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Reason:</strong> {blockingStatus.reason}
                  </p>
                )}
              </div>
            )}

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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUnblockAccountDialogOpen(false);
                  setError('');
                  setSuccess('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Unblock Account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
