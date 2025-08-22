import React, { useState } from 'react';
import { eightbaseService } from '../services/8baseService';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar, Edit, Save, X } from 'lucide-react';

interface EditCoachingTermDialogProps {
  user: User;
  onUpdate: () => void;
}

export function EditCoachingTermDialog({ user, onUpdate }: EditCoachingTermDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(user.coaching_term_start || '');
  const [endDate, setEndDate] = useState(user.coaching_term_end || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!startDate || !endDate) {
      alert('Please enter both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await eightbaseService.updateCoachingTermDates(user.id, startDate, endDate);
      console.log('Updated user:', updatedUser);
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update coaching term dates:', error);
      alert('Failed to update coaching term dates');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStartDate(user.coaching_term_start || '');
    setEndDate(user.coaching_term_end || '');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-3 w-3 mr-1" />
          Edit Term
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Coaching Term - {user.firstName} {user.lastName}</DialogTitle>
          <DialogDescription>
            Update the coaching term start and end dates for this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-3 w-3 mr-1" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}