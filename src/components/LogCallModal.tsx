import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Phone, X } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onLogCall: (callData: CallData) => Promise<void>;
}

interface CallData {
  studentId: string;
  date: string;
  duration: number;
  callType: string;
  studentMood: string;
  topics: string;
  outcome: string;
  nextSteps: string;
}

export function LogCallModal({ isOpen, onClose, students, onLogCall }: LogCallModalProps) {
  const [formData, setFormData] = useState<CallData>({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    duration: 30,
    callType: 'scheduled',
    studentMood: 'positive',
    topics: '',
    outcome: '',
    nextSteps: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onLogCall(formData);
      // Reset form
      setFormData({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        duration: 30,
        callType: 'scheduled',
        studentMood: 'positive',
        topics: '',
        outcome: '',
        nextSteps: ''
      });
      onClose();
    } catch (error) {
      setSubmitError('Failed to log call. Please try again.');
      console.error('Error logging call:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CallData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Log a Call</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Capture call details and outcomes</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student *</label>
              <select 
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a student...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date *</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration (minutes) *</label>
                <input 
                  type="number" 
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  placeholder="30" 
                  className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Call Type *</label>
              <select 
                value={formData.callType}
                onChange={(e) => handleInputChange('callType', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="follow_up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="check_in">Check-in</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student Mood *</label>
              <select 
                value={formData.studentMood}
                onChange={(e) => handleInputChange('studentMood', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="frustrated">Frustrated</option>
                <option value="motivated">Motivated</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Topics Discussed</label>
              <input 
                type="text" 
                value={formData.topics}
                onChange={(e) => handleInputChange('topics', e.target.value)}
                placeholder="Enter topics separated by commas..." 
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Outcome *</label>
              <textarea 
                value={formData.outcome}
                onChange={(e) => handleInputChange('outcome', e.target.value)}
                placeholder="What was accomplished in this call?" 
                rows={3}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Steps</label>
              <textarea 
                value={formData.nextSteps}
                onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                placeholder="What are the next steps?" 
                rows={3}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {submitError && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                <Phone className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Logging...' : 'Log Call'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
