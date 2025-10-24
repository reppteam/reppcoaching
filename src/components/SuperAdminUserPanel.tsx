import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { saasUserCreationService } from '../services/saasUserCreationService';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
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
  Eye,
} from 'lucide-react';
import { UserActions } from './UserActions';
import { CoachStudentEditProfile } from './CoachStudentEditProfile';

interface AssignCoachForm {
  studentId: string;
  coachId: string;
}

export function SuperAdminUserPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [assignCoachDialogOpen, setAssignCoachDialogOpen] = useState(false);
  const [assignCoachForm, setAssignCoachForm] = useState<AssignCoachForm>({
    studentId: '',
    coachId: ''
  });
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkAssignForm, setBulkAssignForm] = useState({
    studentIds: [] as string[],
    coachId: ''
  });
  
  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    is_active: true,
    has_paid: false,
    assignedCoachId: '',
    startDate: '',
    endDate: '',
    programs: [] as string[],
    phoneNumber: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    salesperson: '',
    guaranteeStatus: '',
    paymentType: '',
    guaranteeAmount: '',
    contractValue: '',
    adminNotes: ''
  });

  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Student details modal states
  const [viewingStudentDetails, setViewingStudentDetails] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Create user dialog states
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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [fetchedCoaches, fetchedStudents] = await Promise.all([
        eightbaseService.getAllCoachesDirect(),
        eightbaseService.getAllStudents()
      ]);
      console.log('Fetched coaches from Coach table:', fetchedCoaches);
      console.log('Fetched students from Student table:', fetchedStudents);
      setCoaches(fetchedCoaches);
      setUsers(fetchedStudents); // Using users state to store students for compatibility
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoach = async () => {
    try {
      const studentId = assignCoachForm.studentId;
      const coachId = assignCoachForm.coachId === 'none' ? null : assignCoachForm.coachId;
      
      // Prepare student data with coach connection
      const studentData: any = {};
      
      if (coachId) {
        // Connect coach
        const selectedCoach = coaches.find(c => c.id === coachId);
        if (selectedCoach) {
          console.log('Assigning coach to student:', { studentId, coachId, coach: selectedCoach });
          studentData.coach = {
            connect: { id: selectedCoach.id }
          };
        }
      } else {
        // Disconnect coach - need to find the current coach ID
        const currentStudent = users.find(s => s.id === studentId);
        if (currentStudent?.coach?.id) {
          console.log('Disconnecting coach from student:', studentId, 'coach ID:', currentStudent.coach.id);
          studentData.coach = {
            disconnect: { id: currentStudent.coach.id }
          };
        }
      }
      
      console.log('Student data being sent for coach assignment:', studentData);
      await eightbaseService.updateStudentDirect(studentId, studentData);
      
      setAssignCoachDialogOpen(false);
      setAssignCoachForm({ studentId: '', coachId: '' });
      await loadUsers();
    } catch (error) {
      console.error('Failed to assign coach:', error);
    }
  };

  const handleBulkAssignCoach = async () => {
    if (bulkAssignForm.studentIds.length === 0 || !bulkAssignForm.coachId) {
      alert('Please select students and a coach');
      return;
    }

    if (bulkAssignForm.studentIds.length > 50) {
      alert('Cannot assign more than 50 students at once');
      return;
    }

    try {
      const coachId = bulkAssignForm.coachId;
      const selectedCoach = coaches.find(c => c.id === coachId);
      
      if (!selectedCoach) {
        alert('Selected coach not found');
        return;
      }

      // Assign all selected students to the coach
      const promises = bulkAssignForm.studentIds.map(studentId => {
        const studentData = {
          coach: {
            connect: { id: coachId }
          }
        };
        return eightbaseService.updateStudentDirect(studentId, studentData);
      });

      await Promise.all(promises);
      
      setBulkAssignDialogOpen(false);
      setBulkAssignForm({ studentIds: [], coachId: '' });
      await loadUsers();
      
      alert(`Successfully assigned ${bulkAssignForm.studentIds.length} students to ${selectedCoach.firstName} ${selectedCoach.lastName}`);
    } catch (error) {
      console.error('Failed to bulk assign coach:', error);
      alert('Failed to assign students to coach. Please try again.');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: 'user', // All are students now
      is_active: user.is_active !== false,
      has_paid: user.has_paid || false,
      assignedCoachId: user.coach?.id || 'none',
      startDate: (user as any).access_start || '',
      endDate: (user as any).access_end || '',
      programs: (user as any).programs || [],
      phoneNumber: (user as any).phone || '',
      location: {
        city: (user as any).location?.city || '',
        state: (user as any).location?.state || '',
        country: (user as any).location?.country || ''
      },
      salesperson: (user as any).salesperson || '',
      guaranteeStatus: (user as any).guaranteeStatus || '',
      paymentType: (user as any).paymentType || '',
      guaranteeAmount: (user as any).guaranteeAmount || '',
      contractValue: (user as any).contractValue || '',
      adminNotes: (user as any).adminNotes || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      // Determine if it's a coach or student
      const isCoach = coaches.some(c => c.id === editingUser.id);
      
      if (isCoach) {
        // Update coach using direct Coach table operations
        const coachData = {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          bio: ''
        };
        
        await eightbaseService.updateCoachDirect(editingUser.id, coachData);
      } else {
        // For students, we need to update both User table and Student table
        // First, update the User table with has_paid and is_active
        const userData = {
          has_paid: editForm.has_paid,
          is_active: editForm.is_active
        };
        
        console.log('Updating user data:', userData);
        await eightbaseService.updateUser(editingUser.id, userData);
        
        // Then, update the Student table with profile data
        const studentData: any = {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
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
        
        // Handle coach assignment directly in the student update
        if (editForm.assignedCoachId && editForm.assignedCoachId !== 'none') {
          const selectedCoach = coaches.find(c => c.id === editForm.assignedCoachId);
          if (selectedCoach) {
            console.log('Assigning coach in edit:', { studentId: editingUser.id, coachId: selectedCoach.id });
            studentData.coach = {
              connect: { id: selectedCoach.id }
            };
          }
        } else if (editForm.assignedCoachId === 'none' && editingUser.coach?.id) {
          // Disconnect coach if no coach is selected
          console.log('Disconnecting coach in edit:', editingUser.id, 'coach ID:', editingUser.coach.id);
          studentData.coach = {
            disconnect: { id: editingUser.coach.id }
          };
        }
        
        console.log('Student data being sent for edit:', studentData);
        await eightbaseService.updateStudentDirect(editingUser.id, studentData);
      }

      setEditDialogOpen(false);
      setEditingUser(null);
      setEditForm({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        is_active: true,
        has_paid: false,
        assignedCoachId: '',
        startDate: '',
        endDate: '',
        programs: [],
        phoneNumber: '',
        location: {
          city: '',
          state: '',
          country: ''
        },
        salesperson: '',
        guaranteeStatus: '',
        paymentType: '',
        guaranteeAmount: '',
        contractValue: '',
        adminNotes: ''
      });
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Find the student record to get their user ID and email
      const studentToDelete = users.find(u => u.id === userToDelete.id);
      if (!studentToDelete) {
        alert('User not found.');
        return;
      }

      // Get the User table ID from the student record
      const userId = (studentToDelete as any).user?.id;
      const userEmail = studentToDelete.email;
      
      if (!userId) {
        alert('User ID not found. Cannot delete user.');
        return;
      }
      
      
      const success = await eightbaseService.deleteUser(userId, userEmail);
      if (success) {
        // Remove the student from the local state
        setUsers(users.filter(user => user.id !== userToDelete.id));
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Error deleting user. Please try again.');
    }
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

  // All users are now students from Student table, coaches are separate
  const students = users; // All users are students from Student table
  const coachManagers: any[] = []; // Coach managers would need to be fetched separately if needed
  const superAdmins: any[] = []; // Super admins would need to be fetched separately if needed

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || roleFilter === 'user'; // All are students now
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active !== false) ||
                         (statusFilter === 'inactive' && user.is_active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 animate-pulse text-brand-blue" />
          <span className="text-black dark:text-white">Loading user panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div>
          <h1 className="flex items-center gap-2 text-black dark:text-white">
            <Users className="h-6 w-6 text-brand-blue" />
            User Management Panel
          </h1>
          <p className="text-muted-foreground">
            Manage all users, assign coaches, and monitor account status
          </p>
        </div>
        <div className="flex space-x-2">
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
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
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
                <Button onClick={handleCreateUser} disabled={createUserLoading} className="text-white" style={{color: 'white'}}>
                  {createUserLoading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          <Button 
            // variant="outline"
            onClick={() => setBulkAssignDialogOpen(true)}
          >
            <Shield className="h-4 w-4 mr-2" />
            Bulk Assign Students
          </Button>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Coaches</p>
                <p className="text-2xl font-bold text-green-600">{coaches.length}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Coach Managers</p>
                <p className="text-2xl font-bold text-purple-600">{coachManagers.length}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold text-orange-600">{superAdmins.length}</p>
              </div>
              <Crown className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Search, filter, and manage all platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="text-foreground">Search Users</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label htmlFor="role-filter" className="text-foreground">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Students</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                  <SelectItem value="coach_manager">Coach Managers</SelectItem>
                  <SelectItem value="super_admin">Super Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter" className="text-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Assigned Coach</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info" className="flex items-center gap-1.5">
                      <GraduationCap className="h-3 w-3" />
                      Student
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active !== false ? 'success' : 'destructive'} className="flex items-center gap-1.5">
                      {user.is_active !== false ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.has_paid ? 'success' : 'outline'} className="flex items-center gap-1.5">
                      {user.has_paid ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Paid
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3 w-3" />
                          Coaching
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.coach ? (
                      <span className="text-sm">
                        {user.coach.firstName ? user.coach.firstName : 'Coach Assigned'}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStudentId(user.id);
                          setViewingStudentDetails(true);
                        }}
                        title="View Student Details"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <UserActions 
                        user={user} 
                        onSuccess={(message) => {
                          // You can add a toast notification here if needed
                          console.log('Success:', message);
                        }}
                        onError={(error) => {
                          // You can add a toast notification here if needed
                          console.error('Error:', error);
                        }}
                      />
                      {!user.coach && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAssignCoachForm({ 
                              studentId: user.id, 
                              coachId: '' 
                            });
                            setAssignCoachDialogOpen(true);
                          }}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Assign Coach
                        </Button>
                      )}
                      {user.coach && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const coach = coaches.find(c => c.id === user.coach?.id);
                            setAssignCoachForm({ 
                              studentId: user.id, 
                              coachId: coach ? coach.id : 'none' 
                            });
                            setAssignCoachDialogOpen(true);
                          }}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Change Coach
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Coach Dialog */}
      <Dialog open={assignCoachDialogOpen} onOpenChange={setAssignCoachDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Coach to Student</DialogTitle>
            <DialogDescription>
              Select a coach to assign to this student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student" className="text-foreground">Student</Label>
              <Select value={assignCoachForm.studentId} onValueChange={(value) => setAssignCoachForm({...assignCoachForm, studentId: value})}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="coach" className="text-foreground">Coach</Label>
              <Select value={assignCoachForm.coachId} onValueChange={(value) => setAssignCoachForm({...assignCoachForm, coachId: value})}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassign</SelectItem>
                  {coaches.map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.firstName} {coach.lastName} ({coach.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAssignCoachDialogOpen(false)} className="text-foreground">
                Cancel
              </Button>
              <Button onClick={handleAssignCoach}>
                Assign Coach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Students Dialog */}
      <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Assign Students to Coach</DialogTitle>
            <DialogDescription>
              Select multiple students and assign them to a coach (up to 50 students at once)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coach" className="text-foreground">Select Coach *</Label>
              <Select value={bulkAssignForm.coachId} onValueChange={(value) => setBulkAssignForm({...bulkAssignForm, coachId: value})}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.firstName} {coach.lastName} ({coach.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="students" className="text-foreground">Select Students *</Label>
              <div className="border border-border rounded-md p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={bulkAssignForm.studentIds.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (bulkAssignForm.studentIds.length >= 50) {
                              alert('Cannot select more than 50 students at once');
                              return;
                            }
                            setBulkAssignForm({
                              ...bulkAssignForm,
                              studentIds: [...bulkAssignForm.studentIds, student.id]
                            });
                          } else {
                            setBulkAssignForm({
                              ...bulkAssignForm,
                              studentIds: bulkAssignForm.studentIds.filter(id => id !== student.id)
                            });
                          }
                        }}
                        className="rounded border-border"
                      />
                      <label htmlFor={`student-${student.id}`} className="text-sm text-foreground cursor-pointer">
                        {student.firstName} {student.lastName} ({student.email})
                        {student.coach && (
                          <span className="text-xs text-muted-foreground ml-2">
                            - Currently assigned to {student.coach.firstName} {student.coach.lastName}
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {bulkAssignForm.studentIds.length} students (max 50)
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setBulkAssignDialogOpen(false)} className="text-foreground">
                Cancel
              </Button>
              <Button 
                onClick={handleBulkAssignCoach}
                disabled={bulkAssignForm.studentIds.length === 0 || !bulkAssignForm.coachId}
              >
                Assign {bulkAssignForm.studentIds.length} Students
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white placeholder:text-muted-foreground"
              />
            </div>
            
            <div>
              <Label htmlFor="role" className="text-foreground">Role</Label>
              <Input
                id="role"
                value="Student"
                disabled
                className="bg-background border-border text-muted-foreground"
              />
            </div>
            
              <div>
                <Label htmlFor="assignedCoach" className="text-foreground">Assigned Coach</Label>
                <Select 
                  value={editForm.assignedCoachId} 
                  onValueChange={(value) => setEditForm({...editForm, assignedCoachId: value})}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Coach Assigned</SelectItem>
                    {coaches.map(coach => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.firstName} {coach.lastName} ({coach.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_paid"
                checked={editForm.has_paid}
                onCheckedChange={(checked) => setEditForm({...editForm, has_paid: checked as boolean})}
              />
              <Label htmlFor="has_paid" className="text-foreground">Paid Account</Label>
            </div>

            {/* Access Start and End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-foreground">Access Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                  className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-foreground">Access End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                  className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
            </div>

            {/* Programs */}
            <div>
              <Label className="text-foreground">Programs</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['LAUNCH', 'FRWRD', 'ORBIT', 'ENGINE', 'TALENT'].map(program => (
                  <div key={program} className="flex items-center space-x-2">
                    <Checkbox
                      id={`program-${program}`}
                      checked={editForm.programs.includes(program)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditForm({...editForm, programs: [...editForm.programs, program]});
                        } else {
                          setEditForm({...editForm, programs: editForm.programs.filter(p => p !== program)});
                        }
                      }}
                    />
                    <Label htmlFor={`program-${program}`} className="text-foreground">{program}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber" className="text-foreground">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-foreground">City</Label>
                <Input
                  id="city"
                  value={editForm.location.city}
                  onChange={(e) => setEditForm({...editForm, location: {...editForm.location, city: e.target.value}})}
                  className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-foreground">State</Label>
                <Input
                  id="state"
                  value={editForm.location.state}
                  onChange={(e) => setEditForm({...editForm, location: {...editForm.location, state: e.target.value}})}
                  className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-foreground">Country</Label>
                <Input
                  id="country"
                  value={editForm.location.country}
                  onChange={(e) => setEditForm({...editForm, location: {...editForm.location, country: e.target.value}})}
                  className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
            </div>

            {/* Salesperson */}
            <div>
              <Label htmlFor="salesperson" className="text-foreground">Salesperson</Label>
              <Input
                id="salesperson"
                value={editForm.salesperson}
                onChange={(e) => setEditForm({...editForm, salesperson: e.target.value})}
                className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
              />
            </div>

            {/* Guarantee Status and Payment Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guaranteeStatus" className="text-foreground">Guarantee Status</Label>
                <Select value={editForm.guaranteeStatus} onValueChange={(value) => setEditForm({...editForm, guaranteeStatus: value})}>
                  <SelectTrigger className="bg-background border border-gray-300 dark:border-gray-600 text-foreground">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hit Guarantee">Hit Guarantee</SelectItem>
                    <SelectItem value="Eligible">Eligible</SelectItem>
                    <SelectItem value="Ineligible">Ineligible</SelectItem>
                    <SelectItem value="Final Ineligible">Final Ineligible</SelectItem>
                    <SelectItem value="Re-eligible">Re-eligible</SelectItem>
                    <SelectItem value="Newly Ineligible">Newly Ineligible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentType" className="text-foreground">Payment Type</Label>
                <Select value={editForm.paymentType} onValueChange={(value) => setEditForm({...editForm, paymentType: value})}>
                  <SelectTrigger className="bg-background border border-gray-300 dark:border-gray-600 text-foreground">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPP Finance">REPP Finance</SelectItem>
                    <SelectItem value="True Heroes">True Heroes</SelectItem>
                    <SelectItem value="ShiFi">ShiFi</SelectItem>
                    <SelectItem value="Elective">Elective</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Affirm">Affirm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Guarantee Amount and Contract Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guaranteeAmount" className="text-foreground">Guarantee Amount</Label>
                <Input
                  id="guaranteeAmount"
                  type="number"
                  value={editForm.guaranteeAmount}
                  onChange={(e) => setEditForm({...editForm, guaranteeAmount: e.target.value})}
                  className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="contractValue" className="text-foreground">Contract Value</Label>
                <Input
                  id="contractValue"
                  type="number"
                  value={editForm.contractValue}
                  onChange={(e) => setEditForm({...editForm, contractValue: e.target.value})}
                  className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <Label htmlFor="adminNotes" className="text-foreground">Admin/Manager Notes</Label>
              <Textarea
                id="adminNotes"
                value={editForm.adminNotes}
                onChange={(e) => setEditForm({...editForm, adminNotes: e.target.value})}
                placeholder="Notes about the student..."
                rows={4}
                className="bg-background border border-gray-300 dark:border-gray-600 text-foreground dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="text-foreground">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Details Modal */}
      {selectedStudentId && (
        <CoachStudentEditProfile
          studentId={selectedStudentId}
          isOpen={viewingStudentDetails}
          onClose={() => {
            setViewingStudentDetails(false);
            setSelectedStudentId(null);
          }}
        />
      )}
    </div>
  );
}