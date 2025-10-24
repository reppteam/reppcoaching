import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { todoService } from '../services/todoService';
import { Reminder } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Clock, 
  Bell, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Repeat,
  Timer,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';

interface ReminderDashboardProps {
  className?: string;
}

export function ReminderDashboard({ className }: ReminderDashboardProps) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recurring: 0,
    dueToday: 0,
    overdue: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadReminders();
    }
  }, [user?.id]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const userReminders = await todoService.getRemindersByUser(user!.id);
      setReminders(userReminders);
      calculateStats(userReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reminderList: Reminder[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const stats = {
      total: reminderList.length,
      active: reminderList.filter(r => r.isActive).length,
      recurring: reminderList.filter(r => r.isRecurring).length,
      dueToday: reminderList.filter(r => {
        const reminderDate = new Date(r.reminderDate);
        return reminderDate >= today && reminderDate < tomorrow && r.isActive;
      }).length,
      overdue: reminderList.filter(r => {
        const reminderDateTime = new Date(`${r.reminderDate}T${r.reminderTime}`);
        return reminderDateTime < now && r.isActive;
      }).length
    };

    setStats(stats);
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return reminders
      .filter(reminder => {
        // Handle both old time format and new DateTime format
        let reminderDateTime: Date;
        if (reminder.reminderTime.includes('T')) {
          // New DateTime format
          reminderDateTime = new Date(reminder.reminderTime);
        } else {
          // Old time format - combine with date
          reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
        }
        return reminderDateTime > now && reminderDateTime <= nextWeek && reminder.isActive;
      })
      .sort((a, b) => {
        // Handle both old time format and new DateTime format
        let dateA: Date, dateB: Date;
        if (a.reminderTime.includes('T')) {
          dateA = new Date(a.reminderTime);
        } else {
          dateA = new Date(`${a.reminderDate}T${a.reminderTime}`);
        }
        if (b.reminderTime.includes('T')) {
          dateB = new Date(b.reminderTime);
        } else {
          dateB = new Date(`${b.reminderDate}T${b.reminderTime}`);
        }
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  const getOverdueReminders = () => {
    const now = new Date();
    
    return reminders
      .filter(reminder => {
        // Handle both old time format and new DateTime format
        let reminderDateTime: Date;
        if (reminder.reminderTime.includes('T')) {
          // New DateTime format
          reminderDateTime = new Date(reminder.reminderTime);
        } else {
          // Old time format - combine with date
          reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
        }
        return reminderDateTime < now && reminder.isActive;
      })
      .sort((a, b) => {
        // Handle both old time format and new DateTime format
        let dateA: Date, dateB: Date;
        if (a.reminderTime.includes('T')) {
          dateA = new Date(a.reminderTime);
        } else {
          dateA = new Date(`${a.reminderDate}T${a.reminderTime}`);
        }
        if (b.reminderTime.includes('T')) {
          dateB = new Date(b.reminderTime);
        } else {
          dateB = new Date(`${b.reminderDate}T${b.reminderTime}`);
        }
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  const getTypeIcon = () => {
    return <Bell className="h-4 w-4" />;
  };

  const getTypeColor = () => {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reminders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 not-allowed">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recurring</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recurring}</p>
              </div>
              <Repeat className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Today</p>
                <p className="text-2xl font-bold text-orange-600">{stats.dueToday}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Reminders
            </CardTitle>
            <CardDescription>
              Reminders scheduled for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getUpcomingReminders().length > 0 ? (
              <div className="space-y-3">
                {getUpcomingReminders().map((reminder) => (
                  <div key={reminder.id} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon()}
                          <h4 className="font-medium text-sm">{reminder.title}</h4>
                          <Badge className={getTypeColor()}>
                            Reminder
                          </Badge>
                          {reminder.isRecurring && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Repeat className="h-3 w-3" />
                              {reminder.recurringPattern}
                            </Badge>
                          )}
                        </div>
                        {reminder.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {reminder.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(`${reminder.reminderDate}T${reminder.reminderTime}`).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No upcoming reminders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Overdue Reminders
            </CardTitle>
            <CardDescription>
              Reminders that have passed their due time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getOverdueReminders().length > 0 ? (
              <div className="space-y-3">
                {getOverdueReminders().map((reminder) => (
                  <div key={reminder.id} className="p-3 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon()}
                          <h4 className="font-medium text-sm text-red-800 dark:text-red-200">{reminder.title}</h4>
                          <Badge className={getTypeColor()}>
                            Reminder
                          </Badge>
                          {reminder.isRecurring && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Repeat className="h-3 w-3" />
                              {reminder.recurringPattern}
                            </Badge>
                          )}
                        </div>
                        {reminder.description && (
                          <p className="text-xs text-red-600 dark:text-red-300 mb-1">
                            {reminder.description}
                          </p>
                        )}
                        <p className="text-xs text-red-500">
                          Due: {new Date(`${reminder.reminderDate}T${reminder.reminderTime}`).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <p className="text-gray-500">No overdue reminders</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
