import React, { useState, useEffect } from 'react';
import { eightBaseUserService } from '../services/8baseUserService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertTriangle, Loader2, Users } from 'lucide-react';

export function RoleTest() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const allRoles = await eightBaseUserService.getAllRoles();
      setRoles(allRoles);
      setSuccess(`Loaded ${allRoles.length} roles successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to load roles:', error);
      setError('Failed to load roles');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading roles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Roles in 8base
          </CardTitle>
          <CardDescription>
            These are the roles available in your 8base workspace for user assignment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span>Total Roles: {roles.length}</span>
              <Button onClick={loadRoles} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{role.name}</div>
                    {role.description && (
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    )}
                  </div>
                  <Badge variant="outline">ID: {role.id}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No roles found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
