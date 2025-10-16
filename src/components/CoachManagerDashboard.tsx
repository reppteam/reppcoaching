import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { eightbaseService } from "../services/8baseService";
import { forgotPasswordService } from "../services/forgotPasswordService";
import { accountBlockingService, UserBlockingStatus } from "../services/accountBlockingService";
import { User } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
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
  Key,
  Loader2,
  ExternalLink,
  Bell,
  Send,
  TrendingUp,
  Camera,
  FileText,
} from "lucide-react";

export function CoachManagerDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // User action states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [blockAccountDialogOpen, setBlockAccountDialogOpen] = useState(false);
  const [unblockAccountDialogOpen, setUnblockAccountDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockingStatuses, setBlockingStatuses] = useState<Record<string, UserBlockingStatus>>({});
  
  // Edit user form states
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Notification system states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    studentId: '',
    title: '',
    message: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });
  const [sendingNotification, setSendingNotification] = useState(false);

  // Goals state
  const [goals, setGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await eightbaseService.getAllUsersWithDetails();
      setUsers(usersData);
      
      // Load blocking statuses for all users
      const statusPromises = usersData.map(async (user) => {
        try {
          const status = await accountBlockingService.getUserBlockingStatus(user.email);
          return { email: user.email, status };
        } catch (error) {
          console.error(`Error loading blocking status for ${user.email}:`, error);
          return { email: user.email, status: { isBlocked: false } };
        }
      });
      
      const statuses = await Promise.all(statusPromises);
      const statusMap = statuses.reduce((acc, { email, status }) => {
        acc[email] = status;
        return acc;
      }, {} as Record<string, UserBlockingStatus>);
      
      setBlockingStatuses(statusMap);

      // Load goals for coach manager
      if (user?.id) {
        try {
          setGoalsLoading(true);
          const coachGoals = await eightbaseService.getGoalsByCoach(user.id);
          setGoals(coachGoals);
        } catch (error) {
          console.error('Error loading goals:', error);
        } finally {
          setGoalsLoading(false);
        }
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  // User action handlers
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      const result = await forgotPasswordService.requestPasswordReset(selectedUser.email);
      if (result.success) {
        setActionSuccess(result.message || 'Password reset email sent successfully');
        setForgotPasswordDialogOpen(false);
      } else {
        setActionError(result.error || 'Failed to send password reset email');
      }
    } catch (error) {
      setActionError('Failed to send password reset email');
      console.error('Error sending password reset:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      const result = await accountBlockingService.blockUserAccount(
        selectedUser.email,
        blockReason,
        user?.email
      );
      
      if (result.success) {
        setActionSuccess(result.message || 'User account blocked successfully');
        setBlockAccountDialogOpen(false);
        setBlockReason('');
        // Reload users to update status
        await loadUsers();
      } else {
        setActionError(result.error || 'Failed to block user account');
      }
    } catch (error) {
      setActionError('Failed to block user account');
      console.error('Error blocking user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      const result = await accountBlockingService.unblockUserAccount(
        selectedUser.email,
        user?.email
      );
      
      if (result.success) {
        setActionSuccess(result.message || 'User account unblocked successfully');
        setUnblockAccountDialogOpen(false);
        // Reload users to update status
        await loadUsers();
      } else {
        setActionError(result.error || 'Failed to unblock user account');
      }
    } catch (error) {
      setActionError('Failed to unblock user account');
      console.error('Error unblocking user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      const result = await eightbaseService.deleteUser(selectedUser.id, selectedUser.email);
      if (result) {
        setActionSuccess('User deleted successfully');
        setDeleteUserDialogOpen(false);
        // Reload users to update list
        await loadUsers();
      } else {
        setActionError('Failed to delete user');
      }
    } catch (error) {
      setActionError('Failed to delete user');
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      // Update user with new information
      const updatedUser = await eightbaseService.updateUser(selectedUser.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        is_active: editIsActive
      });
      
      if (updatedUser) {
        setActionSuccess('User updated successfully');
        setEditUserDialogOpen(false);
        // Reload users to show updated information
        await loadUsers();
      } else {
        setActionError('Failed to update user');
      }
    } catch (error) {
      setActionError('Failed to update user');
      console.error('Error editing user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (action: string, user: User) => {
    setSelectedUser(user);
    setActionError('');
    setActionSuccess('');
    
    switch (action) {
      case 'forgot-password':
        setForgotPasswordDialogOpen(true);
        break;
      case 'block':
        setBlockAccountDialogOpen(true);
        break;
      case 'unblock':
        setUnblockAccountDialogOpen(true);
        break;
      case 'delete':
        setDeleteUserDialogOpen(true);
        break;
      case 'edit':
        // Populate edit form with current user data
        setEditFirstName(user.firstName || '');
        setEditLastName(user.lastName || '');
        setEditEmail(user.email || '');
        setEditIsActive(user.is_active !== false);
        setEditUserDialogOpen(true);
        break;
    }
  };

  // Notification system functions
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Coach Manager information not found. Please refresh the page and try again.');
      return;
    }

    if (!notificationForm.studentId) {
      alert('Please select a student to send the message to.');
      return;
    }

    if (!notificationForm.title.trim()) {
      alert('Please enter a title for your message.');
      return;
    }

    if (!notificationForm.message.trim()) {
      alert('Please enter a message.');
      return;
    }

    if (notificationForm.message.trim().length < 10) {
      alert('Message must be at least 10 characters long.');
      return;
    }

    if (notificationForm.message.trim().length > 500) {
      alert('Message must be 500 characters or less.');
      return;
    }

    try {
      setSendingNotification(true);
      
      // Verify coach-student relationship first
      const student = students.find(s => s.id === notificationForm.studentId);
      if (!student) {
        alert('You can only send messages to your assigned students.');
        return;
      }

      // Try to get the student ID from the user ID
      // If that fails, use the user ID directly (they might be the same)
      let studentId = await eightbaseService.getStudentIdFromUserId(notificationForm.studentId);
      if (!studentId) {
        console.log('🔍 No separate student record found, using user ID directly');
        studentId = notificationForm.studentId; // Fallback to user ID
      }

      // Create the notification
      console.log('🚀 Creating personalized notification:', {
        studentId: studentId,
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        priority: notificationForm.priority,
        type: 'COACH_MESSAGE',
        coachId: user.id
      });

      const notification = await eightbaseService.createPersonalizedNotification({
        studentId: studentId,
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        priority: notificationForm.priority,
        type: 'COACH_MESSAGE',
        coachId: user.id
      });

      console.log('✅ Notification created successfully:', notification);

      // Reset form and close modal
      setNotificationForm({
        studentId: '',
        title: '',
        message: '',
        priority: 'medium'
      });
      setShowNotificationModal(false);

      alert(`Message sent successfully to ${student.firstName} ${student.lastName}!`);
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

  const openNotificationModal = (student: User) => {
    setNotificationForm({
      studentId: student.id,
      title: '',
      message: '',
      priority: 'medium'
    });
    setShowNotificationModal(true);
  };

  // Filter users to show only Coach and Coach Manager roles
  const coachAndManagerUsers = users.filter(user => {
    const userRoles = user.role;
    return userRoles === 'coach' || userRoles === 'coach_manager';
  });

  console.log("Total users:", users.length);
  console.log("Coach and manager users:", coachAndManagerUsers.length);

  const filteredUsers = coachAndManagerUsers.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active !== false) ||
      (statusFilter === "inactive" && user.is_active === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const students = users.filter((u) => u.role === "user");
  const coaches = coachAndManagerUsers.filter((u) => {
    return u.role === "coach";
  });
  const coachManagers = coachAndManagerUsers.filter((u) => {
    return u.role === "coach_manager";
  });
  const superAdmins = users.filter((u) => u.role === "super_admin");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 animate-pulse text-brand-blue" />
          <span className="text-black dark:text-white">Loading coach manager dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-black dark:text-white">
          <ShieldCheck className="h-6 w-6 text-brand-blue" />
          Coach Manager Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage coaches and coach managers, monitor performance and assignments
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Coaches & Managers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {coachAndManagerUsers.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {
                    coachAndManagerUsers.filter((u) => u.is_active !== false)
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Coaches</p>
                <p className="text-2xl font-bold text-foreground">
                  {coaches.length}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {coachManagers.length}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>Coach Management</CardTitle>
          <CardDescription>
            Search, filter, and manage coaches and coach managers
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                        <Badge
                          key={user.role}
                          className={
                            user.role === "coach"
                              ? "bg-green-100 text-green-800"
                              : user.role === "coach_manager"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "super_admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {user.role}
                        </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.is_active !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {user.is_active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.has_paid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {user.has_paid ? "Paid" : "Free"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openActionDialog('forgot-password', user)}
                        title="Send Password Reset"
                      >
                        <Key className="h-3 w-3" />
                      </Button>
                      
                      {blockingStatuses[user.email]?.isBlocked ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openActionDialog('unblock', user)}
                          title="Unblock User"
                        >
                          <Unlock className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openActionDialog('block', user)}
                          title="Block User"
                        >
                          <Lock className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openActionDialog('edit', user)}
                        title="Edit User"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openActionDialog('delete', user)}
                        title="Delete User"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>
            Manage students and send personalized notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total Students: {students.length}
            </div>
            
            {students.length > 0 ? (
              <div className="space-y-2">
                {students.slice(0, 10).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {student.email}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openNotificationModal(student)}
                        className="h-8 px-3"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                ))}
                {students.length > 10 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    Showing first 10 of {students.length} students
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Student Goals
          </CardTitle>
          <CardDescription>
            Track and monitor your assigned students' goals and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {goalsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading goals...</span>
            </div>
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 10).map((goal) => {
                const student = students.find(s => s.id === goal.user_id);
                const progressPercentage = goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0;
                
                return (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {goal.goal_type === 'revenue' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {goal.goal_type === 'clients' && <Users className="h-4 w-4 text-blue-600" />}
                          {goal.goal_type === 'shoots' && <Camera className="h-4 w-4 text-purple-600" />}
                          {goal.goal_type === 'text' && <FileText className="h-4 w-4 text-orange-600" />}
                          {goal.goal_type === 'other' && <Target className="h-4 w-4 text-gray-600" />}
                          <span className="font-medium text-gray-900 dark:text-white">{goal.title}</span>
                        </div>
                        <Badge 
                          variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}
                          className={goal.priority === 'medium' ? 'bg-orange-100 text-orange-800' : ''}
                        >
                          {goal.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4 text-gray-600">
                        <span>Current: {goal.goal_type === 'revenue' ? '$' : ''}{goal.current_value?.toLocaleString() || '0'}</span>
                        <span>Target: {goal.goal_type === 'revenue' ? '$' : ''}{goal.target_value?.toLocaleString() || '0'}</span>
                      </div>
                      <Badge 
                        variant={goal.status === 'completed' ? 'default' : 'secondary'}
                        className={goal.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {goal.status}
                      </Badge>
                    </div>
                    
                    {goal.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        {goal.description}
                      </div>
                    )}
                  </div>
                );
              })}
              {goals.length > 10 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Showing first 10 of {goals.length} goals
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No goals found</p>
              <p className="text-sm">Your assigned students haven't set any goals yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {actionSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {actionSuccess}
          </div>
        </div>
      )}
      
      {actionError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {actionError}
          </div>
        </div>
      )}

      {/* Password Reset Dialog */}
      <Dialog open={forgotPasswordDialogOpen} onOpenChange={setForgotPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Password Reset</DialogTitle>
            <DialogDescription>
              Send a password reset email to {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword}>
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setForgotPasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="text-white">
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Send Reset Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={blockAccountDialogOpen} onOpenChange={setBlockAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User Account</DialogTitle>
            <DialogDescription>
              Block {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email}) from accessing the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBlockUser}>
            <div className="space-y-4">
              {/* <div>
                <Label htmlFor="blockReason">Reason for blocking (optional)</Label>
                <Textarea
                  id="blockReason"
                  placeholder="Enter reason for blocking this user..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div> */}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setBlockAccountDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="text-white">
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Blocking...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Block User
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unblock User Dialog */}
      <Dialog open={unblockAccountDialogOpen} onOpenChange={setUnblockAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock User Account</DialogTitle>
            <DialogDescription>
              Unblock {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email}) to restore access to the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUnblockUser}>
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUnblockAccountDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="text-white">
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Unblocking...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unblock User
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeleteUser}>
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeleteUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={actionLoading} 
                variant="destructive"
                className="text-white"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Edit details for {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editIsActive"
                  checked={editIsActive}
                  onCheckedChange={(checked) => setEditIsActive(checked === true)}
                />
                <Label htmlFor="editIsActive">Active User</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="text-white">
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-blue-600" />
              Send Message to Student
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Send a personalized notification to a student. The message will appear in their notification list and dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSendNotification}>
            <div className="space-y-4">
              {/* Student Selection */}
              <div>
                <Label htmlFor="student-select" className="text-sm font-medium">Student *</Label>
                <Select 
                  value={notificationForm.studentId} 
                  onValueChange={(value) => setNotificationForm({...notificationForm, studentId: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a student to send message to" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{student.firstName} {student.lastName}</span>
                          <span className="text-xs text-muted-foreground">{student.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Select the student you want to send a message to</p>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="notification-title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="notification-title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                  placeholder="e.g., Weekly Check-in, Important Update, etc."
                  className="bg-background border-border text-foreground mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">A clear, descriptive title for your message</p>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="notification-message" className="text-sm font-medium">Message *</Label>
                <textarea
                  id="notification-message"
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                  placeholder="Write your personalized message to the student. Be encouraging and specific about what you'd like them to focus on..."
                  className="w-full min-h-[120px] p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground resize-none mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
                <div className={`text-xs mt-1 ${notificationForm.message.length > 500 ? 'text-red-500' : notificationForm.message.length < 10 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {notificationForm.message.length}/500 characters
                  {notificationForm.message.length < 10 && notificationForm.message.length > 0 && (
                    <span className="ml-2">(Minimum 10 characters required)</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This message will be delivered instantly to the student's notification center</p>
              </div>

              {/* Priority */}
              <div>
                <Label htmlFor="notification-priority" className="text-sm font-medium">Priority</Label>
                <Select 
                  value={notificationForm.priority} 
                  onValueChange={(value: 'high' | 'medium' | 'low') => setNotificationForm({...notificationForm, priority: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Low - General information</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Medium - Important update</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>High - Urgent attention needed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Higher priority messages will be more prominent in the student's notification list</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowNotificationModal(false)}
                  disabled={sendingNotification}
                  className="px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={sendingNotification || !notificationForm.studentId || !notificationForm.title.trim() || !notificationForm.message.trim() || notificationForm.message.trim().length < 10}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  {sendingNotification ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
