import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  FileText, 
  User, 
  Eye,
  Filter,
  Search,
  Calendar,
  RefreshCw,
  MessageSquare,
  Lock,
  Globe
} from 'lucide-react';
import { Note } from '../types';

export const StudentNotes: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadNotes();
    }
  }, [user?.id]);

  const loadNotes = async () => {
    if (!user?.id) {
      console.log('No user ID found');
      return;
    }

    try {
      setLoading(true);
      
      // Debug: Log the entire user object
      console.log('Full user object:', user);
      console.log('User student object:', user.student);
      
      // Since user.student is undefined, we need to get the student table ID using the service
      console.log('Getting student profile for user ID:', user.id);
      const studentProfile = await eightbaseService.getStudentProfileByUserId(user.id);
      console.log('Student profile received:', studentProfile);
      
      const studentTableId = studentProfile?.id;
      
      if (!studentTableId) {
        console.error('No student table ID found for user:', user);
        console.log('Available user fields:', Object.keys(user));
        setNotes([]);
        return;
      }
      
      console.log('Loading notes for student table ID:', studentTableId);
      // Get notes for the student - only public notes are visible to students
      const studentNotes = await eightbaseService.getNotes('student', studentTableId, 'user');
      console.log('Notes received:', studentNotes);
      setNotes(studentNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshNotes = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'private':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterVisibility === 'all' || note.visibility === filterVisibility;
    
    return matchesSearch && matchesFilter;
  });

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
          <h2 className="text-3xl font-bold tracking-tight">My Notes</h2>
          <p className="text-muted-foreground">
            View notes from your coaching sessions
          </p>
        </div>
        <Button 
          onClick={refreshNotes} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">
              Notes from your coach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Notes</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notes.filter(note => note.visibility === 'public').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Visible to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Note</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notes.length > 0 
                ? (() => {
                    const date = new Date(notes[0].createdAt || notes[0].created_at);
                    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                  })()
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent note
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notes</SelectItem>
                  <SelectItem value="public">Public Only</SelectItem>
                  <SelectItem value="private">Private Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Notes Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterVisibility !== 'all' 
                ? 'No notes match your current filters.'
                : 'Your coach hasn\'t added any notes yet.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {note.title || 'Untitled Note'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(note.createdAt || note.created_at)}
                    </CardDescription>
                  </div>
                  <Badge className={getVisibilityColor(note.visibility)}>
                    <div className="flex items-center gap-1">
                      {getVisibilityIcon(note.visibility)}
                      {note.visibility}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content || 'No content available'}
                  </p>
                  
                  {note.created_by_name && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>By {note.created_by_name}</span>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setViewingNote(note)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Note Details Dialog */}
      <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Note Details
            </DialogTitle>
            <DialogDescription>
              Detailed note from your coaching session
            </DialogDescription>
          </DialogHeader>
          
          {viewingNote && (
            <div className="space-y-6">
              {/* Note Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {viewingNote.title || 'Untitled Note'}
                  </h3>
                  <Badge className={getVisibilityColor(viewingNote.visibility)}>
                    <div className="flex items-center gap-1">
                      {getVisibilityIcon(viewingNote.visibility)}
                      {viewingNote.visibility}
                    </div>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(viewingNote.createdAt || viewingNote.created_at)}
                  </div>
                  {viewingNote.created_by_name && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      By {viewingNote.created_by_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Note Content */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Note Content</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className='break-all'>
                    {viewingNote.content || 'No content available'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {/* Note: The Note type doesn't include updated_at, so we only show creation date */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
