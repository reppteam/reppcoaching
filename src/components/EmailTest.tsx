import React, { useState } from 'react';
import { userInvitationService } from '../services/userInvitationService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function EmailTest() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user' as 'user' | 'coach' | 'coach_manager' | 'super_admin',
    customMessage: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const invitationData = {
        ...formData,
        invited_by: 'Test User',
        has_paid: false
      };

      const result = await userInvitationService.createUserWithInvitation(invitationData);
      
      if (result.success) {
        setResult(result);
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'user': 'Student',
      'coach': 'Coach',
      'coach_manager': 'Coach Manager',
      'super_admin': 'Super Administrator'
    };
    return roleMap[role] || role;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          SendGrid Email Test
        </CardTitle>
        <CardDescription>
          Test the automated email invitation system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="test@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'user' | 'coach' | 'coach_manager' | 'super_admin') => 
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Student</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="coach_manager">Coach Manager</SelectItem>
                <SelectItem value="super_admin">Super Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Message (Optional)</Label>
            <Textarea
              id="customMessage"
              value={formData.customMessage}
              onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Test Invitation
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Success!</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>User Created:</span>
                <Badge variant="outline">{result.user ? 'Yes' : 'No'}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Email Sent:</span>
                <Badge variant={result.emailSent ? "default" : "destructive"}>
                  {result.emailSent ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              {result.user && (
                <div className="p-2 bg-muted rounded text-xs">
                  <strong>User ID:</strong> {result.user.id}
                </div>
              )}
              
              {result.invitationId && (
                <div className="p-2 bg-muted rounded text-xs">
                  <strong>Invitation ID:</strong> {result.invitationId}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
