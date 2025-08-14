import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { RolePermissionsMatrix, hasPermission, getRoleDisplayInfo, canUserPerformAction } from './RolePermissionsMatrix';
import { WeekTracker } from './WeekTracker';
import { StudentSignUpModal } from './StudentSignUpModal';
import { ConfirmationEmailModal } from './ConfirmationEmailModal';
import { AddUserModal } from './AddUserModal';
import { userInvitationService } from '../services/userInvitationService';
import { SendGridReminder } from './SendGridReminder';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  GraduationCap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Target,
  Tag,
  X,
  Settings,
  Lock,
  Unlock,
  Crown,
  ShieldCheck,
  Users2,
  Mail,
  Loader2,
} from 'lucide-react';

interface CreateCoachFormData {
  name: string;
  email: string;
  assignedStudents: string[];
}

interface CreateStudentFormData {
  name: string;
  email: string;
  startDate: string;
  endDate: string;
  tags: string[];
  goals: string;
  hasPaid: boolean;
}

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [createCoachDialogOpen, setCreateCoachDialogOpen] = useState(false);
  const [createStudentDialogOpen, setCreateStudentDialogOpen] = useState(false);
  const [studentSignUpModalOpen, setStudentSignUpModalOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [emailConfirmationModalOpen, setEmailConfirmationModalOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  
  // Form states
  const [coachFormData, setCoachFormData] = useState<CreateCoachFormData>({
    name: '',
    email: '',
    assignedStudents: []
  });
  
  const [studentFormData, setStudentFormData] = useState<CreateStudentFormData>({
    name: '',
    email: '',
    startDate: '',
    endDate: '',
    tags: [],
    goals: '',
    hasPaid: false
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await eightbaseService.getAllUsersWithDetails();
      console.log("🚀 ~ loadUsers ~ fetchedUsers:", fetchedUsers)
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCoachForm = () => {
    setCoachFormData({
      name: '',
      email: '',
      assignedStudents: []
    });
  };

  const resetStudentForm = () => {
    setStudentFormData({
      name: '',
      email: '',
      startDate: '',
      endDate: '',
      tags: [],
      goals: '',
      hasPaid: false
    });
    setNewTag('');
  };

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'coach_manager' && user.role !== 'super_admin')) return;

    try {
      // Use the automated user creation system
      const invitationData = {
        email: coachFormData.email,
        firstName: coachFormData.name.split(' ')[0],
        lastName: coachFormData.name.split(' ').slice(1).join(' ') || '',
        role: 'coach' as const,
        invited_by: user.name || 'System Administrator',
        has_paid: true,
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      };

      const result = await userInvitationService.createUserWithInvitation(invitationData);
      
      if (result.success && result.user) {
        // Assign students if selected
        if (coachFormData.assignedStudents.length > 0) {
          for (const studentId of coachFormData.assignedStudents) {
            try {
              await eightbaseService.assignStudentToCoach(studentId, result.user!.id);
            } catch (error) {
              console.error(`Failed to assign student ${studentId} to coach:`, error);
            }
          }
        }

        setCreatedUser(result.user);
        setCreateCoachDialogOpen(false);
        setEmailConfirmationModalOpen(true);
        resetCoachForm();
        await loadUsers();
      } else {
        throw new Error(result.error || 'Failed to create coach');
      }
    } catch (error) {
      console.error('Failed to create coach:', error);
      // You can add a toast notification here for better UX
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'coach_manager' && user.role !== 'super_admin')) return;

    try {
      // Use the automated user creation system
      const invitationData = {
        email: studentFormData.email,
        firstName: studentFormData.name.split(' ')[0],
        lastName: studentFormData.name.split(' ').slice(1).join(' ') || '',
        role: 'user' as const,
        assigned_admin_id: user.role === 'coach_manager' ? user.id : undefined,
        invited_by: user.name || 'System Administrator',
        has_paid: studentFormData.hasPaid,
        access_start: studentFormData.startDate,
        access_end: studentFormData.endDate,
        custom_message: studentFormData.goals ? `Goals: ${studentFormData.goals}` : undefined
      };

      const result = await userInvitationService.createUserWithInvitation(invitationData);
      
      if (result.success && result.user) {
        setCreatedUser(result.user);
        setCreateStudentDialogOpen(false);
        setEmailConfirmationModalOpen(true);
        resetStudentForm();
        await loadUsers();
      } else {
        throw new Error(result.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Failed to create student:', error);
      // You can add a toast notification here for better UX
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from users list
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      
      setDeleteConfirmDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleUserCreated = (newUser: any) => {
    // Refresh the users list after creating a new user
    loadUsers();
  };

  const openEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setEditUserDialogOpen(true);
  };

  const openDeleteConfirm = (userToDelete: User) => {
    setUserToDelete(userToDelete);
    setDeleteConfirmDialogOpen(true);
  };

  const handleStudentSignUpComplete = async (studentData: any) => {
    try {
      // Add the new student to the users list
      const newStudent: User = {
        ...studentData,
        role: 'user',
        assigned_admin_id: user?.role === 'coach_manager' || user?.role === 'coach' ? user.id : null,
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        coaching_term_start: new Date().toISOString().split('T')[0],
        coaching_term_end: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
      };
      
      setUsers(prev => [...prev, newStudent]);
      await loadUsers();
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !studentFormData.tags.includes(newTag.trim())) {
      setStudentFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setStudentFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleStudentAssignment = (studentId: string) => {
    setCoachFormData(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(studentId)
        ? prev.assignedStudents.filter(id => id !== studentId)
        : [...prev.assignedStudents, studentId]
    }));
  };

  // Filter users based on role permissions
  const coaches = users.filter(u => u.role === 'coach');
  const coachManagers = users.filter(u => u.role === 'coach_manager');
  const students = users.filter(u => u.role === 'user');
  const availableStudents = students.filter(s => !s.assigned_admin_id || user?.role === 'super_admin' || user?.role === 'coach_manager');
  
  // Show different views based on user role using new permission system
  const canCreateCoach = canUserPerformAction(user, 'create_coach');
  const canCreateStudent = canUserPerformAction(user, 'create_student');
  const canManageUsers = canUserPerformAction(user, 'access_user_management');
  const canDeleteUsers = hasPermission(user, 'delete_users');
  const canModifyRoles = hasPermission(user, 'modify_roles');
  const canViewAllStudents = hasPermission(user, 'view_all_students');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SendGrid Setup Reminder */}
      <SendGridReminder />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <Users2 className="h-6 w-6 text-brand-blue" />
            User Management
          </h2>
          <p className="text-muted-foreground">
            Manage coaches and students in your organization
          </p>
          {/* Role-based access indicator */}
          <div className="flex items-center space-x-2 mt-2">
            <Badge className={getRoleDisplayInfo(user?.role || 'user')?.color}>
              {getRoleDisplayInfo(user?.role || 'user')?.displayName}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {canCreateCoach ? 'Can create coaches' : ''} 
              {canCreateCoach && canCreateStudent ? ' • ' : ''}
              {canCreateStudent ? 'Can create students' : ''}
              {!canCreateCoach && !canCreateStudent ? 'View-only access' : ''}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* Add User with 8base Integration */}
          {(user?.role === 'super_admin' || user?.role === 'coach_manager') && (
            <Button onClick={() => setAddUserModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User (Automated)
            </Button>
          )}
          
          {/* Super Admin can create Coach Managers */}
          {user?.role === 'super_admin' && (
            <Button 
              variant="outline"
              onClick={() => {
                // Open AddUserModal with coach_manager role pre-selected
                setAddUserModalOpen(true);
                // You can add logic here to pre-select coach_manager role
              }}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Add Coach Manager
            </Button>
          )}
          
          {canCreateCoach && (
            <Dialog open={createCoachDialogOpen} onOpenChange={setCreateCoachDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Coach
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
          
          {canCreateStudent && (
            <>
              <Dialog open={createStudentDialogOpen} onOpenChange={setCreateStudentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Add Student (Advanced)
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button variant="default" onClick={() => setStudentSignUpModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Student
              </Button>
            </>
          )}
          
          {/* Show restrictions for coaches */}
          {user?.role === 'coach' && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Coach Access</div>
              <Badge variant="outline" className="text-xs">
                View Assigned Students Only
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles" disabled={!canModifyRoles}>
            Role Management {!canModifyRoles && '🔒'}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* User Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coach Managers List (Super Admin Only) */}
            {user?.role === 'super_admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Coach Managers ({coachManagers.length})
                  </CardTitle>
                  <CardDescription>
                    Manage coach managers who can create and manage coaches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {coachManagers.length === 0 ? (
                    <div className="text-center py-8">
                      <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No coach managers yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {coachManagers.map((manager) => {
                        const managedCoaches = coaches.filter(c => c.assigned_admin_id === manager.id);
                        return (
                          <div key={manager.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{manager.name}</div>
                              <div className="text-sm text-muted-foreground">{manager.email}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {managedCoaches.length} coaches managed
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-purple-100 text-purple-800">Manager</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditUser(manager)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteConfirm(manager)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

        {/* Coaches List */}
        {canManageUsers && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Coaches ({coaches.length})
              </CardTitle>
              <CardDescription>
                Manage coaching staff and their student assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coaches.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No coaches yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {coaches.map((coach) => {
                    const assignedStudents = students.filter(s => s.assigned_admin_id === coach.id);
                    return (
                      <div key={coach.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{coach.name}</div>
                          <div className="text-sm text-muted-foreground">{coach.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {assignedStudents.length} students assigned
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Active: {assignedStudents.filter(s => {
                              const startDate = s.has_paid ? s.access_start : s.coaching_term_start;
                              return startDate && new Date(startDate) <= new Date();
                            }).length} students
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-purple-100 text-purple-800">Coach</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditUser(coach)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteConfirm(coach)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Students ({students.length})
            </CardTitle>
            <CardDescription>
              {user?.role === 'coach' 
                ? 'Students assigned to you'
                : user?.role === 'coach_manager'
                ? 'Students you can manage'
                : 'All students in the system'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students
                  .filter(student => 
                    user?.role === 'super_admin' || 
                    user?.role === 'coach_manager' ||
                    (user?.role === 'coach' && student.assigned_admin_id === user?.id)
                  )
                  .map((student) => {
                    const coach = coaches.find(c => c.id === student.assigned_admin_id);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Coach: {coach?.name || 'Unassigned'}
                          </div>
                          <div className="mt-1">
                            <WeekTracker user={student} variant="compact" showTotal={false} />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={student.has_paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {student.has_paid ? 'Paid' : 'Free'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditUser(student)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {canManageUsers && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteConfirm(student)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <RolePermissionsMatrix currentUser={user ?? undefined} />
        </TabsContent>

        {/* Role Management Tab */}
        <TabsContent value="roles" className="space-y-6">
          {canModifyRoles ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Role Management
                </CardTitle>
                <CardDescription>
                  Modify user roles and permissions (Super Admin only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Crown className="mx-auto h-12 w-12 text-purple-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Advanced Role Management</h3>
                  <p className="text-muted-foreground mb-4">
                    This feature allows Super Admins to modify user roles and custom permissions.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Feature coming soon - currently using default role permissions.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground">
                    Only Super Admins can access role management features.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Student Sign-Up Modal */}
      <StudentSignUpModal
        open={studentSignUpModalOpen}
        onOpenChange={setStudentSignUpModalOpen}
        onComplete={handleStudentSignUpComplete}
        invitedBy={user?.name}
      />

      {/* Create Coach Dialog */}
      <Dialog open={createCoachDialogOpen} onOpenChange={setCreateCoachDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New Coach
            </DialogTitle>
            <DialogDescription>
              Add a new coach to your organization and optionally assign students to them.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCoach} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coach-name">Full Name *</Label>
                <Input
                  id="coach-name"
                  value={coachFormData.name}
                  onChange={(e) => setCoachFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div>
                <Label htmlFor="coach-email">Email Address *</Label>
                <Input
                  id="coach-email"
                  type="email"
                  value={coachFormData.email}
                  onChange={(e) => setCoachFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {availableStudents.length > 0 && (
              <div>
                <Label>Assign Students (Optional)</Label>
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {availableStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 py-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={coachFormData.assignedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudentAssignment(student.id)}
                      />
                      <label htmlFor={`student-${student.id}`} className="text-sm flex-1">
                        <div>{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {coachFormData.assignedStudents.length} students
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateCoachDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Coach
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Student Dialog */}
      <Dialog open={createStudentDialogOpen} onOpenChange={setCreateStudentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Create New Student
            </DialogTitle>
            <DialogDescription>
              Add a new student to your coaching program with their goals and timeline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-name">Full Name *</Label>
                <Input
                  id="student-name"
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="student-email">Email Address *</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={studentFormData.email}
                  onChange={(e) => setStudentFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="jane@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Program Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={studentFormData.startDate}
                  onChange={(e) => setStudentFormData(prev => ({...prev, startDate: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end-date">Program End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={studentFormData.endDate}
                  onChange={(e) => setStudentFormData(prev => ({...prev, endDate: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-paid"
                checked={studentFormData.hasPaid}
                onCheckedChange={(checked) => setStudentFormData(prev => ({...prev, hasPaid: checked as boolean}))}
              />
              <Label htmlFor="has-paid">Paid Student (Full Access)</Label>
            </div>

            <div>
              <Label htmlFor="student-goals">Goals & Objectives</Label>
              <Textarea
                id="student-goals"
                value={studentFormData.goals}
                onChange={(e) => setStudentFormData(prev => ({...prev, goals: e.target.value}))}
                placeholder="What does this student want to achieve?"
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Tag className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {studentFormData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {studentFormData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateStudentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              User Created Successfully!
            </DialogTitle>
            <DialogDescription>
              {createdUser && (
                <div className="space-y-2">
                  <p>
                    <strong>{createdUser.name}</strong> has been successfully created as a{' '}
                    <strong>{createdUser.role === 'coach' ? 'Coach' : 'Student'}</strong>.
                  </p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Email:</strong> {createdUser.email}
                    </p>
                    <p className="text-sm">
                      <strong>Role:</strong> {createdUser.role === 'coach' ? 'Coach' : 'Student'}
                    </p>
                    {createdUser.role === 'user' && (
                      <p className="text-sm">
                        <strong>Account Type:</strong> {createdUser.has_paid ? 'Paid' : 'Free'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setConfirmationDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete && (
                <>
                  Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                  This action cannot be undone and will remove all associated data.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Confirmation Modal */}
      {createdUser && (
        <ConfirmationEmailModal
          open={emailConfirmationModalOpen}
          onOpenChange={setEmailConfirmationModalOpen}
          userType={createdUser.role === 'coach' ? 'coach' : 'student'}
          userName={createdUser.name}
          userEmail={createdUser.email}
          createdBy={user?.name}
        />
      )}

      {/* Add User Modal */}
      <AddUserModal
        open={addUserModalOpen}
        onOpenChange={setAddUserModalOpen}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}