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
  Mail,
  Target,
  BookOpen,
  Activity,
  Star,
  DollarSign,
  Clock3,
  CalendarDays,
  FileText
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && student.has_paid) ||
                         (filterStatus === 'inactive' && !student.has_paid);
    
    const matchesType = filterType === 'all' ||
                       (filterType === 'paid' && student.has_paid) ||
                       (filterType === 'free' && !student.has_paid);

    return matchesSearch && matchesStatus && matchesType;
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
          <CardDescription>
            Your assigned students and their current status
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
              {filteredStudents.map((student) => {
                const kpi = getStudentKPI(student.id);
                const activity = getStudentActivity(student.id);
                
                return (
                  <TableRow key={student.id}>
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
              {selectedStudent?.firstName} {selectedStudent?.lastName} - Student Details
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
