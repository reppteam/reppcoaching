import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { eightbaseService } from '../services/8baseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Edit, 
  Phone,
  FileText,
  Save,
  X,
  Sun,
  Moon
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

interface CoachStudentEditProfileProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CoachStudentEditProfile({ studentId, isOpen, onClose }: CoachStudentEditProfileProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const [notes, setNotes] = useState<Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>>([]);

  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (studentId && isOpen) {
      loadStudentData();
    }
  }, [studentId, isOpen]);

  // Don't render anything if modal is not open or no student ID
  if (!isOpen || !studentId) {
    return null;
  }

  const loadStudentData = async () => {
    if (!studentId || !isOpen) return;

    try {
      setLoading(true);
      
      // Get real student data from 8base
      const realStudent = await eightbaseService.getStudentById(studentId);
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

        // Parse notes from JSON or create empty array
        try {
          const parsedNotes = realStudent.notes ? JSON.parse(realStudent.notes) : [];
          setNotes(Array.isArray(parsedNotes) ? parsedNotes : []);
        } catch (error) {
          console.error('Error parsing notes JSON:', error);
          setNotes([]);
        }
      } else {
        // Fallback to mock data for demonstration
        const mockStudent: Student = {
          id: studentId,
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

        // Set mock notes for demonstration
        setNotes([
          {
            id: '1',
            title: 'Initial Assessment',
            content: 'Very motivated, quick learner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Progress Update',
            content: 'Showing great improvement in pricing confidence',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!student) return;

    try {
      setSaving(true);
      
      // Convert notes to JSON string
      const notesJson = JSON.stringify(notes);
      
      // Update student data using 8base service
      await eightbaseService.updateStudentDirect(student.id, {
        ...formData,
        notes: notesJson
      });
      
      // Reload data to get updated information
      await loadStudentData();
      
      // Show success message or handle success
      console.log('Student profile updated successfully');
      
    } catch (error) {
      console.error('Error updating student:', error);
      // Handle error - show error message to user
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (student) {
      // Reset form data to original values
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        business_name: student.business_name || '',
        location: student.location || '',
        target_market: student.target_market || '',
        strengths: student.strengths || '',
        challenges: student.challenges || '',
        goals: student.goals || '',
        preferred_contact_method: student.preferred_contact_method || '',
        availability: student.availability || '',
        notes: student.notes || ''
      });
    }
    onClose();
  };

  const handleAddNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note = {
        id: Date.now().toString(),
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setNotes([...notes, note]);
      setNewNote({ title: '', content: '' });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const handleEditNote = (noteId: string, updatedNote: { title: string; content: string }) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose} className="w-full">
        <DialogContent className="w-[95vw] max-w-[95vw] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading student profile...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose} className="w-full">
        <DialogContent className="w-[95vw] max-w-[95vw] overflow-y-auto">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Student Not Found</h3>
            <p className="text-muted-foreground">Unable to load student information.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="w-full">
      <DialogContent className="sm:w-[80vw] sm:max-w-[80vw] overflow-y-auto p-0 bg-background text-foreground">
        <div className="p-6">
          {/* Profile Header - Exact match to image */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
              </div>
              <Badge className="bg-blue-600 dark:bg-blue-500 text-white">Paid Student</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs - Exact match to image */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                Profile
              </TabsTrigger>
              <TabsTrigger value="calls" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                Call History
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              {/* Student Profile Card - Exact match to image */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Student Profile</CardTitle>
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Exact match to image */}
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</Label>
                        <Input
                          value={formData.business_name}
                          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Market</Label>
                        <Textarea
                          value={formData.target_market}
                          onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
                          rows={3}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Strengths</Label>
                        <Textarea
                          value={formData.strengths}
                          onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                          rows={3}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Goals</Label>
                        <Textarea
                          value={formData.goals}
                          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                          rows={3}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Contact</Label>
                        <Input
                          value={formData.preferred_contact_method}
                          onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                    </div>

                    {/* Right Column - Exact match to image */}
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</Label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Challenges</Label>
                        <Textarea
                          value={formData.challenges}
                          onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                          rows={3}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</Label>
                        <Input
                          value={formData.availability}
                          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                          className="mt-1 text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calls" className="mt-6">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Call History</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Communication history with this student</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No Call History</h3>
                    <p className="text-muted-foreground">No calls have been recorded yet.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notes</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Additional notes and observations about this student</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Add New Note Section */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Note</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="note-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Note Title</Label>
                          <Input
                            id="note-title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            placeholder="Enter note title..."
                            className="mt-1 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="note-content" className="text-sm font-medium text-gray-700 dark:text-gray-300">Note Content</Label>
                          <Textarea
                            id="note-content"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            placeholder="Enter note content..."
                            rows={3}
                            className="mt-1 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <Button onClick={handleAddNote} disabled={!newNote.title.trim() || !newNote.content.trim()}>
                          <FileText className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </div>
                    </div>

                    {/* Existing Notes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Existing Notes</h3>
                      {notes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                          <p>No notes yet. Add your first note above.</p>
                        </div>
                      ) : (
                        notes.map((note) => (
                          <div key={note.id} className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{note.title}</h4>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">{note.content}</p>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Created: {new Date(note.createdAt).toLocaleDateString()}
                              {note.updatedAt !== note.createdAt && (
                                <span> • Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}