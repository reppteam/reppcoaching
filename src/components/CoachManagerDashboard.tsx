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

export function CoachManagerDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await eightbaseService.getAllUsersWithDetails();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoach = async () => {
    try {
      await eightbaseService.assignStudentToCoach(assignCoachForm.studentId, assignCoachForm.coachId);
      setAssignCoachDialogOpen(false);
      setAssignCoachForm({ studentId: '', coachId: '' });
      await loadUsers();
    } catch (error) {
      console.error('Failed to assign coach:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active !== false) ||
                         (statusFilter === 'inactive' && user.is_active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const students = users.filter(u => u.role === 'user');
  const coaches = users.filter(u => u.role === 'coach' || u.role === 'coach_manager');
  const superAdmins = users.filter(u => u.role === 'super_admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading coach manager dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div>
        <h1 className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-brand-blue" />
            Coach Manager Dashboard
        </h1>
          <p className="text-muted-foreground">
          Manage coaches and students, assign relationships, and monitor performancegdsfsdfdsfsdfds
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <p className="text-xs text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold text-orange-600">
                  {students.filter(s => !s.assigned_admin_id).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
          <Card>
            <CardHeader>
          <CardTitle>User Management</CardTitle>
              <CardDescription>
            Search, filter, and manage coaches and students
              </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Students</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                  <SelectItem value="coach_manager">Coach Managers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                    <Badge className={
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'coach_manager' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'coach' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
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
                    <Badge className={user.has_paid ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}>
                      {user.has_paid ? 'Paid' : 'Free'}
                    </Badge>
                          </TableCell>
                          <TableCell>
                    {user.role === 'user' && user.assigned_admin_id ? (
                      <span className="text-sm">
                        {users.find(u => u.id === user.assigned_admin_id)?.name || 'Unknown Coach'}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {user.role === 'user' ? 'Unassigned' : 'N/A'}
                      </span>
                    )}
                          </TableCell>
                          <TableCell>
                    <div className="flex space-x-2">
                      {user.role === 'user' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setAssignCoachForm({ studentId: user.id, coachId: user.assigned_admin_id || '' });
                            setAssignCoachDialogOpen(true);
                          }}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Assign Coach
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
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
              <Label htmlFor="student">Student</Label>
              <Select value={assignCoachForm.studentId} onValueChange={(value) => setAssignCoachForm({...assignCoachForm, studentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="coach">Coach</Label>
              <Select value={assignCoachForm.coachId} onValueChange={(value) => setAssignCoachForm({...assignCoachForm, coachId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassign</SelectItem>
                  {coaches.map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name} ({coach.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAssignCoachDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignCoach}>
                Assign Coach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}