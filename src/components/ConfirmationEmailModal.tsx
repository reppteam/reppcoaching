import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  CheckCircle, 
  Mail, 
  User, 
  Shield, 
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Crown,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface ConfirmationEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'student' | 'coach' | 'coach_manager' | 'super_admin';
  userName: string;
  userEmail: string;
  createdBy?: string;
}

export function ConfirmationEmailModal({ 
  open, 
  onOpenChange, 
  userType,
  userName,
  userEmail,
  createdBy 
}: ConfirmationEmailModalProps) {
  
  const getUserTypeInfo = (type: string) => {
    switch (type) {
      case 'student':
        return {
          title: 'Student Account',
          icon: <GraduationCap className="h-5 w-5 text-blue-600" />,
          color: 'bg-blue-100 text-blue-800',
          description: 'Access to dashboard, goals, and learning resources'
        };
      case 'coach':
        return {
          title: 'Coach Account',
          icon: <Shield className="h-5 w-5 text-green-600" />,
          color: 'bg-green-100 text-green-800',
          description: 'Manage assigned students and coaching tools'
        };
      case 'coach_manager':
        return {
          title: 'Coach Manager Account',
          icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
          color: 'bg-blue-100 text-blue-800',
          description: 'Full management access to coaches and students'
        };
      case 'super_admin':
        return {
          title: 'Super Admin Account',
          icon: <Crown className="h-5 w-5 text-purple-600" />,
          color: 'bg-purple-100 text-purple-800',
          description: 'Complete system access and permissions management'
        };
      default:
        return {
          title: 'User Account',
                      icon: <User className="h-5 w-5 text-muted-foreground" />,
            color: 'bg-muted text-muted-foreground',
          description: 'Basic account access'
        };
    }
  };

  const userInfo = getUserTypeInfo(userType);

  const copyEmail = () => {
    navigator.clipboard.writeText(userEmail);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div>
            <DialogTitle className="text-xl">Account Created Successfully!</DialogTitle>
            <DialogDescription className="text-base mt-2">
              A confirmation email has been sent to the new user
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-lg">
                {userInfo.icon}
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{userName}</div>
                  <div className="text-sm text-muted-foreground">{userEmail}</div>
                </div>
                <Badge className={userInfo.color}>
                  {userInfo.title}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created on {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
              
              {createdBy && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Created by: {createdBy}</span>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                {userInfo.description}
              </div>
            </CardContent>
          </Card>

          {/* Email Confirmation Details */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-blue-900">
                <Mail className="h-5 w-5" />
                Confirmation Email Sent
              </CardTitle>
              <CardDescription className="text-blue-700">
                The user will receive login instructions and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">{userEmail}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyEmail}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <div className="text-sm text-blue-700">
                  <strong>Email includes:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                    <li>Welcome message and account type</li>
                    <li>Login instructions and temporary password</li>
                    <li>Platform overview and next steps</li>
                    <li>Support contact information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <ArrowRight className="h-5 w-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userType === 'student' ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-brand-blue text-white rounded-full text-xs font-medium">1</div>
                      <div className="text-sm">
                        <div className="font-medium">Check Email</div>
                        <div className="text-muted-foreground">User should check their inbox for login details</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-brand-blue text-white rounded-full text-xs font-medium">2</div>
                      <div className="text-sm">
                        <div className="font-medium">First Login</div>
                        <div className="text-muted-foreground">Complete profile setup and explore the platform</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-brand-blue text-white rounded-full text-xs font-medium">3</div>
                      <div className="text-sm">
                        <div className="font-medium">Set Goals</div>
                        <div className="text-muted-foreground">Define business objectives and start tracking progress</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-brand-blue text-white rounded-full text-xs font-medium">1</div>
                      <div className="text-sm">
                        <div className="font-medium">Email Verification</div>
                        <div className="text-muted-foreground">User should verify their email and set up login</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-brand-blue text-white rounded-full text-xs font-medium">2</div>
                      <div className="text-sm">
                        <div className="font-medium">Platform Training</div>
                        <div className="text-muted-foreground">Review role permissions and management tools</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-brand-blue text-white rounded-full text-xs font-medium">3</div>
                      <div className="text-sm">
                        <div className="font-medium">Start Managing</div>
                        <div className="text-muted-foreground">Begin working with assigned users and responsibilities</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Got It
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}