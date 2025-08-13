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
  XCircle
} from 'lucide-react';
import { StudentProfile as StudentProfileType, CallLog, Note } from '../types';

interface StudentProfileProps {
  student: {
    id: string;
    name: string;
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
        created_by_name: currentUser?.name || ''
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
                {student.name}
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