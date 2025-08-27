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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      loadDashboardData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dynamic dashboard data...');
      
      // Fetch all users dynamically
      console.log('About to fetch users...');
      let fetchedUsers: User[] = [];
      try {
        fetchedUsers = await eightbaseService.getUsers();
        console.log('Fetched users:', fetchedUsers);
        console.log('Fetched users length:', fetchedUsers.length);
        console.log('Fetched users type:', typeof fetchedUsers);
        console.log('Is fetchedUsers an array?', Array.isArray(fetchedUsers));
      } catch (userError) {
        console.error('Error fetching users:', userError);
        fetchedUsers = [];
      }
      setUsers(fetchedUsers);
      
      // Fetch all leads dynamically
      const leads = await eightbaseService.getLeads();
      console.log('Fetched leads:', leads.length);
      
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
        console.log('Fetched pricing packages:', pricingPackages.length);
        
        if (pricingPackages.length > 0) {
          // Calculate average price from all active pricing packages
          const activePackages = pricingPackages.filter(pkg => pkg.status === 'active');
          
          if (activePackages.length > 0) {
            const totalPackagePrices = activePackages.reduce((sum, pkg) => sum + pkg.price, 0);
            const avgPackagePrice = totalPackagePrices / activePackages.length;
            
            // Calculate revenue based on actual average pricing from Pricing Management
            totalRevenue = paidStudents.length * avgPackagePrice;
            avgRevenuePerStudent = paidStudents.length > 0 ? totalRevenue / paidStudents.length : avgPackagePrice;
            
            console.log('Revenue calculation from Pricing Management:', {
              activePackages: activePackages.length,
              avgPackagePrice: avgPackagePrice,
              paidStudents: paidStudents.length,
              totalRevenue: totalRevenue,
              pricingPackages: activePackages.map(pkg => ({ name: pkg.name, price: pkg.price }))
            });
          } else {
            // No active packages, use average of all packages
            const totalPackagePrices = pricingPackages.reduce((sum, pkg) => sum + pkg.price, 0);
            const avgPackagePrice = totalPackagePrices / pricingPackages.length;
            
            totalRevenue = paidStudents.length * avgPackagePrice;
            avgRevenuePerStudent = paidStudents.length > 0 ? totalRevenue / paidStudents.length : avgPackagePrice;
            
            console.log('Revenue calculation (no active packages):', {
              totalPackages: pricingPackages.length,
              avgPackagePrice: avgPackagePrice,
              paidStudents: paidStudents.length,
              totalRevenue: totalRevenue
            });
          }
        } else {
          // Fallback if no pricing packages found
          totalRevenue = 0;
          avgRevenuePerStudent = 0;
          console.log('No pricing packages found in Pricing Management, using fallback values');
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
      
      console.log('Calculated stats:', {
        totalUsers: fetchedUsers.length,
        students: students.length,
        coaches: coaches.length,
        activeStudents: activeStudents.length,
        paidStudents: paidStudents.length,
        totalLeads: totalLeadsGenerated,
        revenue: totalRevenue
      });
      
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
      
      console.log('Final stats being set:', finalStats);
      console.log('Revenue value:', finalStats.revenue, 'Type:', typeof finalStats.revenue);
      
      setStats(finalStats);
      
      setLastUpdated(new Date());
      console.log('Dashboard data updated at:', new Date().toLocaleTimeString());
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
          <span>Loading dashboard data...</span>
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
                      <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
        </div>
        <Button 
          onClick={loadDashboardData} 
          disabled={loading}
          className="flex items-center gap-2"
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
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
                <div className="text-2xl font-bold">{stats.students}</div>
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
                <div className="text-2xl font-bold">{stats.coaches}</div>
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
                <div className="text-2xl font-bold">{stats.active}</div>
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
                <div className="text-2xl font-bold">{stats.paid}</div>
                <div className="text-sm text-muted-foreground">Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <div className="text-sm text-muted-foreground">Total Leads</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
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
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="performance">Performance KPIs</TabsTrigger>
          <TabsTrigger value="system-settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Platform Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Paid Students</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.paidStudents}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stats.students > 0 ? Math.round((stats.paidStudents / stats.students) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Free Students</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.freeStudents}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stats.students > 0 ? Math.round((stats.freeStudents / stats.students) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Students</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.activeStudents}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stats.students > 0 ? Math.round((stats.activeStudents / stats.students) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Coaches</span>
                  <span className="font-semibold">{stats.totalCoaches}</span>
                </div>
              </CardContent>
            </Card>

            {/* Platform Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Platform Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold">${stats.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Revenue/Student</span>
                  <span className="font-semibold">${stats.avgRevenuePerStudent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Leads Generated</span>
                  <span className="font-semibold">{stats.totalLeadsGenerated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Leads/Student</span>
                  <span className="font-semibold">{stats.avgLeadsPerStudent}</span>
                </div>
              </CardContent>
            </Card>

            {/* Coach Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coach Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
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

        {/* Performance KPIs Tab */}
        <TabsContent value="performance" className="space-y-6">
          <KPIDashboard />
        </TabsContent>



        {/* System Settings Tab */}
        <TabsContent value="system-settings" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                        <Badge variant="secondary">{users.filter(u => u.role === 'super_admin').length}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-muted rounded">
                        <span className="text-sm text-foreground">Coach Managers</span>
                        <Badge variant="secondary">{users.filter(u => u.role === 'coach_manager').length}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-muted rounded">
                        <span className="text-sm text-foreground">Coaches</span>
                        <Badge variant="secondary">{users.filter(u => u.role === 'coach').length}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-muted rounded">
                        <span className="text-sm text-foreground">Students</span>
                        <Badge variant="secondary">{users.filter(u => u.role === 'user').length}</Badge>
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