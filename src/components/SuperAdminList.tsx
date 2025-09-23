import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Crown, Search, Users, RefreshCw, Shield, Mail, Calendar, UserCheck, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User } from '../types';
import { UserActions } from './UserActions';

export function SuperAdminList() {
  const { user } = useAuth();
  const [superAdmins, setSuperAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadSuperAdmins();
  }, []);

  const loadSuperAdmins = async () => {
    try {
      setLoading(true);
      const allUsers = await eightbaseService.getUsers();
      const superAdminUsers = allUsers.filter(u => u.role === 'super_admin');
      setSuperAdmins(superAdminUsers);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading super admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuperAdmins = superAdmins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.firstName.toLowerCase().includes(searchLower) ||
      admin.lastName.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower)
    );
  });

  const handleRefresh = () => {
    loadSuperAdmins();
  };

  const handleEditUser = (admin: User) => {
    setEditingUser(admin.id);
    setEditForm({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      firstName: '',
      lastName: '',
      email: ''
    });
  };

  const handleSaveEdit = async (adminId: string) => {
    try {
      setSaving(true);
      
      // Validate form
      if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
        alert('Please fill in all fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Check if email is already used by another user
      const emailExists = superAdmins.some(admin => 
        admin.email.toLowerCase() === editForm.email.toLowerCase() && admin.id !== adminId
      );
      
      if (emailExists) {
        alert('This email is already in use by another user');
        return;
      }
      
      // Update the user in 8base
      await eightbaseService.updateUser(adminId, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim()
      });

      // Update local state
      setSuperAdmins(prev => prev.map(admin => 
        admin.id === adminId 
          ? { ...admin, firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(), email: editForm.email.trim() }
          : admin
      ));

      setEditingUser(null);
      setEditForm({
        firstName: '',
        lastName: '',
        email: ''
      });

      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, adminId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(adminId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleToggleUserStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      setUpdatingStatus(adminId);
      
      // Update user with new is_active status
      const updateData = {
        is_active: !currentStatus
      };

      await eightbaseService.updateUser(adminId, updateData);
      
      // Update local state
      setSuperAdmins(prev => prev.map(admin => 
        admin.id === adminId 
          ? { ...admin, is_active: !currentStatus }
          : admin
      ));

      console.log(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Crown className="h-5 w-5 animate-pulse text-purple-500" />
          <span>Loading Super Administrators...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-purple-500" />
            Super Administrators
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all Super Administrator accounts in the system
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{superAdmins.length}</div>
            <p className="text-xs text-muted-foreground">
              Active super administrator accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {superAdmins.filter(admin => admin.is_active !== false).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active super admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Accounts</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {superAdmins.filter(admin => admin.is_active === false).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Blocked super admin accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastUpdated.toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Data refresh timestamp
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Super Administrators
          </CardTitle>
          <CardDescription>
            Find specific super administrators by name or email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Super Admins List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Super Administrator Accounts
            <Badge variant="secondary" className="ml-2">
              {filteredSuperAdmins.length} {filteredSuperAdmins.length === 1 ? 'account' : 'accounts'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Complete list of all super administrator accounts with management options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSuperAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No matching super administrators found' : 'No Super Administrators found'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Super administrator accounts will appear here when created'
                }
              </p>
            </div>
          ) : (
             <div className="space-y-4">
               {filteredSuperAdmins.map((admin: any) => (
                 <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                   <div className="flex items-center space-x-4">
                     <div className="flex-shrink-0">
                       <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                         <Crown className="h-5 w-5 text-white" />
                       </div>
                     </div>
                     <div className="flex-1 min-w-0">
                       {editingUser === admin.id ? (
                         // Edit Mode
                         <div className="space-y-3">
                           <div className="flex items-center gap-2">
                             <Input
                               value={editForm.firstName}
                               onChange={(e) => handleInputChange('firstName', e.target.value)}
                               onKeyDown={(e) => handleKeyDown(e, admin.id)}
                               placeholder="First Name"
                               className="w-32"
                               disabled={saving}
                             />
                             <Input
                               value={editForm.lastName}
                               onChange={(e) => handleInputChange('lastName', e.target.value)}
                               onKeyDown={(e) => handleKeyDown(e, admin.id)}
                               placeholder="Last Name"
                               className="w-32"
                               disabled={saving}
                             />
                             {admin.id === user?.id && (
                               <Badge variant="gradient" className="text-xs">
                                 You
                               </Badge>
                             )}
                           </div>
                           <div className="flex items-center gap-2">
                             <Mail className="h-3 w-3 text-muted-foreground" />
                             <Input
                               value={editForm.email}
                               onChange={(e) => handleInputChange('email', e.target.value)}
                               onKeyDown={(e) => handleKeyDown(e, admin.id)}
                               placeholder="Email"
                               className="w-64"
                               type="email"
                               disabled={saving}
                             />
                           </div>
                           <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1">
                               <Shield className="h-3 w-3 text-purple-500" />
                               <span className="text-xs text-muted-foreground">
                                 Created: {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'Unknown'}
                               </span>
                             </div>
                             <Badge 
                               variant={admin.is_active !== false ? "default" : "destructive"}
                               className="text-xs"
                             >
                               {admin.is_active !== false ? 'Active' : 'Blocked'}
                             </Badge>
                           </div>
                         </div>
                       ) : (
                         // View Mode
                         <>
                           <div className="flex items-center gap-2">
                             <h3 className="font-medium text-lg">
                               {admin.firstName} {admin.lastName}
                             </h3>
                             {admin.id === user?.id && (
                               <Badge variant="gradient" className="text-xs">
                                 You
                               </Badge>
                             )}
                           </div>
                           <div className="flex items-center gap-2 mt-1">
                             <Mail className="h-3 w-3 text-muted-foreground" />
                             <span className="text-sm text-muted-foreground">{admin.email}</span>
                           </div>
                           <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center gap-1">
                               <Shield className="h-3 w-3 text-purple-500" />
                               <span className="text-xs text-muted-foreground">
                                 Created: {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'Unknown'}
                               </span>
                             </div>
                             <Badge 
                               variant={admin.is_active !== false ? "default" : "destructive"}
                               className="text-xs"
                             >
                               {admin.is_active !== false ? 'Active' : 'Blocked'}
                             </Badge>
                           </div>
                         </>
                       )}
                     </div>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Badge variant="gradient" className="flex items-center gap-1.5">
                       <Crown className="h-3 w-3" />
                       Super Admin
                     </Badge>
                     
                     {editingUser === admin.id ? (
                       // Edit Mode Actions
                       <div className="flex items-center space-x-1">
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={handleCancelEdit}
                           disabled={saving}
                         >
                           <X className="h-3 w-3" />
                         </Button>
                         <Button
                           size="sm"
                           onClick={() => handleSaveEdit(admin.id)}
                           disabled={saving}
                         >
                           {saving ? (
                             <RefreshCw className="h-3 w-3 animate-spin" />
                           ) : (
                             <Save className="h-3 w-3" />
                           )}
                         </Button>
                       </div>
                     ) : (
                       // View Mode Actions
                       <div className="flex items-center space-x-1">
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleEditUser(admin)}
                           title="Edit user details"
                         >
                           <Edit2 className="h-3 w-3" />
                         </Button>
                         {admin.id !== user?.id && (
                           <>
                             <UserActions 
                               user={admin} 
                               onSuccess={(message) => {
                                 console.log('Success:', message);
                                 // Optionally refresh the list
                                 loadSuperAdmins();
                               }}
                               onError={(error) => {
                                 console.error('Error:', error);
                               }}
                             />
                           </>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Super Administrator Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Super Administrators</strong> have full access to the platform including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Complete user management (create, edit, delete all user types)</li>
              <li>System-wide settings and configuration</li>
              <li>Access to all dashboards and reports</li>
              <li>Role and permission management</li>
              <li>Billing and subscription management</li>
              <li>Audit logs and system monitoring</li>
            </ul>
            <p className="pt-2">
              <strong>Note:</strong> Super Administrator accounts should be created and managed carefully 
              as they have unrestricted access to the entire system.
            </p>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
