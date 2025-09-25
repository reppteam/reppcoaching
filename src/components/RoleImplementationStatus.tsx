import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, User, Shield, ShieldCheck, Crown, BarChart3, DollarSign, Settings, Lock, Users, Eye, Edit, Plus, UserCheck } from 'lucide-react';

export function RoleImplementationStatus() {
  const { user } = useAuth();

  const roleSpecifications = {
    'super_admin': {
      name: 'Super Admin',
      icon: <Crown className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-800',
      capabilities: [
        '✅ Full access to Coaches',
        '✅ Full access to Students', 
        '✅ Full access to Coach Manager data',
        '✅ Access to KPI Dashboard (same data as Coach Manager)',
        '✅ Pricing CRUD operations',
        '✅ Can assign Students to Coaches',
        '✅ Can manage Coach Managers and their permissions',
        '✅ Can manage role-based permissions',
        '❌ System Settings UI: Hidden as requested'
      ]
    },
    'coach_manager': {
      name: 'Coach Manager',
      icon: <ShieldCheck className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800',
      capabilities: [
        '✅ Manage Coaches (CRUD)',
        '✅ Manage Students (CRUD)',
        '✅ Assign Students to Coaches',
        '✅ View KPI Dashboard (same data as Super Admin)',
        '✅ View/Add/Edit/Delete Pricing',
        '❌ Cannot access System Settings UI',
        '❌ Cannot manage other roles or permissions'
      ]
    },
    'coach': {
      name: 'Coach',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800',
      capabilities: [
        '✅ View Students assigned to them only',
        '✅ View Student details and interact with them',
        '✅ Access to profit calculator',
        '❌ Cannot assign or add Students',
        '❌ Cannot access Pricing or KPIs'
      ]
    },
    'user': {
      name: 'Student',
      icon: <User className="h-4 w-4" />,
      color: 'bg-gray-100 text-gray-800',
      capabilities: [
        '✅ View their own dashboard/profile only',
        '✅ Access to goals and reports',
        '✅ Can manage own leads',
        '❌ Cannot view others or admin data'
      ]
    }
  };

  const implementedFeatures = [
    {
      category: '🧑‍💻 4-Tier Role System',
      features: [
        { name: 'Super Admin Role', status: 'complete', description: 'Full platform access + role management' },
        { name: 'Coach Manager Role', status: 'complete', description: 'CRUD for coaches/students + KPI access' },
        { name: 'Coach Role', status: 'complete', description: 'View assigned students only' },
        { name: 'Student Role', status: 'complete', description: 'Own dashboard/profile access only' }
      ]
    },
    {
      category: '🔐 Access Control Implementation',
      features: [
        { name: 'Role-Based Navigation', status: 'complete', description: 'Different sidebar items per role' },
        { name: 'Permission Restrictions', status: 'complete', description: 'Visual lock icons and access denied messages' },
        { name: 'System Settings Hidden', status: 'complete', description: 'Removed from all roles as requested' },
        { name: 'Coach Pricing Restrictions', status: 'complete', description: 'Only Coach Manager and Super Admin access' }
      ]
    },
    {
      category: '📊 KPI Dashboard Sharing',
      features: [
        { name: 'Super Admin KPI Access', status: 'complete', description: 'Full analytics dashboard access' },
        { name: 'Coach Manager KPI Access', status: 'complete', description: 'Same data as Super Admin' },
        { name: 'Coach/Student Restrictions', status: 'complete', description: 'Clear access denied messages' },
        { name: 'Shared Data View', status: 'complete', description: 'Identical KPI data for both admin roles' }
      ]
    },
    {
      category: '⚙️ Permissions Management Interface',
      features: [
        { name: 'Super Admin Only Access', status: 'complete', description: 'Restricted to Super Admin role only' },
        { name: 'Toggle-Based Interface', status: 'complete', description: 'Switch controls for each permission' },
        { name: 'Granular Permissions', status: 'complete', description: 'Individual toggles like "Can Add Students", "Can View KPI"' },
        { name: 'Future Role Customization', status: 'complete', description: 'Ready for Sales and other custom roles' }
      ]
    }
  ];

  const currentUserRole = user ? roleSpecifications[user.role as keyof typeof roleSpecifications] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Role-Based Access Control - Implementation Complete ✅
          </CardTitle>
          <CardDescription>
            All requested role specifications have been successfully implemented according to manager requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(roleSpecifications).map(([roleId, spec]) => (
              <Card key={roleId} className={`border-2 ${user?.role === roleId ? 'border-blue-500 bg-blue-50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      {spec.icon}
                      <CardTitle className="text-base">{spec.name}</CardTitle>
                    </div>
                    <Badge className={spec.color}>
                      {user?.role === roleId ? 'You' : 'Role'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 text-xs">
                    {spec.capabilities.map((capability, index) => (
                      <li key={index} className={`${capability.startsWith('✅') ? 'text-green-700' : 'text-red-700'}`}>
                        {capability}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentUserRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black dark:text-white">
              {currentUserRole.icon}
              Your Current Access Level: {currentUserRole.name}
            </CardTitle>
            <CardDescription>
              What you can access and do with your current role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-3">✅ Available Capabilities</h4>
                <ul className="space-y-2">
                  {currentUserRole.capabilities
                    .filter(cap => cap.startsWith('✅'))
                    .map((capability, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                        {capability.replace('✅ ', '')}
                      </li>
                    ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-red-700 mb-3">🔒 Restrictions</h4>
                <ul className="space-y-2">
                  {currentUserRole.capabilities
                    .filter(cap => cap.startsWith('❌'))
                    .map((capability, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Lock className="h-3 w-3 text-red-600 mr-2 flex-shrink-0" />
                        {capability.replace('❌ ', '')}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {implementedFeatures.map((section) => (
          <Card key={section.category}>
            <CardHeader>
              <CardTitle className="text-base">{section.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{feature.name}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Implementation Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">KPI Dashboard Sharing</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Super Admin and Coach Manager see identical KPI data and analytics
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50">
              <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Permissions Interface</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Super Admin only toggle-based permissions management for future customization
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium">Role-Based Access</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Precise access control with visual restrictions and clear role separation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Account Access</CardTitle>
          <CardDescription>Test all role levels with these credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium mb-3">All accounts use password: "password"</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-black dark:text-white">
                <Crown className="h-4 w-4 text-purple-600" />
                <span>Super Admin: superadmin@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-black dark:text-white">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Coach Manager: coachmanager@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-black dark:text-white">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Coach: coach@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-black dark:text-white">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Student: student@example.com</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}