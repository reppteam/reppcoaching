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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Users, 
  TrendingUp, 
  Phone, 
  MessageSquare, 
  Target, 
  Calendar,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  DollarSign,
  Eye,
  Edit,
  Plus,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Bell,
  Search,
  UserIcon,
  CalendarDays,
  Send,
  X,
  Camera
} from 'lucide-react';
import { User, StudentKPIData, CoachKPISummary, TimeFrameFilter, TimeFramePreset, StudentActivitySummary, WeeklyReport } from '../types';

interface CoachDashboardProps {
  coachId?: string;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ coachId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrameFilter>({
    preset: '30days',
    startDate: '',
    endDate: '',
    label: 'Last 30 days'
  });
  const [coachSummary, setCoachSummary] = useState<CoachKPISummary | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<User[]>([]);
  const [studentKPIs, setStudentKPIs] = useState<StudentKPIData[]>([]);
  const [studentActivitySummary, setStudentActivitySummary] = useState<StudentActivitySummary[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [viewingStudentDetails, setViewingStudentDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    studentId: '',
    title: '',
    message: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });
  const [sendingNotification, setSendingNotification] = useState(false);

  // Goals state
  const [goals, setGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  const currentCoachId = coachId || user?.id;

  useEffect(() => {
    if (currentCoachId) {
      loadCoachData();
    }
  }, [currentCoachId, timeFrame]);

  const loadCoachData = async () => {
    if (!currentCoachId) return;

    try {
      setLoading(true);
      
      // Load coach summary
      const summary = await eightbaseService.getCoachKPISummary(currentCoachId, timeFrame);
      setCoachSummary(summary);

      // Load assigned students
      const students = await eightbaseService.getAssignedStudents(currentCoachId);
      setAssignedStudents(students);

      // Load student KPIs
      if (students.length > 0) {
        const studentIds = students.map(s => s.id);
        const kpis = await eightbaseService.getMultipleStudentKPIs(studentIds, timeFrame);
        setStudentKPIs(kpis);

        // Load activity summary
        const activitySummary = await eightbaseService.getStudentActivitySummary(studentIds, timeFrame);
        setStudentActivitySummary(activitySummary);

        // Load weekly reports for all students
        const allReports: WeeklyReport[] = [];
        for (const student of students) {
          try {
            const reports = await eightbaseService.getStudentWeeklyReports(student.id);
            allReports.push(...reports);
          } catch (error) {
            console.error(`Error loading reports for student ${student.id}:`, error);
          }
        }
        setWeeklyReports(allReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

        // Load goals for assigned students
        try {
          const coachGoals = await eightbaseService.getGoalsByCoach(currentCoachId);
          setGoals(coachGoals);
        } catch (error) {
          console.error('Error loading goals:', error);
        }
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeFrameChange = (preset: TimeFramePreset) => {
    const newTimeFrame = eightbaseService.createTimeFrameFilter(preset);
    setTimeFrame(newTimeFrame);
  };

  const getStudentKPI = (studentId: string) => {
    return studentKPIs.find(kpi => kpi.student_id === studentId);
  };

  const getStudentActivity = (studentId: string) => {
    return studentActivitySummary.find(activity => activity.student.id === studentId);
  };

  const getStudentReports = (studentId: string) => {
    return weeklyReports.filter(report => report.student_id === studentId);
  };

  const getStudentTotalRevenue = (studentId: string) => {
    const reports = getStudentReports(studentId);
    return reports.reduce((total, report) => total + (report.revenue || 0), 0);
  };

  const getStudentAvgRevenue = (studentId: string) => {
    const reports = getStudentReports(studentId);
    return reports.length > 0 ? getStudentTotalRevenue(studentId) / reports.length : 0;
  };

  const getActivityLevel = (studentId: string) => {
    const activity = getStudentActivity(studentId);
    if (!activity) return 10;
    
    // Calculate activity level based on recent activity
    const recentActivity = activity.recent_leads + activity.recent_dms + activity.recent_calls;
    return Math.min(Math.max(recentActivity * 10, 10), 100);
  };

  const getStudentsWithoutRecentReports = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return assignedStudents.filter(student => {
      const reports = getStudentReports(student.id);
      const hasRecentReport = reports.some(report => 
        new Date(report.created_at) > sevenDaysAgo
      );
      return !hasRecentReport;
    });
  };

  const filteredStudents = assignedStudents.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendNotification = async () => {
    // Enhanced validation
    if (!notificationForm.studentId) {
      alert('Please select a student to send the message to.');
      return;
    }

    if (!notificationForm.title.trim()) {
      alert('Please enter a title for your message.');
      return;
    }

    if (!notificationForm.message.trim()) {
      alert('Please enter a message to send to the student.');
      return;
    }

    if (notificationForm.message.trim().length < 10) {
      alert('Message must be at least 10 characters long.');
      return;
    }

    if (notificationForm.message.trim().length > 500) {
      alert('Message cannot exceed 500 characters.');
      return;
    }

    if (!currentCoachId) {
      alert('Coach information not found. Please refresh the page and try again.');
      return;
    }

    try {
      setSendingNotification(true);
      
      // Verify coach-student relationship first
      const student = assignedStudents.find(s => s.id === notificationForm.studentId);
      if (!student) {
        alert('You can only send messages to your assigned students.');
        return;
      }

      // Try to get the student ID from the user ID
      // If that fails, use the user ID directly (they might be the same)
      let studentId = await eightbaseService.getStudentIdFromUserId(notificationForm.studentId);
      if (!studentId) {
        console.log('🔍 No separate student record found, using user ID directly');
        studentId = notificationForm.studentId; // Fallback to user ID
      }

      // Create the notification
      console.log('🚀 Creating personalized notification:', {
        studentId: studentId,
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        priority: notificationForm.priority,
        type: 'COACH_MESSAGE',
        coachId: currentCoachId
      });

      const notification = await eightbaseService.createPersonalizedNotification({
        studentId: studentId,
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        priority: notificationForm.priority,
        type: 'COACH_MESSAGE',
        coachId: currentCoachId
      });

      console.log('✅ Notification created successfully:', notification);

      // Reset form and close modal
      setNotificationForm({
        studentId: '',
        title: '',
        message: '',
        priority: 'medium'
      });
      setShowNotificationModal(false);
      
      // Show success message
      alert(`Message sent successfully to ${student.firstName} ${student.lastName}!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      if (error instanceof Error) {
        alert(`Failed to send notification: ${error.message}`);
      } else {
        alert('Failed to send notification. Please try again.');
      }
    } finally {
      setSendingNotification(false);
    }
  };

  const openNotificationModal = (student: User) => {
    setNotificationForm({
      studentId: student.id,
      title: `Message from ${user?.firstName} ${user?.lastName}`,
      message: '',
      priority: 'medium'
    });
    setShowNotificationModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading coach dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coach Dashboard</h2>
          <p className="text-muted-foreground">
            Manage and support your assigned students
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white">Today, {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Summary Cards - Exact match to image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">My Students</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{assignedStudents.length}</div>
            <p className="text-xs text-gray-500">
              Under your guidance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${assignedStudents.reduce((total, student) => total + getStudentTotalRevenue(student.id), 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Combined student revenue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyReports.length}</div>
            <p className="text-xs text-gray-500">
              Weekly reports submitted
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${assignedStudents.length > 0 
                ? (assignedStudents.reduce((total, student) => total + getStudentTotalRevenue(student.id), 0) / assignedStudents.length).toLocaleString()
                : '0'
              }
            </div>
            <p className="text-xs text-gray-500">
              Per student
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section - Exact match to image */}
      {getStudentsWithoutRecentReports().length > 0 && (
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-black dark:text-white">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</CardTitle>
            </div>
            <CardDescription className="text-gray-600">Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getStudentsWithoutRecentReports().map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-orange-100">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.firstName} {student.lastName}: No weekly report submitted in the last 7 days.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Students Section - Exact match to image */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">My Students</CardTitle>
              <CardDescription className="text-gray-600">Manage your assigned students and their progress</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-black dark:text-white">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => {
              const reports = getStudentReports(student.id);
              const totalRevenue = getStudentTotalRevenue(student.id);
              const avgRevenue = getStudentAvgRevenue(student.id);
              const activityLevel = getActivityLevel(student.id);
              
              return (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{student.firstName} {student.lastName}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => openNotificationModal(student)}
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Send Message
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Monitor
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        View Profile
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Reports</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{reports.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Recent Reports</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{reports.filter(r => new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="font-semibold text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg Revenue</p>
                      <p className="font-semibold text-gray-900 dark:text-white">${avgRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Activity Level</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{activityLevel}%</span>
                    </div>
                    <Progress value={activityLevel} className="h-2 bg-gray-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Weekly Reports / Performance Tabs - Exact match to image */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Recent Weekly Reports</TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reports" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Latest submissions from your students</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600 font-medium">Student</TableHead>
                      <TableHead className="text-gray-600 font-medium">Week</TableHead>
                      <TableHead className="text-gray-600 font-medium">Revenue</TableHead>
                      <TableHead className="text-gray-600 font-medium">Profit</TableHead>
                      <TableHead className="text-gray-600 font-medium">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyReports.slice(0, 5).map((report) => {
                      const student = assignedStudents.find(s => s.id === report.student_id);
                      return (
                        <TableRow key={report.id} className="border-gray-200">
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-white">${report.revenue?.toLocaleString() || '0'}</TableCell>
                          <TableCell className="text-gray-900 dark:text-white">${report.net_profit?.toLocaleString() || '0'}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-blue-600">Submitted</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Student performance metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedStudents.map((student) => {
                    const kpi = getStudentKPI(student.id);
                    const activity = getStudentActivity(student.id);
                    
                    return (
                      <Card key={student.id} className="bg-white border border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-sm text-gray-900 dark:text-white">{student.firstName} {student.lastName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Conversion Rate</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{kpi?.conversion_rate?.toFixed(1) || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Engagement</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{activity?.recent_leads || 0} leads</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Revenue</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">${getStudentTotalRevenue(student.id).toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Goals Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Student Goals
              </CardTitle>
              <CardDescription className="text-gray-600">Track and monitor your assigned students' goals and progress</CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              {goals.length} goal{goals.length !== 1 ? 's' : ''} total
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {goalsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading goals...</span>
            </div>
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 10).map((goal) => {
                const student = assignedStudents.find(s => s.id === goal.user_id);
                const progressPercentage = goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0;
                
                return (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {goal.goal_type === 'revenue' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {goal.goal_type === 'clients' && <Users className="h-4 w-4 text-blue-600" />}
                          {goal.goal_type === 'shoots' && <Camera className="h-4 w-4 text-purple-600" />}
                          {goal.goal_type === 'text' && <FileText className="h-4 w-4 text-orange-600" />}
                          {goal.goal_type === 'other' && <Target className="h-4 w-4 text-gray-600" />}
                          <span className="font-medium text-gray-900 dark:text-white">{goal.title}</span>
                        </div>
                        <Badge 
                          variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}
                          className={goal.priority === 'medium' ? 'bg-orange-100 text-orange-800' : ''}
                        >
                          {goal.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4 text-gray-600">
                        <span>Current: {goal.goal_type === 'revenue' ? '$' : ''}{goal.current_value?.toLocaleString() || '0'}</span>
                        <span>Target: {goal.goal_type === 'revenue' ? '$' : ''}{goal.target_value?.toLocaleString() || '0'}</span>
                      </div>
                      <Badge 
                        variant={goal.status === 'completed' ? 'default' : 'secondary'}
                        className={goal.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {goal.status}
                      </Badge>
                    </div>
                    
                    {goal.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        {goal.description}
                      </div>
                    )}
                  </div>
                );
              })}
              {goals.length > 10 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Showing first 10 of {goals.length} goals
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No goals found</p>
              <p className="text-sm">Your assigned students haven't set any goals yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Notification Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-blue-600" />
              Send Message to Student
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Send a personalized notification to your assigned student. The message will appear in their notification list and dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Student Selection */}
            <div>
              <Label htmlFor="student-select" className="text-sm font-medium">Student *</Label>
              <Select 
                value={notificationForm.studentId} 
                onValueChange={(value) => setNotificationForm({...notificationForm, studentId: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a student to send message to" />
                </SelectTrigger>
                <SelectContent>
                  {assignedStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                        <span className="text-xs text-muted-foreground">{student.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Only your assigned students are shown</p>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="notification-title" className="text-sm font-medium">Title *</Label>
              <Input
                id="notification-title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                placeholder="e.g., Weekly Check-in, Important Update, etc."
                className="bg-background border-border text-foreground mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">A clear, descriptive title for your message</p>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="notification-message" className="text-sm font-medium">Message *</Label>
              <textarea
                id="notification-message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                placeholder="Write your personalized message to the student. Be encouraging and specific about what you'd like them to focus on..."
                className="w-full min-h-[120px] p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground resize-none mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={500}
              />
              <div className={`text-xs mt-1 ${notificationForm.message.length > 500 ? 'text-red-500' : notificationForm.message.length < 10 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {notificationForm.message.length}/500 characters
                {notificationForm.message.length < 10 && notificationForm.message.length > 0 && (
                  <span className="ml-2">(Minimum 10 characters required)</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">This message will be delivered instantly to the student's notification center</p>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="notification-priority" className="text-sm font-medium">Priority</Label>
              <Select 
                value={notificationForm.priority} 
                onValueChange={(value: 'high' | 'medium' | 'low') => setNotificationForm({...notificationForm, priority: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Low - General information</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Medium - Important update</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>High - Urgent attention needed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Higher priority messages will be more prominent in the student's notification list</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setShowNotificationModal(false)}
                disabled={sendingNotification}
                className="px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSendNotification}
                disabled={sendingNotification || !notificationForm.studentId || !notificationForm.title.trim() || !notificationForm.message.trim() || notificationForm.message.trim().length < 10}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {sendingNotification ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
