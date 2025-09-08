import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useParams } from 'react-router-dom';
import { eightbaseService } from '../services/8baseService';
import { Header } from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Edit, 
  Home,
  Phone,
  Mail,
  MapPin,
  Building,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  Camera,
  Moon,
  ArrowRight
} from 'lucide-react';

interface Student {
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
  createdAt: string;
  updatedAt: string;
  student?: {
    items: WeeklyReport[];
  };
}

interface WeeklyReport {
  id: string;
  revenue: number;
  net_profit: number;
  paid_shoots: number;
  free_shoots: number;
  new_clients: number;
  start_date: string;
  end_date: string;
  status: string;
  createdAt: string;
}

interface StudentProfileViewProps {
  studentId?: string;
  onClose?: () => void;
}

export function StudentProfileView({ studentId, onClose }: StudentProfileViewProps) {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const actualStudentId = studentId || id;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    business_name: '',
    location: '',
    target_market: '',
    strengths: '',
    challenges: '',
    goals: '',
    preferred_contact_method: '',
    availability: '',
    notes: ''
  });

  useEffect(() => {
    if (actualStudentId) {
      loadStudentData();
    }
  }, [actualStudentId]);

  const loadStudentData = async () => {
    if (!actualStudentId) return;

    try {
      setLoading(true);
      
      // Try to get real student data first
      try {
        const realStudent = await eightbaseService.getStudentById(actualStudentId);
        if (realStudent) {
          setStudent(realStudent);
          setFormData({
            firstName: realStudent.firstName || '',
            lastName: realStudent.lastName || '',
            email: realStudent.email || '',
            phone: realStudent.phone || '',
            business_name: realStudent.business_name || '',
            location: realStudent.location || '',
            target_market: realStudent.target_market || '',
            strengths: realStudent.strengths || '',
            challenges: realStudent.challenges || '',
            goals: realStudent.goals || '',
            preferred_contact_method: realStudent.preferred_contact_method || '',
            availability: realStudent.availability || '',
            notes: realStudent.notes || ''
          });
          return;
        }
      } catch (error) {
        console.log('Real student data not found, using mock data');
      }

      // Fallback to mock data for demonstration
      const mockStudent: Student = {
        id: actualStudentId,
        firstName: 'John',
        lastName: 'Student',
        email: 'student@example.com',
        phone: '+1 (555) 123-4567',
        business_name: "John's Real Estate Photography",
        location: 'Austin, TX',
        target_market: 'Luxury homes and commercial properties',
        strengths: 'Great eye for detail, strong editing skills',
        challenges: 'Pricing confidence, lead generation',
        goals: 'Reach $10K monthly revenue by end of year',
        preferred_contact_method: 'Phone calls',
        availability: 'Weekday evenings, weekend mornings',
        notes: 'Very motivated, quick learner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        student: {
          items: [
            {
              id: '1',
              revenue: 2250,
              net_profit: 1800,
              paid_shoots: 8,
              free_shoots: 2,
              new_clients: 3,
              start_date: '2024-06-24',
              end_date: '2024-06-30',
              status: 'completed',
              createdAt: '2024-06-30T10:00:00Z'
            }
          ]
        }
      };
      
      setStudent(mockStudent);
      setFormData({
        firstName: mockStudent.firstName,
        lastName: mockStudent.lastName,
        email: mockStudent.email,
        phone: mockStudent.phone,
        business_name: mockStudent.business_name,
        location: mockStudent.location,
        target_market: mockStudent.target_market,
        strengths: mockStudent.strengths,
        challenges: mockStudent.challenges,
        goals: mockStudent.goals,
        preferred_contact_method: mockStudent.preferred_contact_method,
        availability: mockStudent.availability,
        notes: mockStudent.notes
      });
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Here you would call the update service
      // await eightbaseService.updateStudent(student.id, formData);
      setEditDialogOpen(false);
      await loadStudentData(); // Reload data
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const getTotalRevenue = () => {
    return student?.student?.items?.reduce((total, report) => total + (report.revenue || 0), 0) || 0;
  };

  const getTotalProfit = () => {
    return student?.student?.items?.reduce((total, report) => total + (report.net_profit || 0), 0) || 0;
  };

  const getTotalShoots = () => {
    return student?.student?.items?.reduce((total, report) => 
      total + (report.paid_shoots || 0) + (report.free_shoots || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Student Not Found</h3>
        <p className="text-muted-foreground">Unable to load student information.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[90%] mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-muted-foreground">
                Student Profile - View and manage student information
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Profile
            </TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Call History
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            {/* Student Profile Card */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Student Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Business Name</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.business_name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Target Market</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.target_market}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Strengths</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.strengths}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Goals</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.goals}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Preferred Contact</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.preferred_contact_method}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Notes</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.notes}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.location}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Challenges</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.challenges}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Availability</Label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{student.availability}</p>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Total Revenue</Label>
                          <p className="text-xl font-bold text-green-600 mt-1">${getTotalRevenue().toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Net Profit</Label>
                          <p className="text-xl font-bold text-blue-600 mt-1">${getTotalProfit().toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Total Shoots</Label>
                          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{getTotalShoots()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Reports</Label>
                          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{student.student?.items?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calls" className="mt-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Call History</CardTitle>
                <CardDescription>Communication history with this student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Call History</h3>
                  <p className="text-muted-foreground">No calls have been recorded yet.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Notes</CardTitle>
                <CardDescription>Additional notes and observations about this student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">General Notes</span>
                    </div>
                    <p className="text-gray-900 dark:text-white">{student.notes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>
              Update student information and profile details
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="target_market">Target Market</Label>
                <Textarea
                  id="target_market"
                  value={formData.target_market}
                  onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="strengths">Strengths</Label>
                <Textarea
                  id="strengths"
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="challenges">Challenges</Label>
                <Textarea
                  id="challenges"
                  value={formData.challenges}
                  onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                <Input
                  id="preferred_contact_method"
                  value={formData.preferred_contact_method}
                  onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </main>
    </div>
  );
}
