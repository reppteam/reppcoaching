import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  GraduationCap,
  Shield,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Crown,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface KPIMetrics {
  totalStudents: number;
  activeStudents: number;
  totalCoaches: number;
  activeCoaches: number;
  paidStudents: number;
  unpaidStudents: number;
  studentsThisMonth: number;
  studentsLastMonth: number;
  averageWeekProgress: number;
  completionRate: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

interface ActivityData {
  date: string;
  newStudents: number;
  activeStudents: number;
  completedGoals: number;
}

interface CoachPerformance {
  coachId: string;
  coachName: string;
  assignedStudents: number;
  activeStudents: number;
  averageProgress: number;
  completionRate: number;
  engagement: number;
}

const COLORS = ['#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB'];

export function KPIDashboard({showCoachSummary = true}: {showCoachSummary?: boolean}) {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('30d');
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [coachPerformance, setCoachPerformance] = useState<CoachPerformance[]>([]);

  useEffect(() => {
    loadKPIData();
  }, [timeFrame]);

  const loadKPIData = async () => {
    setLoading(true);
    try {
      // Fetch all required data from 8base
      const [usersData, weeklyReports, goals] = await Promise.all([
        eightbaseService.getAllUsersWithDetails(),
        eightbaseService.getWeeklyReports(),
        eightbaseService.getGoals()
      ]);
      
      setUsers(usersData);
      
      // Calculate metrics from real data
      const students = usersData.filter(u => u.role === 'user');
      const coaches = usersData.filter(u => u.role === 'coach');
      const paidStudents = students.filter(s => s.has_paid);
      const activeStudents = students.filter(s => s.is_active !== false);
      
      // Calculate real time-based metrics
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const studentsThisMonth = students.filter(s => {
        const createdAt = new Date(s.created_at);
        return createdAt >= thisMonth;
      }).length;
      
      const studentsLastMonth = students.filter(s => {
        const createdAt = new Date(s.created_at);
        return createdAt >= lastMonth && createdAt < thisMonth;
      }).length;
      
      // Calculate revenue from weekly reports
      const thisMonthReports = weeklyReports.filter(report => {
        const reportDate = new Date(report.start_date);
        return reportDate >= thisMonth;
      });
      
      const lastMonthReports = weeklyReports.filter(report => {
        const reportDate = new Date(report.start_date);
        return reportDate >= lastMonth && reportDate < thisMonth;
      });
      
      const revenueThisMonth = thisMonthReports.reduce((total, report) => total + report.revenue, 0);
      const revenueLastMonth = lastMonthReports.reduce((total, report) => total + report.revenue, 0);
      
      // Calculate real progress metrics
      const activeStudentsPercentage = students.length > 0 ? Math.round((activeStudents.length / students.length) * 100) : 0;
      const completionRate = Math.round((paidStudents.length / students.length) * 100);
      
      const calculatedMetrics: KPIMetrics = {
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        totalCoaches: coaches.length,
        activeCoaches: coaches.filter(c => c.is_active !== false).length,
        paidStudents: paidStudents.length,
        unpaidStudents: students.length - paidStudents.length,
        studentsThisMonth: studentsThisMonth,
        studentsLastMonth: studentsLastMonth,
        averageWeekProgress: activeStudentsPercentage,
        completionRate: completionRate,
        revenueThisMonth: revenueThisMonth,
        revenueLastMonth: revenueLastMonth
      };
      
      setMetrics(calculatedMetrics);
      
      // Generate real activity data based on actual data
      const activityData: ActivityData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Count students created on this date
        const newStudentsOnDate = students.filter(s => {
          const createdAt = new Date(s.created_at);
          return createdAt.toDateString() === date.toDateString();
        }).length;
        
        // Count active students (students with recent activity)
        const activeStudentsOnDate = students.filter(s => {
          const createdAt = new Date(s.created_at);
          const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceCreation <= 30 && s.is_active !== false;
        }).length;
        
        // Count completed goals for this date
        const completedGoalsOnDate = goals.filter(g => {
          const completedDate = new Date(g.deadline);
          return completedDate.toDateString() === date.toDateString() && g.status === 'completed';
        }).length;
        
        activityData.push({
          date: dateStr,
          newStudents: newStudentsOnDate,
          activeStudents: activeStudentsOnDate,
          completedGoals: completedGoalsOnDate
        });
      }
      setActivityData(activityData);
      
      // Calculate real coach performance using weekly reports
      const coachPerf: CoachPerformance[] = coaches.map(coach => {
        const assignedStudents = students.filter(s => s.assigned_admin_id === coach.id);
        const activeAssigned = assignedStudents.filter(s => s.is_active !== false);
        const paidAssigned = assignedStudents.filter(s => s.has_paid);
        
        // Get coach's weekly reports
        const coachReports = weeklyReports.filter(report => {
          const student = students.find(s => s.id === report.user_id);
          return student && student.assigned_admin_id === coach.id;
        });
        
        // Calculate real metrics based on reports
        const totalRevenue = coachReports.reduce((sum, report) => sum + report.revenue, 0);
        const averageRevenue = coachReports.length > 0 ? totalRevenue / coachReports.length : 0;
        
        // Calculate progress based on active students vs total assigned
        const progressPercentage = assignedStudents.length > 0 ? Math.round((activeAssigned.length / assignedStudents.length) * 100) : 0;
        
        // Calculate completion rate based on paid students
        const completionPercentage = assignedStudents.length > 0 ? Math.round((paidAssigned.length / assignedStudents.length) * 100) : 0;
        
        // Calculate engagement based on students with recent reports
        const studentsWithReports = new Set(coachReports.map(r => r.user_id)).size;
        const engagementPercentage = assignedStudents.length > 0 ? Math.round((studentsWithReports / assignedStudents.length) * 100) : 0;
        
        return {
          coachId: coach.id,
          coachName: `${coach.firstName} ${coach.lastName}`,
          assignedStudents: assignedStudents.length,
          activeStudents: activeAssigned.length,
          averageProgress: progressPercentage,
          completionRate: completionPercentage,
          engagement: engagementPercentage
        };
      });
      setCoachPerformance(coachPerf);
      
    } catch (error) {
      console.error('Failed to load KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessKPIs = user?.role === 'super_admin' || user?.role === 'coach_manager';

  if (!canAccessKPIs) {
    return (
      <div className="flex items-center justify-center h-64">
                  <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">You don't have permission to view KPI data.</p>
          </div>
          </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 animate-pulse text-brand-blue" />
          <span className="text-black dark:text-white">Loading KPI dashboard...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
                  <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Data Available</h3>
            <p className="text-muted-foreground">Unable to load KPI metrics.</p>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-black dark:text-white">
            <BarChart3 className="h-6 w-6 text-brand-blue" />
            KPI Dashboard
          </h1>
          <p className="text-muted-foreground">
            Performance metrics and analytics overview
          </p>
        </div>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{metrics.totalStudents}</p>
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
                <p className="text-2xl font-bold text-green-600">{metrics.activeStudents}</p>
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
                <p className="text-2xl font-bold text-emerald-600">{metrics.paidStudents}</p>
              </div>
              <Crown className="h-8 w-8 text-emerald-600 opacity-60" />
                </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Coaches</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.totalCoaches}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue (30d)</p>
                <p className="text-2xl font-bold text-green-600">${metrics.revenueThisMonth.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.completionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="coaches">Coach Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
                <CardDescription>Breakdown of student types and status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid Students', value: metrics.paidStudents, color: '#10B981' },
                        { name: 'Free Students', value: metrics.unpaidStudents, color: '#6B7280' },
                        { name: 'Active Students', value: metrics.activeStudents, color: '#3B82F6' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                                             label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progress Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Weekly Progress</span>
                    <span className="text-sm text-muted-foreground">{metrics.averageWeekProgress}%</span>
                  </div>
                  <Progress value={metrics.averageWeekProgress} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm text-muted-foreground">{metrics.completionRate}%</span>
                  </div>
                  <Progress value={metrics.completionRate} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Student Growth</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.studentsThisMonth} this month
                    </span>
                  </div>
                  <Progress value={(metrics.studentsThisMonth / Math.max(metrics.totalStudents, 1)) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Daily activity metrics over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="activeStudents" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="newStudents" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="completedGoals" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coaches" className="space-y-6">
          {showCoachSummary && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Coach Performance</h3>
                  <p className="text-sm text-muted-foreground">Individual coach metrics and student management</p>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {coachPerformance.map((coach) => (
                  <Card key={coach.coachId} className="relative">
                    <CardContent className="pt-6">
                      {/* Engagement Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-100 text-green-800">
                          {coach.engagement}% engagement
                        </Badge>
                      </div>
                      
                      {/* Coach Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-semibold">{coach.coachName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {coach.assignedStudents} students assigned
                          </p>
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="space-y-4">
                        {/* Active Students */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Active Students</span>
                            <span className="text-sm text-muted-foreground">{coach.activeStudents}</span>
                          </div>
                          <Progress 
                            value={coach.assignedStudents > 0 ? (coach.activeStudents / coach.assignedStudents) * 100 : 0} 
                            className="h-2" 
                          />
                        </div>
                        
                        {/* Average Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Avg Progress</span>
                            <span className="text-sm text-muted-foreground">{coach.averageProgress}%</span>
                          </div>
                          <Progress value={coach.averageProgress} className="h-2" />
                        </div>
                        
                        {/* Completion Rate */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Completion Rate</span>
                            <span className="text-sm text-muted-foreground">{coach.completionRate}%</span>
                          </div>
                          <Progress value={coach.completionRate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue comparison</CardDescription>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={[
                  { month: 'Last Month', revenue: metrics.revenueLastMonth },
                  { month: 'This Month', revenue: metrics.revenueThisMonth }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}