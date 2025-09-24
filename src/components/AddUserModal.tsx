import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userInvitationService, InvitationData } from '../services/userInvitationService';
import { eightbaseService } from '../services/8baseService';
import { STATIC_ROLES, mapApplicationRoleTo8baseRole } from '../config/staticRoles';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
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
  AlertTriangle,
  Mail,
  Send
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

interface EightBaseRole {
  id: string;
  name: string;
}

export function AddUserModal({ open, onOpenChange, onUserCreated }: AddUserModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [eightbaseRoles, setEightbaseRoles] = useState<EightBaseRole[]>([]);
  const [availableCoaches, setAvailableCoaches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user', // Set a default role instead of empty string
    selectedRoleId: '', // Store the actual 8base role ID
    assigned_admin_id: 'none',
    assigned_students: 'none',
    access_start: '',
    access_end: '',
    has_paid: false,
    isActive: true,
    custom_message: ''
  });

  useEffect(() => {
    if (open) {
      loadRoles();
      loadEightbaseRoles();
      loadAvailableCoaches();
    }
  }, [open]);

  const loadRoles = async () => {
    try {
      // Define available roles for the application
      const availableRoles: Role[] = [
        { id: 'user', name: 'Student', description: 'Regular student user' },
        { id: 'coach', name: 'Coach', description: 'Coach who manages students' },
        { id: 'coach_manager', name: 'Coach Manager', description: 'Manager who oversees coaches' },
        { id: 'super_admin', name: 'Super Administrator', description: 'Full system access' }
      ];
      setRoles(availableRoles);
    } catch (error) {
      console.error('Failed to load roles:', error);
      setError('Failed to load available roles');
    }
  };

  const loadEightbaseRoles = async () => {
    try {
      // Use static roles instead of fetching from 8base
      setEightbaseRoles(STATIC_ROLES);
      
      // Set default role ID for student
      const defaultRole = STATIC_ROLES.find(role => 
        role.name.toLowerCase() === 'student'
      );
      
      if (defaultRole) {
        setFormData(prev => ({
          ...prev,
          selectedRoleId: defaultRole.id
        }));
      }
    } catch (error) {
      console.error('Failed to load static roles:', error);
      setError('Failed to load roles');
    }
  };

  const loadAvailableCoaches = async () => {
    try {
      const users = await eightbaseService.getAllUsersWithDetails();
      const coaches = users.filter(u => u.role === 'coach' || u.role === 'coach_manager');
      setAvailableCoaches(coaches);
    } catch (error) {
      console.error('Failed to load coaches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let newUser;
      
      // Validate role selection
      if (!formData.selectedRoleId) {
        throw new Error('Please select a valid role');
      }
      
      // Step 1: Always create user in User table first
        const invitationData: InvitationData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role as 'user' | 'coach' | 'coach_manager' | 'super_admin',
          selectedRoleId: formData.selectedRoleId,
          assigned_admin_id: formData.assigned_admin_id === 'none' ? undefined : formData.assigned_admin_id,
          access_start: formData.access_start || undefined,
          access_end: formData.access_end || undefined,
          has_paid: formData.has_paid,
          invited_by: `${user?.firstName} ${user?.lastName}` || 'System Administrator',
          custom_message: formData.custom_message || undefined
        };

      console.log('Step 1: Creating user in User table:', invitationData);
      const userResult = await userInvitationService.createUserWithInvitation(invitationData);
      
      if (!userResult.success) {
        throw new Error(userResult.error || 'Failed to create user');
      }
      
      newUser = userResult.user;
      console.log('User created successfully:', newUser);
      
      // The userInvitationService handles all the record creation logic
      // No need to create additional records here as it's handled by the service

      if (newUser) {
        let successMessage = 'User created';
        
        // Add email status information
        if (userResult.emailSent) {
          successMessage += ' and email sent';
        } else {
          successMessage += ' but email not sent - logout account and login again and send invitation';
        }
        
        setSuccess(successMessage);
        onUserCreated?.(newUser);
      } else {
        setError('Failed to create user.');
      }
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

  const handleRoleChange = (roleId: string) => {
    // Map application role to 8base role using static mapping
    const targetRole = mapApplicationRoleTo8baseRole(roleId);
    
    console.log('Role change:', {
      selectedRole: roleId,
      targetRole: targetRole,
      roleId: targetRole?.id
    });

    if (!targetRole) {
      console.error('No matching 8base role found for:', roleId);
      setError('Invalid role selection. Please try again.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      role: roleId,
      selectedRoleId: targetRole.id
    }));
    
    // Clear any previous errors
    setError('');
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
        return 'gradient';
      case 'Coach Manager':
      case 'coach_manager':
        return 'info';
      case 'Coach':
      case 'coach':
        return 'success';
      case 'Student':
      case 'user':
        return 'info';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
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
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Basic Info</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Role & Permissions</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Additional Info</span>
            </div>
          </div>
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
                  <Label htmlFor="firstName" className="text-foreground">First Name *</Label>
                                                                           <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                      required
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name *</Label>
                                                                           <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                      required
                    />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                  />
                </div>
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
                <Label htmlFor="role" className="text-foreground">User Role *</Label>
                                                                                                                                     <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => {
                      const connectedRole = mapApplicationRoleTo8baseRole(role.id);
                      const recordsCreated = role.id === 'coach' ? 'User + Coach' :
                                           role.id === 'user' ? 'User + Student' :
                                           'User only';
                      return (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2 w-full">
                            {getRoleIcon(role.name)}
                            <div className="flex flex-col flex-1">
                              <span>{role.name}</span>
                              {connectedRole && (
                                <span className="text-xs text-muted-foreground">
                                  Connects to: {connectedRole.name} • Creates: {recordsCreated}
                                </span>
                              )}
                            </div>
                            {role.description && (
                              <Badge variant={getRoleBadgeVariant(role.name)} className="ml-auto flex items-center gap-1.5">
                                {getRoleIcon(role.name)}
                                {role.description}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

                     {/* Student-specific fields */}
           {formData.role === 'user' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
                <CardDescription>
                  Additional information for student accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_admin_id" className="text-foreground">Assigned Coach</Label>
                                                                           <Select value={formData.assigned_admin_id} onValueChange={(value) => handleInputChange('assigned_admin_id', value)}>
                      <SelectTrigger className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white">
                        <SelectValue placeholder="Select a coach (optional)" />
                      </SelectTrigger>
                                         <SelectContent>
                       <SelectItem value="none">No coach assigned</SelectItem>
                       {availableCoaches.map((coach) => (
                        <SelectItem key={coach.id} value={coach.id}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>{coach.name}</span>
                            <Badge variant="outline" className="ml-auto">
                              {coach.role === 'coach' ? 'Coach' : 'Manager'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="access_start" className="text-foreground">Access Start Date</Label>
                                                                                   <Input
                        id="access_start"
                        type="date"
                        value={formData.access_start}
                        onChange={(e) => handleInputChange('access_start', e.target.value)}
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access_end" className="text-foreground">Access End Date</Label>
                                                                                   <Input
                        id="access_end"
                        type="date"
                        value={formData.access_end}
                        onChange={(e) => handleInputChange('access_end', e.target.value)}
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                      />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_paid"
                    checked={formData.has_paid}
                    onCheckedChange={(checked) => handleInputChange('has_paid', checked as boolean)}
                  />
                  <Label htmlFor="has_paid" className="text-foreground">Has Paid Subscription</Label>
                </div>
                           </CardContent>
           </Card>
         )}

         {/* Coach-specific fields */}
         {formData.role === 'coach' && (
           <Card>
             <CardHeader>
               <CardTitle className="text-lg">Coach Information</CardTitle>
               <CardDescription>
                 Additional information for coach accounts
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="assigned_students" className="text-foreground">Assigned Students (Optional)</Label>
                                                                       <Select 
                     value={formData.assigned_students || 'none'} 
                     onValueChange={(value) => handleInputChange('assigned_students', value)}
                   >
                     <SelectTrigger className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white">
                       <SelectValue placeholder="Select students to assign (optional)" />
                     </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="none">No students assigned</SelectItem>
                     {/* This would be populated with available students */}
                     <SelectItem value="multiple">Assign multiple students</SelectItem>
                   </SelectContent>
                 </Select>
                 <p className="text-xs text-muted-foreground">
                   You can assign students to this coach after creation.
                 </p>
               </div>
             </CardContent>
           </Card>
         )}

          {/* Invitation Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invitation Message
              </CardTitle>
              <CardDescription>
                Add a custom message to the invitation email (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="custom_message" className="text-foreground">Custom Message</Label>
                                                                   <Textarea
                    id="custom_message"
                    value={formData.custom_message}
                    onChange={(e) => handleInputChange('custom_message', e.target.value)}
                    placeholder="Add a personal message to include in the invitation email..."
                    className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                    rows={3}
                  />
                <p className="text-xs text-muted-foreground">
                  This message will be included in the invitation email sent to the user.
                </p>
              </div>
            </CardContent>
          </Card>

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
                <Label htmlFor="isActive" className="text-foreground">Account is active</Label>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
              <CardDescription>
                Review the information before creating the user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {formData.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {formData.phone || 'Not provided'}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {roles.find(r => r.id === formData.role)?.name || 'Student'}
                  </div>
                  <div>
                    <span className="font-medium">8base Role:</span> {
                      (() => {
                        const connectedRole = mapApplicationRoleTo8baseRole(formData.role);
                        return connectedRole ? connectedRole.name : 'Not mapped';
                      })()
                    }
                  </div>
                  <div>
                    <span className="font-medium">Records Created:</span> {
                      formData.role === 'coach' ? 'User + Coach' :
                      formData.role === 'user' ? 'User + Student' :
                      'User only'
                    }
                  </div>
                  {formData.role === 'user' && (
                    <>
                      <div>
                        <span className="font-medium">Coach:</span> {formData.assigned_admin_id === 'none' ? 'Not assigned' : 'Assigned'}
                      </div>
                      <div>
                        <span className="font-medium">Paid:</span> {formData.has_paid ? 'Yes' : 'No'}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span> {formData.isActive ? 'Active' : 'Inactive'}
                </div>
                {formData.custom_message && (
                  <div className="text-sm">
                    <span className="font-medium">Custom Message:</span> {formData.custom_message}
                  </div>
                )}
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
               className="text-foreground"
             >
               Cancel
             </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 animate-pulse" />
                  Creating User & Sending Invitation...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create User & Send Invitation
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 