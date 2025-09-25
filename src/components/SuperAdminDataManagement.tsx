import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User, WeeklyReport, Goal, Lead, Note, Product, Subitem, CallLog, MessageTemplate } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  Target,
  Phone,
  MessageSquare,
  Package,
  Settings,
  Database,
  BarChart3,
  Calendar,
  DollarSign,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface DataManagementState {
  users: User[];
  weeklyReports: WeeklyReport[];
  goals: Goal[];
  leads: Lead[];
  notes: Note[];
  products: Product[];
  subitems: Subitem[];
  callLogs: CallLog[];
  messageTemplates: MessageTemplate[];
  loading: boolean;
  selectedTab: string;
  searchTerm: string;
  filterStatus: string;
}

export function SuperAdminDataManagement() {
  const { user } = useAuth();
  const [state, setState] = useState<DataManagementState>({
    users: [],
    weeklyReports: [],
    goals: [],
    leads: [],
    notes: [],
    products: [],
    subitems: [],
    callLogs: [],
    messageTemplates: [],
    loading: true,
    selectedTab: 'users',
    searchTerm: '',
    filterStatus: 'all'
  });

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const [
        users, weeklyReports, goals, leads, notes, 
        products, subitems, callLogs, messageTemplates
      ] = await Promise.all([
        eightbaseService.getAllUsersWithDetails(),
        eightbaseService.getAllWeeklyReports(),
        eightbaseService.getAllGoals(),
        eightbaseService.getAllLeads(),
        eightbaseService.getAllNotes(),
        eightbaseService.getAllProducts(),
        eightbaseService.getAllSubitems(),
        eightbaseService.getAllCallLogs(),
        eightbaseService.getMessageTemplates() // Using backward compatibility method
      ]);

      setState(prev => ({
        ...prev,
        users,
        weeklyReports,
        goals,
        leads,
        notes,
        products,
        subitems,
        callLogs,
        messageTemplates,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreate = async (data: any, type: string) => {
    try {
      let result: any;
      switch (type) {
        case 'user':
          result = await eightbaseService.createUser(data);
          setState(prev => ({ ...prev, users: [...prev.users, result] }));
          break;
        case 'weeklyReport':
          result = await eightbaseService.createWeeklyReport(data);
          setState(prev => ({ ...prev, weeklyReports: [...prev.weeklyReports, result] }));
          break;
        case 'goal':
          result = await eightbaseService.createGoal(data);
          setState(prev => ({ ...prev, goals: [...prev.goals, result] }));
          break;
        case 'lead':
          result = await eightbaseService.createLead(data);
          setState(prev => ({ ...prev, leads: [...prev.leads, result] }));
          break;
        case 'note':
          result = await eightbaseService.createNote(data);
          setState(prev => ({ ...prev, notes: [...prev.notes, result] }));
          break;
        case 'product':
          result = await eightbaseService.createProduct(data);
          setState(prev => ({ ...prev, products: [...prev.products, result] }));
          break;
        case 'subitem':
          result = await eightbaseService.createSubitem(data);
          setState(prev => ({ ...prev, subitems: [...prev.subitems, result] }));
          break;
        case 'callLog':
          result = await eightbaseService.createCallLog(data);
          setState(prev => ({ ...prev, callLogs: [...prev.callLogs, result] }));
          break;
        case 'messageTemplate':
          result = await eightbaseService.createMessageTemplate(data); // Using backward compatibility method
          setState(prev => ({ ...prev, messageTemplates: [...prev.messageTemplates, result] }));
          break;
      }
      setCreateDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Failed to create ${type}:`, error);
    }
  };

  const handleUpdate = async (id: string, data: any, type: string) => {
    try {
      let result: any;
      switch (type) {
        case 'user':
          result = await eightbaseService.updateUser(id, data);
          setState(prev => ({ 
            ...prev, 
            users: prev.users.map(u => u.id === id ? result : u) 
          }));
          break;
        case 'weeklyReport':
          result = await eightbaseService.updateWeeklyReport(id, data);
          setState(prev => ({ 
            ...prev, 
            weeklyReports: prev.weeklyReports.map(w => w.id === id ? result : w) 
          }));
          break;
        case 'goal':
          result = await eightbaseService.updateGoal(id, data);
          setState(prev => ({ 
            ...prev, 
            goals: prev.goals.map(g => g.id === id ? result : g) 
          }));
          break;
        case 'lead':
          result = await eightbaseService.updateLead(id, data);
          setState(prev => ({ 
            ...prev, 
            leads: prev.leads.map(l => l.id === id ? result : l) 
          }));
          break;
        case 'note':
          result = await eightbaseService.updateNote(id, data);
          setState(prev => ({ 
            ...prev, 
            notes: prev.notes.map(n => n.id === id ? result : n) 
          }));
          break;
        case 'product':
          result = await eightbaseService.updateProduct(id, data);
          setState(prev => ({ 
            ...prev, 
            products: prev.products.map(p => p.id === id ? result : p) 
          }));
          break;
        case 'subitem':
          result = await eightbaseService.updateSubitem(id, data);
          setState(prev => ({ 
            ...prev, 
            subitems: prev.subitems.map(s => s.id === id ? result : s) 
          }));
          break;
        case 'callLog':
          result = await eightbaseService.updateCallLog(id, data);
          setState(prev => ({ 
            ...prev, 
            callLogs: prev.callLogs.map(c => c.id === id ? result : c) 
          }));
          break;
        case 'messageTemplate':
          result = await eightbaseService.updateMessageTemplate(id, data); // Using backward compatibility method
          setState(prev => ({ 
            ...prev, 
            messageTemplates: prev.messageTemplates.map(m => m.id === id ? result : m) 
          }));
          break;
      }
      setEditDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Failed to update ${type}:`, error);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    try {
      switch (type) {
        case 'user':
          await eightbaseService.deleteUser(id);
          setState(prev => ({ 
            ...prev, 
            users: prev.users.filter(u => u.id !== id) 
          }));
          break;
        case 'weeklyReport':
          await eightbaseService.deleteWeeklyReport(id);
          setState(prev => ({ 
            ...prev, 
            weeklyReports: prev.weeklyReports.filter(w => w.id !== id) 
          }));
          break;
        case 'goal':
          await eightbaseService.deleteGoal(id);
          setState(prev => ({ 
            ...prev, 
            goals: prev.goals.filter(g => g.id !== id) 
          }));
          break;
        case 'lead':
          await eightbaseService.deleteLead(id);
          setState(prev => ({ 
            ...prev, 
            leads: prev.leads.filter(l => l.id !== id) 
          }));
          break;
        case 'note':
          await eightbaseService.deleteNote(id);
          setState(prev => ({ 
            ...prev, 
            notes: prev.notes.filter(n => n.id !== id) 
          }));
          break;
        case 'product':
          await eightbaseService.deleteProduct(id);
          setState(prev => ({ 
            ...prev, 
            products: prev.products.filter(p => p.id !== id) 
          }));
          break;
        case 'subitem':
          await eightbaseService.deleteSubitem(id);
          setState(prev => ({ 
            ...prev, 
            subitems: prev.subitems.filter(s => s.id !== id) 
          }));
          break;
        case 'callLog':
          await eightbaseService.deleteCallLog(id);
          setState(prev => ({ 
            ...prev, 
            callLogs: prev.callLogs.filter(c => c.id !== id) 
          }));
          break;
        case 'messageTemplate':
          await eightbaseService.deleteMessageTemplate(id); // Using backward compatibility method
          setState(prev => ({ 
            ...prev, 
            messageTemplates: prev.messageTemplates.filter(m => m.id !== id) 
          }));
          break;
      }
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    }
  };

  const openEditDialog = (item: any, mode: 'create' | 'edit') => {
    setSelectedItem(item);
    setEditMode(mode);
    setEditDialogOpen(true);
  };

  const openCreateDialog = (type: string) => {
    setSelectedItem({ type });
    setEditMode('create');
    setCreateDialogOpen(true);
  };

  const openDeleteDialog = (item: any) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const getFilteredData = (data: any[], type: string) => {
    let filtered = data;
    
    // Apply search filter
    if (state.searchTerm) {
      filtered = filtered.filter(item => {
        const searchFields = getSearchFields(type);
        return searchFields.some(field => 
          item[field]?.toString().toLowerCase().includes(state.searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === state.filterStatus);
    }

    return filtered;
  };

  const getSearchFields = (type: string): string[] => {
    switch (type) {
      case 'users': return ['name', 'email', 'role'];
      case 'weeklyReports': return ['user_id', 'status'];
      case 'goals': return ['title', 'description', 'goal_type'];
      case 'leads': return ['lead_name', 'email', 'lead_source'];
      case 'notes': return ['content', 'targetType'];
      case 'products': return ['name', 'description'];
      case 'subitems': return ['name', 'description'];
      case 'callLogs': return ['notes', 'outcome'];
      case 'messageTemplates': return ['name', 'content', 'type'];
      default: return [];
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            Only Super Admins can access this data management system.
          </p>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
          <span className="text-black dark:text-white">Loading data management system...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2 text-black dark:text-white">
            <Database className="h-6 w-6 text-brand-blue" />
            Super Admin Data Management
          </h2>
          <p className="text-muted-foreground">
            Complete CRUD operations for all system data
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadAllData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search across all fields..."
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select 
                value={state.filterStatus} 
                onValueChange={(value) => setState(prev => ({ ...prev, filterStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={state.selectedTab} onValueChange={(value) => setState(prev => ({ ...prev, selectedTab: value }))}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="weeklyReports">Reports</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="subitems">Subitems</TabsTrigger>
          <TabsTrigger value="callLogs">Call Logs</TabsTrigger>
          <TabsTrigger value="messageTemplates">Templates</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">User Management</h3>
            <Button onClick={() => openCreateDialog('user')}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.users, 'users').map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.has_paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {user.has_paid ? 'Paid' : 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(user, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(user)}>
                            <Trash2 className="h-3 w-3" />
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

        {/* Weekly Reports Tab */}
        <TabsContent value="weeklyReports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Weekly Reports</h3>
            <Button onClick={() => openCreateDialog('weeklyReport')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Report
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.weeklyReports, 'weeklyReports').map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.user_id}</TableCell>
                      <TableCell>{report.start_date} - {report.end_date}</TableCell>
                      <TableCell>${report.revenue}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(report, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(report)}>
                            <Trash2 className="h-3 w-3" />
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

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Goals</h3>
            <Button onClick={() => openCreateDialog('goal')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.goals, 'goals').map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell>{goal.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{goal.goal_type}</Badge>
                      </TableCell>
                      <TableCell>{goal.current_value}/{goal.target_value}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{goal.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(goal, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(goal)}>
                            <Trash2 className="h-3 w-3" />
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

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Leads</h3>
            <Button onClick={() => openCreateDialog('lead')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.leads, 'leads').map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.lead_name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.lead_source}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.status || 'New'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(lead, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(lead)}>
                            <Trash2 className="h-3 w-3" />
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

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Notes</h3>
            <Button onClick={() => openCreateDialog('note')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Target Type</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.notes, 'notes').map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="max-w-xs truncate">{note.content}</TableCell>
                      <TableCell>{note.targetType}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{note.visibility}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(note, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(note)}>
                            <Trash2 className="h-3 w-3" />
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

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Products</h3>
            <Button onClick={() => openCreateDialog('product')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.products, 'products').map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(product, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product)}>
                            <Trash2 className="h-3 w-3" />
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

        {/* Subitems Tab */}
        <TabsContent value="subitems" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Subitems</h3>
            <Button onClick={() => openCreateDialog('subitem')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subitem
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.subitems, 'subitems').map((subitem) => (
                    <TableRow key={subitem.id}>
                      <TableCell>{subitem.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{subitem.description}</TableCell>
                      <TableCell>{subitem.product_id}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(subitem, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(subitem)}>
                            <Trash2 className="h-3 w-3" />
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

        {/* Call Logs Tab */}
        <TabsContent value="callLogs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Call Logs</h3>
            <Button onClick={() => openCreateDialog('callLog')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Call Log
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.callLogs, 'callLogs').map((callLog) => (
                    <TableRow key={callLog.id}>
                      <TableCell>{callLog.student_id}</TableCell>
                      <TableCell>{callLog.coach_id}</TableCell>
                      <TableCell>{callLog.outcome}</TableCell>
                      <TableCell>{callLog.call_date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(callLog, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(callLog)}>
                            <Trash2 className="h-3 w-3" />
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

        {/* Message Templates Tab */}
        <TabsContent value="messageTemplates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Message Templates</h3>
            <Button onClick={() => openCreateDialog('messageTemplate')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData(state.messageTemplates, 'messageTemplates').map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{template.content}</TableCell>
                      <TableCell>
                        <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(template, 'edit')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(template)}>
                            <Trash2 className="h-3 w-3" />
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
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editMode === 'create' ? 'Create New' : 'Edit'} {selectedItem?.type || 'Item'}
            </DialogTitle>
            <DialogDescription>
              {editMode === 'create' ? 'Add a new item to the system' : 'Update the selected item'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Form fields will be dynamically generated based on the selected data type.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setEditDialogOpen(false)}>
                {editMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-black dark:text-white">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem && (
                <>
                  Are you sure you want to delete this {selectedItem.type || 'item'}? 
                  This action cannot be undone and will remove all associated data.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedItem && handleDelete(selectedItem.id, selectedItem.type)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 