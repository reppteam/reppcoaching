import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, User, Shield, ShieldCheck, Crown, Lock, AlertTriangle } from 'lucide-react';

export function RoleSystemSummary() {
  const roleInfo = [
    {
      role: 'Student',
      email: 'student@example.com',
      icon: <User className="h-4 w-4" />,
      color: 'bg-gray-100 text-gray-800',
      permissions: [
        'View own dashboard',
        'Access goals and reports',
        'View pricing information',
        'Manage own leads'
      ],
      restrictions: [
        'Cannot access user management',
        'Cannot create pricing packages',
        'Cannot access system settings',
        'Cannot access billing/sales'
      ]
    },
    {
      role: 'Coach',
      email: 'coach@example.com',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800',
      permissions: [
        'View assigned students only',
        'Manage own pricing packages',
        'Access profit calculator',
        'View KPI dashboard for assigned students'
      ],
      restrictions: [
        'Cannot add new students',
        'Cannot manage other coaches',
        'Cannot access system settings',
        'Cannot access billing/sales'
      ]
    },
    {
      role: 'Coach Manager',
      email: 'coachmanager@example.com',
      icon: <ShieldCheck className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800',
      permissions: [
        'Add/edit/delete students',
        'Manage coaches (CRUD)',
        'Assign students to coaches',
        'Access all pricing management',
        'View comprehensive user management'
      ],
      restrictions: [
        'Cannot access system settings',
        'Cannot access billing/sales',
        'Cannot modify platform-wide configurations'
      ]
    },
    {
      role: 'Super Admin',
      email: 'superadmin@example.com',
      icon: <Crown className="h-4 w-4" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      permissions: [
        'Full platform access',
        'User and role management',
        'System-wide settings',
        'Billing and sales access',
        'All features unrestricted'
      ],
      restrictions: []
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Role System Implementation Status
          </CardTitle>
          <CardDescription>
            4-tier role system successfully implemented with proper access controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleInfo.map((info) => (
              <Card key={info.role} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-black dark:text-white">
                      {info.icon}
                      {info.role}
                    </CardTitle>
                    <Badge className={info.color}>
                      {info.role}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {info.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-green-700 mb-1">✅ Permissions</div>
                      <ul className="text-xs space-y-1">
                        {info.permissions.map((permission, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-600 mr-1 flex-shrink-0" />
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {info.restrictions.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-red-700 mb-1">🔒 Restrictions</div>
                        <ul className="text-xs space-y-1">
                          {info.restrictions.map((restriction, index) => (
                            <li key={index} className="flex items-center">
                              <Lock className="h-3 w-3 text-red-600 mr-1 flex-shrink-0" />
                              {restriction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Coach Pricing CRUD Features
          </CardTitle>
          <CardDescription>
            Complete pricing management system for coaches and coach managers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Available Features:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Create pricing packages
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Edit existing packages
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Delete packages
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Duplicate packages
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Toggle active/inactive status
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Package Details:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Package name & description
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Duration in weeks
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Pricing & categories
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Feature lists
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Analytics dashboard
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Demo Account Access
          </CardTitle>
          <CardDescription>
            Test all role levels with provided demo accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">Demo Credentials (all use password: "password")</div>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Super Admin: superadmin@example.com</li>
                <li className="text-blue-600 font-medium">• Coach Manager: coachmanager@example.com (NEW)</li>
                <li>• Coach: coach@example.com</li>
                <li>• Student: student@example.com</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}