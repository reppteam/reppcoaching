import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, X } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onCreateNote: (noteData: NoteData) => Promise<void>;
  preselectedStudentId?: string;
}

interface NoteData {
  target: string;
  studentId: string;
  title: string;
  content: string;
  visibility: string;
}

export function CreateNoteModal({ 
  isOpen, 
  onClose, 
  students, 
  onCreateNote, 
  preselectedStudentId 
}: CreateNoteModalProps) {
  const [formData, setFormData] = useState<NoteData>({
    target: 'student',
    studentId: '',
    title: '',
    content: '',
    visibility: 'private'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Set preselected student when modal opens
  useEffect(() => {
    if (isOpen && preselectedStudentId) {
      setFormData(prev => ({
        ...prev,
        studentId: preselectedStudentId
      }));
    }
  }, [isOpen, preselectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onCreateNote(formData);
      // Reset form
      setFormData({
        target: 'student',
        studentId: '',
        title: '',
        content: '',
        visibility: 'private'
      });
      onClose();
    } catch (error) {
      setSubmitError('Failed to create note. Please try again.');
      console.error('Error creating note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NoteData, value: string) => {
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
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Create a Note</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Add notes about students or link to calls</CardDescription>
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target *</label>
              <select 
                value={formData.target}
                onChange={(e) => handleInputChange('target', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="student">Student</option>
                <option value="call">Linked to Call</option>
                <option value="general">General Note</option>
              </select>
            </div>

            {formData.target === 'student' && (
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
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter note title..." 
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Note Content *</label>
              <textarea 
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter your note content..." 
                rows={8}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibility *</label>
              <select 
                value={formData.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="public">Public (Visible to all coaches)</option>
                <option value="private">Private (Only you)</option>
              </select>
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
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                <FileText className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Note'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
