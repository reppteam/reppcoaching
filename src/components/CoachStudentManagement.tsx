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
import { Textarea } from './ui/textarea';
import {
  Users,
  User,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  RefreshCw,
  FileText,
  Target,
  Mail,
  BookOpen,
  Activity,
  Star,
  DollarSign,
  Clock3,
  CalendarDays
} from 'lucide-react';
import { User as UserType, StudentKPIData, StudentActivitySummary } from '../types';

interface CoachStudentManagementProps {
  coachId?: string;
}

export const CoachStudentManagement: React.FC<CoachStudentManagementProps> = ({ coachId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<UserType[]>([]);
  const [studentKPIs, setStudentKPIs] = useState<StudentKPIData[]>([]);
  const [studentActivity, setStudentActivity] = useState<StudentActivitySummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null);
  const [viewingStudentDetails, setViewingStudentDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showInactive, setShowInactive] = useState(false);
  const [showIncompleteTasks, setShowIncompleteTasks] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const currentCoachId = coachId || user?.id;

  useEffect(() => {
    if (currentCoachId) {
      loadStudentData();
    }
  }, [currentCoachId]);

  const loadStudentData = async () => {
    if (!currentCoachId) return;

    try {
      setLoading(true);

      // Load assigned students
      const assignedStudents = await eightbaseService.getAssignedStudents(currentCoachId);
      setStudents(assignedStudents);

      // Load student KPIs
      if (assignedStudents.length > 0) {
        const studentIds = assignedStudents.map(s => s.id);
        const kpis = await eightbaseService.getMultipleStudentKPIs(studentIds, { preset: '30days' });
        setStudentKPIs(kpis);

        // Load activity summary
        const activitySummary = await eightbaseService.getStudentActivitySummary(studentIds, { preset: '30days' });
        setStudentActivity(activitySummary);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && student.has_paid) ||
                         (filterStatus === 'inactive' && !student.has_paid);
    
    const matchesType = filterType === 'all' ||
                       (filterType === 'paid' && student.has_paid) ||
                       (filterType === 'free' && !student.has_paid);

    const matchesInactiveFilter = showInactive || student.has_paid;

    const matchesIncompleteTasks = !showIncompleteTasks || (() => {
      const activity = getStudentActivity(student.id);
      return activity?.alerts && activity.alerts.length > 0;
    })();

    return matchesSearch && matchesStatus && matchesType && matchesInactiveFilter && matchesIncompleteTasks;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      case 'email':
        comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        break;
      case 'lastActivity':
        const activityA = getStudentActivity(a.id);
        const activityB = getStudentActivity(b.id);
        const dateA = activityA?.last_activity ? new Date(activityA.last_activity).getTime() : 0;
        const dateB = activityB?.last_activity ? new Date(activityB.last_activity).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case 'performance':
        const kpiA = getStudentKPI(a.id);
        const kpiB = getStudentKPI(b.id);
        const scoreA = kpiA?.conversion_rate || 0;
        const scoreB = kpiB?.conversion_rate || 0;
        comparison = scoreA - scoreB;
        break;
      case 'status':
        comparison = (a.has_paid ? 1 : 0) - (b.has_paid ? 1 : 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStudentKPI = (studentId: string) => {
    return studentKPIs.find(kpi => kpi.student_id === studentId);
  };

  const getStudentActivity = (studentId: string) => {
    return studentActivity.find(activity => activity.student.id === studentId);
  };

  const getStatusBadge = (student: UserType) => {
    if (student.has_paid) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge variant="secondary">Free</Badge>;
    }
  };

  const getPerformanceBadge = (studentId: string) => {
    const kpi = getStudentKPI(studentId);
    if (!kpi) return <Badge variant="outline">No Data</Badge>;
    
    const score = kpi.conversion_rate || 0;
    if (score >= 80) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
          <p className="text-muted-foreground">
            Manage your assigned students and track their progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadStudentData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => s.has_paid).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Paid subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentKPIs.length > 0 
                ? Math.round(studentKPIs.reduce((sum, kpi) => sum + (kpi.conversion_rate || 0), 0) / studentKPIs.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentActivity.filter(a => a.alerts.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Students with alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Find and organize your students with advanced filtering options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <Label htmlFor="search">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="lastActivity">Last Activity</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showInactive"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="showInactive" className="text-sm">
                  Show inactive clients
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showIncompleteTasks"
                  checked={showIncompleteTasks}
                  onChange={(e) => setShowIncompleteTasks(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="showIncompleteTasks" className="text-sm">
                  Incomplete tasks this week
                </Label>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedStudents.length} of {students.length} students
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterType('all');
                    setSortBy('name');
                    setSortOrder('asc');
                    setShowInactive(false);
                    setShowIncompleteTasks(false);
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredAndSortedStudents.length})</CardTitle>
          <CardDescription>
            Your assigned students with detailed information and multiple data rows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStudents.map((student) => {
                const kpi = getStudentKPI(student.id);
                const activity = getStudentActivity(student.id);
                
                return (
                  <React.Fragment key={student.id}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(student)}
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(student.id)}
                    </TableCell>
                    <TableCell>
                                             <div className="text-sm">
                         {activity?.last_activity 
                           ? new Date(activity.last_activity).toLocaleDateString()
                           : 'No activity'
                         }
                       </div>
                    </TableCell>
                    <TableCell>
                                             {activity?.alerts && activity.alerts.length > 0 ? (
                         <Badge variant="destructive">
                           {activity.alerts.length} alert{activity.alerts.length > 1 ? 's' : ''}
                         </Badge>
                       ) : (
                         <Badge variant="outline">None</Badge>
                       )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student);
                            setViewingStudentDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Detailed Information Row */}
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Performance Metrics */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Performance Metrics</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Conversion Rate:</span>
                                <span className="font-medium">{kpi?.conversion_rate || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Revenue:</span>
                                <span className="font-medium">${(kpi as any)?.total_revenue || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Shoots:</span>
                                <span className="font-medium">{(kpi as any)?.total_shoots || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Recent Activity */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Recent Activity</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Report:</span>
                                <span className="font-medium">
                                  {(activity as any)?.last_report_date 
                                    ? new Date((activity as any).last_report_date).toLocaleDateString()
                                    : 'None'
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Reports This Month:</span>
                                <span className="font-medium">{(activity as any)?.reports_this_month || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Engagement Score:</span>
                                <span className="font-medium">{(activity as any)?.engagement_score || 0}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Goals & Progress */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Goals & Progress</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Current Goal:</span>
                                <span className="font-medium">
                                  {(student as any).current_goal || 'Not set'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Progress:</span>
                                <span className="font-medium">
                                  {(student as any).goal_progress || 0}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Next Milestone:</span>
                                <span className="font-medium">
                                  {(student as any).next_milestone || 'None'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Coaching Start: {student.coaching_term_start ? new Date(student.coaching_term_start).toLocaleDateString() : 'N/A'}</span>
                              <span>Access End: {student.access_end ? new Date(student.access_end).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4 mr-2" />
                                Log Call
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Add Note
                              </Button>
                              <Button variant="outline" size="sm">
                                <Target className="h-4 w-4 mr-2" />
                                View Goals
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={viewingStudentDetails} onOpenChange={setViewingStudentDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Student'} - Student Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of student information, performance, and activity
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p>{selectedStudent.firstName} {selectedStudent.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p>{selectedStudent.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedStudent)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Member Since</Label>
                        <p>{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Conversion Rate:</span>
                        <span className="font-medium">
                          {getStudentKPI(selectedStudent.id)?.conversion_rate || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Activity:</span>
                        <span className="font-medium">
                          {(() => {
                            const activity = getStudentActivity(selectedStudent.id)?.last_activity;
                            return activity ? new Date(activity).toLocaleDateString() : 'No activity';
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Alerts:</span>
                        <span className="font-medium">
                          {getStudentActivity(selectedStudent.id)?.alerts.length || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {getStudentKPI(selectedStudent.id)?.conversion_rate || 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {getStudentKPI(selectedStudent.id)?.engagement_completion_rate || 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Engagement Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {getStudentActivity(selectedStudent.id)?.performance_score || 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Performance Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getStudentActivity(selectedStudent.id)?.alerts.map((alert, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <p className="font-medium">{alert}</p>
                          </div>
                        </div>
                      ))}
                      {(!getStudentActivity(selectedStudent.id)?.alerts || 
                        getStudentActivity(selectedStudent.id)!.alerts.length === 0) && (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <p className="text-muted-foreground">No alerts or issues</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newNote">Add Note</Label>
                        <Textarea
                          id="newNote"
                          placeholder="Add a note about this student..."
                          className="mt-2"
                        />
                        <Button className="mt-2">Save Note</Button>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Previous Notes</h4>
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No notes yet</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
