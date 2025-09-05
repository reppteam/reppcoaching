import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Trash2,
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Target, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  UserCheck,
  UserX,
  TrendingUp,
  BarChart3,
  FileText,
  Activity
} from 'lucide-react';

interface CoachProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profileImage?: {
    downloadUrl: string;
  };
  users: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    roles: {
      items: Array<{
        id: string;
        name: string;
      }>;
    };
  };
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    business_name: string;
    location: string;
    target_market: string;
    strengths: string;
    challenges: string;
    goals: string;
    preferred_contact_method: string;
    availability: string;
    notes: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CoachFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}

export function CoachProfileDashboard() {
  const { user } = useAuth();
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<CoachFormData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadCoachProfile();
    }
  }, [user]);

  const loadCoachProfile = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const coach = await eightbaseService.getCoachByEmail(user.email);
      if (coach) {
        setCoachProfile(coach);
        setFormData({
          firstName: coach.firstName,
          lastName: coach.lastName,
          email: coach.email,
          bio: coach.bio
        });
      }
    } catch (error) {
      console.error('Failed to load coach profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (coachProfile) {
      setFormData({
        firstName: coachProfile.firstName,
        lastName: coachProfile.lastName,
        email: coachProfile.email,
        bio: coachProfile.bio
      });
    }
  };

  const handleSave = async () => {
    if (!coachProfile) return;

    try {
      setUpdateLoading(true);
      const updatedCoach = await eightbaseService.updateCoachDirect(coachProfile.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        bio: formData.bio
      });

      setCoachProfile(updatedCoach);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update coach profile:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!coachProfile) return;

    try {
      const success = await eightbaseService.deleteCoach(coachProfile.id);
      if (success) {
        // Redirect to home or show success message
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to delete coach profile:', error);
    }
  };

  const getStudentCount = () => {
    return coachProfile?.students?.length || 0;
  };

  const getCoachStatus = () => {
    return coachProfile?.users?.status || 'Unknown';
  };

  const getCoachRole = () => {
    return coachProfile?.users?.roles?.items?.[0]?.name || 'Coach';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your coach profile...</p>
        </div>
      </div>
    );
  }

  if (!coachProfile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Coach Profile Not Found</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find a coach profile associated with your account.
        </p>
        <Button onClick={loadCoachProfile} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Coach Profile</h2>
          <p className="text-muted-foreground">
            Manage your coach profile and view your students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadCoachProfile} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {!editing ? (
            <Button onClick={handleEdit} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={updateLoading}>
                {updateLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={getCoachStatus() === 'active' ? 'default' : 'secondary'}>
              {getCoachStatus()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{getCoachRole()}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStudentCount()}</div>
            <p className="text-xs text-muted-foreground">Assigned students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(coachProfile.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">Coach since</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="students">My Students ({getStudentCount()})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your coach profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editing}
                  rows={4}
                  placeholder="Tell us about yourself as a coach..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Coach Profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Coach Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your coach profile? This action cannot be undone 
                      and will remove all associated data including student assignments.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete Profile
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {coachProfile.students && coachProfile.students.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Students</CardTitle>
                <CardDescription>
                  Students currently assigned to you for coaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Assigned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coachProfile.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3" />
                                {student.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.business_name && (
                              <div className="font-medium text-sm">
                                {student.business_name}
                              </div>
                            )}
                            {student.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {student.location}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {student.goals ? (
                              <div className="max-w-xs truncate" title={student.goals}>
                                {student.goals}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No goals set</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Students Assigned</h3>
                <p className="text-muted-foreground">
                  You don't have any students assigned to you yet. Contact your administrator to get students assigned.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
