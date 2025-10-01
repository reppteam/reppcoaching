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
    const userRoles = u.roles?.items || [];
    return userRoles.some((role: any) => role.name === "Coach");
  });
  const coachManagers = coachAndManagerUsers.filter((u) => {
    const userRoles = u.roles?.items || [];
    return userRoles.some(
      (role: any) =>
        role.name === "coach_manager" ||
        role.name === "Coach Manager" ||
        role.name === "Administrator"
    );
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
    </div>
  );
}
