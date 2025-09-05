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
      
      // Step 2: Create additional record based on selected role ID
      const selectedRole = STATIC_ROLES.find(role => role.id === formData.selectedRoleId);
      console.log('Selected role:', selectedRole);
      
      if (selectedRole?.name === 'Coach' || selectedRole?.name === 'coach_manager') {
        // Create coach in Coach table
        const coachData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          bio: ''
        };
        
        console.log('Step 2: Creating coach in Coach table:', coachData);
        const newCoach = await eightbaseService.createCoachDirect(coachData);
        console.log('Coach created successfully:', newCoach);
        
      } else if (selectedRole?.name === 'Student') {
        // Create student in Student table
        const studentData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: '',
          business_name: '',
          location: '',
          target_market: '',
          strengths: '',
          challenges: '',
          goals: '',
          preferred_contact_method: '',
          availability: '',
          notes: ''
        };
        
        console.log('Step 2: Creating student in Student table:', studentData);
        const newStudent = await eightbaseService.createStudentDirect(studentData);
        console.log('Student created successfully:', newStudent);
      }
      
      // For super_admin, only User table creation is needed

      if (newUser) {
        let successMessage = 'User created successfully in User table!';
        if (selectedRole?.name === 'Coach' || selectedRole?.name === 'coach_manager') {
          successMessage += ' Coach record also created in Coach table!';
        } else if (selectedRole?.name === 'Student') {
          successMessage += ' Student record also created in Student table!';
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

    setFormData(prev => ({
      ...prev,
      role: roleId,
      selectedRoleId: targetRole?.id || ''
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
                  <Label htmlFor="firstName" className="text-foreground">First Name *</Label>
                                                                           <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
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
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                                                                   <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
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
                <Label htmlFor="role" className="text-foreground">User Role *</Label>
                                                                                                                                     <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="bg-background border-border text-foreground">
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
                      <SelectTrigger className="bg-background border-border text-foreground">
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
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access_end" className="text-foreground">Access End Date</Label>
                                                                                   <Input
                        id="access_end"
                        type="date"
                        value={formData.access_end}
                        onChange={(e) => handleInputChange('access_end', e.target.value)}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
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
                     <SelectTrigger className="bg-background border-border text-foreground">
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
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
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