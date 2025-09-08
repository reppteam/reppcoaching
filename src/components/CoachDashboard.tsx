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
  CalendarDays
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
    return weeklyReports.filter(report => report.user_id === studentId);
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
          <span>Today, {new Date().toLocaleDateString('en-US', { 
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{assignedStudents.length}</div>
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
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-2">
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
                      const student = assignedStudents.find(s => s.id === report.user_id);
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
                            <Badge variant="default" className="bg-blue-600 text-white">Submitted</Badge>
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
    </div>
  );
};
