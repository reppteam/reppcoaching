import React, { useState } from 'react';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Crown, 
  ShieldCheck, 
  User as UserIcon, 
  GraduationCap,
  Settings,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

export type Permission = 
  | 'create_students'
  | 'create_coaches' 
  | 'manage_coaches'
  | 'assign_students_to_coaches'
  | 'edit_own_students'
  | 'edit_any_user'
  | 'delete_users'
  | 'activate_deactivate_users'
  | 'view_all_students'
  | 'view_own_students'
  | 'view_own_dashboard'
  | 'view_system_settings'
  | 'access_billing'
  | 'access_sales'
  | 'modify_roles'
  | 'view_kpis_all'
  | 'view_kpis_own'
  | 'access_user_management'
  | 'update_student_notes';

interface RolePermissions {
  role: string;
  displayName: string;
  icon: React.ReactNode;
  color: string;
  permissions: Permission[];
  description: string;
}

const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'super_admin',
    displayName: 'Super Admin',
    icon: <Crown className="h-4 w-4" />,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    description: 'Full platform access - manage all users, roles, global settings, billing',
    permissions: [
      'create_students',
      'create_coaches',
      'manage_coaches',
      'assign_students_to_coaches',
      'edit_any_user',
      'delete_users',
      'activate_deactivate_users',
      'view_all_students',
      'view_system_settings',
      'access_billing',
      'access_sales',
      'modify_roles',
      'view_kpis_all',
      'access_user_management',
      'update_student_notes'
    ]
  },
  {
    role: 'coach_manager',
    displayName: 'Coach Manager',
    icon: <ShieldCheck className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    description: 'Can add/edit students, assign students to coaches, manage coaches',
    permissions: [
      'create_students',
      'create_coaches',
      'manage_coaches',
      'assign_students_to_coaches',
      'edit_own_students',
      'activate_deactivate_users',
      'view_all_students',
      'view_kpis_all',
      'access_user_management',
      'update_student_notes'
    ]
  },
  {
    role: 'coach',
    displayName: 'Coach',
    icon: <UserIcon className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    description: 'View and manage only assigned students - cannot add students or coaches',
    permissions: [
      'view_own_students',
      'edit_own_students',
      'view_kpis_own',
      'update_student_notes'
    ]
  },
  {
    role: 'user',
    displayName: 'Student',
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    description: 'View only their own dashboard, sessions, messages, and weekly progress',
    permissions: [
      'view_own_dashboard'
    ]
  }
];

const PERMISSION_LABELS: Record<Permission, { label: string; description: string; icon: React.ReactNode }> = {
  create_students: {
    label: 'Create Students',
    description: 'Add new student accounts',
    icon: <Plus className="h-3 w-3" />
  },
  create_coaches: {
    label: 'Create Coaches',
    description: 'Add new coach accounts',
    icon: <Plus className="h-3 w-3" />
  },
  manage_coaches: {
    label: 'Manage Coaches',
    description: 'Promote, deactivate, and manage coach accounts',
    icon: <Settings className="h-3 w-3" />
  },
  assign_students_to_coaches: {
    label: 'Assign Students to Coaches',
    description: 'Assign and reassign students to coaches',
    icon: <Users className="h-3 w-3" />
  },
  edit_own_students: {
    label: 'Edit Assigned Students',
    description: 'Modify assigned students only',
    icon: <Edit className="h-3 w-3" />
  },
  edit_any_user: {
    label: 'Edit Any User',
    description: 'Modify any user in the system',
    icon: <Edit className="h-3 w-3" />
  },
  delete_users: {
    label: 'Delete Users',
    description: 'Remove users from the system',
    icon: <Trash2 className="h-3 w-3" />
  },
  activate_deactivate_users: {
    label: 'Activate/Deactivate Users',
    description: 'Toggle user account activation status',
    icon: <Lock className="h-3 w-3" />
  },
  view_all_students: {
    label: 'View All Students',
    description: 'See all students in the system',
    icon: <Eye className="h-3 w-3" />
  },
  view_own_students: {
    label: 'View Assigned Students',
    description: 'See only assigned students',
    icon: <Eye className="h-3 w-3" />
  },
  view_own_dashboard: {
    label: 'View Own Dashboard',
    description: 'Access personal dashboard, sessions, messages, progress',
    icon: <Eye className="h-3 w-3" />
  },
  view_system_settings: {
    label: 'System Settings',
    description: 'Access global system configuration',
    icon: <Settings className="h-3 w-3" />
  },
  access_billing: {
    label: 'Access Billing',
    description: 'View and manage billing information',
    icon: <Settings className="h-3 w-3" />
  },
  access_sales: {
    label: 'Access Sales',
    description: 'View and manage sales modules',
    icon: <Settings className="h-3 w-3" />
  },
  modify_roles: {
    label: 'Modify Roles',
    description: 'Change user roles and permissions',
    icon: <Lock className="h-3 w-3" />
  },
  view_kpis_all: {
    label: 'View All KPIs',
    description: 'See performance data for all users',
    icon: <Eye className="h-3 w-3" />
  },
  view_kpis_own: {
    label: 'View Own KPIs',
    description: 'See performance data for assigned users',
    icon: <Eye className="h-3 w-3" />
  },
  access_user_management: {
    label: 'User Management',
    description: 'Access user management interface',
    icon: <Users className="h-3 w-3" />
  },
  update_student_notes: {
    label: 'Update Student Notes',
    description: 'Add and modify student progress notes',
    icon: <Edit className="h-3 w-3" />
  }
};

