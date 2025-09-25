import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Settings,
  Shield,
  ShieldCheck,
  User,
  Crown,
  Save,
  RotateCcw,
  AlertTriangle,
  Lock,
  CheckCircle,
  Users,
  DollarSign,
  BarChart3,
  FileText,
  Target,
  Calculator,
  UserCheck,
  Eye,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'management' | 'analytics' | 'system';
  icon: React.ComponentType<any>;
}

interface RolePermissions {
  [roleId: string]: {
    [permissionId: string]: boolean;
  };
}

const PERMISSIONS: Permission[] = [
  // Core permissions
  { id: 'view_own_dashboard', name: 'View Own Dashboard', description: 'Access personal dashboard and profile', category: 'core', icon: User },
  { id: 'view_goals', name: 'View Goals', description: 'Access goals and objectives', category: 'core', icon: Target },
  { id: 'view_reports', name: 'View Reports', description: 'Access weekly reports and progress', category: 'core', icon: FileText },
  { id: 'view_leads', name: 'View Leads', description: 'Access leads management', category: 'core', icon: Users },
  { id: 'edit_own_profile', name: 'Edit Own Profile', description: 'Modify personal information', category: 'core', icon: User },
  
  // Management permissions
  { id: 'view_all_students', name: 'View All Students', description: 'See all student accounts', category: 'management', icon: Users },
  { id: 'view_assigned_students', name: 'View Assigned Students', description: 'See only assigned students', category: 'management', icon: Users },
  { id: 'add_students', name: 'Add Students', description: 'Create new student accounts', category: 'management', icon: Plus },
  { id: 'edit_students', name: 'Edit Students', description: 'Modify student information', category: 'management', icon: Edit },
  { id: 'delete_students', name: 'Delete Students', description: 'Remove student accounts', category: 'management', icon: Trash2 },
  { id: 'manage_coaches', name: 'Manage Coaches', description: 'Add, edit, remove coach accounts (CRUD)', category: 'management', icon: Shield },
  { id: 'assign_students_to_coaches', name: 'Assign Students to Coaches', description: 'Assign students to specific coaches', category: 'management', icon: UserCheck },
  { id: 'manage_coach_managers', name: 'Manage Coach Managers', description: 'Add, edit, remove coach manager accounts', category: 'management', icon: ShieldCheck },
  
  // Analytics permissions
  { id: 'view_kpi_dashboard', name: 'View KPI Dashboard', description: 'Access comprehensive analytics and KPIs', category: 'analytics', icon: BarChart3 },
  { id: 'view_profit_calculator', name: 'View Profit Calculator', description: 'Access profit margin tools', category: 'analytics', icon: Calculator },
  { id: 'view_coach_performance', name: 'View Coach Performance', description: 'See coach analytics and metrics', category: 'analytics', icon: BarChart3 },
  
  // System permissions
  { id: 'manage_pricing', name: 'Manage Pricing', description: 'Create, edit, delete pricing packages (CRUD)', category: 'system', icon: DollarSign },
  { id: 'manage_roles_permissions', name: 'Manage Roles & Permissions', description: 'Change user roles and configure permissions', category: 'system', icon: Crown },
  { id: 'login_as_user', name: 'Login As User', description: 'Impersonate other users for support', category: 'system', icon: Shield }
];

