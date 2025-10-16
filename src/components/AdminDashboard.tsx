import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User, WeeklyReport, Goal, Lead, CallLog, Note, StudentProfile } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { KPIDashboard } from './KPIDashboard';
import { UserManagement } from './UserManagement';
import { WeekTracker, getUserWeekInfo } from './WeekTracker';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Plus,
  BarChart3,
  Target,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  User as UserIcon,
  Settings,
  Shield
} from 'lucide-react';

export function AdminDashboard() {
  const { authState } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [coachTableId, setCoachTableId] = useState<string>('');

  // Call log state
  const [callLogDialogOpen, setCallLogDialogOpen] = useState(false);
  const [callLogForm, setCallLogForm] = useState({
    student_id: '',
    call_date: '',
    call_duration: 0,
    call_type: 'scheduled',
    topics_discussed: [] as string[],
    outcome: '',
    next_steps: '',
    student_mood: 'positive'
  });

  // Note state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    target_type: 'student',
    target_id: '',
    title: '',
    content: '',
    visibility: 'public'
  });

  // Helper function to determine if KPI tab should be shown
  const shouldShowKPITab = (user: any) => {
    // Show KPI for super_admin role only (admin dashboard)
    return user?.role === 'super_admin';
  };

  // Reset active tab if user doesn't have permission for KPIs
  useEffect(() => {
    if (activeTab === 'kpis' && !shouldShowKPITab(authState?.user)) {
      setActiveTab('overview');
    }
  }, [activeTab, authState?.user]);

  useEffect(() => {
    if (authState.user) {
      loadData();
    }
  }, [authState.user]);

  // Only show for admin roles
  if (!authState?.user || (authState.user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">This dashboard is only available for administrators.</p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    if (!authState.user) return;
    
    setLoading(true);
    try {
      // Admin dashboard loads all data (not filtered by coach)
      const [usersData, reportsData, goalsData, leadsData, callLogsData, studentsData] = await Promise.all([
        eightbaseService.getAllUsersWithDetails(),
        eightbaseService.getWeeklyReports(), // All reports, not filtered by coach
        eightbaseService.getGoals(), // All goals, not filtered by coach
        eightbaseService.getLeads(), // All leads, not filtered by coach
        eightbaseService.getCallLogs(), // All call logs, not filtered by coach
        eightbaseService.getAllStudents()
      ]);
      
      setUsers(usersData);
      setReports(reportsData);
      setGoals(goalsData);
      setLeads(leadsData);
      setCallLogs(callLogsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCallLog = async () => {
    try {
      await eightbaseService.createCallLog({
        ...callLogForm,
        coach_id: authState.user!.id, // Admin user ID
        call_type: callLogForm.call_type as 'scheduled' | 'follow_up' | 'emergency',
        student_mood: callLogForm.student_mood as 'positive' | 'neutral' | 'frustrated' | 'motivated'
      });
      setCallLogDialogOpen(false);
      setCallLogForm({
        student_id: '',
        call_date: '',
        call_duration: 0,
        call_type: 'scheduled',
        topics_discussed: [],
        outcome: '',
        next_steps: '',
        student_mood: 'positive'
      });
      loadData(); // Refresh data after creating call log
    } catch (error) {
      console.error('Failed to create call log:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      await eightbaseService.createNote({
        ...noteForm,
        student_id: noteForm.target_id, // Use the selected target ID
        created_by: authState.user!.id, // Admin user ID
        created_by_name: `${authState.user!.firstName} ${authState.user!.lastName}`,
        visibility: noteForm.visibility as 'public' | 'private'
      });
      setNoteDialogOpen(false);
      setNoteForm({
        target_type: 'student',
        target_id: '',
        title: '',
        content: '',
        visibility: 'public'
      });
      loadData(); // Refresh data after creating note
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 animate-pulse text-brand-blue" />
          <span className="text-black dark:text-white">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate metrics - admin sees all students
  const assignedStudents = students; // Admin sees all students
  
  const activeStudents = assignedStudents.filter((s: any) => s.is_active !== false);
  const paidStudents = assignedStudents.filter((s: any) => s.has_paid);
  const totalRevenue = reports.reduce((sum, report) => sum + report.revenue, 0);
  const totalLeads = leads.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-black dark:text-white">
          <Shield className="h-6 w-6 text-brand-blue" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage all users, students, and system data
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{assignedStudents.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-foreground">{activeStudents.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Paid Students</p>
                <p className="text-2xl font-bold text-foreground">{paidStudents.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">${Math.round(totalRevenue / 1000)}k</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Call Logs</p>
                <p className="text-2xl font-bold text-foreground">{callLogs.length}</p>
              </div>
              <Phone className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${shouldShowKPITab(authState?.user) ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          {shouldShowKPITab(authState?.user) && (
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
          )}
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress</CardTitle>
                <CardDescription>
                  Overview of all students' progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedStudents.map((student: any) => {
                    const studentReports = reports.filter(r => r.student_id === student.id);
                    const studentLeads = leads.filter(l => l.student_id === student.id);
                    const studentGoals = goals.filter(g => g.student_id === student.id);
                    const recentCallLog = callLogs
                      .filter(c => c.student_id === student.id)
                      .sort((a, b) => new Date(b.call_date).getTime() - new Date(a.call_date).getTime())[0];
                    
                      return (
                      <div key={student.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium text-foreground">{student.firstName} {student.lastName}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                          <Badge className={student.has_paid ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}>
                            {student.has_paid ? 'Paid' : 'Free'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Reports</div>
                            <div className="font-medium text-foreground">{studentReports.length}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Leads</div>
                            <div className="font-medium text-foreground">{studentLeads.length}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Goals</div>
                            <div className="font-medium text-foreground">{studentGoals.length}</div>
                          </div>
                        </div>
                        
                        {recentCallLog && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            Last call: {new Date(recentCallLog.call_date).toLocaleDateString()}
                          </div>
                        )}
                        </div>
                      );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest reports, leads, and call logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent Reports */}
                  <div>
                    <h4 className="font-medium mb-2">Recent Reports</h4>
                    <div className="space-y-2">
                      {reports.slice(0, 3).map(report => (
                        <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-muted rounded">
                          <div>
                            <div className="text-sm font-medium">
                              {(() => {
                                const user = users.find(u => u.id === report.student_id);
                                return user ? `${user.firstName} ${user.lastName}` : 'Unknown Student';
                              })()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {report.start_date} - {report.end_date}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            ${report.revenue}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Leads */}
                  <div>
                    <h4 className="font-medium mb-2">Recent Leads</h4>
                    <div className="space-y-2">
                      {leads.slice(0, 3).map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-muted rounded">
                          <div>
                            <div className="text-sm font-medium">{lead.lead_name}</div>
                            <div className="text-xs text-muted-foreground">{lead.lead_source}</div>
                          </div>
                          <Badge className={
                            lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                            lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                            'bg-muted text-muted-foreground'
                          }>
                            {lead.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <UserManagement />
        </TabsContent>

        {/* KPIs Tab */}
        {shouldShowKPITab(authState?.user) && (
          <TabsContent value="kpis" className="space-y-6">
            <KPIDashboard showCoachSummary={true} />
          </TabsContent>
        )}

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Call Log Tool */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Phone className="h-5 w-5" />
                  Call Log Tool
                </CardTitle>
              <CardDescription>
                  Log coaching calls and track student interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setCallLogDialogOpen(true)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Log New Call
                            </Button>
            </CardContent>
          </Card>

            {/* Note Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <FileText className="h-5 w-5" />
                  Note Tool
                </CardTitle>
                <CardDescription>
                  Add notes about students and their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setNoteDialogOpen(true)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>

            {/* Week Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Calendar className="h-5 w-5" />
                  Week Tracker
                </CardTitle>
                <CardDescription>
                  Track weekly progress and goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeekTracker user={authState.user!} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Bulk Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Review Goals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Call Log Dialog */}
      <Dialog open={callLogDialogOpen} onOpenChange={setCallLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Coaching Call</DialogTitle>
            <DialogDescription>
              Record details about a coaching session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student" className="text-foreground">Student</Label>
              <Select value={callLogForm.student_id} onValueChange={(value) => setCallLogForm({...callLogForm, student_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {assignedStudents.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
              <div>
                <Label htmlFor="call_date" className="text-foreground">Call Date</Label>
                <Input
                  id="call_date"
                  type="date"
                value={callLogForm.call_date}
                onChange={(e) => setCallLogForm({...callLogForm, call_date: e.target.value})}
                />
              </div>
            
              <div>
                <Label htmlFor="call_duration" className="text-foreground">Duration (minutes)</Label>
                <Input
                  id="call_duration"
                  type="number"
                value={callLogForm.call_duration}
                onChange={(e) => setCallLogForm({...callLogForm, call_duration: parseInt(e.target.value)})}
                />
            </div>
            
              <div>
                <Label htmlFor="call_type" className="text-foreground">Call Type</Label>
              <Select value={callLogForm.call_type} onValueChange={(value) => setCallLogForm({...callLogForm, call_type: value})}>
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
              <Label htmlFor="outcome" className="text-foreground">Outcome</Label>
              <Textarea
                id="outcome"
                value={callLogForm.outcome}
                onChange={(e) => setCallLogForm({...callLogForm, outcome: e.target.value})}
                placeholder="What was accomplished in this call?"
              />
            </div>
            
            <div>
              <Label htmlFor="next_steps" className="text-foreground">Next Steps</Label>
              <Textarea
                id="next_steps"
                value={callLogForm.next_steps}
                onChange={(e) => setCallLogForm({...callLogForm, next_steps: e.target.value})}
                placeholder="What are the next steps?"
              />
            </div>

            <div>
              <Label htmlFor="student_mood" className="text-foreground">Student Mood</Label>
              <Select value={callLogForm.student_mood} onValueChange={(value) => setCallLogForm({...callLogForm, student_mood: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="frustrated">Frustrated</SelectItem>
                  <SelectItem value="motivated">Motivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCallLogDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCallLog}>
                Log Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note about a student or interaction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="target_type" className="text-foreground">Note Type</Label>
              <Select value={noteForm.target_type} onValueChange={(value) => setNoteForm({...noteForm, target_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="target_id" className="text-foreground">Target</Label>
              <Select value={noteForm.target_id} onValueChange={(value) => setNoteForm({...noteForm, target_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  {noteForm.target_type === 'student' && assignedStudents.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                  {noteForm.target_type === 'call' && callLogs.map(call => (
                    <SelectItem key={call.id} value={call.id}>
                      Call with {(() => {
                        const user = users.find(u => u.id === call.student_id);
                        return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
                      })()} on {call.call_date}
                    </SelectItem>
                  ))}
                  {noteForm.target_type === 'lead' && leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.lead_name} - {lead.lead_source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title" className="text-foreground">Note Title</Label>
              <Input
                id="title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                placeholder="Enter note title..."
              />
            </div>
            
            <div>
              <Label htmlFor="content" className="text-foreground">Note Content</Label>
              <Textarea
                id="content"
                value={noteForm.content}
                onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                placeholder="Enter your note here..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="visibility" className="text-foreground">Visibility</Label>
              <Select value={noteForm.visibility} onValueChange={(value) => setNoteForm({...noteForm, visibility: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNote}>
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}