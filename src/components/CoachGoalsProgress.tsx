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
import { Progress } from './ui/progress';
import {
  Target,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Users,
  Star,
  Award,
  BarChart3,
  Activity,
  CalendarDays,
  Flag,
  CheckSquare,
  Square,
  Camera,
  FileText
} from 'lucide-react';
import { User, Goal } from '../types';

interface CoachGoalsProgressProps {
  coachId?: string;
}

export const CoachGoalsProgress: React.FC<CoachGoalsProgressProps> = ({ coachId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<User[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [addingGoal, setAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [viewingGoal, setViewingGoal] = useState<Goal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [formData, setFormData] = useState({
    user_id: '',
    title: '',
    description: '',
    target_value: 0,
    current_value: 0,
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    goal_type: 'revenue' as 'revenue' | 'clients' | 'shoots' | 'text' | 'other',
    status: 'active' as 'active' | 'completed'
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

      // Load goals for this coach's students
      const coachGoals = await eightbaseService.getGoalsByCoach(currentCoachId);
      setGoals(coachGoals);
    } catch (error) {
      console.error('Error loading goals data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && goal.status === 'completed') ||
                         (filterStatus === 'in_progress' && goal.status === 'active');
    
    const matchesStudent = filterStudent === 'all' || goal.user_id === filterStudent;

    return matchesSearch && matchesStatus && matchesStudent;
  });

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.target_value === 0) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getStatusBadge = (goal: Goal) => {
    if (goal.status === 'completed') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
    }
    
    const progress = getProgressPercentage(goal);
    if (progress >= 80) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Near Complete</Badge>;
    } else if (progress >= 50) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    } else {
      return <Badge variant="secondary">Started</Badge>;
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

  const getCategoryIcon = (goalType: string) => {
    switch (goalType) {
      case 'revenue':
        return <TrendingUp className="h-4 w-4" />;
      case 'clients':
        return <Users className="h-4 w-4" />;
      case 'shoots':
        return <Camera className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'other':
        return <Target className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGoal) {
        await eightbaseService.updateGoal(editingGoal, formData);
      } else {
        await eightbaseService.createGoal(formData);
      }
      
      setAddingGoal(false);
      setEditingGoal(null);
      setFormData({
        user_id: '',
        title: '',
        description: '',
        target_value: 0,
        current_value: 0,
        deadline: '',
        priority: 'medium',
        goal_type: 'revenue',
        status: 'active'
      });
      
      loadData();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await eightbaseService.deleteGoal(goalId);
        loadData();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Goals & Progress</h2>
          <p className="text-muted-foreground">
            Set and track goals for your students
          </p>
        </div>
        <div className="flex items-center gap-2 text-black dark:text-white">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setAddingGoal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Goals</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="student">Student</Label>
              <Select value={filterStudent} onValueChange={setFilterStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
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

      {/* Goals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Goals ({filteredGoals.length})</CardTitle>
          <CardDescription>
            Track progress and manage student goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Goal</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                                             <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                         {getCategoryIcon(goal.goal_type)}
                       </div>
                      <div>
                        <div className="font-medium">{goal.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {goal.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                                         <div className="text-sm font-medium">
                       {getStudentName(goal.user_id)}
                     </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.current_value}/{goal.target_value}</span>
                        <span>{Math.round(getProgressPercentage(goal))}%</span>
                      </div>
                      <Progress value={getProgressPercentage(goal)} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(goal)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(goal.priority)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingGoal(goal);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                                                     setFormData({
                             user_id: goal.user_id,
                             title: goal.title,
                             description: goal.description,
                             target_value: goal.target_value,
                             current_value: goal.current_value,
                             deadline: goal.deadline || '',
                             priority: goal.priority,
                             goal_type: goal.goal_type,
                             status: goal.status
                           });
                          setEditingGoal(goal.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
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

      {/* Add/Edit Goal Dialog */}
      <Dialog open={addingGoal || !!editingGoal} onOpenChange={(open) => {
        if (!open) {
          setAddingGoal(false);
          setEditingGoal(null);
          setFormData({
            user_id: '',
            title: '',
            description: '',
            target_value: 0,
            current_value: 0,
            deadline: '',
            priority: 'medium',
            goal_type: 'revenue',
            status: 'active'
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </DialogTitle>
            <DialogDescription>
              Set a new goal for your student
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
               <Label htmlFor="student">Student</Label>
               <Select value={formData.user_id} onValueChange={(value) => setFormData({...formData, user_id: value})}>
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
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter goal title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the goal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target">Target Value</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({...formData, target_value: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="current">Current Value</Label>
                <Input
                  id="current"
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => setFormData({...formData, current_value: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                             <div>
                 <Label htmlFor="goal_type">Goal Type</Label>
                 <Select value={formData.goal_type} onValueChange={(value: 'revenue' | 'clients' | 'shoots' | 'text' | 'other') => setFormData({...formData, goal_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                                     <SelectContent>
                     <SelectItem value="revenue">Revenue</SelectItem>
                     <SelectItem value="clients">Clients</SelectItem>
                     <SelectItem value="shoots">Shoots</SelectItem>
                     <SelectItem value="text">Text</SelectItem>
                     <SelectItem value="other">Other</SelectItem>
                   </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setAddingGoal(false);
                setEditingGoal(null);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Goal Dialog */}
      <Dialog open={!!viewingGoal} onOpenChange={(open) => {
        if (!open) setViewingGoal(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingGoal?.title}</DialogTitle>
            <DialogDescription>
              Goal details and progress
            </DialogDescription>
          </DialogHeader>
          {viewingGoal && (
            <div className="space-y-4">
                             <div>
                 <Label className="text-sm font-medium">Student</Label>
                 <p>{getStudentName(viewingGoal.user_id)}</p>
               </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p>{viewingGoal.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Progress</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{viewingGoal.current_value}/{viewingGoal.target_value}</span>
                      <span>{Math.round(getProgressPercentage(viewingGoal))}%</span>
                    </div>
                    <Progress value={getProgressPercentage(viewingGoal)} className="h-2" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingGoal)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(viewingGoal.priority)}</div>
                </div>
                                 <div>
                   <Label className="text-sm font-medium">Goal Type</Label>
                   <div className="flex items-center gap-2 text-black dark:text-white mt-1">
                     {getCategoryIcon(viewingGoal.goal_type)}
                     <span className="capitalize">{viewingGoal.goal_type}</span>
                   </div>
                 </div>
              </div>
              {viewingGoal.deadline && (
                <div>
                  <Label className="text-sm font-medium">Deadline</Label>
                  <p>{new Date(viewingGoal.deadline).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
