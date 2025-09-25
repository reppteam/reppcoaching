import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, WeeklyReport, Goal, Lead, Note, Product, Subitem, CallLog, MessageTemplate } from '../types';
import { eightbaseService } from '../services/8baseService';
import { X, Plus, Loader2 } from 'lucide-react';

interface DataEditFormProps {
  type: string;
  data?: any;
  mode: 'create' | 'edit';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function DataEditForm({ type, data, mode, onSubmit, onCancel }: DataEditFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    if (data && mode === 'edit') {
      setFormData(data);
    } else {
      setFormData(getDefaultFormData(type));
    }
  }, [type, data, mode]);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await eightbaseService.getAllUsersWithDetails();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const getDefaultFormData = (type: string) => {
    switch (type) {
      case 'user':
        return {
          name: '',
          email: '',
          role: 'user',
          has_paid: false,
          access_start: new Date().toISOString().split('T')[0],
          access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        };
      case 'weeklyReport':
        return {
          user_id: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          new_clients: 0,
          paid_shoots: 0,
          free_shoots: 0,
          unique_clients: 0,
          aov: 0,
          revenue: 0,
          expenses: 0,
          editing_cost: 0,
          net_profit: 0,
          status: 'active'
        };
      case 'goal':
        return {
          user_id: '',
          title: '',
          description: '',
          target_value: 0,
          current_value: 0,
          goal_type: 'revenue',
          deadline: new Date().toISOString().split('T')[0],
          priority: 'medium',
          status: 'active'
        };
      case 'lead':
        return {
          user_id: '',
          lead_name: '',
          email: '',
          phone: '',
          instagram_handle: '',
          lead_source: '',
          status: 'new'
        };
      case 'note':
        return {
          content: '',
          targetType: '',
          targetId: '',
          visibility: 'public'
        };
      case 'product':
        return {
          user_id: '',
          name: '',
          description: '',
          status: 'active'
        };
      case 'subitem':
        return {
          product_id: '',
          name: '',
          description: ''
        };
      case 'callLog':
        return {
          student_id: '',
          coach_id: '',
          call_date: new Date().toISOString().split('T')[0],
          duration: 0,
          outcome: '',
          notes: ''
        };
      case 'messageTemplate':
        return {
          name: '',
          type: '',
          content: '',
          is_active: true
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'create') {
        await onSubmit(formData);
      } else {
        await onSubmit({ id: data.id, ...formData });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role || 'user'} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Student</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="coach_manager">Coach Manager</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="assigned_admin_id">Assigned Coach</Label>
          <Select value={formData.assigned_admin_id || ''} onValueChange={(value) => setFormData({ ...formData, assigned_admin_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select coach" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No coach assigned</SelectItem>
              {users.filter(u => u.role === 'coach').map(coach => (
                <SelectItem key={coach.id} value={coach.id}>{coach.firstName} {coach.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="access_start">Access Start Date</Label>
          <Input
            id="access_start"
            type="date"
            value={formData.access_start || ''}
            onChange={(e) => setFormData({ ...formData, access_start: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="access_end">Access End Date</Label>
          <Input
            id="access_end"
            type="date"
            value={formData.access_end || ''}
            onChange={(e) => setFormData({ ...formData, access_end: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="has_paid"
          checked={formData.has_paid || false}
          onCheckedChange={(checked) => setFormData({ ...formData, has_paid: checked })}
        />
        <Label htmlFor="has_paid">Paid User</Label>
      </div>
    </div>
  );

  const renderWeeklyReportForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="user_id">User *</Label>
        <Select value={formData.user_id || ''} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="new_clients">New Clients</Label>
          <Input
            id="new_clients"
            type="number"
            value={formData.new_clients || 0}
            onChange={(e) => setFormData({ ...formData, new_clients: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="paid_shoots">Paid Shoots</Label>
          <Input
            id="paid_shoots"
            type="number"
            value={formData.paid_shoots || 0}
            onChange={(e) => setFormData({ ...formData, paid_shoots: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="revenue">Revenue</Label>
          <Input
            id="revenue"
            type="number"
            value={formData.revenue || 0}
            onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status || 'active'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderGoalForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="user_id">User *</Label>
        <Select value={formData.user_id || ''} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="title">Goal Title *</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="goal_type">Goal Type</Label>
          <Select value={formData.goal_type || 'revenue'} onValueChange={(value) => setFormData({ ...formData, goal_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="shoots">Shoots</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="target_value">Target Value</Label>
          <Input
            id="target_value"
            type="number"
            value={formData.target_value || 0}
            onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="current_value">Current Value</Label>
          <Input
            id="current_value"
            type="number"
            value={formData.current_value || 0}
            onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline || ''}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority || 'medium'} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderLeadForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="user_id">User *</Label>
        <Select value={formData.user_id || ''} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead_name">Lead Name *</Label>
          <Input
            id="lead_name"
            value={formData.lead_name || ''}
            onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="instagram_handle">Instagram Handle</Label>
          <Input
            id="instagram_handle"
            value={formData.instagram_handle || ''}
            onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead_source">Lead Source</Label>
          <Select value={formData.lead_source || ''} onValueChange={(value) => setFormData({ ...formData, lead_source: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status || 'new'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderNoteForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="content">Note Content *</Label>
        <Textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="targetType">Target Type</Label>
          <Select value={formData.targetType || ''} onValueChange={(value) => setFormData({ ...formData, targetType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="goal">Goal</SelectItem>
              <SelectItem value="weeklyReport">Weekly Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="visibility">Visibility</Label>
          <Select value={formData.visibility || 'public'} onValueChange={(value) => setFormData({ ...formData, visibility: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderProductForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="user_id">User *</Label>
        <Select value={formData.user_id || ''} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status || 'active'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSubitemForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="product_id">Product *</Label>
        <Select value={formData.product_id || ''} onValueChange={(value) => setFormData({ ...formData, product_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="name">Subitem Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  const renderCallLogForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="student_id">Student *</Label>
          <Select value={formData.student_id || ''} onValueChange={(value) => setFormData({ ...formData, student_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {users.filter(u => u.role === 'user').map(student => (
                <SelectItem key={student.id} value={student.id}>{student.firstName} {student.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="coach_id">Coach *</Label>
          <Select value={formData.coach_id || ''} onValueChange={(value) => setFormData({ ...formData, coach_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select coach" />
            </SelectTrigger>
            <SelectContent>
              {users.filter(u => u.role === 'coach').map(coach => (
                <SelectItem key={coach.id} value={coach.id}>{coach.firstName} {coach.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="call_date">Call Date</Label>
          <Input
            id="call_date"
            type="date"
            value={formData.call_date || ''}
            onChange={(e) => setFormData({ ...formData, call_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration || 0}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="outcome">Outcome</Label>
        <Select value={formData.outcome || ''} onValueChange={(value) => setFormData({ ...formData, outcome: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="no_answer">No Answer</SelectItem>
            <SelectItem value="voicemail">Voicemail</SelectItem>
            <SelectItem value="not_interested">Not Interested</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  const renderMessageTemplateForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Template Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="type">Template Type</Label>
        <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="intro">Introduction</SelectItem>
            <SelectItem value="hook">Hook</SelectItem>
            <SelectItem value="body1">Body 1</SelectItem>
            <SelectItem value="body2">Body 2</SelectItem>
            <SelectItem value="ending">Ending</SelectItem>
            <SelectItem value="followup">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="content">Template Content *</Label>
        <Textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active || false}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active Template</Label>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (type) {
      case 'user':
        return renderUserForm();
      case 'weeklyReport':
        return renderWeeklyReportForm();
      case 'goal':
        return renderGoalForm();
      case 'lead':
        return renderLeadForm();
      case 'note':
        return renderNoteForm();
      case 'product':
        return renderProductForm();
      case 'subitem':
        return renderSubitemForm();
      case 'callLog':
        return renderCallLogForm();
      case 'messageTemplate':
        return renderMessageTemplateForm();
      default:
        return <div>Unknown form type: {type}</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            {mode === 'create' ? <Plus className="h-5 w-5" /> : <X className="h-5 w-5" />}
            {mode === 'create' ? 'Create New' : 'Edit'} {type}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderForm()}
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            mode === 'create' ? 'Create' : 'Update'
          )}
        </Button>
      </div>
    </form>
  );
} 