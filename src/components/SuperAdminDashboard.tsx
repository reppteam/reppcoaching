import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import {
  Users,
  GraduationCap,
  UserCheck,
  TrendingUp,
  Crown,
  Target,
  DollarSign,
  BarChart3,
  Shield,
  Settings,
  Activity,
  UserPlus,
  Calendar,
  Award,
  PieChart,
  LineChart
} from 'lucide-react';
import { eightbaseService } from '../services/8baseService';
import { User } from '../types';
import { UserManagement } from './UserManagement';
import { KPIDashboard } from './KPIDashboard';

// Helper function to get ISO 8601 week number
function getISOWeekNumber(date: Date): string {
  const tempDate = new Date(date.getTime());
  const dayNum = (date.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNum + 3);
  const firstThursday = tempDate.getTime();
  tempDate.setMonth(0, 1);
  if (tempDate.getDay() !== 4) {
    tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
  }
  return String(1 + Math.ceil((firstThursday - tempDate.getTime()) / 604800000));
}

interface DashboardStats {
  totalUsers: number;
  students: number;
  coaches: number;
  active: number;
  paid: number;
  totalLeads: number;
  revenue: number;
  paidStudents: number;
  freeStudents: number;
  activeStudents: number;
  totalCoaches: number;
  avgRevenuePerStudent: number;
  totalLeadsGenerated: number;
  avgLeadsPerStudent: number;
  unassignedStudents: number;
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    students: 0,
    coaches: 0,
    active: 0,
    paid: 0,
    totalLeads: 0,
    revenue: 0,
    paidStudents: 0,
    freeStudents: 0,
    activeStudents: 0,
    totalCoaches: 0,
    avgRevenuePerStudent: 0,
    totalLeadsGenerated: 0,
    avgLeadsPerStudent: 0,
    unassignedStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []); // Empty dependency array - only runs once on mount

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users dynamically
      console.log('About to fetch users...');
      let fetchedUsers: User[] = [];
      try {
        fetchedUsers = await eightbaseService.getUsers();
        
      } catch (userError) {
        console.error('Error fetching users:', userError);
        fetchedUsers = [];
      }
      setUsers(fetchedUsers);
      
      // Fetch all leads dynamically
      const leads = await eightbaseService.getLeads();
      
      // Calculate dynamic statistics based on actual data
      const students = fetchedUsers.filter(user => user.role === 'user');
      const coaches = fetchedUsers.filter(user => user.role === 'coach');
      const coachManagers = fetchedUsers.filter(user => user.role === 'coach_manager');
      const superAdmins = fetchedUsers.filter(user => user.role === 'super_admin');
      
      // Dynamic active status calculation
      const activeStudents = students.filter(student => student.is_active === true);
      const paidStudents = students.filter(student => student.has_paid === true);
      const freeStudents = students.filter(student => student.has_paid === false);
      const unassignedStudents = students.filter(student => !student.assignedCoach);
      
      // Dynamic revenue calculation based on actual pricing data from Pricing Management
      let totalRevenue = 0;
      let avgRevenuePerStudent = 0;
      
      try {
        // Fetch all pricing packages to calculate real revenue
        const pricingPackages = await eightbaseService.getCoachPricing();
        if (pricingPackages.length > 0) {
          // Calculate average price from all active pricing packages
          const activePackages = pricingPackages.filter(pkg => pkg.status === 'active');
          
          if (activePackages.length > 0) {
            const totalPackagePrices = activePackages.reduce((sum, pkg) => sum + pkg.price, 0);
            const avgPackagePrice = totalPackagePrices / activePackages.length;
            
            // Calculate revenue based on actual average pricing from Pricing Management
            totalRevenue = paidStudents.length * avgPackagePrice;
            avgRevenuePerStudent = paidStudents.length > 0 ? totalRevenue / paidStudents.length : avgPackagePrice;
            
            
          } else {
            // No active packages, use average of all packages
            const totalPackagePrices = pricingPackages.reduce((sum, pkg) => sum + pkg.price, 0);
            const avgPackagePrice = totalPackagePrices / pricingPackages.length;
            
            totalRevenue = paidStudents.length * avgPackagePrice;
            avgRevenuePerStudent = paidStudents.length > 0 ? totalRevenue / paidStudents.length : avgPackagePrice;
            
          }
        } else {
          // Fallback if no pricing packages found
          totalRevenue = 0;
          avgRevenuePerStudent = 0;
        }
      } catch (error) {
        console.error('Error fetching pricing data for revenue calculation:', error);
        // Fallback to zero if pricing fetch fails
        totalRevenue = 0;
        avgRevenuePerStudent = 0;
      }
      
      // Dynamic leads statistics
      const totalLeadsGenerated = leads.length;
      const avgLeadsPerStudent = students.length > 0 ? totalLeadsGenerated / students.length : 0;
      
      // Calculate total active users (all roles)
      const totalActiveUsers = fetchedUsers.filter(user => user.is_active === true).length;
      
      
      
      const finalStats = {
        totalUsers: fetchedUsers.length,
        students: students.length,
        coaches: coaches.length,
        active: totalActiveUsers, // Dynamic active count
        paid: paidStudents.length,
        totalLeads: totalLeadsGenerated,
        revenue: totalRevenue,
        paidStudents: paidStudents.length,
        freeStudents: freeStudents.length,
        activeStudents: activeStudents.length,
        totalCoaches: coaches.length,
        avgRevenuePerStudent: Math.round(avgRevenuePerStudent),
        totalLeadsGenerated,
        avgLeadsPerStudent: Math.round(avgLeadsPerStudent * 10) / 10,
        unassignedStudents: unassignedStudents.length
      };
      
      
      setStats(finalStats);
      
      setLastUpdated(new Date());
        } catch (error) {
      console.error('Error loading dynamic dashboard data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      // Set default values if there's an error
      setStats({
        totalUsers: 0,
        students: 0,
        coaches: 0,
        active: 0,
        paid: 0,
        totalLeads: 0,
        revenue: 0,
        paidStudents: 0,
        freeStudents: 0,
        activeStudents: 0,
        totalCoaches: 0,
        avgRevenuePerStudent: 0,
        totalLeadsGenerated: 0,
        avgLeadsPerStudent: 0,
        unassignedStudents: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 animate-pulse text-blue-600" />
          <span className="text-black dark:text-white">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">System-wide management and analytics for Real Estate Photographer Pro</p>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            <p className="text-xs text-muted-foreground">
              ISO Week: {getISOWeekNumber(new Date())}
            </p>
          </div>
        </div>
        <Button 
          onClick={loadDashboardData} 
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2 text-black dark:text-white"
        >
          <Activity className="h-4 w-4" />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.students}</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.coaches}</div>
                <div className="text-sm text-muted-foreground">Coaches</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.paid}</div>
                <div className="text-sm text-muted-foreground">FRWRD Capacity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalLeads}</div>
                <div className="text-sm text-muted-foreground">LAUNCH Capacity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.revenue >= 1000 
                    ? `$${(stats.revenue / 1000).toFixed(1)}k` 
                    : `$${stats.revenue.toLocaleString()}`
                  }
                </div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance KPIs</TabsTrigger>
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="system-settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Performance KPIs Tab */}
        <TabsContent value="performance" className="space-y-6">
          <KPIDashboard />
        </TabsContent>

        {/* Platform Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Capacity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LAUNCH Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Target className="h-5 w-5 text-red-600" />
                  LAUNCH Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Students</span>
                  <span className="font-semibold text-foreground">
                    {users.filter(u => u.role === 'user' && (u as any).coachType === 'LAUNCH').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Capacity</span>
                  <span className="font-semibold text-foreground">
                    {users.filter(u => u.role === 'coach' && (u as any).coachType === 'LAUNCH').reduce((total, coach) => total + ((coach as any).maxCapacity || 50), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Spots</span>
                  <span className="font-semibold text-green-600">
                    {users.filter(u => u.role === 'coach' && (u as any).coachType === 'LAUNCH').reduce((total, coach) => total + ((coach as any).maxCapacity || 50), 0) - users.filter(u => u.role === 'user' && (u as any).program === 'LAUNCH').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* FRWRD Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  FRWRD Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Students</span>
                  <span className="font-semibold text-foreground">
                    {users.filter(u => u.role === 'user' && (u as any).coachType === 'FRWRD').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Capacity</span>
                  <span className="font-semibold text-foreground">
                    {users.filter(u => u.role === 'coach' && (u as any).coachType === 'FRWRD').reduce((total, coach) => total + ((coach as any).maxCapacity || 50), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Spots</span>
                  <span className="font-semibold text-green-600">
                    {users.filter(u => u.role === 'coach' && (u as any).coachType === 'FRWRD').reduce((total, coach) => total + ((coach as any).maxCapacity || 50), 0) - users.filter(u => u.role === 'user' && (u as any).program === 'FRWRD').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <PieChart className="h-5 w-5" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Paid Users</span>
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <span className="font-semibold text-foreground">{stats.paidStudents}</span>
                    <Badge variant="secondary" className="text-xs dark:bg-primary dark:text-white">
                      {stats.students > 0 ? Math.round((stats.paidStudents / stats.students) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Students (In Coaching)</span>
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <span className="font-semibold text-foreground">{stats.activeStudents}</span>
                    <Badge variant="secondary" className="text-xs dark:bg-primary dark:text-white">
                      {stats.students > 0 ? Math.round((stats.activeStudents / stats.students) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Coaches</span>
                  <span className="font-semibold text-foreground">{stats.totalCoaches}</span>
                </div>
              </CardContent>
            </Card>


            {/* Coach Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Users className="h-5 w-5" />
                  Coach Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Individual Coach Display */}
                {users.filter(u => u.role === 'coach').map((coach) => {
                  const assignedStudents = users.filter(u => u.role === 'user' && u.assignedCoach?.id === coach.id).length;
                  const maxCapacity = (coach as any).maxCapacity || 50; // Default capacity if not set
                  const utilizationPercent = Math.round((assignedStudents / maxCapacity) * 100);
                  
                  return (
                    <div key={coach.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {coach.firstName} {coach.lastName}
                        </span>
                        <Badge 
                          variant={utilizationPercent >= 90 ? "destructive" : utilizationPercent >= 75 ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {assignedStudents}/{maxCapacity}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {assignedStudents} students assigned
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {utilizationPercent}% capacity
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Unassigned Students */}
                <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Unassigned</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                      {stats.unassignedStudents} students
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">No coach assigned</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="user-management" className="space-y-6">
          <UserManagement />
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system-settings" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Role Management</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-muted rounded">
                        <span className="text-sm text-foreground">Super Admins</span>
                        <Badge variant="secondary" className="dark:bg-primary dark:text-white">{users.filter(u => u.role === 'super_admin').length}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-muted rounded">
                        <span className="text-sm text-foreground">Coach Managers</span>
                        <Badge variant="secondary" className="dark:bg-primary dark:text-white">{users.filter(u => u.role === 'coach_manager').length}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-muted rounded">
                        <span className="text-sm text-foreground">Coaches</span>
                        <Badge variant="secondary" className="dark:bg-primary dark:text-white">{users.filter(u => u.role === 'coach').length}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-muted rounded">
                        <span className="text-sm text-foreground">Students</span>
                        <Badge variant="secondary" className="dark:bg-primary dark:text-white">{users.filter(u => u.role === 'user').length}</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <span className="text-sm text-green-800 dark:text-green-200">Database Connection</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <span className="text-sm text-green-800 dark:text-green-200">API Status</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                        <span className="text-sm text-blue-800 dark:text-blue-200">Last Updated</span>
                        <span className="text-xs text-blue-600 dark:text-blue-300">{lastUpdated.toLocaleString()}</span>
                      </div>
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