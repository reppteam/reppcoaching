import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { eightbaseService } from '../services/8baseService';
import { CallLog } from '../types';
import { useQuery } from '@apollo/client';
import { GET_NOTES_BY_FILTER, GET_GOALS_BY_FILTER, GET_STUDENT_BY_ID, GET_CALL_LOGS_BY_FILTER } from '../graphql/operations';
import { Goal } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Edit, 
  Phone,
  FileText,
  Save,
  X,
  Sun,
  Moon,
  Calculator,
  ExternalLink
} from 'lucide-react';
import ProfitCalculator from './ProfitCalculator';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  business_name: string;
  location: string;
  target_market: string;
  strengths: string;
  challenges: string;
  goals: string;
  preferred_contact_method: string;
  availability: string;
  why?: string;
  notes: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  student?: {
    items: WeeklyReport[];
  };
}

interface WeeklyReport {
  id: string;
  revenue: number;
  net_profit: number;
  paid_shoots: number;
  free_shoots: number;
  new_clients: number;
  start_date: string;
  end_date: string;
  status: string;
  createdAt: string;
}


interface CoachStudentEditProfileProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
}

export function CoachStudentEditProfile({ studentId, isOpen, onClose, activeTab = 'profile' }: CoachStudentEditProfileProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [student, setStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);

  // Debug logging
  console.log('CoachStudentEditProfile - studentId:', studentId);
  console.log('CoachStudentEditProfile - isOpen:', isOpen);
  console.log('CoachStudentEditProfile - activeTab:', activeTab);

  // GraphQL query for notes
  const { data: notesData, loading: notesLoading, refetch: refetchNotes, error: notesError } = useQuery(GET_NOTES_BY_FILTER, {
    variables: {
      filter: {
        studentNote: {
          id: { equals: studentId }
        }
      }
    },
    skip: !studentId || !isOpen,
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('Notes query completed:', data);
    },
    onError: (error) => {
      console.error('Notes query error:', error);
    }
  });

  console.log('Notes query - skip:', !studentId || !isOpen);
  console.log('Notes query - loading:', notesLoading);
  console.log('Notes query - error:', notesError);
  console.log('Notes query - data:', notesData);

  // GraphQL query for student profile data
  const { data: studentData, loading: studentLoading, refetch: refetchStudent, error: studentError } = useQuery(GET_STUDENT_BY_ID, {
    variables: { id: studentId },
    skip: !studentId || !isOpen,
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('Student query completed:', data);
    },
    onError: (error) => {
      console.error('Student query error:', error);
    }
  });

  // GraphQL query for goals
  const { data: goalsData, loading: goalsLoading, refetch: refetchGoals, error: goalsError } = useQuery(GET_GOALS_BY_FILTER, {
    variables: {
      filter: {
        student: {
          email: {
            equals: studentData?.student?.email
          }
        }
      }
    },
    skip: !studentId || !isOpen || !studentData?.student?.email,
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('Goals query completed:', data);
    },
    onError: (error) => {
      console.error('Goals query error:', error);
    }
  });
  // GraphQL query for call logs
  const { data: callLogsData, loading: callLogsLoading, refetch: refetchCallLogs, error: callLogsError } = useQuery(GET_CALL_LOGS_BY_FILTER, {
    variables: {
      filter: {
        student: {
          id: { equals: studentId }
        }
      }
    },
    skip: !studentId || !isOpen,
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('Call logs query completed:', data);
    },
    onError: (error) => {
      console.error('Call logs query error:', error);
    }
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    business_name: '',
    location: '',
    target_market: '',
    strengths: '',
    challenges: '',
    goals: '',
    preferred_contact_method: '',
    availability: '',
    why: '',
    notes: ''
  });

  const [notes, setNotes] = useState<Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>>([]);

  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // All data is now loaded via GraphQL queries automatically
  // No need for manual loading functions

  // Process notes data from GraphQL query
  useEffect(() => {
    console.log('Processing notes data:', notesData);
    if (notesData?.notesList?.items) {
      console.log('Notes items from API:', notesData.notesList.items);
      const transformedNotes = notesData.notesList.items.map((note: any) => ({
        id: note.id,
        title: note.title || note.content?.split('\n')[0] || 'Untitled Note',
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }));
      console.log('Transformed notes:', transformedNotes);
      setNotes(transformedNotes);
    } else {
      console.log('No notes data found in response:', notesData);
    }
  }, [notesData]);

  // Process student data from GraphQL query
  useEffect(() => {
    console.log('Processing student data:', studentData);
    if (studentData?.student) {
      const student = studentData.student;
      console.log('Student object from API:', student);
      
      const processedStudent = {
        id: student.id,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        business_name: student.business_name || '',
        location: student.location || '',
        target_market: student.target_market || '',
        strengths: student.strengths || '',
        challenges: student.challenges || '',
        goals: student.goals || '',
        preferred_contact_method: student.preferred_contact_method || '',
        availability: student.availability || '',
        why: student.why || '',
        notes: student.notes || '',
        user: student.user,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        student: student.student
      };
      
      console.log('Processed student:', processedStudent);
      setStudent(processedStudent);
      
      const processedFormData = {
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        business_name: student.business_name || '',
        location: student.location || '',
        target_market: student.target_market || '',
        strengths: student.strengths || '',
        challenges: student.challenges || '',
        goals: student.goals || '',
        preferred_contact_method: student.preferred_contact_method || '',
        availability: student.availability || '',
        why: student.why || '',
        notes: student.notes || ''
      };
      
      console.log('Processed form data:', processedFormData);
      setFormData(processedFormData);
      } else {
      console.log('No student data found in response:', studentData);
    }
  }, [studentData]);

  // Process goals data from GraphQL query
  useEffect(() => {
    console.log('Processing goals data:', goalsData);
    if (goalsData?.goalsList?.items) {
      console.log('Goals items from API:', goalsData.goalsList.items);
      const transformedGoals = goalsData.goalsList.items.map((goal: any) => ({
        id: goal.id,
        user_id: goal.student?.id || '',
        title: goal.title || 'Untitled Goal',
        description: goal.description || '',
        target_value: goal.target_value || 0,
        current_value: goal.current_value || 0,
        goal_type: goal.goal_type || 'revenue',
        deadline: goal.deadline || goal.month_start || new Date().toISOString(),
        priority: goal.priority || 'medium',
        status: goal.status || 'active',
        progress_percentage: goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0,
        created_at: goal.createdAt,
        updated_at: goal.updatedAt
      }));
      console.log('Transformed goals:', transformedGoals);
      setGoals(transformedGoals);
    } else {
      console.log('No goals data found in response:', goalsData);
    }
  }, [goalsData]);

  // Process call logs data from GraphQL query
  useEffect(() => {
    console.log('Processing call logs data:', callLogsData);
    if (callLogsData?.callLogsList?.items) {
      console.log('Call logs items from API:', callLogsData.callLogsList.items);
      const transformedCallLogs = callLogsData.callLogsList.items.map((callLog: any) => ({
        id: callLog.id,
        student_id: callLog.student?.id || '',
        coach_id: callLog.coach?.id || '',
        call_date: callLog.call_date,
        call_duration: callLog.call_duration,
        call_type: callLog.call_type,
        topics_discussed: callLog.topics_discussed || [],
        outcome: callLog.outcome || '',
        next_steps: callLog.next_steps || '',
        student_mood: callLog.student_mood || 'neutral',
        created_at: callLog.createdAt,
        updated_at: callLog.updatedAt
      }));
      console.log('Transformed call logs:', transformedCallLogs);
      setCallLogs(transformedCallLogs);
    } else {
      console.log('No call logs data found in response:', callLogsData);
    }
  }, [callLogsData]);

  // Don't render anything if modal is not open or no student ID
  if (!isOpen || !studentId) {
    return null;
  }

  // All data loading is now handled by GraphQL queries
  // No need for separate loading functions


  const handleSave = async () => {
    if (!student) return;

    try {
      setSaving(true);
      
      // Convert notes to JSON string
      const notesJson = JSON.stringify(notes);
      
      // Update student data using 8base service
      await eightbaseService.updateStudentDirect(student.id, {
        ...formData,
        notes: notesJson
      });
      
      // Refetch student data to get updated information
      await refetchStudent();
      
      // Show success message or handle success
      console.log('Student profile updated successfully');
      
    } catch (error) {
      console.error('Error updating student:', error);
      // Handle error - show error message to user
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (student) {
      // Reset form data to original values
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        business_name: student.business_name || '',
        location: student.location || '',
        target_market: student.target_market || '',
        strengths: student.strengths || '',
        challenges: student.challenges || '',
        goals: student.goals || '',
        preferred_contact_method: student.preferred_contact_method || '',
        availability: student.availability || '',
        why: student.why || '',
        notes: student.notes || ''
      });
    }
    onClose();
  };


  const handleDeleteNote = async (noteId: string) => {
    try {
      // Delete note from database
      await eightbaseService.deleteNote(noteId);
      
      // Refetch notes from GraphQL query
      await refetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      // You could add a toast notification here
    }
  };

  const handleEditNote = (noteId: string, updatedNote: { title: string; content: string }) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const handleCreateGoal = async () => {
    const title = prompt('Enter goal title:');
    if (!title) return;

    const description = prompt('Enter goal description (optional):') || '';
    const targetValue = prompt('Enter target value (number):');
    if (!targetValue || isNaN(Number(targetValue))) {
      alert('Please enter a valid number for target value');
      return;
    }

    const goalType = prompt('Enter goal type (revenue, clients, shoots, text, other):') || 'revenue';
    const priority = prompt('Enter priority (low, medium, high):') || 'medium';

    try {
      await eightbaseService.createGoal({
        title,
        description,
        target_value: Number(targetValue),
        current_value: 0,
        goal_type: goalType as any,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        priority: priority as any,
        status: 'active',
        user_id: student?.user?.id || studentId
      });

      // Refetch goals to get updated data
      await refetchGoals();
      console.log('Goal created successfully');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  if (studentLoading && !student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose} className="w-full">
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading student profile...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose} className="w-full">
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Student Not Found</h3>
            <p className="text-muted-foreground">Unable to load student information.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="w-full">
      <DialogContent className="sm:w-[80vw] sm:max-w-[80vw] max-h-[90vh] overflow-y-auto p-0 bg-background text-foreground">
        <div className="p-6">
          {/* Profile Header - Exact match to image */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
              </div>
              <Badge className="bg-blue-600">Paid Student</Badge>
            </div>
            <div className="flex items-center gap-2 text-black dark:text-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={saving} className="!text-var-white">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2 !text-white" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs - Exact match to image */}
            <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                Profile
              </TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                Goals
              </TabsTrigger>
              <TabsTrigger value="profit" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                Profit Calculator
              </TabsTrigger>
              <TabsTrigger value="calls" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                Call History
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              {/* Student Profile Card - Exact match to image */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Student Profile</CardTitle>
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Exact match to image */}
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</Label>
                        <Input
                          value={formData.business_name}
                          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Market</Label>
                        <Textarea
                          value={formData.target_market}
                          onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
                          rows={3}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Strengths</Label>
                        <Textarea
                          value={formData.strengths}
                          onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                          rows={3}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Goals</Label>
                        <Textarea
                          value={formData.goals}
                          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                          rows={3}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Contact Method</Label>
                        <Input
                          value={formData.preferred_contact_method}
                          onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          placeholder="e.g., Email, Phone, Text"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</Label>
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          placeholder="student@example.com"
                        />
                      </div>
                      
                    </div>

                    {/* Right Column - Exact match to image */}
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</Label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Challenges</Label>
                        <Textarea
                          value={formData.challenges}
                          onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                          rows={3}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</Label>
                        <Input
                          value={formData.availability}
                          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Why (Motivation)</Label>
                        <Textarea
                          value={formData.why || ''}
                          onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                          rows={4}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          placeholder="What motivates this student? Why are they pursuing real estate photography?"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calls" className="mt-6">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Call History</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Communication history with this student</CardDescription>
                </CardHeader>
                <CardContent>
                  {callLogsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading call history...</p>
                    </div>
                  ) : callLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No Call History</h3>
                      <p className="text-muted-foreground">No calls have been recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {callLogs.map((callLog) => (
                        <div key={callLog.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {callLog.call_type.charAt(0).toUpperCase() + callLog.call_type.slice(1)} Call
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(callLog.call_date).toLocaleDateString()} • {callLog.call_duration} minutes
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${
                                callLog.student_mood === 'positive' ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-900/20' :
                                callLog.student_mood === 'motivated' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-900/20' :
                                callLog.student_mood === 'neutral' ? 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-900/20' :
                                'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:bg-orange-900/20'
                              }`}
                            >
                              {callLog.student_mood.charAt(0).toUpperCase() + callLog.student_mood.slice(1)}
                            </Badge>
                          </div>
                          
                          {callLog.topics_discussed && callLog.topics_discussed.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics Discussed:</h5>
                              <div className="flex flex-wrap gap-2">
                                {callLog.topics_discussed.map((topic, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {callLog.outcome && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outcome:</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{callLog.outcome}</p>
                            </div>
                          )}
                          
                          {callLog.next_steps && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Steps:</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{callLog.next_steps}</p>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                            <div className="flex justify-between">
                              <span>Coach ID: {callLog.coach_id}</span>
                              <span>Recorded: {new Date(callLog.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="mt-6">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Student Goals</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">View and track student goals and progress</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCreateGoal}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {goalsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading goals...</p>
                    </div>
                  ) : goals.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No Goals Set</h3>
                      <p className="text-muted-foreground mb-4">This student hasn't created any goals yet.</p>
                      <Button onClick={handleCreateGoal} variant="outline">
                        <User className="h-4 w-4 mr-2" />
                        Create First Goal
                      </Button>
                  </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Current Goals from Profile */}
                      {formData.goals && formData.goals.trim() && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Profile Goals</span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{formData.goals}</p>
                        </div>
                      )}

                      {/* Real Goals from Database */}
                      <div className="space-y-4">
                        {goals.map((goal) => (
                          <div key={goal.id} className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{goal.title}</h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`${
                                      goal.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-900/20' :
                                      goal.priority === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-900/20' :
                                      'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-900/20'
                                    }`}
                                  >
                                    {goal.priority}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`${
                                      goal.status === 'completed' ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-900/20' :
                                      'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-900/20'
                                    }`}
                                  >
                                    {goal.status}
                                  </Badge>
                                </div>
                                {goal.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{goal.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <span>Type: <span className="font-medium text-gray-900 dark:text-gray-100">{goal.goal_type}</span></span>
                                  <span>Deadline: <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(goal.deadline).toLocaleDateString()}</span></span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {goal.current_value} / {goal.target_value} ({goal.progress_percentage || 0}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    (goal.progress_percentage || 0) >= 100 ? 'bg-green-500' :
                                    (goal.progress_percentage || 0) >= 75 ? 'bg-blue-500' :
                                    (goal.progress_percentage || 0) >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(goal.progress_percentage || 0, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Goal Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Target Value:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                  {goal.goal_type === 'revenue' ? `$${goal.target_value.toLocaleString()}` : goal.target_value}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Current Value:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                  {goal.goal_type === 'revenue' ? `$${goal.current_value.toLocaleString()}` : goal.current_value}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profit" className="mt-6 overflow-y-auto">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-black dark:text-white">
                        <Calculator className="h-5 w-5" />
                        Profit Calculator
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        View {student?.firstName} {student?.lastName}'s profit calculator and financial data
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                        <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Student's Profit Calculator</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        This shows the profit calculator data for {student?.firstName} {student?.lastName}. 
                        You can view their pricing, costs, and profit margins.
                      </p>
                    </div>
                    
                    {/* Profit Calculator Component */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-y-auto">
                      {student?.user?.id ? (
                        <ProfitCalculator studentId={student.user.id} />
                      ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                          <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                          <p>Unable to load profit calculator</p>
                          <p className="text-sm mt-2">Student user information not available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notes</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Additional notes and observations about this student</CardDescription>
                </CardHeader>
                <CardContent>
                  {notesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading notes...</p>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No notes available for this student.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 text-black dark:text-white">
                              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{note.title}</h4>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3">{note.content}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {new Date(note.createdAt).toLocaleDateString()}
                            {note.updatedAt !== note.createdAt && (
                              <span> • Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}