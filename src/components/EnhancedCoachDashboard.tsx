import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { eightbaseService } from '../services/8baseService';
import { Header } from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Eye,
  RefreshCw,
  FileText,
  Target,
  Phone,
  Mail,
  MapPin,
  Building,
  Plus
} from 'lucide-react';

interface Coach {
  id: string;
  bio: string;
  email: string;
  firstName: string;
  lastName: string;
  students: {
    items: Student[];
  };
}

interface Student {
  id: string;
  availability: string;
  business_name: string;
  challenges: string;
  createdAt: string;
  deletedAt?: string;
  email: string;
  firstName: string;
  goals: string;
  lastName: string;
  location: string;
  notes: string;
  phone: string;
  preferred_contact_method: string;
  strengths: string;
  target_market: string;
  updatedAt: string;
  student: {
    items: WeeklyReport[];
  };
}

interface WeeklyReport {
  id: string;
  free_shoots: number;
  expenses: number;
  end_date: string;
  editing_cost: number;
  createdAt: string;
  aov: number;
  net_profit: number;
  new_clients: number;
  paid_shoots: number;
  revenue: number;
  start_date: string;
  status: string;
  unique_clients: number;
  updatedAt: string;
}

export function EnhancedCoachDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadCoachData();
    }
  }, [user]);

  const loadCoachData = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError(null);

      // Step 1: Get all coaches and filter by email
      const coaches = await eightbaseService.getCoachesByEmailFilter(user.email);
      
      if (!coaches || coaches.length === 0) {
        setError('No coach found with your email address.');
        return;
      }

      // Find exact email match
      const foundCoach = coaches.find(c => c.email.toLowerCase() === user.email.toLowerCase());
      
      if (!foundCoach) {
        setError('No coach found with your exact email address.');
        return;
      }

      // Step 2: Get coach with students and reports using the second query
      const coachWithData = await eightbaseService.getCoachWithStudentsAndReports(foundCoach.id);
      
      if (coachWithData) {
        setCoach(coachWithData);
      } else {
        setError('Failed to load coach data.');
      }

    } catch (error) {
      console.error('Error loading coach data:', error);
      setError('An error occurred while loading your data.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    if (!coach?.students?.items) return 0;
    
    return coach.students.items.reduce((total, student) => {
      const studentRevenue = student.student?.items?.reduce((studentTotal, report) => 
        studentTotal + (report.revenue || 0), 0) || 0;
      return total + studentRevenue;
    }, 0);
  };

  const getTotalNetProfit = () => {
    if (!coach?.students?.items) return 0;
    
    return coach.students.items.reduce((total, student) => {
      const studentProfit = student.student?.items?.reduce((studentTotal, report) => 
        studentTotal + (report.net_profit || 0), 0) || 0;
      return total + studentProfit;
    }, 0);
  };

  const getTotalShoots = () => {
    if (!coach?.students?.items) return 0;
    
    return coach.students.items.reduce((total, student) => {
      const studentShoots = student.student?.items?.reduce((studentTotal, report) => 
        studentTotal + (report.paid_shoots || 0) + (report.free_shoots || 0), 0) || 0;
      return total + studentShoots;
    }, 0);
  };

  const getTotalClients = () => {
    if (!coach?.students?.items) return 0;
    
    return coach.students.items.reduce((total, student) => {
      const studentClients = student.student?.items?.reduce((studentTotal, report) => 
        studentTotal + (report.new_clients || 0), 0) || 0;
      return total + studentClients;
    }, 0);
  };

  const getStudentTotalRevenue = (student: Student) => {
    return student.student?.items?.reduce((total, report) => total + (report.revenue || 0), 0) || 0;
  };

  const getStudentTotalProfit = (student: Student) => {
    return student.student?.items?.reduce((total, report) => total + (report.net_profit || 0), 0) || 0;
  };

  const getStudentTotalShoots = (student: Student) => {
    return student.student?.items?.reduce((total, report) => 
      total + (report.paid_shoots || 0) + (report.free_shoots || 0), 0) || 0;
  };

  const getStudentReportsCount = (student: Student) => {
    return student.student?.items?.length || 0;
  };

  const getStudentsWithoutRecentReports = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return coach?.students?.items?.filter(student => {
      const reports = student.student?.items || [];
      const hasRecentReport = reports.some(report => 
        new Date(report.createdAt) > sevenDaysAgo
      );
      return !hasRecentReport;
    }) || [];
  };

  const handleViewStudentProfile = (studentId: string) => {
    navigate(`/student-profile/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your coach dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadCoachData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="text-center py-12">
        <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Coach Data Found</h3>
        <p className="text-muted-foreground">Unable to load your coach information.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[90%] mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome, {coach.firstName} {coach.lastName}
              </h2>
              <p className="text-muted-foreground">
                Coach Dashboard - Manage your students and track performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadCoachData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
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
              <div className="text-2xl font-bold text-gray-900">{coach.students?.items?.length || 0}</div>
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
              <div className="text-2xl font-bold text-gray-900">
                ${getTotalRevenue().toLocaleString()}
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
              <div className="text-2xl font-bold text-gray-900">
                {coach.students?.items?.reduce((total, student) => 
                  total + (student.student?.items?.length || 0), 0) || 0}
              </div>
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
              <div className="text-2xl font-bold text-gray-900">
                ${coach.students?.items?.length > 0 
                  ? Math.round(getTotalRevenue() / coach.students.items.length).toLocaleString()
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
                <CardTitle className="text-lg font-semibold text-gray-900">Alerts</CardTitle>
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
                        <p className="font-medium text-gray-900">{student.firstName} {student.lastName}: No weekly report submitted in the last 7 days.</p>
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
                <CardTitle className="text-lg font-semibold text-gray-900">My Students</CardTitle>
                <CardDescription className="text-gray-600">Manage your assigned students and their progress</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coach.students?.items?.map((student) => {
                const reports = student.student?.items || [];
                const totalRevenue = getStudentTotalRevenue(student);
                const avgRevenue = reports.length > 0 ? totalRevenue / reports.length : 0;
                const recentReports = reports.filter(r => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
                const activityLevel = Math.min(Math.max(recentReports * 50, 20), 100);
                
                return (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.firstName} {student.lastName}</h3>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                          {recentReports === 0 ? 'Inactive' : 'Active'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => handleViewStudentProfile(student.id)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Reports</p>
                        <p className="font-semibold text-gray-900">{reports.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Recent Reports</p>
                        <p className="font-semibold text-gray-900">{recentReports}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Avg Revenue</p>
                        <p className="font-semibold text-gray-900">${Math.round(avgRevenue).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Activity Level</span>
                        <span className="text-sm font-medium text-gray-900">{activityLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${activityLevel}%` }}
                        ></div>
                      </div>
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
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Weekly Reports</CardTitle>
            <CardDescription className="text-gray-600">Latest submissions from your students</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Recent Weekly Reports</TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reports" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Latest submissions from your students</h3>
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
                      {coach.students?.items?.flatMap(student => 
                        student.student?.items?.map(report => ({ student, report })) || []
                      ).slice(0, 5).map(({ student, report }) => (
                        <TableRow key={report.id} className="border-gray-200">
                          <TableCell className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-900">${report.revenue?.toLocaleString() || '0'}</TableCell>
                          <TableCell className="text-gray-900">${report.net_profit?.toLocaleString() || '0'}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-blue-600 text-white">Submitted</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Student performance metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coach.students?.items?.map((student) => {
                      const reports = student.student?.items || [];
                      const totalRevenue = getStudentTotalRevenue(student);
                      const totalProfit = getStudentTotalProfit(student);
                      const totalShoots = getStudentTotalShoots(student);
                      
                      return (
                        <Card key={student.id} className="bg-white border border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-sm text-gray-900">{student.firstName} {student.lastName}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Revenue</span>
                                <span className="text-sm font-medium text-gray-900">${totalRevenue.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Net Profit</span>
                                <span className="text-sm font-medium text-gray-900">${totalProfit.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Shoots</span>
                                <span className="text-sm font-medium text-gray-900">{totalShoots}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Reports</span>
                                <span className="text-sm font-medium text-gray-900">{reports.length}</span>
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
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
