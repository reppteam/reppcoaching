import React, { useState, useEffect } from 'react';
import { eightbaseService } from '../services/8baseService';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Phone, 
  MapPin, 
  Target, 
  Award, 
  AlertTriangle, 
  Target as TargetIcon,
  MessageSquare, 
  Clock, 
  FileText,
  Edit,
  Plus,
  Calendar,
  PhoneCall,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { StudentProfile as StudentProfileType, CallLog, Note } from '../types';

interface StudentProfileProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [addingCall, setAddingCall] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    business_name: '',
    location: '',
    target_market: '',
    strengths: '',
    challenges: '',
    goals: '',
    preferred_contact_method: '',
    availability: '',
    notes: ''
  });

  const [callForm, setCallForm] = useState({
    call_date: '',
    call_duration: 30,
    call_type: 'scheduled' as 'scheduled' | 'follow_up' | 'emergency',
    topics_discussed: [''],
    outcome: '',
    next_steps: '',
    student_mood: 'positive' as 'positive' | 'neutral' | 'frustrated' | 'motivated'
  });

  const [noteForm, setNoteForm] = useState({
    content: '',
    visibility: 'public' as 'public' | 'private'
  });

  useEffect(() => {
    loadStudentData();
  }, [student.id]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [profileData, callLogsData, notesData] = await Promise.all([
        eightbaseService.getStudentProfile(student.id),
        eightbaseService.getCallLogs(student.id),
        eightbaseService.getNotes('student', student.id, currentUser?.role)
      ]);

      setProfile(profileData);
      setCallLogs(callLogsData);
      setNotes(notesData);
      
      if (profileData) {
        setProfileForm({
          business_name: profileData.business_name || '',
          location: profileData.location || '',
          target_market: profileData.target_market || '',
          strengths: profileData.strengths || '',
          challenges: profileData.challenges || '',
          goals: profileData.goals || '',
          preferred_contact_method: profileData.preferred_contact_method || '',
          availability: profileData.availability || '',
          notes: profileData.notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const updatedProfile = await eightbaseService.updateStudentProfile(student.id, profileForm);
      setProfile(updatedProfile);
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddCall = async () => {
    try {
      const newCall = await eightbaseService.createCallLog({
        student_id: student.id,
        coach_id: currentUser?.id || '',
        call_date: callForm.call_date,
        call_duration: callForm.call_duration,
        call_type: callForm.call_type,
        topics_discussed: callForm.topics_discussed.filter(topic => topic.trim() !== ''),
        outcome: callForm.outcome,
        next_steps: callForm.next_steps,
        student_mood: callForm.student_mood
      });

      setCallLogs([newCall, ...callLogs]);
      setAddingCall(false);
      setCallForm({
        call_date: '',
        call_duration: 30,
        call_type: 'scheduled',
        topics_discussed: [''],
        outcome: '',
        next_steps: '',
        student_mood: 'positive'
      });
    } catch (error) {
      console.error('Error adding call log:', error);
    }
  };

  const handleAddNote = async () => {
    try {
      const newNote = await eightbaseService.createNote({
        target_type: 'student',
        target_id: student.id,
        user_id: currentUser?.id || '',
        content: noteForm.content,
        visibility: noteForm.visibility,
        created_by: currentUser?.id || '',
        created_by_name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ''
      });

      setNotes([newNote, ...notes]);
      setAddingNote(false);
      setNoteForm({ content: '', visibility: 'public' });
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading student profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
      <div className="flex items-center justify-between">
          <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {student.firstName} {student.lastName}
              </CardTitle>
              <CardDescription>{student.email}</CardDescription>
            </div>
            <Button onClick={() => setEditingProfile(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{profile?.location || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Target Market:</span>
                <span>{profile?.target_market || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Preferred Contact:</span>
                <span>{profile?.preferred_contact_method || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Availability:</span>
                <span>{profile?.availability || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Business:</span>
                <span>{profile?.business_name || 'Not specified'}</span>
        </div>
        </div>
      </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calls">Call Logs</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          {currentUser?.role === 'coach' && (
            <>
              <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
              <TabsTrigger value="leads">Lead Insights</TabsTrigger>
              <TabsTrigger value="profit">Profit Calculator</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {profile?.strengths || 'No strengths recorded yet.'}
                </p>
              </CardContent>
            </Card>

            {/* Challenges */}
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {profile?.challenges || 'No challenges recorded yet.'}
                </p>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TargetIcon className="h-5 w-5 text-blue-600" />
                  Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {profile?.goals || 'No goals recorded yet.'}
                </p>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  General Notes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                  {profile?.notes || 'No notes recorded yet.'}
                </p>
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Call Logs</h3>
                <Button onClick={() => setAddingCall(true)}>
                  <Plus className="h-4 w-4 mr-2" />
              Add Call
                </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Mood</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callLogs.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>{new Date(call.call_date).toLocaleDateString()}</TableCell>
                      <TableCell>{call.call_duration} min</TableCell>
                      <TableCell>
                        <Badge variant={call.call_type === 'scheduled' ? 'default' : 'secondary'}>
                          {call.call_type}
                          </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {call.topics_discussed.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {call.outcome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            call.student_mood === 'positive' ? 'default' :
                            call.student_mood === 'motivated' ? 'default' :
                            call.student_mood === 'neutral' ? 'secondary' : 'destructive'
                          }
                        >
                          {call.student_mood}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notes</h3>
                <Button onClick={() => setAddingNote(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
          </div>

                <div className="space-y-4">
                  {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                          <Badge variant={note.visibility === 'public' ? 'default' : 'secondary'}>
                            {note.visibility}
                          </Badge>
                        <span className="text-sm text-muted-foreground">
                        by {note.created_by_name}
                        </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{note.content}</p>
            </CardContent>
          </Card>
            ))}
          </div>
        </TabsContent>

        {/* Coach-specific tabs */}
        {currentUser?.role === 'coach' && (
          <>
            {/* Goals & Progress Tab */}
            <TabsContent value="goals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Goals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Current Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Primary Goal</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {profile?.goals || 'No primary goal set'}
                        </p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400">
                            <span>Progress</span>
                            <span>75%</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-1">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-semibold text-green-900 dark:text-green-100">Secondary Goal</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Increase client base by 20%
                        </p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                            <span>Progress</span>
                            <span>45%</span>
                          </div>
                          <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mt-1">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Goal History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Goal History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium text-sm">Complete 10 shoots</p>
                          <p className="text-xs text-muted-foreground">Completed 2 weeks ago</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium text-sm">Increase revenue by 30%</p>
                          <p className="text-xs text-muted-foreground">Completed 1 month ago</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium text-sm">Build portfolio website</p>
                          <p className="text-xs text-muted-foreground">In progress</p>
                        </div>
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Lead Insights Tab */}
            <TabsContent value="leads" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Lead Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Lead Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Leads:</span>
                        <span className="font-semibold">24</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Converted:</span>
                        <span className="font-semibold text-green-600">18</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Conversion Rate:</span>
                        <span className="font-semibold text-blue-600">75%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pipeline Value:</span>
                        <span className="font-semibold text-green-600">$12,500</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Top Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Referrals</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '40%'}}></div>
                          </div>
                          <span className="text-xs font-medium">40%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Social Media</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                          </div>
                          <span className="text-xs font-medium">30%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Website</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{width: '20%'}}></div>
                          </div>
                          <span className="text-xs font-medium">20%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Other</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-gray-600 h-2 rounded-full" style={{width: '10%'}}></div>
                          </div>
                          <span className="text-xs font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">New lead from referral</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Lead converted to client</p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Follow-up scheduled</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profit Calculator Tab */}
            <TabsContent value="profit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Student's Profit Calculator
                  </CardTitle>
                  <CardDescription>
                    View the student's profit calculations and financial insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quick Financial Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">Total Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mt-1">$15,420</p>
                        <p className="text-xs text-green-700 dark:text-green-300">This month</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Net Profit</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mt-1">$8,750</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">After expenses</p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Profit Margin</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600 mt-1">56.7%</p>
                        <p className="text-xs text-orange-700 dark:text-orange-300">Industry avg: 45%</p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Avg. Order Value</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 mt-1">$1,285</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Per shoot</p>
                      </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Equipment & Supplies</span>
                              <span className="font-medium">$2,100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Marketing & Advertising</span>
                              <span className="font-medium">$1,850</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Transportation</span>
                              <span className="font-medium">$1,200</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Software & Tools</span>
                              <span className="font-medium">$520</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-medium">Total Expenses</span>
                              <span className="font-bold">$5,670</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Revenue by Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Real Estate Photography</span>
                              <span className="font-medium">$12,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Virtual Tours</span>
                              <span className="font-medium">$1,920</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Drone Services</span>
                              <span className="font-medium">$1,000</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-medium">Total Revenue</span>
                              <span className="font-bold">$15,420</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => window.open('/dashboard?view=profit-calculator', '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Calculator
                      </Button>
                      <Button variant="outline" onClick={() => window.open('/dashboard?view=profit-calculator&edit=true', '_blank')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Settings
                      </Button>
                      <Button variant="outline" onClick={() => window.open('/dashboard?view=reports', '_blank')}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Reports
                      </Button>
                      {currentUser?.role === 'coach' && (
                        <Button variant="outline" onClick={() => {
                          // For coaches, provide option to log in as student
                          const confirmLogin = window.confirm(
                            `This will open the student's dashboard in a new tab. Do you want to continue?`
                          );
                          if (confirmLogin) {
                            window.open(`/dashboard?student=${student.id}`, '_blank');
                          }
                        }}>
                          <User className="h-4 w-4 mr-2" />
                          Log in as Student
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>
              Update the student's profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={profileForm.business_name}
                  onChange={(e) => setProfileForm({...profileForm, business_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="target_market">Target Market</Label>
              <Input
                id="target_market"
                value={profileForm.target_market}
                onChange={(e) => setProfileForm({...profileForm, target_market: e.target.value})}
              />
            </div>
              <div>
                <Label htmlFor="strengths">Strengths</Label>
                <Textarea
                  id="strengths"
                value={profileForm.strengths}
                onChange={(e) => setProfileForm({...profileForm, strengths: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="challenges">Challenges</Label>
                <Textarea
                  id="challenges"
                value={profileForm.challenges}
                onChange={(e) => setProfileForm({...profileForm, challenges: e.target.value})}
                />
            </div>
            <div>
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                value={profileForm.goals}
                onChange={(e) => setProfileForm({...profileForm, goals: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                <Select
                  value={profileForm.preferred_contact_method}
                  onValueChange={(value) => setProfileForm({...profileForm, preferred_contact_method: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={profileForm.availability}
                  onChange={(e) => setProfileForm({...profileForm, availability: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">General Notes</Label>
              <Textarea
                id="notes"
                value={profileForm.notes}
                onChange={(e) => setProfileForm({...profileForm, notes: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingProfile(false)}>
                Cancel
              </Button>
            <Button onClick={handleProfileUpdate}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Call Dialog */}
      <Dialog open={addingCall} onOpenChange={setAddingCall}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Call Log</DialogTitle>
            <DialogDescription>
              Record a new coaching call with the student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="call_date">Call Date</Label>
                <Input
                  id="call_date"
                  type="date"
                  value={callForm.call_date}
                  onChange={(e) => setCallForm({...callForm, call_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="call_duration">Duration (minutes)</Label>
                <Input
                  id="call_duration"
                  type="number"
                  value={callForm.call_duration}
                  onChange={(e) => setCallForm({...callForm, call_duration: parseInt(e.target.value)})}
                />
              </div>
            </div>
              <div>
                <Label htmlFor="call_type">Call Type</Label>
                <Select
                  value={callForm.call_type}
                onValueChange={(value: 'scheduled' | 'follow_up' | 'emergency') => 
                  setCallForm({...callForm, call_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="topics">Topics Discussed</Label>
              {callForm.topics_discussed.map((topic, index) => (
                <div key={index} className="flex gap-2 mb-2">
              <Input
                    value={topic}
                    onChange={(e) => {
                      const newTopics = [...callForm.topics_discussed];
                      newTopics[index] = e.target.value;
                      setCallForm({...callForm, topics_discussed: newTopics});
                    }}
                    placeholder="Enter topic"
                  />
                  {callForm.topics_discussed.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newTopics = callForm.topics_discussed.filter((_, i) => i !== index);
                        setCallForm({...callForm, topics_discussed: newTopics});
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCallForm({
                  ...callForm, 
                  topics_discussed: [...callForm.topics_discussed, '']
                })}
              >
                Add Topic
              </Button>
            </div>
            <div>
              <Label htmlFor="outcome">Outcome</Label>
              <Textarea
                id="outcome"
                value={callForm.outcome}
                onChange={(e) => setCallForm({...callForm, outcome: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="next_steps">Next Steps</Label>
              <Textarea
                id="next_steps"
                value={callForm.next_steps}
                onChange={(e) => setCallForm({...callForm, next_steps: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="student_mood">Student Mood</Label>
              <Select
                value={callForm.student_mood}
                onValueChange={(value: 'positive' | 'neutral' | 'frustrated' | 'motivated') => 
                  setCallForm({...callForm, student_mood: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="motivated">Motivated</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="frustrated">Frustrated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddingCall(false)}>
                Cancel
              </Button>
            <Button onClick={handleAddCall}>
              Add Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={addingNote} onOpenChange={setAddingNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note about the student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note_content">Note Content</Label>
              <Textarea
                id="note_content"
                value={noteForm.content}
                onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                placeholder="Enter your note here..."
              />
            </div>
            <div>
              <Label htmlFor="note_visibility">Visibility</Label>
              <Select
                value={noteForm.visibility}
                onValueChange={(value: 'public' | 'private') => 
                  setNoteForm({...noteForm, visibility: value})}
              >
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddingNote(false)}>
                Cancel
              </Button>
            <Button onClick={handleAddNote}>
              Add Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};