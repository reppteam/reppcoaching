import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Eye,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { CallLog } from '../types';

export const StudentCallLog: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [viewingCall, setViewingCall] = useState<CallLog | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCallLogs();
    }
  }, [user?.id]);

  const loadCallLogs = async () => {
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
        setCallLogs([]);
        return;
      }
      
      console.log('Loading call logs for student table ID:', studentTableId);
      const logs = await eightbaseService.getCallLogs(studentTableId);
      console.log('Call logs received:', logs);
      setCallLogs(logs);
    } catch (error) {
      console.error('Error loading call logs:', error);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCallLogs = async () => {
    setRefreshing(true);
    await loadCallLogs();
    setRefreshing(false);
  };

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'follow_up':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'motivated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
      case 'frustrated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const filteredCallLogs = callLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.outcome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.next_steps?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.topics_discussed?.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || log.call_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading call logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Call Logs</h2>
          <p className="text-muted-foreground">
            View your coaching call history and notes
          </p>
        </div>
        <Button 
          onClick={refreshCallLogs} 
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
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              All time calls with your coach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(callLogs.reduce((total, log) => total + (log.call_duration || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined call duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Call</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {callLogs.length > 0 
                ? new Date(callLogs[0].call_date).toLocaleDateString()
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent coaching session
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
                  placeholder="Search call logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>
            Your complete coaching call history with your assigned coach
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCallLogs.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Call Logs Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'No call logs match your current filters.'
                  : 'You haven\'t had any coaching calls yet.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCallLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(log.call_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.call_date).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDuration(log.call_duration || 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCallTypeColor(log.call_type)}>
                        {log.call_type?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {log.topics_discussed && log.topics_discussed.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {log.topics_discussed.slice(0, 2).map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {log.topics_discussed.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{log.topics_discussed.length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No topics listed</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMoodColor(log.student_mood || 'neutral')}>
                        {log.student_mood?.replace('_', ' ') || 'neutral'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingCall(log)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Call Details Dialog */}
      <Dialog open={!!viewingCall} onOpenChange={() => setViewingCall(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about your coaching call
            </DialogDescription>
          </DialogHeader>
          
          {viewingCall && (
            <div className="space-y-6">
              {/* Call Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                  <p className="text-lg font-medium">
                    {new Date(viewingCall.call_date).toLocaleDateString()} at{' '}
                    {new Date(viewingCall.call_date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-lg font-medium">
                    {formatDuration(viewingCall.call_duration || 0)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Call Type</label>
                  <div className="mt-1">
                    <Badge className={getCallTypeColor(viewingCall.call_type)}>
                      {viewingCall.call_type?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Your Mood</label>
                  <div className="mt-1">
                    <Badge className={getMoodColor(viewingCall.student_mood || 'neutral')}>
                      {viewingCall.student_mood?.replace('_', ' ') || 'neutral'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Topics Discussed */}
              {viewingCall.topics_discussed && viewingCall.topics_discussed.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Topics Discussed</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingCall.topics_discussed.map((topic, index) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Outcome */}
              {viewingCall.outcome && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Call Outcome</label>
                  <p className="mt-2 p-3 bg-muted rounded-lg">
                    {viewingCall.outcome}
                  </p>
                </div>
              )}

              {/* Next Steps */}
              {viewingCall.next_steps && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Next Steps</label>
                  <p className="mt-2 p-3 bg-muted rounded-lg">
                    {viewingCall.next_steps}
                  </p>
                </div>
              )}

              {/* Recording */}
              {viewingCall.recording_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Call Recording</label>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(viewingCall.recording_url, '_blank')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Listen to Recording
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
