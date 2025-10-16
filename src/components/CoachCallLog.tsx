import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { CallLog, User as UserType } from '../types';

interface CoachCallLogProps {
  coachId?: string;
}

export const CoachCallLog: React.FC<CoachCallLogProps> = ({ coachId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [addingCall, setAddingCall] = useState(false);
  const [editingCall, setEditingCall] = useState<string | null>(null);
  const [viewingCall, setViewingCall] = useState<CallLog | null>(null);
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [coachRecordId, setCoachRecordId] = useState<string>(''); // Coach table ID
  const [formData, setFormData] = useState({
    student_id: '',
    call_date: '',
    call_duration: 0,
    call_type: 'scheduled' as 'scheduled' | 'follow_up' | 'emergency',
    topics_discussed: [] as string[],
    outcome: '',
    next_steps: '',
    student_mood: 'positive' as 'positive' | 'neutral' | 'frustrated' | 'motivated',
    recording_url: ''
  });

  const currentCoachId = coachId || user?.id;

  useEffect(() => {
    if (currentCoachId) {
      loadData();
    }
  }, [currentCoachId]);

  const loadData = async () => {
    if (!currentCoachId) return;

    try {
      setLoading(true);
      
      // Get all coaches and find the one that matches the current user
      const coaches = await eightbaseService.getAllCoachesDirect();
      console.log('All coaches:', coaches);
      console.log('Current user:', user);
      
      const coachRecord = coaches.find(c => 
        c.users?.id === user?.id || 
        c.email === user?.email ||
        c.id === user?.id
      );
      
      console.log('Found coach record:', coachRecord);
      
      if (coachRecord) {
        console.log('Coach Record ID (from Coach table):', coachRecord.id);
        setCoachRecordId(coachRecord.id);
        
        // Load call logs using Coach table ID
        const logs = await eightbaseService.getCallLogs(undefined, coachRecord.id);
        setCallLogs(logs);

        // Load assigned students using the same logic as UserManagement
        const allStudents = await eightbaseService.getAllStudents();
        console.log('All students:', allStudents);
        
        const assignedStudents = allStudents.filter((student: any) => 
          student.coach?.id === coachRecord.id
        );
        console.log('Assigned students:', assignedStudents);
        console.log('First student details:', assignedStudents[0]);
        if (assignedStudents[0]) {
          console.log('Student name fields:', {
            firstName: assignedStudents[0].firstName,
            lastName: assignedStudents[0].lastName,
            userFirstName: assignedStudents[0].user?.firstName,
            userLastName: assignedStudents[0].user?.lastName
          });
        }
        setAssignedStudents(assignedStudents);
      } else {
        console.error('Coach record not found for user:', user?.email);
        console.error('Available coaches:', coaches.map(c => ({ id: c.id, email: c.email, usersId: c.users?.id })));
      }
    } catch (error) {
      console.error('Error loading call data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachRecordId) {
      console.error('No coach record ID available');
      return;
    }

    try {
      console.log('Creating call log with Coach table ID:', coachRecordId);
      const callLog = await eightbaseService.createCallLog({
        student_id: formData.student_id,
        coach_id: coachRecordId, // Use Coach table ID, not User table ID
        call_date: formData.call_date,
        call_duration: formData.call_duration,
        call_type: formData.call_type,
        topics_discussed: formData.topics_discussed,
        outcome: formData.outcome,
        next_steps: formData.next_steps,
        student_mood: formData.student_mood,
        recording_url: formData.recording_url
      });

      setCallLogs([callLog, ...callLogs]);
      setAddingCall(false);
      resetForm();
    } catch (error) {
      console.error('Error creating call log:', error);
    }
  };

  const handleUpdate = async (callId: string) => {
    try {
      const updatedCall = await eightbaseService.updateCallLog(callId, formData);
      setCallLogs(callLogs.map(c => c.id === callId ? updatedCall : c));
      setEditingCall(null);
      resetForm();
    } catch (error) {
      console.error('Error updating call log:', error);
    }
  };

  const handleDelete = async (callId: string) => {
    if (!window.confirm('Are you sure you want to delete this call log?')) return;

    try {
      await eightbaseService.deleteCallLog(callId);
      setCallLogs(callLogs.filter(c => c.id !== callId));
    } catch (error) {
      console.error('Error deleting call log:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      call_date: '',
      call_duration: 0,
      call_type: 'scheduled',
      topics_discussed: [],
      outcome: '',
      next_steps: '',
      student_mood: 'positive',
      recording_url: ''
    });
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'motivated': return 'text-green-600 bg-green-100';
      case 'positive': return 'text-blue-600 bg-blue-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      case 'frustrated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'follow_up': return 'text-green-600 bg-green-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCallLogs = callLogs.filter(call => {
    const matchesStudent = filterStudent === 'all' || call.student?.id === filterStudent;
    const matchesType = filterType === 'all' || call.call_type === filterType;
    return matchesStudent && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading call logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Call Logs</h2>
          <p className="text-muted-foreground">
            Track and manage your coaching calls with students
          </p>
        </div>
        <div className="flex items-center gap-2 text-black dark:text-white">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={addingCall} onOpenChange={setAddingCall}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Call
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Coaching Call</DialogTitle>
                <DialogDescription>
                  Record details about your coaching session
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student_id">Student</Label>
                    <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignedStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="call_date">Call Date</Label>
                    <Input
                      id="call_date"
                      type="date"
                      value={formData.call_date}
                      onChange={(e) => setFormData({...formData, call_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="call_duration">Duration (minutes)</Label>
                    <Input
                      id="call_duration"
                      type="number"
                      value={formData.call_duration}
                      onChange={(e) => setFormData({...formData, call_duration: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="call_type">Call Type</Label>
                    <Select value={formData.call_type} onValueChange={(value: 'scheduled' | 'follow_up' | 'emergency') => setFormData({...formData, call_type: value})}>
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
                </div>

                <div>
                  <Label htmlFor="topics_discussed">Topics Discussed</Label>
                  <Textarea
                    id="topics_discussed"
                    placeholder="Enter topics discussed during the call..."
                    value={formData.topics_discussed.join(', ')}
                    onChange={(e) => setFormData({...formData, topics_discussed: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="outcome">Call Outcome</Label>
                  <Textarea
                    id="outcome"
                    placeholder="What was accomplished during this call?"
                    value={formData.outcome}
                    onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="next_steps">Next Steps</Label>
                  <Textarea
                    id="next_steps"
                    placeholder="What are the next steps for the student?"
                    value={formData.next_steps}
                    onChange={(e) => setFormData({...formData, next_steps: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="student_mood">Student Mood</Label>
                  <Select value={formData.student_mood} onValueChange={(value: 'positive' | 'neutral' | 'frustrated' | 'motivated') => setFormData({...formData, student_mood: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motivated">Motivated</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="frustrated">Frustrated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recording_url">Call Recording URL (Optional)</Label>
                  <Input
                    id="recording_url"
                    type="url"
                    placeholder="https://example.com/recording/..."
                    value={formData.recording_url}
                    onChange={(e) => setFormData({...formData, recording_url: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the URL to the call recording (e.g., Zoom, Loom, etc.)
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddingCall(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Call Log</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-black dark:text-white">
              <Filter className="h-4 w-4" />
              <Label>Filters:</Label>
            </div>
            <Select value={filterStudent} onValueChange={setFilterStudent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {callLogs
                  .filter(call => call.student) // Only include calls with student data
                  .reduce((unique, call) => {
                    // Get unique students from call logs
                    if (!unique.find(s => s.id === call.student?.id)) {
                      unique.push(call.student!);
                    }
                    return unique;
                  }, [] as any[])
                  .map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Call Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Call Logs</CardTitle>
          <CardDescription>
            Your coaching call history with students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date & Duration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Student Mood</TableHead>
                <TableHead>Next Steps</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCallLogs.map((call) => {
                // Use the student data that's already included in the call log
                const student = call.student;
                
                return (
                  <TableRow key={call.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student?.email || 'No email'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-black dark:text-white">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{new Date(call.call_date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {call.call_duration} minutes
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCallTypeColor(call.call_type)}>
                        {call.call_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">
                          {Array.isArray(call.topics_discussed) 
                            ? call.topics_discussed.join(', ')
                            : call.topics_discussed}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMoodColor(call.student_mood)}>
                        {call.student_mood}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">{call.next_steps}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-black dark:text-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingCall(call)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              student_id: call.student_id,
                              call_date: call.call_date,
                              call_duration: call.call_duration,
                              call_type: call.call_type,
                              topics_discussed: Array.isArray(call.topics_discussed) ? call.topics_discussed : [],
                              outcome: call.outcome,
                              next_steps: call.next_steps,
                              student_mood: call.student_mood,
                              recording_url: call.recording_url || ''
                            });
                            setEditingCall(call.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(call.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Call Dialog */}
      <Dialog open={!!editingCall} onOpenChange={() => setEditingCall(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Call Log</DialogTitle>
            <DialogDescription>
              Update the call log information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Student</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Call Date</Label>
                <Input
                  type="date"
                  value={formData.call_date}
                  onChange={(e) => setFormData({...formData, call_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.call_duration}
                  onChange={(e) => setFormData({...formData, call_duration: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Call Type</Label>
                <Select value={formData.call_type} onValueChange={(value: 'scheduled' | 'follow_up' | 'emergency') => setFormData({...formData, call_type: value})}>
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
            </div>

            <div>
              <Label>Topics Discussed</Label>
              <Textarea
                placeholder="Enter topics discussed during the call..."
                value={formData.topics_discussed.join(', ')}
                onChange={(e) => setFormData({...formData, topics_discussed: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                rows={3}
              />
            </div>

            <div>
              <Label>Call Outcome</Label>
              <Textarea
                placeholder="What was accomplished during this call?"
                value={formData.outcome}
                onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label>Next Steps</Label>
              <Textarea
                placeholder="What are the next steps for the student?"
                value={formData.next_steps}
                onChange={(e) => setFormData({...formData, next_steps: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label>Student Mood</Label>
              <Select value={formData.student_mood} onValueChange={(value: 'positive' | 'neutral' | 'frustrated' | 'motivated') => setFormData({...formData, student_mood: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motivated">Motivated</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="frustrated">Frustrated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit_recording_url">Call Recording URL (Optional)</Label>
              <Input
                id="edit_recording_url"
                type="url"
                placeholder="https://example.com/recording/..."
                value={formData.recording_url}
                onChange={(e) => setFormData({...formData, recording_url: e.target.value})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste the URL to the call recording (e.g., Zoom, Loom, etc.)
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCall(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingCall && handleUpdate(editingCall)}>
                Update Call Log
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Call Dialog */}
      <Dialog open={!!viewingCall} onOpenChange={() => setViewingCall(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              Detailed view of the coaching call
            </DialogDescription>
          </DialogHeader>
          {viewingCall && (
            <div className="space-y-6">
              {/* Call Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student</Label>
                  <p className="text-lg font-semibold">
                    {(() => {
                      const student = assignedStudents.find(s => s.id === viewingCall.student_id);
                      return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
                    })()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Call Date</Label>
                  <p className="text-lg">{new Date(viewingCall.call_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="text-lg">{viewingCall.call_duration} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Call Type</Label>
                  <Badge className={getCallTypeColor(viewingCall.call_type)}>
                    {viewingCall.call_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Topics Discussed */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Topics Discussed</Label>
                <p className="text-lg mt-1">
                  {Array.isArray(viewingCall.topics_discussed) 
                    ? viewingCall.topics_discussed.join(', ')
                    : viewingCall.topics_discussed}
                </p>
              </div>

              {/* Outcome */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Call Outcome</Label>
                <p className="text-lg mt-1">{viewingCall.outcome}</p>
              </div>

              {/* Next Steps */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Next Steps</Label>
                <p className="text-lg mt-1">{viewingCall.next_steps}</p>
              </div>

              {/* Student Mood */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Student Mood</Label>
                <Badge className={`mt-1 ${getMoodColor(viewingCall.student_mood)}`}>
                  {viewingCall.student_mood}
                </Badge>
              </div>

              {/* Recording URL */}
              {viewingCall.recording_url && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Call Recording</Label>
                  <div className="mt-1">
                    <a 
                      href={viewingCall.recording_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline flex items-center gap-2"
                    >
                      🎥 Watch Recording
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Logged On</Label>
                <p className="text-sm">{new Date(viewingCall.created_at).toLocaleString()}</p>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewingCall(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
