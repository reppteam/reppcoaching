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
      const usersData = await eightbaseService.getAllUsersWithDetails();
      setUsers(usersData);
      
      // Calculate metrics
      const students = usersData.filter(u => u.role === 'user');
      const coaches = usersData.filter(u => u.role === 'coach');
      const paidStudents = students.filter(s => s.has_paid);
      const activeStudents = students.filter(s => s.is_active !== false);
      
      const calculatedMetrics: KPIMetrics = {
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        totalCoaches: coaches.length,
        activeCoaches: coaches.filter(c => c.is_active !== false).length,
        paidStudents: paidStudents.length,
        unpaidStudents: students.length - paidStudents.length,
        studentsThisMonth: Math.floor(students.length * 0.3), // Mock data
        studentsLastMonth: Math.floor(students.length * 0.2), // Mock data
        averageWeekProgress: 65,
        completionRate: 78,
        revenueThisMonth: paidStudents.length * 299, // Mock pricing
        revenueLastMonth: Math.floor(paidStudents.length * 0.8) * 299
      };
      
      setMetrics(calculatedMetrics);
      
      // Generate mock activity data
      const mockActivityData: ActivityData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockActivityData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          newStudents: Math.floor(Math.random() * 5),
          activeStudents: Math.floor(Math.random() * 20) + 30,
          completedGoals: Math.floor(Math.random() * 15) + 5
        });
      }
      setActivityData(mockActivityData);
      
      // Calculate coach performance
      const coachPerf: CoachPerformance[] = coaches.map(coach => {
        const assignedStudents = students.filter(s => s.assigned_admin_id === coach.id);
        const activeAssigned = assignedStudents.filter(s => s.is_active !== false);
        return {
          coachId: coach.id,
          coachName: coach.name,
          assignedStudents: assignedStudents.length,
          activeStudents: activeAssigned.length,
          averageProgress: Math.floor(Math.random() * 30) + 60,
          completionRate: Math.floor(Math.random() * 20) + 70,
          engagement: Math.floor(Math.random() * 25) + 65
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
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">You don't have permission to view KPI data.</p>
        </div>
          </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading KPI dashboard...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">Unable to load KPI metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coachPerformance.map((coach) => (
                <Card key={coach.coachId}>
            <CardHeader>
                    <CardTitle className="text-lg">{coach.coachName}</CardTitle>
                    <CardDescription>Performance metrics</CardDescription>
            </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{coach.assignedStudents}</div>
                        <div className="text-xs text-muted-foreground">Assigned</div>
                          </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{coach.activeStudents}</div>
                        <div className="text-xs text-muted-foreground">Active</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-medium">{coach.averageProgress}%</span>
                      </div>
                      <Progress value={coach.averageProgress} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completion</span>
                        <span className="text-sm font-medium">{coach.completionRate}%</span>
                      </div>
                      <Progress value={coach.completionRate} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Engagement</span>
                        <span className="text-sm font-medium">{coach.engagement}%</span>
                      </div>
                      <Progress value={coach.engagement} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                ))}
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