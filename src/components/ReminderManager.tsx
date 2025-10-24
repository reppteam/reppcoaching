import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { todoService } from '../services/todoService';
import { Reminder, CreateReminderInput, UpdateReminderInput } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Switch } from './ui/switch';
import { 
  Plus, 
  Clock, 
  Calendar,
  Bell,
  BellOff,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Repeat,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

interface ReminderManagerProps {
  className?: string;
}

export function ReminderManager({ className }: ReminderManagerProps) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    reminderDate: string;
    reminderTime: string;
    isActive: boolean;
  }>({
    title: '',
    description: '',
    reminderDate: '',
    reminderTime: '',
    isActive: true
  });
  
  // Role-based permissions
  const canCreateReminders = user?.role === 'user' || user?.role === 'coach' || user?.role === 'coach_manager' || user?.role === 'super_admin';
  const canEditReminders = user?.role === 'user' || user?.role === 'coach' || user?.role === 'coach_manager' || user?.role === 'super_admin';
  const canDeleteReminders = user?.role === 'user' || user?.role === 'coach' || user?.role === 'coach_manager' || user?.role === 'super_admin';
  
  // Form state
  const [formData, setFormData] = useState<CreateReminderInput>({
    title: '',
    description: '',
    reminderDate: '',
    reminderTime: '',
    isRecurring: false,
    recurringPattern: 'daily'
  });

  useEffect(() => {
    if (user?.id) {
      loadReminders();
    }
  }, [user?.id]);

  // Check for due reminders and show toast notifications
  useEffect(() => {
    if (reminders.length > 0) {
      const now = new Date();
      reminders.forEach(reminder => {
        if (reminder.isActive) {
          // Handle both old time format and new DateTime format
          let reminderDateTime: Date;
          if (reminder.reminderTime.includes('T')) {
            // New DateTime format
            reminderDateTime = new Date(reminder.reminderTime);
          } else {
            // Old time format - combine with date
            reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
          }
          
          // Check if reminder is due (within the last minute)
          const timeDiff = now.getTime() - reminderDateTime.getTime();
          if (timeDiff >= 0 && timeDiff <= 60000) { // Within the last minute
            toast.info('🔔 Reminder Due!', {
              description: `"${reminder.title}" is due now!`,
              duration: 10000,
              action: {
                label: 'View Reminders',
                onClick: () => {
                  // Scroll to reminders section or open reminders page
                  const remindersSection = document.querySelector('[data-reminders-section]');
                  if (remindersSection) {
                    remindersSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }
            });
          }
        }
      });
    }
  }, [reminders]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const userReminders = await todoService.getRemindersByUser(user!.id);
      setReminders(userReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast.error('Failed to load reminders', {
        description: 'Please refresh the page or try again later',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async () => {
    try {
      // Validate form data before submission
      if (!formData.title.trim()) {
        alert('Please enter a reminder title');
        return;
      }
      
      if (!formData.reminderDate) {
        alert('Please select a reminder date');
        return;
      }
      
      if (!formData.reminderTime) {
        alert('Please select a reminder time');
        return;
      }
      
      // Check if the reminder is in the future
      const reminderDateTime = new Date(`${formData.reminderDate}T${formData.reminderTime}`);
      const now = new Date();
      
      if (reminderDateTime <= now) {
        alert('Reminder date and time must be in the future');
        return;
      }
      
      await todoService.createReminder(formData, user!.id);
      setCreateModalOpen(false);
      resetForm();
      loadReminders();
      toast.success('Reminder created successfully!', {
        description: `"${formData.title}" has been scheduled for ${formData.reminderDate} at ${formData.reminderTime}`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder', {
        description: error instanceof Error ? error.message : 'Please check your input and try again',
        duration: 4000,
      });
    }
  };

  const handleUpdateReminder = async (id: string, updateData: UpdateReminderInput) => {
    try {
      console.log('Update data received:', updateData);
      
      // Convert the time back to UTC format if it's being updated
      let formattedUpdateData = { ...updateData };
      if (updateData.reminderTime && updateData.reminderDate) {
        // Combine date and time into proper DateTime format
        formattedUpdateData.reminderTime = `${updateData.reminderDate}T${updateData.reminderTime}:00Z`;
        console.log('Formatted reminderTime:', formattedUpdateData.reminderTime);
      }
      
      await todoService.updateReminder(id, formattedUpdateData);
      setEditModalOpen(false);
      setSelectedReminder(null);
      loadReminders();
      toast.success('Reminder updated successfully!', {
        description: `"${formattedUpdateData.title}" has been updated`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder', {
        description: error instanceof Error ? error.message : 'Please check your input and try again',
        duration: 4000,
      });
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await todoService.deleteReminder(id);
      loadReminders();
      toast.success('Reminder deleted successfully!', {
        description: 'The reminder has been removed from your list',
        duration: 4000,
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder', {
        description: 'Please try again or contact support if the issue persists',
        duration: 4000,
      });
    }
  };

  const toggleReminderActive = async (id: string, isActive: boolean) => {
    try {
      await todoService.updateReminder(id, { isActive });
      loadReminders();
      toast.success(`Reminder ${isActive ? 'activated' : 'deactivated'}!`, {
        description: isActive ? 'You will now receive notifications for this reminder' : 'You will no longer receive notifications for this reminder',
        duration: 4000,
      });
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast.error('Failed to update reminder', {
        description: 'Please try again or contact support if the issue persists',
        duration: 4000,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminderDate: '',
      reminderTime: '',
      isRecurring: false,
      recurringPattern: 'daily'
    });
  };

  const getTypeColor = () => {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
  };

  const getTypeIcon = () => {
    return <Bell className="h-4 w-4" />;
  };

  const isUpcoming = (reminder: Reminder) => {
    // Handle both old time format and new DateTime format
    let reminderDateTime: Date;
    if (reminder.reminderTime.includes('T')) {
      // New DateTime format
      reminderDateTime = new Date(reminder.reminderTime);
    } else {
      // Old time format - combine with date
      reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
    }
    const now = new Date();
    return reminderDateTime > now;
  };

  const isPast = (reminder: Reminder) => {
    // Handle both old time format and new DateTime format
    let reminderDateTime: Date;
    if (reminder.reminderTime.includes('T')) {
      // New DateTime format
      reminderDateTime = new Date(reminder.reminderTime);
    } else {
      // Old time format - combine with date
      reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
    }
    const now = new Date();
    return reminderDateTime < now;
  };

  const getUpcomingReminders = () => {
    return reminders
      .filter(reminder => reminder.isActive && isUpcoming(reminder))
      .sort((a, b) => {
        const dateA = new Date(`${a.reminderDate}T${a.reminderTime}`);
        const dateB = new Date(`${b.reminderDate}T${b.reminderTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const getPastReminders = () => {
    return reminders
      .filter(reminder => isPast(reminder))
      .sort((a, b) => {
        const dateA = new Date(`${a.reminderDate}T${a.reminderTime}`);
        const dateB = new Date(`${b.reminderDate}T${b.reminderTime}`);
        return dateB.getTime() - dateA.getTime();
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-reminders-section>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Reminders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set reminders for important tasks and deadlines
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toast.info('🔔 Test Reminder!', {
                description: 'This is a test reminder notification',
                duration: 5000,
                action: {
                  label: 'View Reminders',
                  onClick: () => {
                    const remindersSection = document.querySelector('[data-reminders-section]');
                    if (remindersSection) {
                      remindersSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }
              });
            }}
          >
            Test Notification
          </Button>
        </div>
        {canCreateReminders && (
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
              <DialogDescription>
                Set a reminder for an important task or event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter reminder title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reminderDate">Date</Label>
                  <Input
                    id="reminderDate"
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="reminderTime">Time</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                />
                <Label htmlFor="isRecurring">Recurring reminder</Label>
              </div>
              {formData.isRecurring && (
                <div>
                  <Label htmlFor="recurringPattern">Repeat Pattern</Label>
                  <Select value={formData.recurringPattern} onValueChange={(value) => setFormData({ ...formData, recurringPattern: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReminder} disabled={!formData.title.trim() || !formData.reminderDate || !formData.reminderTime}>
                  Create Reminder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Reminders ({getUpcomingReminders().length})
          </CardTitle>
          <CardDescription>
            Active reminders scheduled for the future
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getUpcomingReminders().length > 0 ? (
            <div className="space-y-4">
              {getUpcomingReminders().map((reminder) => (
                <div key={reminder.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon()}
                        <h3 className="font-semibold text-lg">{reminder.title}</h3>
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
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{reminder.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(reminder.reminderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{reminder.reminderTime.includes('T') ? 
                            new Date(reminder.reminderTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true, timeZone: 'UTC'}) : 
                            reminder.reminderTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleReminderActive(reminder.id, !reminder.isActive)}
                        className={reminder.isActive ? 'text-green-600' : 'text-gray-400'}
                      >
                        {reminder.isActive ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      </Button>
                      {canEditReminders && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Extract time portion from DateTime string for edit form
                            let timePortion = reminder.reminderTime;
                            if (reminder.reminderTime.includes('T')) {
                              // Extract time portion from DateTime string like "2025-10-24T16:23:00Z"
                              const timeMatch = reminder.reminderTime.match(/T(\d{2}:\d{2})/);
                              if (timeMatch) {
                                timePortion = timeMatch[1]; // Extract "16:23"
                              } else {
                                // Fallback to date conversion
                                timePortion = new Date(reminder.reminderTime).toTimeString().split(' ')[0].substring(0, 5);
                              }
                            }
                            
                            console.log('Original reminderTime:', reminder.reminderTime);
                            console.log('Extracted timePortion:', timePortion);
                            
                            setSelectedReminder(reminder);
                            setEditFormData({
                              title: reminder.title,
                              description: reminder.description || '',
                              reminderDate: reminder.reminderDate,
                              reminderTime: timePortion,
                              isActive: reminder.isActive
                            });
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteReminders && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{reminder.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReminder(reminder.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No upcoming reminders</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Reminders */}
      {getPastReminders().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Past Reminders ({getPastReminders().length})
            </CardTitle>
            <CardDescription>
              Completed or missed reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPastReminders().slice(0, 5).map((reminder) => (
                <div key={reminder.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon()}
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">{reminder.title}</h3>
                        <Badge className={getTypeColor()}>
                          Reminder
                        </Badge>
                      </div>
                      {reminder.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">{reminder.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(reminder.reminderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{reminder.reminderTime.includes('T') ? 
                            new Date(reminder.reminderTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true, timeZone: 'UTC'}) : 
                            reminder.reminderTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
            <DialogDescription>
              Update the reminder details
            </DialogDescription>
          </DialogHeader>
          {selectedReminder && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.reminderDate}
                    onChange={(e) => setEditFormData({ ...editFormData, reminderDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editFormData.reminderTime}
                    onChange={(e) => setEditFormData({ ...editFormData, reminderTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editFormData.isActive}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active reminder</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateReminder(selectedReminder.id, {
                  title: editFormData.title,
                  description: editFormData.description,
                  reminderDate: editFormData.reminderDate,
                  reminderTime: editFormData.reminderTime,
                  isActive: editFormData.isActive
                })}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
