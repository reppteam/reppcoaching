import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User, WeeklyReport, Goal, Lead } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { EditCoachingTermDialog } from './EditCoachingTermDialog';
import { KPIDashboard } from './KPIDashboard';
import { UserManagement } from './UserManagement';
import { WeekTracker } from './WeekTracker';
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
  GraduationCap
} from 'lucide-react';

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [allReports, setAllReports] = useState<WeeklyReport[]>([]);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // User management state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [coachingTermDialogOpen, setCoachingTermDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user || user.role !== 'super_admin') return;
    
    setLoading(true);
    try {
      const [usersData, reportsData, goalsData, leadsData] = await Promise.all([
        eightbaseService.getAllUsersWithDetails(),
        eightbaseService.getAllWeeklyReports(),
        eightbaseService.getAllGoals(),
        eightbaseService.getAllLeads()
      ]);
      
      setUsers(usersData);
      setAllReports(reportsData);
      setAllGoals(goalsData);
      setAllLeads(leadsData);
    } catch (error) {
      console.error('Failed to load super admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoach = async (studentId: string, coachId: string | null) => {
    try {
      await eightbaseService.assignStudentToCoach(studentId, coachId);
      await loadData();
    } catch (error) {
      console.error('Failed to assign coach:', error);
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const openCoachingTermDialog = (user: User) => {
    setEditingUser(user);
    setCoachingTermDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading super admin dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const students = users.filter(u => u.role === 'user');
  const coaches = users.filter(u => u.role === 'coach_manager' || u.role === 'coach');
  const paidStudents = students.filter(s => s.has_paid);
  const freeStudents = students.filter(s => !s.has_paid);
  const totalRevenue = allReports.reduce((sum, report) => sum + report.revenue, 0);
  const totalLeads = allLeads.length;
  const activeStudents = students.filter(student => {
    const hasRecentReport = allReports.some(r => r.user_id === student.id);
    const hasRecentActivity = allLeads.some(l => l.user_id === student.id);
    return hasRecentReport || hasRecentActivity;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-brand-blue" />
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          System-wide management and analytics for Real Estate Photographer Pro
        </p>
      </div>

      {/* Platform Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-brand-blue opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Coaches</p>
                <p className="text-2xl font-bold text-purple-600">{coaches.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeStudents}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-emerald-600">{paidStudents.length}</p>
              </div>
              <Crown className="h-8 w-8 text-emerald-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-orange-600">{totalLeads}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-green-600">${Math.round(totalRevenue / 1000)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="kpis">Performance KPIs</TabsTrigger>
          <TabsTrigger value="coaches">Coach Analytics</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Paid Students</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-emerald-100 text-emerald-800">{paidStudents.length}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((paidStudents.length / students.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Free Students</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gray-100 text-gray-800">{freeStudents.length}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((freeStudents.length / students.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Students</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">{activeStudents}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((activeStudents / students.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Coaches</span>
                    <Badge className="bg-purple-100 text-purple-800">{coaches.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Revenue</span>
                    <span className="font-bold text-green-600">
                      ${totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Revenue/Student</span>
                    <span className="font-bold">
                      ${Math.round(totalRevenue / students.length).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Leads Generated</span>
                    <span className="font-bold text-orange-600">{totalLeads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Leads/Student</span>
                    <span className="font-bold">
                      {(totalLeads / students.length).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coach Distribution</CardTitle>
                <CardDescription>
                  Student assignments across coaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coaches.map(coach => {
                    const assignedStudents = students.filter(s => s.assigned_admin_id === coach.id);
                    return (
                      <div key={coach.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{coach.name}</div>
                          <div className="text-sm text-muted-foreground">{coach.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {assignedStudents.length > 0 ? (
                              `Active Students: ${assignedStudents.filter(s => {
                                const startDate = s.has_paid ? s.access_start : s.coaching_term_start;
                                return startDate && new Date(startDate) <= new Date();
                              }).length}`
                            ) : (
                              'No students assigned'
                            )}
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {assignedStudents.length} students
                        </Badge>
                      </div>
                    );
                  })}
                  {/* Unassigned students */}
                  <div className="flex items-center justify-between p-2 border rounded bg-orange-50">
                    <div>
                      <div className="font-medium">Unassigned</div>
                      <div className="text-sm text-muted-foreground">No coach assigned</div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {students.filter(s => !s.assigned_admin_id).length} students
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-6">
          <KPIDashboard showCoachSummary={false} />
        </TabsContent>

        {/* Coaches Tab */}
        <TabsContent value="coaches" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coaches.map(coach => {
              const coachStudents = students.filter(s => s.assigned_admin_id === coach.id);
              const coachReports = allReports.filter(r => 
                coachStudents.some(s => s.id === r.user_id)
              );
              const coachLeads = allLeads.filter(l => 
                coachStudents.some(s => s.id === l.user_id)
              );
              const coachRevenue = coachReports.reduce((sum, r) => sum + r.revenue, 0);
              
              return (
                <Card key={coach.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      {coach.name}
                    </CardTitle>
                    <CardDescription>{coach.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{coachStudents.length}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          ${Math.round(coachRevenue / 1000)}k
                        </div>
                        <div className="text-xs text-muted-foreground">Student Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">{coachLeads.length}</div>
                        <div className="text-xs text-muted-foreground">Student Leads</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">{coachReports.length}</div>
                        <div className="text-xs text-muted-foreground">Reports</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab('kpis')}>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        View KPIs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Platform-wide settings and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Platform Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">User Registration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Control how new users can join the platform
                        </p>
                        <Select defaultValue="admin-only">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin-only">Admin Only</SelectItem>
                            <SelectItem value="invite-only">Invite Only</SelectItem>
                            <SelectItem value="open">Open Registration</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Default Coaching Term</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Default length for free coaching programs
                        </p>
                        <Select defaultValue="6-months">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3-months">3 Months</SelectItem>
                            <SelectItem value="6-months">6 Months</SelectItem>
                            <SelectItem value="12-months">12 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Platform Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{allReports.length}</div>
                      <div className="text-sm text-muted-foreground">Total Reports</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{allLeads.length}</div>
                      <div className="text-sm text-muted-foreground">Total Leads</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">${Math.round(totalRevenue / 1000)}k</div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User - {editingUser?.name}</DialogTitle>
            <DialogDescription>
              Update user account settings and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              User management features will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setUserDialogOpen(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coaching Term Dialog */}
      {editingUser && (
        <EditCoachingTermDialog
          // open={coachingTermDialogOpen}
          // onOpenChange={setCoachingTermDialogOpen}
          user={editingUser}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}