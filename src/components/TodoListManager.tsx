import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { todoService } from '../services/todoService';
import { TodoItem, CreateTodoInput, UpdateTodoInput } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  User,
  Tag,
  Edit,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  ListTodo,
  Target,
  Users,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface TodoListManagerProps {
  className?: string;
}

export function TodoListManager({ className }: TodoListManagerProps) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    dueThisWeek: 0
  });
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Form states
  const [formData, setFormData] = useState<CreateTodoInput>({
    title: '',
    description: '',
    assignedToId: '',
    category: 'personal',
    priority: 'medium',
    dueDate: '',
  });

  // Single useEffect to handle data loading
  useEffect(() => {
    console.log('TodoListManager useEffect triggered, user:', user);
    if (user?.id) {
      console.log('User ID available, loading todos and statistics...');
      // Load data only once when user is available
      loadTodosAndStatistics(true); // Initial load
    } else {
      console.log('User ID not available yet');
    }
  }, [user?.id]); // Only depend on user?.id

  // Listen for visibility changes to refresh data when tab becomes active (with throttling)
  useEffect(() => {
    let lastRefreshTime = 0;
    const REFRESH_THROTTLE = 5000; // 5 seconds minimum between refreshes

    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        const now = Date.now();
        if (now - lastRefreshTime > REFRESH_THROTTLE) {
          console.log('Page became visible, refreshing todos...');
          lastRefreshTime = now;
          refreshData();
        }
      }
    };

    const handleFocus = () => {
      if (user?.id) {
        const now = Date.now();
        if (now - lastRefreshTime > REFRESH_THROTTLE) {
          console.log('Window focused, refreshing todos...');
          lastRefreshTime = now;
          refreshData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  // Combined function to load todos and calculate statistics from the same data
  const loadTodosAndStatistics = async (isInitialLoad = false) => {
    if (user?.id) {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        console.log('Loading todos and statistics for user:', user.id);
        
        // Load todos first
        const userTodos = await todoService.getTodosByUser(user.id);
        console.log('Loaded todos:', userTodos);
        setTodos(userTodos);
        
        // Calculate statistics from the same data (no additional query needed)
        const today = new Date().toISOString().split('T')[0];
        const todayDate = new Date(today);
        const weekFromNow = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const stats = {
          total: userTodos.length,
          pending: userTodos.filter(todo => todo.status === 'pending').length,
          inProgress: userTodos.filter(todo => todo.status === 'in_progress').length,
          completed: userTodos.filter(todo => todo.status === 'completed').length,
          overdue: userTodos.filter(todo => {
            if (!todo.dueDate) return false;
            return new Date(todo.dueDate) < todayDate && ['pending', 'in_progress'].includes(todo.status);
          }).length,
          dueToday: userTodos.filter(todo => todo.dueDate === today && ['pending', 'in_progress'].includes(todo.status)).length,
          dueThisWeek: userTodos.filter(todo => {
            if (!todo.dueDate) return false;
            const dueDate = new Date(todo.dueDate);
            return dueDate >= todayDate && dueDate <= weekFromNow && ['pending', 'in_progress'].includes(todo.status);
          }).length
        };
        
        console.log('Calculated statistics:', stats);
        setStatistics(stats);
        
      } catch (error) {
        console.error('Error loading todos and statistics:', error);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    }
  };

  // Force refresh function with deduplication
  const refreshData = async () => {
    if (user?.id && !isRefreshing && !loading) {
      setIsRefreshing(true);
      try {
        await loadTodosAndStatistics();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const loadTodos = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      console.log('Loading todos for user:', user!.id);
      console.log('TodoService available:', !!todoService);
      const userTodos = await todoService.getTodosByUser(user!.id);
      console.log('Loaded todos:', userTodos);
      setTodos(userTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      console.error('Error details:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const loadStatistics = async () => {
    try {
      console.log('Loading statistics for user:', user!.id);
      const stats = await todoService.getTodoStatistics(user!.id);
      console.log('Loaded statistics:', stats);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleCreateTodo = async () => {
    try {
      setLoading(true);
      await todoService.createTodo(formData, user!.id);
      setCreateModalOpen(false);
      resetForm();
      // Refresh todos and statistics from single query
      await loadTodosAndStatistics();
    } catch (error) {
      console.error('Error creating todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTodo = async (input: UpdateTodoInput) => {
    try {
      await todoService.updateTodo(input);
      setEditModalOpen(false);
      setSelectedTodo(null);
      // Refresh todos and statistics from single query
      await loadTodosAndStatistics();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      // Refresh todos and statistics from single query
      await loadTodosAndStatistics();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedToId: user?.id || '',
      category: 'personal',
      priority: 'medium',
      dueDate: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return <Users className="h-4 w-4" />;
      case 'new_students': return <User className="h-4 w-4" />;
      case 'post_calls': return <Target className="h-4 w-4" />;
      case 'follow_up': return <TrendingUp className="h-4 w-4" />;
      case 'admin': return <ListTodo className="h-4 w-4" />;
      case 'training': return <AlertCircle className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || todo.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || todo.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getTabTodos = (tab: string) => {
    switch (tab) {
      case 'pending': return todos.filter(todo => todo.status === 'pending');
      case 'in_progress': return todos.filter(todo => todo.status === 'in_progress');
      case 'completed': return todos.filter(todo => todo.status === 'completed');
      case 'overdue': return todos.filter(todo => {
        if (!todo.dueDate) return false;
        return new Date(todo.dueDate) < new Date() && ['pending', 'in_progress'].includes(todo.status);
      });
      case 'due_today': return todos.filter(todo => {
        if (!todo.dueDate) return false;
        return todo.dueDate === new Date().toISOString().split('T')[0] && ['pending', 'in_progress'].includes(todo.status);
      });
      default: return filteredTodos;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Todo Lists
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tasks and stay organized
          </p>
        </div>
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Todo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Todo</DialogTitle>
              <DialogDescription>
                Add a new task to your todo list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter todo title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="new_students">New Students</SelectItem>
                      <SelectItem value="post_calls">Post Calls</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTodo} disabled={!formData.title.trim()}>
                  Create Todo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{statistics.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.inProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.completed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.overdue}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statistics.dueToday}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Due Today</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statistics.dueThisWeek}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Due This Week</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search todos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="new_students">New Students</SelectItem>
                <SelectItem value="post_calls">Post Calls</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              console.log('Manual load triggered');
              if (user?.id) {
                loadTodos();
                loadStatistics();
              } else {
                console.log('No user ID available for manual load');
              }
            }}>
              Manual Load
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Todo List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({filteredTodos.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({statistics.pending})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({statistics.inProgress})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({statistics.completed})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({statistics.overdue})</TabsTrigger>
              <TabsTrigger value="due_today">Due Today ({statistics.dueToday})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab}>
            <TabsContent value={activeTab} className="space-y-4">
              {getTabTodos(activeTab).length > 0 ? (
                getTabTodos(activeTab).map((todo) => (
                  <div key={todo.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{todo.title}</h3>
                          <Badge className={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Badge>
                          <Badge className={getStatusColor(todo.status)}>
                            {todo.status.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1 text-gray-500">
                            {getCategoryIcon(todo.category)}
                            <span className="text-sm">{todo.category.replace('_', ' ')}</span>
                          </div>
                        </div>
                        {todo.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-2">{todo.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {todo.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Assigned by: {todo.assignedBy.firstName} {todo.assignedBy.lastName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {todo.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTodo({ id: todo.id, status: 'completed' })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTodo(todo);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{todo.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTodo(todo.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ListTodo className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No todos found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>
              Update the todo details
            </DialogDescription>
          </DialogHeader>
          {selectedTodo && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedTodo.title}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedTodo.description || ''}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={selectedTodo.status} onValueChange={(value) => setSelectedTodo({ ...selectedTodo, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={selectedTodo.priority} onValueChange={(value) => setSelectedTodo({ ...selectedTodo, priority: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={selectedTodo.dueDate || ''}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-completionNotes">Completion Notes</Label>
                <Textarea
                  id="edit-completionNotes"
                  value={selectedTodo.completionNotes || ''}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, completionNotes: e.target.value })}
                  placeholder="Add completion notes (optional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateTodo({
                  id: selectedTodo.id,
                  title: selectedTodo.title,
                  description: selectedTodo.description,
                  status: selectedTodo.status,
                  priority: selectedTodo.priority,
                  dueDate: selectedTodo.dueDate,
                  completionNotes: selectedTodo.completionNotes
                })}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
