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
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  MapPin,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';

interface Coach {
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

export function CoachManagement() {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState<Coach | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CoachFormData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    loadCoaches();
  }, []);

  useEffect(() => {
    filterCoaches();
  }, [coaches, searchTerm]);

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const allCoaches = await eightbaseService.getAllCoachesDirect();
      setCoaches(allCoaches);
    } catch (error) {
      console.error('Failed to load coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCoaches = () => {
    if (!searchTerm.trim()) {
      setFilteredCoaches(coaches);
      return;
    }

    const filtered = coaches.filter(coach =>
      coach.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoaches(filtered);
  };

  const handleEditCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setFormData({
      firstName: coach.firstName,
      lastName: coach.lastName,
      email: coach.email,
      bio: coach.bio
    });
    setEditDialogOpen(true);
  };

  const handleDeleteCoach = (coach: Coach) => {
    setCoachToDelete(coach);
    setDeleteDialogOpen(true);
  };

  const handleViewCoach = async (coach: Coach) => {
    try {
      const coachWithStudents = await eightbaseService.getCoachWithStudents(coach.id);
      setSelectedCoach(coachWithStudents || coach);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Failed to load coach details:', error);
      setSelectedCoach(coach);
      setViewDialogOpen(true);
    }
  };

  const handleUpdateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach) return;

    try {
      await eightbaseService.updateCoachDirect(selectedCoach.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        bio: formData.bio
      });

      setEditDialogOpen(false);
      setSelectedCoach(null);
      await loadCoaches();
    } catch (error) {
      console.error('Failed to update coach:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!coachToDelete) return;

    try {
      const success = await eightbaseService.deleteCoach(coachToDelete.id);
      if (success) {
        setDeleteDialogOpen(false);
        setCoachToDelete(null);
        await loadCoaches();
      }
    } catch (error) {
      console.error('Failed to delete coach:', error);
    }
  };

  const getCoachStatus = (coach: Coach) => {
    return coach.users?.status || 'Unknown';
  };

  const getCoachRole = (coach: Coach) => {
    return coach.users?.roles?.items?.[0]?.name || 'Coach';
  };

  const getStudentCount = (coach: Coach) => {
    return coach.students?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading coaches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coach Management</h2>
          <p className="text-muted-foreground">
            Manage coaches and their assigned students
          </p>
        </div>
        <div className="flex items-center gap-2 text-black dark:text-white">
          <Button onClick={loadCoaches} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <Search className="h-5 w-5" />
            Search & Filter Coaches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Badge variant="secondary">
              {filteredCoaches.length} of {coaches.length} coaches
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Coaches Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <Users className="h-5 w-5" />
            All Coaches ({filteredCoaches.length})
          </CardTitle>
          <CardDescription>
            Manage coach profiles and view their assigned students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {coach.profileImage?.downloadUrl ? (
                        <img
                          src={coach.profileImage.downloadUrl}
                          alt={`${coach.firstName} ${coach.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {coach.firstName} {coach.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {coach.bio ? coach.bio.substring(0, 50) + '...' : 'No bio'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {coach.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getCoachStatus(coach) === 'active' ? 'default' : 'secondary'}
                    >
                      {getCoachStatus(coach)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCoachRole(coach)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      {getStudentCount(coach)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(coach.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCoach(coach)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCoach(coach)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoach(coach)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Coach Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Coach</DialogTitle>
            <DialogDescription>
              Update coach information and profile details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCoach} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell us about this coach..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Coach</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Coach Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Coach Details</DialogTitle>
            <DialogDescription>
              View coach information and assigned students
            </DialogDescription>
          </DialogHeader>
          {selectedCoach && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="students">Students ({getStudentCount(selectedCoach)})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                        <p className="text-lg">{selectedCoach.firstName} {selectedCoach.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="flex items-center gap-2 text-black dark:text-white">
                          <Mail className="h-4 w-4" />
                          {selectedCoach.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <Badge variant={getCoachStatus(selectedCoach) === 'active' ? 'default' : 'secondary'}>
                          {getCoachStatus(selectedCoach)}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                        <Badge variant="outline">{getCoachRole(selectedCoach)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile</h3>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                      <p className="mt-1 text-sm">{selectedCoach.bio || 'No bio provided'}</p>
                    </div>
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="flex items-center gap-2 text-black dark:text-white mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedCoach.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="students" className="space-y-4">
                {selectedCoach.students && selectedCoach.students.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCoach.students.map((student) => (
                      <Card key={student.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{student.firstName} {student.lastName}</CardTitle>
                          <CardDescription>{student.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                              <p className="flex items-center gap-2 text-black dark:text-white">
                                <Phone className="h-4 w-4" />
                                {student.phone || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Business</Label>
                              <p className="flex items-center gap-2 text-black dark:text-white">
                                <Target className="h-4 w-4" />
                                {student.business_name || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                              <p className="flex items-center gap-2 text-black dark:text-white">
                                <MapPin className="h-4 w-4" />
                                {student.location || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Goals</Label>
                              <p className="text-sm">{student.goals || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Strengths</Label>
                              <p className="text-sm">{student.strengths || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Challenges</Label>
                              <p className="text-sm">{student.challenges || 'Not provided'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Students Assigned</h3>
                    <p className="text-muted-foreground">This coach doesn't have any students assigned yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coach</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {coachToDelete?.firstName} {coachToDelete?.lastName}? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete Coach
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
