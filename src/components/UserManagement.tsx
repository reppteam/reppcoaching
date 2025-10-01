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
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RolePermissionsMatrix, hasPermission, getRoleDisplayInfo, canUserPerformAction } from './RolePermissionsMatrix';
import { StudentSignUpModal } from './StudentSignUpModal';
import { ConfirmationEmailModal } from './ConfirmationEmailModal';
import { AddUserModal } from './AddUserModal';
import { userInvitationService } from '../services/userInvitationService';
import { saasUserCreationService } from '../services/saasUserCreationService';
import { STATIC_ROLES } from '../config/staticRoles';
import { 
  Users, 
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
  Crown,
  ShieldCheck,
  Users2,
} from 'lucide-react';
import { UserActions } from './UserActions';

interface CreateCoachFormData {
  firstName: string;
  lastName: string;
  email: string;
  assignedStudents: string[];
}

interface CreateStudentFormData {
  firstName: string;
  lastName: string;
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
  const [coaches, setCoaches] = useState<any[]>([]);
  const [coachManagers, setCoachManagers] = useState<User[]>([]);
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
  
  // Create user dialog states (same as SuperAdminUserPanel)
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as 'user' | 'coach' | 'coach_manager' | 'super_admin',
    is_active: true,
    has_paid: false,
    assignedCoachId: 'none'
  });
  
  // Form states
  const [coachFormData, setCoachFormData] = useState<CreateCoachFormData>({
    firstName: '',
    lastName: '',
    email: '',
    assignedStudents: []
  });
  
  const [studentFormData, setStudentFormData] = useState<CreateStudentFormData>({
    firstName: '',
    lastName: '',
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
  const [selectedStudentsForCoach, setSelectedStudentsForCoach] = useState<string[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [fetchedCoaches, fetchedStudents, allUsersFromUserTable] = await Promise.all([
        eightbaseService.getAllCoachesDirect(),
        eightbaseService.getAllStudents(),
        eightbaseService.getUsers() // Get all users from User table
      ]);
      console.log('Fetched coaches from Coach table:', fetchedCoaches);
      console.log('Fetched students from Student table:', fetchedStudents);
      console.log('Fetched all users from User table:', allUsersFromUserTable);
      
      // Filter Coach Managers from User table
      const fetchedCoachManagers = allUsersFromUserTable.filter(u => u.role === 'coach_manager');
      console.log('Filtered Coach Managers:', fetchedCoachManagers);
      
      setCoaches(fetchedCoaches);
      setUsers(fetchedStudents); // Using users state to store students for compatibility
      setCoachManagers(fetchedCoachManagers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCoachForm = () => {
    setCoachFormData({
      firstName: '',
      lastName: '',
      email: '',
      assignedStudents: []
    });
  };

  const resetStudentForm = () => {
    setStudentFormData({
      firstName: '',
      lastName: '',
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
      // Dynamically get the Coach role ID
      const coachRole = STATIC_ROLES.find(role => role.name === 'Coach');
      if (!coachRole) {
        throw new Error('Coach role not found in static roles');
      }
      
      console.log('=== COACH CREATION DEBUG ===');
      console.log('All available roles:', STATIC_ROLES);
      console.log('Found Coach role:', coachRole);
      console.log('Using Coach role ID:', coachRole.id);
      console.log('Coach role name:', coachRole.name);
      
      // Step 1: Create user directly with Coach role (bypassing complex transformation)
      const userInput = {
        email: coachFormData.email,
        firstName: coachFormData.firstName,
        lastName: coachFormData.lastName,
        roles: {
          connect: [{ id: coachRole.id }]
        }
      };
      
      console.log('Creating user with Coach role:', userInput);
      const createdUser = await eightbaseService.createUserDirect(userInput);
      console.log('User created successfully:', createdUser);
      
      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      // Step 2: Create coach in Coach table and link to user
      const coachData = {
        firstName: coachFormData.firstName,
        lastName: coachFormData.lastName,
        email: coachFormData.email,
        bio: '',
        users: {
          connect: { id: createdUser.id }
        }
      };

      console.log('Step 2: Creating coach in Coach table:', coachData);
      const newCoach = await eightbaseService.createCoachDirect(coachData);
      console.log('Coach created successfully:', newCoach);
      
      if (newCoach) {
        // Assign students if selected
        if (coachFormData.assignedStudents.length > 0) {
          for (const studentId of coachFormData.assignedStudents) {
            try {
              await eightbaseService.assignStudentToCoach(studentId, newCoach.id);
            } catch (error) {
              console.error(`Failed to assign student ${studentId} to coach:`, error);
            }
          }
        }

        setCreatedUser(newCoach as any); // Type compatibility
        setCreateCoachDialogOpen(false);
        setEmailConfirmationModalOpen(true);
        resetCoachForm();
        await loadUsers();
      } else {
        throw new Error('Failed to create coach');
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
      // Dynamically get the Student role ID
      const studentRole = STATIC_ROLES.find(role => role.name === 'Student');
      if (!studentRole) {
        throw new Error('Student role not found in static roles');
      }
      
      console.log('Using Student role ID:', studentRole.id);
      
      // Step 1: Create user directly in User table with Student role
      const userInput = {
        email: studentFormData.email,
        firstName: studentFormData.firstName,
        lastName: studentFormData.lastName,
        roles: {
          connect: { id: studentRole.id }
        }
      };
      
      console.log('Creating user with Student role:', userInput);
      const createdUser = await eightbaseService.createUser(userInput);
      console.log('User created successfully:', createdUser);
      
      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      // Step 2: Create student in Student table and link to user
      const studentData = {
        firstName: studentFormData.firstName,
        lastName: studentFormData.lastName,
        email: studentFormData.email,
        phone: '',
        business_name: '',
        location: '',
        target_market: '',
        strengths: '',
        challenges: '',
        goals: studentFormData.goals,
        preferred_contact_method: '',
        availability: '',
        notes: '',
        user: {
          connect: { id: createdUser.id }
        }
      };

      console.log('Step 2: Creating student in Student table:', studentData);
      const newStudent = await eightbaseService.createStudentDirect(studentData);
      console.log('Student created successfully:', newStudent);
      
      if (newStudent) {
        setCreatedUser(newStudent as any); // Type compatibility
        setCreateStudentDialogOpen(false);
        setEmailConfirmationModalOpen(true);
        resetStudentForm();
        await loadUsers();
      } else {
        throw new Error('Failed to create student');
      }
    } catch (error) {
      console.error('Failed to create student:', error);
      // You can add a toast notification here for better UX
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Determine user type
      const isCoach = coaches.some(c => c.id === userToDelete.id);
      const isCoachManager = coachManagers.some(cm => cm.id === userToDelete.id);
      const isStudent = users.some(u => u.id === userToDelete.id);
      
      if (isCoachManager) {
        // For coach managers, the ID is already the User table ID
        console.log('Deleting coach manager with User ID:', userToDelete.id, 'Email:', userToDelete.email);
        
        await eightbaseService.deleteUser(userToDelete.id, userToDelete.email);
        setCoachManagers(prev => prev.filter(cm => cm.id !== userToDelete.id));
      } else if (isCoach) {
        // For coaches, get the User table ID from the coach record
        const coachRecord = coaches.find(c => c.id === userToDelete.id);
        if (!coachRecord) {
          console.error('Coach record not found');
          return;
        }
        
        // Get the User table ID from the coach record
        // The coach.users or coach.user field contains the User table reference
        const userId = (coachRecord as any).users?.id || (coachRecord as any).user?.id;
        if (!userId) {
          console.error('User ID not found in coach record');
          alert('Cannot delete coach: User ID not found');
          return;
        }
        
        console.log('Deleting coach with Coach ID:', userToDelete.id, 'User ID:', userId, 'Email:', userToDelete.email);
        
        // First delete from Coach table, then from User table (deleteUser handles both)
        await eightbaseService.deleteUser(userId, userToDelete.email);
        setCoaches(prev => prev.filter(c => c.id !== userToDelete.id));
      } else if (isStudent) {
        // For students, get the User table ID from the student record
        const studentRecord = users.find(u => u.id === userToDelete.id);
        if (!studentRecord) {
          console.error('Student record not found');
          return;
        }
        
        // Get the User table ID from the student record
        const userId = (studentRecord as any).user?.id;
        if (!userId) {
          console.error('User ID not found in student record');
          alert('Cannot delete student: User ID not found');
          return;
        }
        
        console.log('Deleting student with Student ID:', userToDelete.id, 'User ID:', userId, 'Email:', userToDelete.email);
        
        // Use the updated delete user method with email for Auth0 deletion
        await eightbaseService.deleteUser(userId, userToDelete.email);
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      }
      
      setDeleteConfirmDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!editingUser) return;

    try {
      console.log('Updating user with direct Coach/Student table approach');
      console.log('Editing user:', editingUser);
      console.log('User data:', userData);
      
      // Determine if it's a coach or student
      const isCoach = coaches.some(c => c.id === editingUser.id);
      
      if (isCoach) {
        // Update coach using direct Coach table operations
        const coachData = {
          firstName: userData.firstName || editingUser.firstName,
          lastName: userData.lastName || editingUser.lastName,
          email: userData.email || editingUser.email,
          bio: userData.bio || ''
        };
        
        await eightbaseService.updateCoachDirect(editingUser.id, coachData);
        
        // Handle student assignment for coaches
        if (selectedStudentsForCoach.length > 0) {
          const studentToAssign = selectedStudentsForCoach[0];
          const currentAssignedStudent = users.find(u => u.assignedCoach?.id === editingUser.id);
          
          // Disconnect current student if different
          if (currentAssignedStudent && currentAssignedStudent.id !== studentToAssign) {
            await eightbaseService.disconnectCoachFromStudent(currentAssignedStudent.id);
          }
          
          // Assign new student
          if (studentToAssign !== currentAssignedStudent?.id) {
              await eightbaseService.assignStudentToCoach(studentToAssign, editingUser.id);
          }
        } else {
          // Disconnect all students if none selected
          const currentAssignedStudent = users.find(u => u.assignedCoach?.id === editingUser.id);
          if (currentAssignedStudent) {
            await eightbaseService.disconnectCoachFromStudent(currentAssignedStudent.id);
          }
        }
      } else {
        // Update student using direct Student table operations
        const studentData: any = {
          firstName: userData.firstName || editingUser.firstName,
          lastName: userData.lastName || editingUser.lastName,
          email: userData.email || editingUser.email,
          phone: userData.phone || '',
          business_name: userData.business_name || '',
          location: userData.location || '',
          target_market: userData.target_market || '',
          strengths: userData.strengths || '',
          challenges: userData.challenges || '',
          goals: userData.goals || '',
          preferred_contact_method: userData.preferred_contact_method || '',
          availability: userData.availability || '',
          notes: userData.notes || ''
        };
        
        // Handle coach assignment directly in the student update
        if (editingUser.coach?.id) {
          const coachId = editingUser.coach.id;
          console.log('Looking for coach with ID:', coachId);
          console.log('Available coaches:', coaches.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}` })));
          const selectedCoach = coaches.find(c => c.id === coachId);
          if (selectedCoach) {
            console.log('Found coach for assignment:', selectedCoach);
            studentData.coach = {
              connect: { id: selectedCoach.id }
            };
      } else {
            console.error('Coach not found with ID:', coachId);
          }
        } else if (editingUser.coach?.id) {
          // Disconnect coach if no coach is selected but there was a previous coach
          const previousCoachId = editingUser.coach.id;
          studentData.coach = {
            disconnect: { id: previousCoachId }
          };
        }
        
        console.log('Student data being sent to update:', studentData);
        await eightbaseService.updateStudentDirect(editingUser.id, studentData);
      }
      
      // Refresh the data
      await loadUsers();
      
      setEditUserDialogOpen(false);
      setEditingUser(null);
      setSelectedStudentsForCoach([]);
      
      console.log('User update completed successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      // You can add a toast notification here for better UX
    }
  };

  const handleUserCreated = (newUser: any) => {
    // Refresh the users list after creating a new user
    loadUsers();
  };

  const handleCreateUser = async () => {
    setCreateUserLoading(true);
    try {
      // Validate required fields
      if (!createUserForm.firstName?.trim()) {
        alert('First name is required.');
        return;
      }
      if (!createUserForm.lastName?.trim()) {
        alert('Last name is required.');
        return;
      }
      if (!createUserForm.email?.trim()) {
        alert('Email is required.');
        return;
      }

      // Check if user already exists
      const userExists = await saasUserCreationService.checkUserExists(createUserForm.email);
      if (userExists.exists) {
        alert('A user with this email already exists. Please use a different email.');
        return;
      }

      // Create user with SaaS invitation flow
      const result = await saasUserCreationService.createUserWithInvitation(createUserForm);
      
      if (result.success) {
        // Close the dialog
        setCreateUserDialogOpen(false);
        // Reset the form
        setCreateUserForm({
          firstName: '',
          lastName: '',
          email: '',
          role: 'user' as 'user' | 'coach' | 'coach_manager' | 'super_admin',
          is_active: true,
          has_paid: false,
          assignedCoachId: 'none'
        });
        
        // Show simplified success message
        let successMessage = 'User created';
        if (result.verificationSent) {
          successMessage += ' and email sent';
        } else {
          successMessage += ' but email not sent - logout account and login again and send invitation';
        }
        alert(successMessage);
        
        // Refresh the users list to show any new users that might have been created
        loadUsers();
      } else {
        alert(result.error || 'Failed to create user invitation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const openEditUser = (userToEdit: any) => {
    setEditingUser(userToEdit);
    
    // Initialize selected student if editing a coach (single assignment)
    const isCoach = coaches.some(c => c.id === userToEdit.id);
    if (isCoach) {
      const assignedStudent = users.find(u => u.coach?.id === userToEdit.id);
      setSelectedStudentsForCoach(assignedStudent ? [assignedStudent.id] : []);
    } else {
      setSelectedStudentsForCoach([]);
    }
    
    setEditUserDialogOpen(true);
  };

  const openDeleteConfirm = (userToDelete: any) => {
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

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdatingStatus(userId);
      
      // Update user with new is_active status
      const updateData = {
        is_active: !currentStatus
      };

      await eightbaseService.updateUser(userId, updateData);
      
      // Update local state for users (students)
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, is_active: !currentStatus }
          : u
      ));
      
      // Update local state for coaches - check both coach.id and coach.users.id
      setCoaches(prev => prev.map(c => 
        ((c as any).users?.id === userId || c.id === userId)
          ? { ...c, users: (c as any).users ? { ...(c as any).users, is_active: !currentStatus } : (c as any).users, is_active: !currentStatus }
          : c
      ));

      console.log(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter users based on role permissions
  const students = users; // All users are now students from Student table
  const availableStudents = students.filter(s => !s.coach || user?.role === 'super_admin' || user?.role === 'coach_manager');
  
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
          <span className="text-black dark:text-white">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2 text-black dark:text-white">
            <Users2 className="h-6 w-6 text-brand-blue" />
            User Management
          </h2>
          <p className="text-muted-foreground">
            Manage coaches and students in your organization
          </p>
          {/* Role-based access indicator */}
          <div className="flex items-center space-x-3 mt-3">
            <Badge 
              variant={user?.role === 'super_admin' ? 'gradient' : 
                      user?.role === 'coach_manager' ? 'info' : 
                      user?.role === 'coach' ? 'success' : 'outline'}
              className="flex items-center gap-1.5 dark:bg-primary dark:text-white"
            >
              {getRoleDisplayInfo(user?.role || 'user')?.icon}
              {getRoleDisplayInfo(user?.role || 'user')?.displayName}
            </Badge>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md dark:bg-gray-800 dark:text-gray-300">
              {canCreateCoach ? 'Can create coaches' : ''} 
              {canCreateCoach && canCreateStudent ? ' • ' : ''}
              {canCreateStudent ? 'Can create students' : ''}
              {!canCreateCoach && !canCreateStudent ? 'View-only access' : ''}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* Create User with SaaS Flow (same as SuperAdminUserPanel) */}
          {(user?.role === 'super_admin' || user?.role === 'coach_manager') && (
            <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="create-firstName" className="text-foreground">First Name</Label>
                      <Input
                        id="create-firstName"
                        value={createUserForm.firstName}
                        onChange={(e) => setCreateUserForm({...createUserForm, firstName: e.target.value})}
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-lastName" className="text-foreground">Last Name</Label>
                      <Input
                        id="create-lastName"
                        value={createUserForm.lastName}
                        onChange={(e) => setCreateUserForm({...createUserForm, lastName: e.target.value})}
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="create-email" className="text-foreground">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="create-role" className="text-foreground">Role</Label>
                    <Select value={createUserForm.role} onValueChange={(value) => setCreateUserForm({...createUserForm, role: value as 'user' | 'coach' | 'coach_manager' | 'super_admin', assignedCoachId: 'none'})}>
                      <SelectTrigger className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Student</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="coach_manager">Coach Manager</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {createUserForm.role === 'user' && (
                    <div>
                      <Label htmlFor="create-coach" className="text-foreground">Assign Coach (Optional)</Label>
                      <Select value={createUserForm.assignedCoachId} onValueChange={(value) => setCreateUserForm({...createUserForm, assignedCoachId: value})}>
                    <SelectTrigger className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white">
                      <SelectValue placeholder="Select a coach (optional)" />
                    </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No coach assigned</SelectItem>
                          {coaches.map((coach) => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.firstName} {coach.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="create-is_active"
                        checked={createUserForm.is_active}
                        onCheckedChange={(checked) => setCreateUserForm({...createUserForm, is_active: checked as boolean})}
                      />
                      <Label htmlFor="create-is_active" className="text-foreground">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="create-has_paid"
                        checked={createUserForm.has_paid}
                        onCheckedChange={(checked) => setCreateUserForm({...createUserForm, has_paid: checked as boolean})}
                      />
                      <Label htmlFor="create-has_paid" className="text-foreground">Paid Account</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)} className="text-foreground">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={createUserLoading}>
                      {createUserLoading ? 'Creating...' : 'Create User'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Legacy Add User Modal (keeping for compatibility) */}
          {/* {(user?.role === 'super_admin' || user?.role === 'coach_manager') && (
            <Button variant="outline" onClick={() => setAddUserModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Legacy Create Student
            </Button>
          )}
           */}
          {/* Super Admin can create Coach Managers */}
          {/* {user?.role === 'super_admin' && (
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
          )} */}
          
          {/* {canCreateCoach && (
            <Dialog open={createCoachDialogOpen} onOpenChange={setCreateCoachDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Coach
                </Button>
              </DialogTrigger>
            </Dialog>
          )} */}
          
          {/* {canCreateStudent && (
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
          )} */}
          
          {/* Show restrictions for coaches */}
          {user?.role === 'coach' && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Coach Access</div>
              <Badge variant="outline" className="text-xs flex items-center gap-1.5">
                <Target className="h-3 w-3" />
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
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
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
                        // Since coaches are now from coach table, we need to check their user relationship
                        const managedCoaches = coaches.filter(c => c.user?.id === manager.id);
                        return (
                          <div key={manager.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{manager.firstName} {manager.lastName}</div>
                              <div className="text-sm text-muted-foreground">{manager.email}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {managedCoaches.length} coaches managed
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <UserActions 
                                user={manager} 
                                onSuccess={(message) => {
                                  // You can add a toast notification here if needed
                                  console.log('Success:', message);
                                }}
                                onError={(error) => {
                                  // You can add a toast notification here if needed
                                  console.error('Error:', error);
                                }}
                              />
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
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
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
                    // Find assigned students using the coach relationship
                    const assignedStudents = students.filter(s => s.coach?.id === coach.id);
                    return (
                      <div key={coach.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{coach.firstName} {coach.lastName}</div>
                          <div className="text-sm text-muted-foreground">{coach.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {assignedStudents.length} students assigned
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Active: {assignedStudents.length} students
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          
                          <UserActions 
                            user={coach} 
                            onSuccess={(message) => {
                              // You can add a toast notification here if needed
                              console.log('Success:', message);
                            }}
                            onError={(error) => {
                              // You can add a toast notification here if needed
                              console.error('Error:', error);
                            }}
                          />
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
            <CardTitle className="flex items-center gap-2 text-black dark:text-white">
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
                    (user?.role === 'coach' && student.coach?.id === user?.id)
                  )
                  .map((student) => {
                    // Use the coach field directly from the student data
                    const coach = student.coach;
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Coach: {coach ? (coach.firstName ? coach.firstName : 'Coach Assigned') : 'Unassigned'}
                          </div>
                          <div className="mt-1">
                            {/* WeekTracker component needs to be updated to work with Student table structure */}
                            <div className="text-xs text-muted-foreground">
                              Student Progress: Coming Soon
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                         
                          <UserActions 
                            user={student} 
                            onSuccess={(message) => {
                              // You can add a toast notification here if needed
                              console.log('Success:', message);
                            }}
                            onError={(error) => {
                              // You can add a toast notification here if needed
                              console.error('Error:', error);
                            }}
                          />
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
            <div className="space-y-6">
              {/* Super Admins Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                        <Crown className="h-5 w-5 text-purple-500" />
                        Super Administrators
                      </CardTitle>
                      <CardDescription>
                        View all Super Administrators in the system
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/super-admin-list'}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      View Full List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Get all users with super_admin role
                    const superAdmins = users.filter(u => u.role === 'super_admin');
                    const currentUserIsSuperAdmin = user?.role === 'super_admin';
                    
                    return (
                      <div className="space-y-3">
                        {superAdmins.length === 0 ? (
                          <div className="text-center py-8">
                            <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No Super Administrators found</p>
                          </div>
                        ) : (
                          superAdmins.map((admin) => (
                            <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2 text-black dark:text-white">
                                  {admin.firstName} {admin.lastName}
                                  {admin.id === user?.id && (
                                    <Badge variant="gradient" className="text-xs">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">{admin.email}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Created: {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'Unknown'}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="gradient" className="flex items-center gap-1.5">
                                  <Crown className="h-3 w-3" />
                                  Super Admin
                                </Badge>
                                {admin.id !== user?.id && (
                                  <UserActions 
                                    user={admin} 
                                    onSuccess={(message) => {
                                      console.log('Success:', message);
                                    }}
                                    onError={(error) => {
                                      console.error('Error:', error);
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Advanced Role Management Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <Settings className="h-5 w-5" />
                    Advanced Role Management
                  </CardTitle>
                  <CardDescription>
                    Modify user roles and permissions (Super Admin only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Crown className="mx-auto h-12 w-12 text-purple-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-foreground">Advanced Role Management</h3>
                    <p className="text-muted-foreground mb-4">
                      This feature allows Super Admins to modify user roles and custom permissions.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Feature coming soon - currently using default role permissions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">Access Restricted</h3>
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
                      invitedBy={`${user?.firstName} ${user?.lastName}`}
      />

      {/* Create Coach Dialog */}
      <Dialog open={createCoachDialogOpen} onOpenChange={setCreateCoachDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
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
                <Label htmlFor="coach-firstName" className="text-foreground">First Name *</Label>
                <Input
                  id="coach-firstName"
                  value={coachFormData.firstName}
                  onChange={(e) => setCoachFormData(prev => ({...prev, firstName: e.target.value}))}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="coach-lastName" className="text-foreground">Last Name *</Label>
                <Input
                  id="coach-lastName"
                  value={coachFormData.lastName}
                  onChange={(e) => setCoachFormData(prev => ({...prev, lastName: e.target.value}))}
                  placeholder="Smith"
                  required
                />
              </div>
              <div>
                <Label htmlFor="coach-email" className="text-foreground">Email Address *</Label>
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
                <Label className="text-foreground">Assign Students (Optional)</Label>
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {availableStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 py-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={coachFormData.assignedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudentAssignment(student.id)}
                      />
                      <label htmlFor={`student-${student.id}`} className="text-sm flex-1">
                        <div>{student.firstName} {student.lastName}</div>
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
            <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
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
                <Label htmlFor="student-firstName" className="text-foreground">First Name *</Label>
                <Input
                  id="student-firstName"
                  value={studentFormData.firstName}
                  onChange={(e) => setStudentFormData(prev => ({...prev, firstName: e.target.value}))}
                  placeholder="Jane"
                  required
                />
              </div>
              <div>
                <Label htmlFor="student-lastName" className="text-foreground">Last Name *</Label>
                <Input
                  id="student-lastName"
                  value={studentFormData.lastName}
                  onChange={(e) => setStudentFormData(prev => ({...prev, lastName: e.target.value}))}
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="student-email" className="text-foreground">Email Address *</Label>
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
                <Label htmlFor="start-date" className="text-foreground">Program Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={studentFormData.startDate}
                  onChange={(e) => setStudentFormData(prev => ({...prev, startDate: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-foreground">Program End Date *</Label>
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
              <Label htmlFor="has-paid" className="text-foreground">Paid Student (Full Access)</Label>
            </div>

            <div>
              <Label htmlFor="student-goals" className="text-foreground">Goals & Objectives</Label>
              <Textarea
                id="student-goals"
                value={studentFormData.goals}
                onChange={(e) => setStudentFormData(prev => ({...prev, goals: e.target.value}))}
                placeholder="What does this student want to achieve?"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-foreground">Tags</Label>
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
                    <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
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
            <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
              <CheckCircle className="h-5 w-5 text-green-600" />
              User Created Successfully!
            </DialogTitle>
            <DialogDescription>
              {createdUser && (
                <div className="space-y-2">
                  <p>
                    <strong>{createdUser.firstName} {createdUser.lastName}</strong> has been successfully created as a{' '}
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
            <AlertDialogTitle className="flex items-center gap-2 text-black dark:text-white">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete && (
                <>
                  Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>? 
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
                        userName={`${createdUser.firstName} ${createdUser.lastName}`}
          userEmail={createdUser.email}
                      createdBy={`${user?.firstName} ${user?.lastName}`}
        />
      )}

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={(open) => {
        setEditUserDialogOpen(open);
        if (!open) {
          setSelectedStudentsForCoach([]);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
              <Edit className="h-5 w-5" />
              Edit User - {editingUser ? `${editingUser.firstName} ${editingUser.lastName}` : ''}
            </DialogTitle>
            <DialogDescription>
              Update user account settings and permissions
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={`${editingUser.firstName} ${editingUser.lastName}`}
                                          onChange={(e) => {
                        const nameParts = e.target.value.split(' ');
                        setEditingUser({ 
                          ...editingUser, 
                          firstName: nameParts[0] || '', 
                          lastName: nameParts.slice(1).join(' ') || '' 
                        });
                      }}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={coaches.some(c => c.id === editingUser.id) ? 'coach' : 'student'} 
                    onValueChange={(value) => {
                      // Role is determined by which table the record is in
                      console.log('Role change not supported - determined by table structure');
                    }}
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  {/* Show Assigned Coach for Students */}
                  {!coaches.some(c => c.id === editingUser.id) && (
                    <>
                      <Label htmlFor="edit-assigned-coach">Assigned Coach</Label>
                      <Select 
                        value={editingUser.coach?.id || 'none'} 
                        onValueChange={(value) => {
                          if (value === 'none') {
                            setEditingUser({ ...editingUser, coach: null });
                          } else {
                            const selectedCoach = coaches.find(c => c.id === value);
                            setEditingUser({ 
                              ...editingUser, 
                              coach: selectedCoach ? {
                                id: selectedCoach.id,
                                firstName: selectedCoach.firstName,
                                lastName: selectedCoach.lastName,
                                email: selectedCoach.email
                              } : null
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select coach" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No coach assigned</SelectItem>
                          {coaches.map(coach => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.firstName} {coach.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                  
                  {/* Show Assigned Students for Coaches */}
                  {coaches.some(c => c.id === editingUser.id) && (
                    <>
                      <Label htmlFor="edit-assigned-students">Assigned Students</Label>
                      <Select 
                        value={selectedStudentsForCoach.length > 0 ? selectedStudentsForCoach[0] : 'none'} 
                        onValueChange={(value) => {
                          if (value === 'none') {
                            setSelectedStudentsForCoach([]);
                          } else {
                            setSelectedStudentsForCoach([value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No student assigned</SelectItem>
                          {users.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} ({student.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedStudentsForCoach.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Currently assigned: {users.find(u => u.id === selectedStudentsForCoach[0])?.firstName} {users.find(u => u.id === selectedStudentsForCoach[0])?.lastName}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Access dates and payment status are managed through User table relationship */}
              {/* <div className="text-sm text-muted-foreground">
                Access dates and payment status are managed through the User table relationship.
              </div> */}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className='text-white' onClick={() => handleEditUser(editingUser)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <AddUserModal
        open={addUserModalOpen}
        onOpenChange={setAddUserModalOpen}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}