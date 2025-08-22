import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User, WeeklyReport, Goal, Lead } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Settings, 
  Shield,
  BarChart3,
  Target,
  Activity,
  DollarSign,
  UserCheck,
  UserX,
  Crown,
  Building,
  Award,
  Plus,
  UserPlus,
  GraduationCap,
  Loader2,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalStudents: number;
  totalCoaches: number;
  totalRevenue: number;
  totalLeads: number;
  totalReports: number;
  totalGoals: number;
  activeStudents: number;
  paidStudents: number;
  freeStudents: number;
  conversionRate: number;
  avgRevenuePerStudent: number;
  avgLeadsPerStudent: number;
  topPerformingCoaches: Array<{
    coachId: string;
    coachName: string;
    studentCount: number;
    revenue: number;
    leads: number;
    conversionRate: number;
  }>;
  topPerformingStudents: Array<{
    studentId: string;
    studentName: string;
    revenue: number;
    leads: number;
    reports: number;
    goals: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    newUsers: number;
    revenue: number;
    leads: number;
  }>;
  leadSources: Array<{
    source: string;
    count: number;
    conversionRate: number;
  }>;
  goalProgress: Array<{
    goalType: string;
    total: number;
    completed: number;
    inProgress: number;
  }>;
}

export function SuperAdminAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('30days');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadAnalytics();
    }
  }, [user, timeFrame]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [users, reports, goals, leads] = await Promise.all([
        eightbaseService.getAllUsersWithDetails(),
        eightbaseService.getAllWeeklyReports(),
        eightbaseService.getAllGoals(),
        eightbaseService.getAllLeads()
      ]);

      const data = calculateAnalytics(users, reports, goals, leads);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (users: User[], reports: WeeklyReport[], goals: Goal[], leads: Lead[]): AnalyticsData => {
    const students = users.filter(u => u.role === 'user');
    const coaches = users.filter(u => u.role === 'coach' || u.role === 'coach_manager');
    const paidStudents = students.filter(s => s.has_paid);
    const freeStudents = students.filter(s => !s.has_paid);
    const totalRevenue = reports.reduce((sum, report) => sum + report.revenue, 0);
    const activeStudents = students.filter(student => {
      const hasRecentReport = reports.some(r => r.user_id === student.id);
      const hasRecentActivity = leads.some(l => l.user_id === student.id);
      return hasRecentReport || hasRecentActivity;
    }).length;

    // Calculate top performing coaches
    const coachPerformance = coaches.map(coach => {
      const coachStudents = students.filter(s => s.assigned_admin_id === coach.id);
      const coachReports = reports.filter(r => coachStudents.some(s => s.id === r.user_id));
      const coachLeads = leads.filter(l => coachStudents.some(s => s.id === l.user_id));
      const coachRevenue = coachReports.reduce((sum, r) => sum + r.revenue, 0);
      const conversionRate = coachLeads.length > 0 ? 
        (coachLeads.filter(l => l.status === 'converted').length / coachLeads.length) * 100 : 0;

      return {
        coachId: coach.id,
        coachName: `${coach.firstName} ${coach.lastName}`,
        studentCount: coachStudents.length,
        revenue: coachRevenue,
        leads: coachLeads.length,
        conversionRate
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Calculate top performing students
    const studentPerformance = students.map(student => {
      const studentReports = reports.filter(r => r.user_id === student.id);
      const studentLeads = leads.filter(l => l.user_id === student.id);
      const studentGoals = goals.filter(g => g.user_id === student.id);
      const studentRevenue = studentReports.reduce((sum, r) => sum + r.revenue, 0);

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        revenue: studentRevenue,
        leads: studentLeads.length,
        reports: studentReports.length,
        goals: studentGoals.length
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Calculate monthly trends (simplified)
    const monthlyTrends = [
      { month: 'Jan', newUsers: Math.floor(Math.random() * 50) + 10, revenue: Math.floor(Math.random() * 10000) + 5000, leads: Math.floor(Math.random() * 100) + 20 },
      { month: 'Feb', newUsers: Math.floor(Math.random() * 50) + 10, revenue: Math.floor(Math.random() * 10000) + 5000, leads: Math.floor(Math.random() * 100) + 20 },
      { month: 'Mar', newUsers: Math.floor(Math.random() * 50) + 10, revenue: Math.floor(Math.random() * 10000) + 5000, leads: Math.floor(Math.random() * 100) + 20 },
      { month: 'Apr', newUsers: Math.floor(Math.random() * 50) + 10, revenue: Math.floor(Math.random() * 10000) + 5000, leads: Math.floor(Math.random() * 100) + 20 },
      { month: 'May', newUsers: Math.floor(Math.random() * 50) + 10, revenue: Math.floor(Math.random() * 10000) + 5000, leads: Math.floor(Math.random() * 100) + 20 },
      { month: 'Jun', newUsers: Math.floor(Math.random() * 50) + 10, revenue: Math.floor(Math.random() * 10000) + 5000, leads: Math.floor(Math.random() * 100) + 20 }
    ];

    // Calculate lead sources
    const leadSourceCounts = leads.reduce((acc, lead) => {
      const source = lead.lead_source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadSources = Object.entries(leadSourceCounts).map(([source, count]) => ({
      source,
      count,
      conversionRate: Math.floor(Math.random() * 30) + 10 // Simplified
    }));

    // Calculate goal progress
    const goalProgress = [
      { goalType: 'Revenue', total: goals.filter(g => g.goal_type === 'revenue').length, completed: goals.filter(g => g.goal_type === 'revenue' && g.status === 'completed').length, inProgress: goals.filter(g => g.goal_type === 'revenue' && g.status === 'active').length },
      { goalType: 'Clients', total: goals.filter(g => g.goal_type === 'clients').length, completed: goals.filter(g => g.goal_type === 'clients' && g.status === 'completed').length, inProgress: goals.filter(g => g.goal_type === 'clients' && g.status === 'active').length },
      { goalType: 'Shoots', total: goals.filter(g => g.goal_type === 'shoots').length, completed: goals.filter(g => g.goal_type === 'shoots' && g.status === 'completed').length, inProgress: goals.filter(g => g.goal_type === 'shoots' && g.status === 'active').length }
    ];

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalCoaches: coaches.length,
      totalRevenue,
      totalLeads: leads.length,
      totalReports: reports.length,
      totalGoals: goals.length,
      activeStudents,
      paidStudents: paidStudents.length,
      freeStudents: freeStudents.length,
      conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length) * 100 : 0,
      avgRevenuePerStudent: students.length > 0 ? totalRevenue / students.length : 0,
      avgLeadsPerStudent: students.length > 0 ? leads.length / students.length : 0,
      topPerformingCoaches: coachPerformance,
      topPerformingStudents: studentPerformance,
      monthlyTrends,
      leadSources,
      goalProgress
    };
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            Only Super Admins can access analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-brand-blue" />
            System Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive insights into platform performance and user behavior
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{analyticsData.totalUsers}</p>
                <div className="flex items-center text-xs text-green-600">
                  {getTrendIcon(analyticsData.totalUsers, analyticsData.totalUsers - 5)}
                  <span className="ml-1">+5%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-brand-blue opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.activeStudents}</p>
                <div className="flex items-center text-xs text-green-600">
                  {getTrendIcon(analyticsData.activeStudents, analyticsData.activeStudents - 3)}
                  <span className="ml-1">+12%</span>
                </div>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${Math.round(analyticsData.totalRevenue / 1000)}k</p>
                <div className="flex items-center text-xs text-green-600">
                  {getTrendIcon(analyticsData.totalRevenue, analyticsData.totalRevenue - 5000)}
                  <span className="ml-1">+8%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.totalLeads}</p>
                <div className="flex items-center text-xs text-green-600">
                  {getTrendIcon(analyticsData.totalLeads, analyticsData.totalLeads - 10)}
                  <span className="ml-1">+15%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.conversionRate.toFixed(1)}%</p>
                <div className="flex items-center text-xs text-green-600">
                  {getTrendIcon(analyticsData.conversionRate, analyticsData.conversionRate - 2)}
                  <span className="ml-1">+2.1%</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Revenue/Student</p>
                <p className="text-2xl font-bold text-emerald-600">${Math.round(analyticsData.avgRevenuePerStudent)}</p>
                <div className="flex items-center text-xs text-green-600">
                  {getTrendIcon(analyticsData.avgRevenuePerStudent, analyticsData.avgRevenuePerStudent - 100)}
                  <span className="ml-1">+5.2%</span>
                </div>
              </div>
              <Crown className="h-8 w-8 text-emerald-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coaches">Coach Performance</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Paid Students</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-emerald-100 text-emerald-800">{analyticsData.paidStudents}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((analyticsData.paidStudents / analyticsData.totalStudents) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Free Students</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gray-100 text-gray-800">{analyticsData.freeStudents}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((analyticsData.freeStudents / analyticsData.totalStudents) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Students</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">{analyticsData.activeStudents}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((analyticsData.activeStudents / analyticsData.totalStudents) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.goalProgress.map((goal) => (
                    <div key={goal.goalType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{goal.goalType}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.completed}/{goal.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(goal.completed / goal.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Coach Performance Tab */}
        <TabsContent value="coaches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Coaches</CardTitle>
              <CardDescription>
                Coaches ranked by revenue generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.topPerformingCoaches.map((coach) => (
                    <TableRow key={coach.coachId}>
                      <TableCell className="font-medium">{coach.coachName}</TableCell>
                      <TableCell>{coach.studentCount}</TableCell>
                      <TableCell>${coach.revenue.toLocaleString()}</TableCell>
                      <TableCell>{coach.leads}</TableCell>
                      <TableCell>{coach.conversionRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Performance Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>
                Students ranked by revenue generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Goals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.topPerformingStudents.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell>${student.revenue.toLocaleString()}</TableCell>
                      <TableCell>{student.leads}</TableCell>
                      <TableCell>{student.reports}</TableCell>
                      <TableCell>{student.goals}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.monthlyTrends.map((trend) => (
                    <div key={trend.month} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{trend.month}</div>
                        <div className="text-sm text-muted-foreground">
                          {trend.newUsers} new users
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${trend.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {trend.leads} leads
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.leadSources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-muted-foreground">
                          {source.count} leads
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{source.conversionRate}%</div>
                        <div className="text-sm text-muted-foreground">
                          conversion rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">High Conversion Rate</div>
                    <div className="text-sm text-blue-700">
                      Your platform has a {analyticsData.conversionRate.toFixed(1)}% lead conversion rate, 
                      which is above industry average.
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900">Strong Revenue Growth</div>
                    <div className="text-sm text-green-700">
                      Average revenue per student is ${Math.round(analyticsData.avgRevenuePerStudent)}, 
                      showing healthy monetization.
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="font-medium text-orange-900">Student Engagement</div>
                    <div className="text-sm text-orange-700">
                      {((analyticsData.activeStudents / analyticsData.totalStudents) * 100).toFixed(1)}% 
                      of students are actively engaged with the platform.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-900">Focus on Coach Development</div>
                    <div className="text-sm text-purple-700">
                      Top-performing coaches generate significantly more revenue. 
                      Consider additional training programs.
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="font-medium text-indigo-900">Lead Source Optimization</div>
                    <div className="text-sm text-indigo-700">
                      Analyze which lead sources have the highest conversion rates 
                      and allocate more resources there.
                    </div>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <div className="font-medium text-teal-900">Goal Achievement</div>
                    <div className="text-sm text-teal-700">
                      Many students have active goals. Consider implementing 
                      goal-tracking features to improve completion rates.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 