interface RolePermissionsMatrixProps {
  currentUser?: User;
  onRoleChange?: (userId: string, newRole: string) => void;
  onPermissionChange?: (userId: string, permission: Permission, enabled: boolean) => void;
}

export function RolePermissionsMatrix({ currentUser, onRoleChange, onPermissionChange }: RolePermissionsMatrixProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const hasPermission = (userRole: string, permission: Permission): boolean => {
    const roleConfig = ROLE_PERMISSIONS.find(r => r.role === userRole);
    return roleConfig?.permissions.includes(permission) ?? false;
  };

  const getRoleConfig = (role: string): RolePermissions | undefined => {
    return ROLE_PERMISSIONS.find(r => r.role === role);
  };

  const canModifyRoles = currentUser?.role === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLE_PERMISSIONS.map((roleConfig) => (
          <Card key={roleConfig.role} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {roleConfig.icon}
                  <CardTitle className="text-sm">{roleConfig.displayName}</CardTitle>
                </div>
                <Badge className={roleConfig.color}>
                  {roleConfig.permissions.length} permissions
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {roleConfig.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roleConfig.permissions.slice(0, 3).map((permission) => (
                  <div key={permission} className="flex items-center space-x-2 text-xs">
                    {PERMISSION_LABELS[permission].icon}
                    <span className="text-muted-foreground">
                      {PERMISSION_LABELS[permission].label}
                    </span>
                  </div>
                ))}
                {roleConfig.permissions.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{roleConfig.permissions.length - 3} more...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Detailed Permissions Matrix
          </CardTitle>
          <CardDescription>
            Comprehensive overview of what each role can and cannot do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-sm">Permission</th>
                  {ROLE_PERMISSIONS.map((roleConfig) => (
                    <th key={roleConfig.role} className="text-center p-3 min-w-24">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="flex items-center space-x-1">
                          {roleConfig.icon}
                          <span className="text-xs font-medium">{roleConfig.displayName}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERMISSION_LABELS).map(([permission, config]) => (
                  <tr key={permission} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {config.icon}
                        <div>
                          <div className="font-medium text-sm">{config.label}</div>
                          <div className="text-xs text-muted-foreground">{config.description}</div>
                        </div>
                      </div>
                    </td>
                    {ROLE_PERMISSIONS.map((roleConfig) => (
                      <td key={roleConfig.role} className="p-3 text-center">
                        {hasPermission(roleConfig.role, permission as Permission) ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                            <Unlock className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 dark:bg-red-900/20">
                            <Lock className="h-3 w-3" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Current User Access Summary */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Your Current Access Level
            </CardTitle>
            <CardDescription>
              What you can do with your current role: {currentUser.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getRoleConfig(currentUser.role)?.icon}
                <div>
                  <div className="font-medium">{getRoleConfig(currentUser.role)?.displayName}</div>
                  <div className="text-sm text-muted-foreground">
                    {getRoleConfig(currentUser.role)?.description}
                  </div>
                </div>
                <Badge className={getRoleConfig(currentUser.role)?.color}>
                  Current Role
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-3 text-green-600 flex items-center gap-2">
                    <Unlock className="h-4 w-4" />
                    What You Can Do
                  </h4>
                  <div className="space-y-2">
                    {getRoleConfig(currentUser.role)?.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2 text-sm">
                        {PERMISSION_LABELS[permission].icon}
                        <span>{PERMISSION_LABELS[permission].label}</span>
                      </div>
                    )) || (
                      <div className="text-sm text-muted-foreground">
                        View your own dashboard and data only
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3 text-red-600 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    What You Cannot Do
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(PERMISSION_LABELS)
                      .filter(([permission]) => !hasPermission(currentUser.role, permission as Permission))
                      .slice(0, 5)
                      .map(([permission, config]) => (
                        <div key={permission} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {config.icon}
                          <span>{config.label}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Utility functions for role-based access control
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  const roleConfig = ROLE_PERMISSIONS.find(r => r.role === user.role);
  return roleConfig?.permissions.includes(permission) ?? false;
}

export function getRoleDisplayInfo(role: string) {
  return ROLE_PERMISSIONS.find(r => r.role === role);
}

export function canUserPerformAction(user: User | null, action: string): boolean {
  if (!user) return false;
  
  const actionPermissionMap: Record<string, Permission> = {
    'create_coach': 'create_coaches',
    'create_student': 'create_students',
    'manage_coaches': 'manage_coaches',
    'assign_student_to_coach': 'assign_students_to_coaches',
    'edit_user': 'edit_any_user',
    'edit_assigned_student': 'edit_own_students',
    'delete_user': 'delete_users',
    'activate_user': 'activate_deactivate_users',
    'view_all_kpis': 'view_kpis_all',
    'view_system_settings': 'view_system_settings',
    'access_billing': 'access_billing',
    'access_sales': 'access_sales',
    'modify_roles': 'modify_roles',
    'access_user_management': 'access_user_management',
    'update_notes': 'update_student_notes'
  };

  const permission = actionPermissionMap[action];
  return permission ? hasPermission(user, permission) : false;
}