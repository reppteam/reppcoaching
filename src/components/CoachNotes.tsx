import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { 
  FileText, 
  Calendar, 
  User, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Lock,
  Globe,
  Tag,
  Clock
} from 'lucide-react';
import { Note, User as UserType } from '../types';

interface CoachNotesProps {
  coachId?: string;
}

export const CoachNotes: React.FC<CoachNotesProps> = ({ coachId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<UserType[]>([]);
  const [addingNote, setAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [formData, setFormData] = useState({
    target_type: 'student' as 'student' | 'call',
    target_id: '',
    content: '',
    visibility: 'public' as 'public' | 'private'
  });

  const currentCoachId = coachId || user?.id;

  useEffect(() => {
    if (currentCoachId) {
      loadData();
    }
  }, [currentCoachId]);

  const loadData = async () => {
    if (!currentCoachId) return;

    try {
      setLoading(true);
      
      // Load notes for this coach
      const coachNotes = await eightbaseService.getNotes('coach', currentCoachId, 'coach');
      setNotes(coachNotes);

      // Load assigned students
      const students = await eightbaseService.getAssignedStudents(currentCoachId);
      setAssignedStudents(students);
    } catch (error) {
      console.error('Error loading notes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCoachId) return;

    try {
      const note = await eightbaseService.createNote({
        target_type: formData.target_type,
        target_id: formData.target_id,
        user_id: currentCoachId,
        content: formData.content,
        visibility: formData.visibility,
        created_by: currentCoachId,
        created_by_name: `${user?.firstName || 'Coach'} ${user?.lastName || 'Name'}`
      });

      setNotes([note, ...notes]);
      setAddingNote(false);
      resetForm();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdate = async (noteId: string) => {
    try {
      const updatedNote = await eightbaseService.updateNote(noteId, formData);
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      setEditingNote(null);
      resetForm();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await eightbaseService.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      target_type: 'student',
      target_id: '',
      content: '',
      visibility: 'public'
    });
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'private' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === 'private' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100';
  };

  const getTargetTypeColor = (type: string) => {
    switch (type) {
      case 'student': return 'text-blue-600 bg-blue-100';
      case 'call': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTarget = filterTarget === 'all' || note.target_type === filterTarget;
    const matchesVisibility = filterVisibility === 'all' || note.visibility === filterVisibility;
    return matchesSearch && matchesTarget && matchesVisibility;
  });

  const getStudentName = (targetId: string) => {
    const student = assignedStudents.find(s => s.id === targetId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coach Notes</h2>
          <p className="text-muted-foreground">
            Manage your notes about students and coaching sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={addingNote} onOpenChange={setAddingNote}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Note</DialogTitle>
                <DialogDescription>
                  Create a new note about a student or coaching session
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_type">Note Type</Label>
                    <Select value={formData.target_type} onValueChange={(value: 'student' | 'call') => setFormData({...formData, target_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student Note</SelectItem>
                        <SelectItem value="call">Call Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target_id">Target</Label>
                    <Select value={formData.target_id} onValueChange={(value) => setFormData({...formData, target_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignedStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Note Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your note content..."
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={formData.visibility} onValueChange={(value: 'public' | 'private') => setFormData({...formData, visibility: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (Visible to all coaches)</SelectItem>
                      <SelectItem value="private">Private (Only you)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddingNote(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Note</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Label>Filters:</Label>
              </div>
              <Select value={filterTarget} onValueChange={setFilterTarget}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="student">Student Notes</SelectItem>
                  <SelectItem value="call">Call Notes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Your notes about students and coaching sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>
                    <Badge className={getTargetTypeColor(note.target_type)}>
                      <Tag className="h-3 w-3 mr-1" />
                      {note.target_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getStudentName(note.target_id)}</p>
                      <p className="text-sm text-muted-foreground">ID: {note.target_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">{note.content}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getVisibilityColor(note.visibility)}>
                      {getVisibilityIcon(note.visibility)}
                      <span className="ml-1">{note.visibility}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingNote(note)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            target_type: note.target_type as 'student' | 'call',
                            target_id: note.target_id,
                            content: note.content,
                            visibility: note.visibility as 'public' | 'private'
                          });
                          setEditingNote(note.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(note.id)}
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

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update the note information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Note Type</Label>
                <Select value={formData.target_type} onValueChange={(value: 'student' | 'call') => setFormData({...formData, target_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student Note</SelectItem>
                    <SelectItem value="call">Call Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target</Label>
                <Select value={formData.target_id} onValueChange={(value) => setFormData({...formData, target_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Note Content</Label>
              <Textarea
                placeholder="Enter your note content..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={6}
              />
            </div>

            <div>
              <Label>Visibility</Label>
              <Select value={formData.visibility} onValueChange={(value: 'public' | 'private') => setFormData({...formData, visibility: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Visible to all coaches)</SelectItem>
                  <SelectItem value="private">Private (Only you)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingNote && handleUpdate(editingNote)}>
                Update Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Note Dialog */}
      <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Note Details</DialogTitle>
            <DialogDescription>
              Detailed view of the note
            </DialogDescription>
          </DialogHeader>
          {viewingNote && (
            <div className="space-y-6">
              {/* Note Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Note Type</Label>
                  <Badge className={`mt-1 ${getTargetTypeColor(viewingNote.target_type)}`}>
                    <Tag className="h-3 w-3 mr-1" />
                    {viewingNote.target_type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Target</Label>
                  <p className="text-lg font-semibold mt-1">
                    {getStudentName(viewingNote.target_id)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Visibility</Label>
                  <Badge className={`mt-1 ${getVisibilityColor(viewingNote.visibility)}`}>
                    {getVisibilityIcon(viewingNote.visibility)}
                    <span className="ml-1">{viewingNote.visibility}</span>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                  <p className="text-lg mt-1">{viewingNote.created_by_name}</p>
                </div>
              </div>

              {/* Note Content */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Note Content</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{viewingNote.content}</p>
                </div>
              </div>

              {/* Created Date */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created On</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {new Date(viewingNote.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewingNote(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
