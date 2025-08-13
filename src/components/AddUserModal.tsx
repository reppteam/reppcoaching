import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightBaseUserService, CreateUserInput } from '../services/8baseUserService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  UserPlus, 
  Users, 
  Shield, 
  ShieldCheck, 
  Crown,
  GraduationCap,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: (user: any) => void;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

export function AddUserModal({ open, onOpenChange, onUserCreated }: AddUserModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    assigned_admin_id: '',
    access_start: '',
    access_end: '',
    has_paid: false,
    isActive: true
  });

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  const loadRoles = async () => {
    try {
      const availableRoles = await eightBaseUserService.getAllRoles();
      setRoles(availableRoles);
    } catch (error) {
      console.error('Failed to load roles:', error);
      setError('Failed to load available roles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userInput: CreateUserInput = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: formData.role ? [formData.role] : undefined
      };

      let createdUser;
      
      // Create user based on role
      if (formData.role) {
        const selectedRole = roles.find(r => r.id === formData.role);
        if (selectedRole?.name === 'Student' || selectedRole?.name === 'user') {
          createdUser = await eightBaseUserService.createStudentUser({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName
          });
        } else if (selectedRole?.name === 'Coach' || selectedRole?.name === 'coach') {
          createdUser = await eightBaseUserService.createCoachUser({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName
          });
        } else if (selectedRole?.name === 'Coach Manager' || selectedRole?.name === 'coach_manager') {
          createdUser = await eightBaseUserService.createCoachManagerUser({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName
          });
        } else {
          createdUser = await eightBaseUserService.createUser(userInput);
        }
      } else {
        createdUser = await eightBaseUserService.createUser(userInput);
      }

      setSuccess('User created successfully!');
      onUserCreated?.(createdUser);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        assigned_admin_id: '',
        access_start: '',
        access_end: '',
        has_paid: false,
        isActive: true
      });

      // Close modal after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to create user:', error);
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin':
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'Coach Manager':
      case 'coach_manager':
        return <ShieldCheck className="h-4 w-4" />;
      case 'Coach':
      case 'coach':
        return <Shield className="h-4 w-4" />;
      case 'Student':
      case 'user':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin':
      case 'super_admin':
        return 'default';
      case 'Coach Manager':
      case 'coach_manager':
        return 'secondary';
      case 'Coach':
      case 'coach':
        return 'outline';
      case 'Student':
      case 'user':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account with appropriate role and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>
                Enter the user's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role & Permissions</CardTitle>
              <CardDescription>
                Select the user's role and access level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">User Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.name)}
                          <span>{role.name}</span>
                          {role.description && (
                            <Badge variant={getRoleBadgeVariant(role.name)} className="ml-auto">
                              {role.description}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Student-specific fields */}
          {(formData.role && roles.find(r => r.id === formData.role)?.name === 'Student') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
                <CardDescription>
                  Additional information for student accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_admin_id">Assigned Coach</Label>
                  <Input
                    id="assigned_admin_id"
                    value={formData.assigned_admin_id}
                    onChange={(e) => handleInputChange('assigned_admin_id', e.target.value)}
                    placeholder="Enter coach ID"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="access_start">Access Start Date</Label>
                    <Input
                      id="access_start"
                      type="date"
                      value={formData.access_start}
                      onChange={(e) => handleInputChange('access_start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access_end">Access End Date</Label>
                    <Input
                      id="access_end"
                      type="date"
                      value={formData.access_end}
                      onChange={(e) => handleInputChange('access_end', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_paid"
                    checked={formData.has_paid}
                    onCheckedChange={(checked) => handleInputChange('has_paid', checked as boolean)}
                  />
                  <Label htmlFor="has_paid">Has Paid Subscription</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
              <CardDescription>
                Set the initial account status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                />
                <Label htmlFor="isActive">Account is active</Label>
              </div>
            </CardContent>
          </Card>

          {/* Error and Success Messages */}
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating User...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 