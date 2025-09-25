import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  CheckCircle, 
  ArrowUpCircle,
  Lock,
  Gift
} from 'lucide-react';

interface SubscriptionInfoProps {
  user?: {
    firstName: string;
    lastName: string;
    plan?: string;
    has_paid?: boolean;
    created_at?: string;
  } | null;
}

export function SubscriptionInfo({ user }: SubscriptionInfoProps) {
  const planType = user?.has_paid ? 'premium' : 'free';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <CreditCard className="h-5 w-5" />
            Subscription Info
          </CardTitle>
          <CardDescription>
            Your current plan and subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${planType === 'premium' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {planType === 'premium' ? (
                  <Crown className="h-4 w-4 text-purple-600" />
                ) : (
                  <Gift className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-medium">
                  {planType === 'premium' ? 'Premium Plan' : 'You are currently on the Free Plan'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {planType === 'premium' ? 'Full access to all features' : 'Basic features and resources'}
                </div>
              </div>
            </div>
            <Badge 
              variant={planType === 'premium' ? 'default' : 'secondary'}
                              className={planType === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-muted text-muted-foreground'}
            >
              {planType === 'premium' ? 'Premium' : 'Free'}
            </Badge>
          </div>

          {/* Plan Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Account Status:</span>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-medium">{formatDate(user?.created_at)}</span>
            </div>

            {planType === 'free' && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Plan Cost:</span>
                <span className="font-medium text-green-600">$0 / month</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Current Plan Features */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Current Plan Includes:</h4>
            <div className="space-y-1">
              {planType === 'free' ? (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>Access to dashboard and profile</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>Basic goals and progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>Essential learning resources</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>Community access</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-purple-600 flex-shrink-0" />
                    <span>All Free Plan features</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-purple-600 flex-shrink-0" />
                    <span>Premium coaching access</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-purple-600 flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-purple-600 flex-shrink-0" />
                    <span>Priority support</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upgrade Button - Grayed out for future use */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full opacity-60 cursor-not-allowed" 
              disabled
            >
              <Lock className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Premium plans coming soon
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      {planType === 'free' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <ArrowUpCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-900">Ready to level up?</div>
                <div className="text-sm text-blue-700">
                  Upgrade when premium plans become available
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}