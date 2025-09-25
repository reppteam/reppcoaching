import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Mail, 
  User, 
  Shield, 
  Lock,
  ExternalLink,
  Crown,
  ShieldCheck,
  GraduationCap,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';

interface EmailTemplatePreviewProps {
  userType: 'student' | 'coach' | 'coach_manager' | 'super_admin';
  userName: string;
  userEmail: string;
  createdBy?: string;
}

export function EmailTemplatePreview({ 
  userType, 
  userName, 
  userEmail, 
  createdBy 
}: EmailTemplatePreviewProps) {
  
  const getUserTypeInfo = (type: string) => {
    switch (type) {
      case 'student':
        return {
          title: 'Student',
          icon: <GraduationCap className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-800',
          welcomeMessage: 'Welcome to Real Estate Photography Pro! Your learning journey starts here.',
          features: [
            'Personal dashboard with progress tracking',
            'Goal setting and milestone tracking',
            'Access to learning resources and pricing guides',
            'Direct communication with your assigned coach',
            'Weekly progress reports and analytics'
          ]
        };
      case 'coach':
        return {
          title: 'Coach',
          icon: <Shield className="h-4 w-4" />,
          color: 'bg-green-100 text-green-800',
          welcomeMessage: 'Welcome to the coaching team! Help students achieve their photography business goals.',
          features: [
            'Manage your assigned students',
            'Track student progress and milestones',
            'Access to coaching tools and resources',
            'Profit calculator and business planning tools',
            'Student performance analytics'
          ]
        };
      case 'coach_manager':
        return {
          title: 'Coach Manager',
          icon: <ShieldCheck className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-800',
          welcomeMessage: 'Welcome to the management team! Oversee coaches and drive student success.',
          features: [
            'Manage all coaches and students',
            'Assign students to coaches',
            'Access to comprehensive KPI dashboard',
            'Pricing management and business tools',
            'Full analytics and reporting suite'
          ]
        };
      case 'super_admin':
        return {
          title: 'Super Admin',
          icon: <Crown className="h-4 w-4" />,
          color: 'bg-purple-100 text-purple-800',
          welcomeMessage: 'Welcome to Real Estate Photography Pro! You have full system access.',
          features: [
            'Complete platform administration',
            'User role and permission management',
            'System-wide analytics and reporting',
            'Coach and student management',
            'Platform configuration and settings'
          ]
        };
      default:
        return {
          title: 'User',
          icon: <User className="h-4 w-4" />,
          color: 'bg-gray-100 text-gray-800',
          welcomeMessage: 'Welcome to Real Estate Photography Pro!',
          features: []
        };
    }
  };

  const userInfo = getUserTypeInfo(userType);
  const loginUrl = window.location.origin;
  const temporaryPassword = 'REPhoto2024!';

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <Mail className="h-5 w-5" />
            Email Template Preview
          </CardTitle>
          <CardDescription>
            This is what the confirmation email will look like
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Email Content */}
          <div className="bg-white border rounded-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">REAL ESTATE</h1>
                  <p className="text-blue-200 text-sm">PHOTOGRAPHER PRO</p>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-6 space-y-6">
              {/* Welcome Section */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Welcome, {userName}!
                </h2>
                <p className="text-muted-foreground mb-4">
                  {userInfo.welcomeMessage}
                </p>
                
                <div className="flex items-center space-x-2">
                  <Badge className={userInfo.color}>
                    {userInfo.icon}
                    <span className="ml-1">{userInfo.title} Account</span>
                  </Badge>
                  {createdBy && (
                    <span className="text-sm text-muted-foreground">
                      Created by {createdBy}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Login Information */}
                              <div className="bg-gray-50 dark:bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-black dark:text-white">
                  <Lock className="h-4 w-4" />
                  Your Login Information
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Login URL:</span>
                    <a href={loginUrl} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                      {loginUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">{userEmail}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Temporary Password:</span>
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                      {temporaryPassword}
                    </code>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Please change your password after your first login for security.
                  </p>
                </div>
              </div>

              {/* Features & Access */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Your {userInfo.title} Access Includes:
                </h3>
                <ul className="space-y-2">
                  {userInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Next Steps */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Next Steps:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <div className="font-medium text-sm">Log in to your account</div>
                      <div className="text-sm text-muted-foreground">Use the credentials provided above</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <div className="font-medium text-sm">Complete your profile</div>
                      <div className="text-sm text-muted-foreground">Add your information and set your preferences</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <div className="font-medium text-sm">Explore the platform</div>
                      <div className="text-sm text-muted-foreground">
                        {userType === 'student' ? 'Set your goals and start learning' : 'Review your dashboard and available tools'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Our support team is here to help you get started. Don't hesitate to reach out!
                </p>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Mail className="h-3 w-3" />
                    <span>support@realestatehotographerpro.com</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Phone className="h-3 w-3" />
                    <span>(555) 123-4567</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Login to Your Account
                </Button>
              </div>
            </div>

            {/* Email Footer */}
                          <div className="bg-gray-100 dark:bg-muted p-4 text-center">
              <p className="text-xs text-muted-foreground">
                © 2024 Real Estate Photographer Pro. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This email was sent to {userEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}