const ROLES = [
  { id: 'user', name: 'Student', icon: User, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  { id: 'coach', name: 'Coach', icon: Shield, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
  { id: 'coach_manager', name: 'Coach Manager', icon: ShieldCheck, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
  { id: 'super_admin', name: 'Super Admin', icon: Crown, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' }
];

// Default permissions for each role based on specifications
const DEFAULT_PERMISSIONS: RolePermissions = {
  user: {
    // Student: Can only view their own dashboard/profile
    view_own_dashboard: true,
    view_goals: true,
    view_reports: true,
    view_leads: true,
    edit_own_profile: true,
    view_all_students: false,
    view_assigned_students: false,
    add_students: false,
    edit_students: false,
    delete_students: false,
    manage_coaches: false,
    assign_students_to_coaches: false,
    manage_coach_managers: false,
    view_kpi_dashboard: false,
    view_profit_calculator: false,
    view_coach_performance: false,
    manage_pricing: false,
    manage_roles_permissions: false,
    login_as_user: false
  },
  coach: {
    // Coach: Can only view students assigned to them, view student details and interact with them
    view_own_dashboard: true,
    view_goals: true,
    view_reports: true,
    view_leads: true,
    edit_own_profile: true,
    view_all_students: false,
    view_assigned_students: true,
    add_students: false,
    edit_students: false,
    delete_students: false,
    manage_coaches: false,
    assign_students_to_coaches: false,
    manage_coach_managers: false,
    view_kpi_dashboard: false,
    view_profit_calculator: true,
    view_coach_performance: false,
    manage_pricing: false,
    manage_roles_permissions: false,
    login_as_user: false
  },
  coach_manager: {
    // Coach Manager: Manage Coaches (CRUD), Manage Students (CRUD), Assign Students to Coaches, View KPI Dashboard, View/Add/Edit/Delete Pricing
    view_own_dashboard: true,
    view_goals: true,
    view_reports: true,
    view_leads: true,
    edit_own_profile: true,
    view_all_students: true,
    view_assigned_students: false,
    add_students: true,
    edit_students: true,
    delete_students: true,
    manage_coaches: true,
    assign_students_to_coaches: true,
    manage_coach_managers: false,
    view_kpi_dashboard: true,
    view_profit_calculator: true,
    view_coach_performance: true,
    manage_pricing: true,
    manage_roles_permissions: false,
    login_as_user: false
  },
  super_admin: {
    // Super Admin: Full access to Coaches, Students, Coach Manager data, KPI Dashboard, Pricing (CRUD), can assign Students to Coaches, can manage Coach Managers and permissions
    view_own_dashboard: true,
    view_goals: true,
    view_reports: true,
    view_leads: true,
    edit_own_profile: true,
    view_all_students: true,
    view_assigned_students: false,
    add_students: true,
    edit_students: true,
    delete_students: true,
    manage_coaches: true,
    assign_students_to_coaches: true,
    manage_coach_managers: true,
    view_kpi_dashboard: true,
    view_profit_calculator: true,
    view_coach_performance: true,
    manage_pricing: true,
    manage_roles_permissions: true,
    login_as_user: true
  }
};

function hasAnyRole(user: any, roles: string[]) {
  const userRoles = user?.['https://api.8base.com/roles'] || user?.roles || [];
  return roles.some(role => userRoles.includes(role));
}

export function AdvancedRolePermissions() {
  const { user } = useAuth();
  if (hasAnyRole(user, ['Administrator', 'coach_manager'])) {
    return <div>Super admin or coach manager permissions granted.</div>;
  }
  if (hasAnyRole(user, ['Coach'])) {
    return <div>Coach permissions granted.</div>;
  }
  if (hasAnyRole(user, ['Student'])) {
    return <div>Student permissions granted.</div>;
  }
  return <div>No special permissions.</div>;
}

export function RolePermissionsManager() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved permissions from localStorage or API
    const savedPermissions = localStorage.getItem('rolePermissions');
    if (savedPermissions) {
      setPermissions(JSON.parse(savedPermissions));
    }
  }, []);

  const handlePermissionChange = (roleId: string, permissionId: string, enabled: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionId]: enabled
      }
    }));
    setHasChanges(true);
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('rolePermissions', JSON.stringify(permissions));
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPermissions = () => {
    setPermissions(DEFAULT_PERMISSIONS);
    setHasChanges(true);
  };

  const getPermissionsByCategory = (category: string) => {
    return PERMISSIONS.filter(p => p.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <User className="h-4 w-4" />;
      case 'management': return <Users className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'text-blue-600 dark:text-blue-400';
      case 'management': return 'text-green-600 dark:text-green-400';
      case 'analytics': return 'text-purple-600 dark:text-purple-400';
      case 'system': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  // Only Super Admin can access this interface
  if (user?.role !== 'super_admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Super Admin Access Required</h3>
            <p className="text-muted-foreground mb-4">
              Role and permissions management is restricted to Super Admins only.
            </p>
            <Badge variant="outline" className="text-red-600">
              <Crown className="h-3 w-3 mr-1" />
              Super Admin Only
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2 text-black dark:text-white">
            <Crown className="h-6 w-6 text-purple-600" />
            Role & Permissions Manager
          </h2>
          <p className="text-muted-foreground">
            Configure access levels and permissions for each user role. Useful for customizing future roles like Sales, etc.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={resetPermissions}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={savePermissions} disabled={!hasChanges || loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Alert */}
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription>
          <strong>Role-Based Permissions:</strong> Configure what each role can access and do. 
          Changes apply immediately to all users with the respective roles. Perfect for customizing access levels for future roles.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">By Role</TabsTrigger>
          <TabsTrigger value="permissions">By Permission</TabsTrigger>
        </TabsList>

        {/* By Role Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Role Selector */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Select Role</CardTitle>
                  <CardDescription>Choose a role to configure permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ROLES.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;
                      const rolePermissions = permissions[role.id];
                      const enabledCount = Object.values(rolePermissions).filter(Boolean).length;
                      
                      return (
                        <Button
                          key={role.id}
                          variant={isSelected ? "default" : "ghost"}
                          className="w-full justify-start h-auto p-3"
                          onClick={() => setSelectedRole(role.id)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span>{role.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {enabledCount}/{PERMISSIONS.length}
                            </Badge>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permissions for Selected Role */}
            <div className="lg:col-span-3">
              {selectedRole && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                      {React.createElement(ROLES.find(r => r.id === selectedRole)?.icon || User, { className: "h-5 w-5" })}
                      {ROLES.find(r => r.id === selectedRole)?.name} Permissions
                    </CardTitle>
                    <CardDescription>
                      Toggle permissions on/off for this role. Example: Can Add Students, Can View KPI, etc.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {['core', 'management', 'analytics', 'system'].map((category) => {
                        const categoryPermissions = getPermissionsByCategory(category);
                        if (categoryPermissions.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <div className={`flex items-center gap-2 text-black dark:text-white mb-3 ${getCategoryColor(category)}`}>
                              {getCategoryIcon(category)}
                              <h4 className="font-medium capitalize">{category} Permissions</h4>
                              <Badge variant="outline" className="text-xs">
                                {categoryPermissions.filter(p => permissions[selectedRole]?.[p.id]).length}/{categoryPermissions.length}
                              </Badge>
                            </div>
                            <div className="space-y-3 pl-6">
                              {categoryPermissions.map((permission) => {
                                const Icon = permission.icon;
                                const isEnabled = permissions[selectedRole]?.[permission.id] || false;
                                
                                return (
                                  <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                      <Icon className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <Label htmlFor={`${selectedRole}-${permission.id}`} className="font-medium cursor-pointer">
                                          {permission.name}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          {permission.description}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {isEnabled && <CheckCircle className="h-4 w-4 text-green-600" />}
                                      <Switch
                                        id={`${selectedRole}-${permission.id}`}
                                        checked={isEnabled}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(selectedRole, permission.id, checked)
                                        }
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {category !== 'system' && <Separator className="mt-6" />}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* By Permission Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="space-y-6">
            {['core', 'management', 'analytics', 'system'].map((category) => {
              const categoryPermissions = getPermissionsByCategory(category);
              if (categoryPermissions.length === 0) return null;
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 text-black dark:text-white capitalize ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                      {category} Permissions
                    </CardTitle>
                    <CardDescription>
                      Configure {category} permissions across all roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryPermissions.map((permission) => {
                        const Icon = permission.icon;
                        
                        return (
                          <div key={permission.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium">{permission.name}</h4>
                                <p className="text-sm text-muted-foreground">{permission.description}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {ROLES.map((role) => {
                                const RoleIcon = role.icon;
                                const isEnabled = permissions[role.id]?.[permission.id] || false;
                                
                                return (
                                  <div key={role.id} className="flex items-center justify-between p-3 border rounded bg-muted/30">
                                    <div className="flex items-center space-x-2">
                                      <RoleIcon className="h-4 w-4" />
                                      <span className="text-sm font-medium">{role.name}</span>
                                    </div>
                                    <Switch
                                      checked={isEnabled}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(role.id, permission.id, checked)
                                      }
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}