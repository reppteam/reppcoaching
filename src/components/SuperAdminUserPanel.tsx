import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
} from 'lucide-react';

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
    assignedCoachId: ''
  });

  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Create user dialog states
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    is_active: true,
    has_paid: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedCoaches] = await Promise.all([
        eightbaseService.getAllUsersWithDetails(),
        eightbaseService.getAllCoaches()
      ]);
      setUsers(fetchedUsers);
      setCoaches(fetchedCoaches);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoach = async () => {
    try {
      // If coachId is "none", we're unassigning the coach
      const coachId = assignCoachForm.coachId === 'none' ? null : assignCoachForm.coachId;
      await eightbaseService.assignStudentToCoach(assignCoachForm.studentId, coachId);
      setAssignCoachDialogOpen(false);
      setAssignCoachForm({ studentId: '', coachId: '' });
      await loadUsers();
    } catch (error) {
      console.error('Failed to assign coach:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || '',
      is_active: user.is_active !== false,
      has_paid: user.has_paid || false,
      assignedCoachId: user.assignedCoach?.id || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      // Update basic user information
      await eightbaseService.updateUser(editingUser.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        role: editForm.role,
        is_active: editForm.is_active,
        has_paid: editForm.has_paid
      });

      // Update assigned coach if the user is a student and coach assignment changed
      if (editForm.role === 'user' && editForm.assignedCoachId !== editingUser.assignedCoach?.id) {
        const coachId = editForm.assignedCoachId || null;
        await eightbaseService.assignStudentToCoach(editingUser.id, coachId);
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
        assignedCoachId: ''
      });
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const success = await eightbaseService.deleteUser(userToDelete.id);
      if (success) {
        // Remove the user from the local state
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
    try {
      const newUser = await eightbaseService.createUser(createUserForm);
      // Add the new user to the local state
      setUsers([newUser, ...users]);
      // Close the dialog
      setCreateUserDialogOpen(false);
      // Reset the form
      setCreateUserForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        is_active: true,
        has_paid: false
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Error creating user. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active !== false) ||
                         (statusFilter === 'inactive' && user.is_active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const students = users.filter(u => u.role === 'user');
  const coachManagers = users.filter(u => u.role === 'coach_manager');
  const superAdmins = users.filter(u => u.role === 'super_admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading user panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-blue" />
            User Management Panel
          </h1>
          <p className="text-muted-foreground">
            Manage all users, assign coaches, and monitor account status
          </p>
        </div>
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
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-lastName" className="text-foreground">Last Name</Label>
                  <Input
                    id="create-lastName"
                    value={createUserForm.lastName}
                    onChange={(e) => setCreateUserForm({...createUserForm, lastName: e.target.value})}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
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
                <Select value={createUserForm.role} onValueChange={(value) => setCreateUserForm({...createUserForm, role: value})}>
                  <SelectTrigger className="bg-background border-border text-foreground">
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
                <Button onClick={handleCreateUser}>
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
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
                    <Badge className={
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'coach_manager' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'coach' ? 'bg-green-100 text-green-800' :
                      'bg-muted text-muted-foreground'
                    }>
                      {user.role === 'super_admin' ? 'Super Admin' :
                       user.role === 'coach_manager' ? 'Coach Manager' :
                       user.role === 'coach' ? 'Coach' : 'Student'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {user.is_active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.has_paid ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}>
                      {user.has_paid ? 'Paid' : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'user' && user.assignedCoach ? (
                      <span className="text-sm">
                        {user.assignedCoach.firstName ? user.assignedCoach.firstName : 'Coach Assigned'}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {user.role === 'user' ? 'Unassigned' : 'N/A'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {user.role === 'user' && !user.assignedCoach && (
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
                      {user.role === 'user' && user.assignedCoach && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const coach = coaches.find(c => c.id === user.assignedCoach?.id);
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
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
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div>
              <Label htmlFor="role" className="text-foreground">Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                <SelectTrigger className="bg-background border-border text-foreground">
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
            
            {editForm.role === 'user' && (
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
                    <SelectItem value="">No Coach Assigned</SelectItem>
                    {coaches.map(coach => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.firstName} {coach.lastName} ({coach.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={editForm.is_active}
                  onCheckedChange={(checked) => setEditForm({...editForm, is_active: checked as boolean})}
                />
                <Label htmlFor="is_active" className="text-foreground">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_paid"
                  checked={editForm.has_paid}
                  onCheckedChange={(checked) => setEditForm({...editForm, has_paid: checked as boolean})}
                />
                <Label htmlFor="has_paid" className="text-foreground">Paid Account</Label>
              </div>
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
    </div>
  );
}