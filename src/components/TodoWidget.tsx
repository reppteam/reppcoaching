import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { todoService } from '../services/todoService';
import { TodoItem } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  Plus,
  ListTodo,
  TrendingUp,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface TodoWidgetProps {
  className?: string;
  maxItems?: number;
  showQuickActions?: boolean;
}

export function TodoWidget({ className, maxItems = 5, showQuickActions = true }: TodoWidgetProps) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    dueThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadTodos();
      loadStatistics();
    }
  }, [user?.id]);

  // Additional useEffect to ensure queries run when component mounts
  useEffect(() => {
    if (user?.id) {
      loadTodos();
      loadStatistics();
    }
  }, []); // Empty dependency array to run on mount

  const loadTodos = async () => {
    try {
      setLoading(true);
      const userTodos = await todoService.getTodosByUser(user!.id);
      setTodos(userTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await todoService.getTodoStatistics(user!.id);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleQuickComplete = async (todoId: string) => {
    try {
      await todoService.updateTodo({ id: todoId, status: 'completed' });
      // Force refresh todos and statistics
      await Promise.all([loadTodos(), loadStatistics()]);
    } catch (error) {
      console.error('Error completing todo:', error);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const isOverdue = (todo: TodoItem) => {
    if (!todo.dueDate) return false;
    return new Date(todo.dueDate) < new Date() && ['pending', 'in_progress'].includes(todo.status);
  };

  const isDueToday = (todo: TodoItem) => {
    if (!todo.dueDate) return false;
    return todo.dueDate === new Date().toISOString().split('T')[0] && ['pending', 'in_progress'].includes(todo.status);
  };

  const getUrgentTodos = (): TodoItem[] => {
    return todos
      .filter(todo => ['pending', 'in_progress'].includes(todo.status))
      .sort((a, b) => {
        // Sort by overdue first, then by priority, then by due date
        const aOverdue = isOverdue(a);
        const bOverdue = isOverdue(b);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      })
      .slice(0, maxItems);
  };

  const handleViewAll = () => {
    // Navigate to full todo list manager
    window.location.href = '/todos';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            My Todos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading todos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              My Todos
            </CardTitle>
            <CardDescription>
              {statistics.total} total tasks • {statistics.pending} pending • {statistics.overdue} overdue
            </CardDescription>
          </div>
          {showQuickActions && (
            <Button size="sm" variant="outline" onClick={() => window.location.href = '/todos?action=create'}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {getUrgentTodos().length > 0 ? (
          <div className="space-y-3">
            {getUrgentTodos().map((todo: TodoItem) => (
              <div key={todo.id} className="p-3 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(todo.status)}
                      <h4 className="font-medium text-sm truncate">{todo.title}</h4>
                      <Badge className={`${getPriorityColor(todo.priority)} text-xs`}>
                        {todo.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {todo.dueDate && (
                        <div className={`flex items-center gap-1 ${isOverdue(todo) ? 'text-red-600' : isDueToday(todo) ? 'text-orange-600' : ''}`}>
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                          {isOverdue(todo) && <AlertTriangle className="h-3 w-3" />}
                        </div>
                      )}
                      <span className="text-gray-400">•</span>
                      <span className="capitalize">{todo.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {todo.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleQuickComplete(todo.id)}
                        className="h-6 w-6 p-0"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {statistics.total > maxItems && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={handleViewAll} className="text-blue-600 hover:text-blue-700">
                  View all {statistics.total} todos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <ListTodo className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 mb-3">No pending todos</p>
            {showQuickActions && (
              <Button size="sm" onClick={() => window.location.href = '/todos?action=create'}>
                <Plus className="h-4 w-4 mr-1" />
                Create your first todo
              </Button>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {statistics.total > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-red-600">{statistics.overdue}</div>
                <div className="text-xs text-gray-500">Overdue</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">{statistics.dueToday}</div>
                <div className="text-xs text-gray-500">Due Today</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
