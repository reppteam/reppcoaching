import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { NotificationBanner } from './NotificationBanner';
import { DashboardStats, QuickActions } from './DashboardStats';
import { ActivityFeed } from './ActivityFeed';
import { notificationService, Notification } from '../services/notificationService';
import { NotificationUtils } from '../utils/notificationUtils';
import { Heart, Quote, Bell, TrendingUp, Calendar } from 'lucide-react';
import { WeeklyReports } from './WeeklyReports';

interface EnhancedStudentDashboardProps {
  onEditProfile?: () => void;
  onNavigate?: (tab: string) => void;
}

export function EnhancedStudentDashboard({ 
  onEditProfile, 
  onNavigate 
}: EnhancedStudentDashboardProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalLeads: 0,
    reportsThisWeek: 0,
    leadsThisWeek: 0,
    totalRevenue: 0,
    avgRevenue: 0,
    activeLeads: 0,
    convertedLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load notifications
      const userNotifications = await notificationService.checkUserActivity(user.id);
      setNotifications(userNotifications);

      // Load stats
      const dashboardStats = await notificationService.getDashboardStats(user.id);
      setStats(dashboardStats);

      // Log activity
      NotificationUtils.logActivity(user.id, 'login');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionLink && onNavigate) {
      // Extract the tab name from the action link
      const tab = notification.actionLink.replace('/', '');
      onNavigate(tab);
    }
  };

  const getRecentActivities = () => {
    if (!user?.id) return [];

    const logs = NotificationUtils.getActivityLogs(user.id, 10);
    return logs.map((log, index) => ({
      id: `activity-${index}`,
      type: log.activityType === 'report_submitted' ? 'report' as const :
            log.activityType === 'lead_added' ? 'lead' as const :
            log.activityType === 'goal_updated' ? 'goal' as const :
            'milestone' as const,
      title: getActivityTitle(log.activityType),
      description: getActivityDescription(log.activityType, log.metadata),
      timestamp: new Date(log.timestamp),
    }));
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'report_submitted':
        return 'Weekly Report Submitted';
      case 'lead_added':
        return 'New Lead Added';
      case 'goal_updated':
        return 'Goal Updated';
      case 'login':
        return 'Dashboard Accessed';
      default:
        return 'Activity';
    }
  };

  const getActivityDescription = (type: string, metadata?: any) => {
    switch (type) {
      case 'report_submitted':
        return metadata?.revenue 
          ? `Revenue: $${metadata.revenue}` 
          : 'Weekly progress tracked';
      case 'lead_added':
        return metadata?.leadName 
          ? `Lead: ${metadata.leadName}` 
          : 'New potential client added';
      case 'goal_updated':
        return metadata?.goalTitle 
          ? `Goal: ${metadata.goalTitle}` 
          : 'Goal progress updated';
      case 'login':
        return 'Checked dashboard';
      default:
        return 'Activity recorded';
    }
  };

  const visibleNotifications = showAllNotifications 
    ? notifications 
    : notifications.slice(0, 2);

  const unreadCount = NotificationUtils.getUnreadCount(notifications);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section with Why */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back,{' '}
                <span className="text-brand-blue">
                  {user?.firstName} {user?.lastName}
                </span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your real estate photography business progress
              </p>
            </div>
            {notifications.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-2 border-primary/20 hover:border-primary/40 bg-background/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-600 dark:hover:border-gray-500 dark:text-white transition-all duration-200"
                  onClick={() => setShowAllNotifications(!showAllNotifications)}
                >
                  <Bell className="h-4 w-4 text-primary dark:text-blue-400" />
                  <span className="font-medium">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Why Section - Motivational */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    Remember Your Why
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {user?.why ||
                      'Why did you start this business? What drives you to succeed? Keep your purpose front and center.'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={onEditProfile}
                  >
                    <Quote className="mr-2 h-4 w-4" />
                    {user?.why ? 'Edit Your Why' : 'Set Your Why'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Notifications */}
      {visibleNotifications.length > 0 && (
        <div>
          <NotificationBanner
            notifications={visibleNotifications}
            onDismiss={handleDismissNotification}
            onAction={handleNotificationAction}
          />
          {notifications.length > 2 && !showAllNotifications && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => setShowAllNotifications(true)}
            >
              Show {notifications.length - 2} more notification
              {notifications.length - 2 > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}

      {/* Dashboard Stats */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Progress
        </h2>
        <DashboardStats stats={stats} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Quick Actions
        </h2>
        <QuickActions
          onSubmitReport={() => onNavigate?.('reports')}
          onAddLead={() => onNavigate?.('leads')}
          onViewGoals={() => onNavigate?.('goals')}
          onCalculator={() => onNavigate?.('calculator')}
        />
      </div>

      {/* Activity Feed and Weekly Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ActivityFeed activities={getRecentActivities()} maxItems={5} />
        </div>
        <div className="lg:col-span-2">
          <WeeklyReports />
        </div>
      </div>
    </div>
  );
}

