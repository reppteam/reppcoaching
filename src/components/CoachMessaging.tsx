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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import {
  MessageSquare,
  Send,
  Inbox,
  Archive,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Reply,
  Forward,
  Mail,
  Phone,
  Calendar,
  Users,
  FileText,
  Paperclip,
  Smile
} from 'lucide-react';
import { User as UserType } from '../types';

interface Message {
  id: string;
  from_id: string;
  to_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  message_type: 'email' | 'sms' | 'in_app';
  priority: 'low' | 'medium' | 'high';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface CoachMessagingProps {
  coachId?: string;
}

export const CoachMessaging: React.FC<CoachMessagingProps> = ({ coachId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<UserType[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null);
  const [composingMessage, setComposingMessage] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('inbox');
  const [formData, setFormData] = useState({
    to_id: '',
    subject: '',
    content: '',
    message_type: 'email' as 'email' | 'sms' | 'in_app',
    priority: 'medium' as 'low' | 'medium' | 'high'
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

      // Load assigned students
      const assignedStudents = await eightbaseService.getAssignedStudents(currentCoachId);
      setStudents(assignedStudents);

      // Load messages for this coach (mock data for now)
      const mockMessages: Message[] = [
        {
          id: '1',
          from_id: currentCoachId,
          to_id: assignedStudents[0]?.id || '',
          subject: 'Weekly Progress Check',
          content: 'Hi there! I wanted to check in on your progress this week. How are things going with your goals?',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          message_type: 'email',
          priority: 'medium',
          status: 'read'
        },
        {
          id: '2',
          from_id: assignedStudents[1]?.id || '',
          to_id: currentCoachId,
          subject: 'Question about assignment',
          content: 'I have a question about the latest assignment. Can we schedule a quick call?',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          message_type: 'in_app',
          priority: 'high',
          status: 'delivered'
        },
        {
          id: '3',
          from_id: currentCoachId,
          to_id: assignedStudents[2]?.id || '',
          subject: 'Great job on your progress!',
          content: 'I wanted to congratulate you on the excellent progress you\'ve made this month. Keep up the great work!',
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          message_type: 'email',
          priority: 'low',
          status: 'sent'
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messaging data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || message.message_type === filterType;
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'in_app':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline">Sent</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Delivered</Badge>;
      case 'read':
        return <Badge variant="default" className="bg-green-100 text-green-800">Read</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Mock sending message
      const newMessage: Message = {
        id: Date.now().toString(),
        from_id: currentCoachId!,
        to_id: formData.to_id,
        subject: formData.subject,
        content: formData.content,
        is_read: false,
        created_at: new Date().toISOString(),
        message_type: formData.message_type,
        priority: formData.priority,
        status: 'sent'
      };
      
      setMessages(prev => [newMessage, ...prev]);
      setComposingMessage(false);
      setFormData({
        to_id: '',
        subject: '',
        content: '',
        message_type: 'email',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messaging</h2>
          <p className="text-muted-foreground">
            Communicate with your students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setComposingMessage(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter(m => !m.is_read).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter(m => 
                m.from_id === currentCoachId && 
                new Date(m.created_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Messages sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Average response rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Drafts
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Messages</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Message Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in_app">In-App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Messages ({filteredMessages.length})</CardTitle>
              <CardDescription>
                Your communication history with students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From/To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id} className={!message.is_read ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {message.from_id === currentCoachId 
                                ? `To: ${getStudentName(message.to_id)}`
                                : `From: ${getStudentName(message.from_id)}`
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {message.from_id === currentCoachId ? 'Sent' : 'Received'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{message.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {message.content.substring(0, 50)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMessageTypeIcon(message.message_type)}
                          <span className="capitalize">{message.message_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(message.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(message.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(message.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingMessage(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
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
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
              <CardDescription>
                Messages you have sent to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Sent messages will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft Messages</CardTitle>
              <CardDescription>
                Messages saved as drafts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No draft messages</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Pre-written message templates for common communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Welcome Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Welcome new students to the program
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress Check</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Check in on student progress
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Encouragement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Motivate students to keep going
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Message Dialog */}
      <Dialog open={composingMessage} onOpenChange={setComposingMessage}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>
              Send a message to your student
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <Label htmlFor="to">To</Label>
              <Select value={formData.to_id} onValueChange={(value) => setFormData({...formData, to_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Enter message subject"
              />
            </div>
            <div>
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Write your message..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Message Type</Label>
                <Select value={formData.message_type} onValueChange={(value: 'email' | 'sms' | 'in_app') => setFormData({...formData, message_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setComposingMessage(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog open={!!viewingMessage} onOpenChange={(open) => {
        if (!open) setViewingMessage(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingMessage?.subject}</DialogTitle>
            <DialogDescription>
              Message details
            </DialogDescription>
          </DialogHeader>
          {viewingMessage && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">From/To</Label>
                <p>
                  {viewingMessage.from_id === currentCoachId 
                    ? `To: ${getStudentName(viewingMessage.to_id)}`
                    : `From: ${getStudentName(viewingMessage.from_id)}`
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <p className="mt-2 p-3 bg-gray-50 rounded-lg">{viewingMessage.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getMessageTypeIcon(viewingMessage.message_type)}
                    <span className="capitalize">{viewingMessage.message_type}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(viewingMessage.priority)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Date</Label>
                <p>{new Date(viewingMessage.created_at).toLocaleString()}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline">
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
