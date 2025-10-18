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
  
  // Form state
  const [formData, setFormData] = useState<CreateReminderInput>({
    title: '',
    description: '',
    reminderDate: '',
    reminderTime: '',
    type: 'custom',
    isRecurring: false,
    recurringPattern: 'daily'
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
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async () => {
    try {
      await todoService.createReminder(formData, user!.id);
      setCreateModalOpen(false);
      resetForm();
      loadReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleUpdateReminder = async (id: string, updateData: UpdateReminderInput) => {
    try {
      await todoService.updateReminder(id, updateData);
      setEditModalOpen(false);
      setSelectedReminder(null);
      loadReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await todoService.deleteReminder(id);
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const toggleReminderActive = async (id: string, isActive: boolean) => {
    try {
      await todoService.updateReminder(id, { isActive });
      loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminderDate: '',
      reminderTime: '',
      type: 'custom',
      isRecurring: false,
      recurringPattern: 'daily'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task_reminder': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'appointment_reminder': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'deadline': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'follow_up': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_reminder': return <Timer className="h-4 w-4" />;
      case 'appointment_reminder': return <Calendar className="h-4 w-4" />;
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      case 'follow_up': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const isUpcoming = (reminder: Reminder) => {
    const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
    const now = new Date();
    return reminderDateTime > now;
  };

  const isPast = (reminder: Reminder) => {
    const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
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
    <div className={`space-y-6 ${className}`}>
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
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="task_reminder">Task Reminder</SelectItem>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                  </SelectContent>
                </Select>
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
                        {getTypeIcon(reminder.type)}
                        <h3 className="font-semibold text-lg">{reminder.title}</h3>
                        <Badge className={getTypeColor(reminder.type)}>
                          {reminder.type.replace('_', ' ')}
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
                          <span>{reminder.reminderTime}</span>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReminder(reminder);
                          setEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
                        {getTypeIcon(reminder.type)}
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">{reminder.title}</h3>
                        <Badge className={getTypeColor(reminder.type)}>
                          {reminder.type.replace('_', ' ')}
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
                          <span>{reminder.reminderTime}</span>
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
                  value={selectedReminder.title}
                  onChange={(e) => setSelectedReminder({ ...selectedReminder, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedReminder.description || ''}
                  onChange={(e) => setSelectedReminder({ ...selectedReminder, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={selectedReminder.reminderDate}
                    onChange={(e) => setSelectedReminder({ ...selectedReminder, reminderDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={selectedReminder.reminderTime}
                    onChange={(e) => setSelectedReminder({ ...selectedReminder, reminderTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={selectedReminder.isActive}
                  onCheckedChange={(checked) => setSelectedReminder({ ...selectedReminder, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active reminder</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateReminder(selectedReminder.id, {
                  title: selectedReminder.title,
                  description: selectedReminder.description,
                  reminderDate: selectedReminder.reminderDate,
                  reminderTime: selectedReminder.reminderTime,
                  isActive: selectedReminder.isActive
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
