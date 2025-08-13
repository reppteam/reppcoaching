import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, User, Shield } from 'lucide-react';
import { auth0UserService } from '../services/auth0UserService';

export function CoachInvitationExample() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'coach' | 'coach_manager'>('coach');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const invitationData = {
        email,
        role,
        invitedBy: 'admin-user-id', // This would come from current admin
        invitationToken: 'invitation-token-' + Date.now() // This would be generated
      };

      const invitedUser = await auth0UserService.handleCoachInvitation(invitationData);
      
      setSuccess(`Successfully invited ${email} as a ${role}. They can now sign in with Auth0.`);
      setEmail('');
    } catch (error: any) {
      setError(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Invite Coach
          </CardTitle>
          <CardDescription>
            Send an invitation to a coach or coach manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coach">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Coach
                    </div>
                  </SelectItem>
                  <SelectItem value="coach_manager">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Coach Manager
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">How invitations work:</h4>
            <div className="space-y-1 text-sm">
              <div>• Coach receives invitation email</div>
              <div>• They sign in with Auth0</div>
              <div>• Automatically gets coach role</div>
              <div>• Access to coach dashboard</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 