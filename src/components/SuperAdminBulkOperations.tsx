import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { User, WeeklyReport, Goal, Lead } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Users, 
  Target,
  FileText,
  Phone,
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
  RefreshCw,
  Trash2,
  Edit,
  Copy,
  Archive,
  Send,
  Mail,
  Shield,
  Crown
} from 'lucide-react';

interface BulkOperation {
  id: string;
  type: 'user' | 'weeklyReport' | 'goal' | 'lead';
  operation: 'update' | 'delete' | 'assign' | 'export' | 'archive';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  itemsCount: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export function SuperAdminBulkOperations() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  
  // Dialog states
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkExportDialogOpen, setBulkExportDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [operationData, setOperationData] = useState<any>({});

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, reportsData, goalsData, leadsData] = await Promise.all([
        eightbaseService.getAllUsersWithDetails(),
        eightbaseService.getAllWeeklyReports(),
        eightbaseService.getAllGoals(),
        eightbaseService.getAllLeads()
      ]);
      
      setUsers(usersData);
      setWeeklyReports(reportsData);
      setGoals(goalsData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (type: string) => {
    const allIds = getAllIds(type);
    if (selectedItems.size === allIds.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allIds));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getAllIds = (type: string): string[] => {
    switch (type) {
      case 'users': return users.map(u => u.id);
      case 'weeklyReports': return weeklyReports.map(w => w.id);
      case 'goals': return goals.map(g => g.id);
      case 'leads': return leads.map(l => l.id);
      default: return [];
    }
  };

  const getSelectedItems = (type: string): any[] => {
    const allItems = getAllItems(type);
    return allItems.filter(item => selectedItems.has(item.id));
  };

  const getAllItems = (type: string): any[] => {
    switch (type) {
      case 'users': return users;
      case 'weeklyReports': return weeklyReports;
      case 'goals': return goals;
      case 'leads': return leads;
      default: return [];
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedItems.size === 0) return;

    const operation: BulkOperation = {
      id: Date.now().toString(),
      type: selectedOperation as any,
      operation: 'update',
      status: 'processing',
      itemsCount: selectedItems.size,
      createdAt: new Date().toISOString()
    };

    setBulkOperations(prev => [...prev, operation]);

    try {
      const selectedData = getSelectedItems(selectedOperation);
      
      // Perform bulk update based on operation type
      switch (selectedOperation) {
        case 'users':
          await Promise.all(selectedData.map(user => 
            eightbaseService.updateUser(user.id, operationData)
          ));
          break;
        case 'weeklyReports':
          await Promise.all(selectedData.map(report => 
            eightbaseService.updateWeeklyReport(report.id, operationData)
          ));
          break;
        case 'goals':
          await Promise.all(selectedData.map(goal => 
            eightbaseService.updateGoal(goal.id, operationData)
          ));
          break;
        case 'leads':
          await Promise.all(selectedData.map(lead => 
            eightbaseService.updateLead(lead.id, operationData)
          ));
          break;
      }

      // Update operation status
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'completed', completedAt: new Date().toISOString() }
          : op
      ));

      // Refresh data
      await loadData();
      setSelectedItems(new Set());
      setBulkUpdateDialogOpen(false);
      setOperationData({});
    } catch (error) {
      console.error('Bulk update failed:', error);
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          : op
      ));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const operation: BulkOperation = {
      id: Date.now().toString(),
      type: selectedOperation as any,
      operation: 'delete',
      status: 'processing',
      itemsCount: selectedItems.size,
      createdAt: new Date().toISOString()
    };

    setBulkOperations(prev => [...prev, operation]);

    try {
      const selectedData = getSelectedItems(selectedOperation);
      
      // Perform bulk delete based on operation type
      switch (selectedOperation) {
        case 'users':
          await Promise.all(selectedData.map(user => 
            eightbaseService.deleteUser(user.id, user.email)
          ));
          break;
        case 'weeklyReports':
          await Promise.all(selectedData.map(report => 
            eightbaseService.deleteWeeklyReport(report.id)
          ));
          break;
        case 'goals':
          await Promise.all(selectedData.map(goal => 
            eightbaseService.deleteGoal(goal.id)
          ));
          break;
        case 'leads':
          await Promise.all(selectedData.map(lead => 
            eightbaseService.deleteLead(lead.id)
          ));
          break;
      }

      // Update operation status
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'completed', completedAt: new Date().toISOString() }
          : op
      ));

      // Refresh data
      await loadData();
      setSelectedItems(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          : op
      ));
    }
  };

  const handleBulkAssign = async () => {
    if (selectedItems.size === 0 || !operationData.coachId) return;

    const operation: BulkOperation = {
      id: Date.now().toString(),
      type: 'user',
      operation: 'assign',
      status: 'processing',
      itemsCount: selectedItems.size,
      createdAt: new Date().toISOString()
    };

    setBulkOperations(prev => [...prev, operation]);

    try {
      const selectedUsers = getSelectedItems('users');
      
      // Get coach record ID from user ID
      const coachRecordId = await eightbaseService.getCoachRecordIdByUserId(operationData.coachId);
      if (!coachRecordId) {
        throw new Error(`No coach record found for user ${operationData.coachId}`);
      }
      
      // Assign students to coach
      await Promise.all(selectedUsers.map(user => 
        eightbaseService.assignStudentToCoach(user.id, coachRecordId)
      ));

      // Update operation status
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'completed', completedAt: new Date().toISOString() }
          : op
      ));

      // Refresh data
      await loadData();
      setSelectedItems(new Set());
      setBulkAssignDialogOpen(false);
      setOperationData({});
    } catch (error) {
      console.error('Bulk assign failed:', error);
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          : op
      ));
    }
  };

  const handleBulkExport = async () => {
    if (selectedItems.size === 0) return;

    const operation: BulkOperation = {
      id: Date.now().toString(),
      type: selectedOperation as any,
      operation: 'export',
      status: 'processing',
      itemsCount: selectedItems.size,
      createdAt: new Date().toISOString()
    };

    setBulkOperations(prev => [...prev, operation]);

    try {
      const selectedData = getSelectedItems(selectedOperation);
      
      // Create CSV data
      const csvData = convertToCSV(selectedData, selectedOperation);
      
      // Download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedOperation}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Update operation status
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'completed', completedAt: new Date().toISOString() }
          : op
      ));

      setBulkExportDialogOpen(false);
    } catch (error) {
      console.error('Bulk export failed:', error);
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          : op
      ));
    }
  };

  const convertToCSV = (data: any[], type: string): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            Only Super Admins can access bulk operations.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
          <span className="text-black dark:text-white">Loading bulk operations...</span>
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
            <Settings className="h-6 w-6 text-brand-blue" />
            Bulk Operations
          </h2>
          <p className="text-muted-foreground">
            Perform mass operations on system data
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Data Type</CardTitle>
          <CardDescription>
            Choose the type of data you want to perform bulk operations on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${
                selectedOperation === 'users' ? 'border-brand-blue bg-blue-50' : ''
              }`}
              onClick={() => setSelectedOperation('users')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Users</div>
                  <div className="text-sm text-muted-foreground">{users.length} total</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                selectedOperation === 'weeklyReports' ? 'border-brand-blue bg-blue-50' : ''
              }`}
              onClick={() => setSelectedOperation('weeklyReports')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">Reports</div>
                  <div className="text-sm text-muted-foreground">{weeklyReports.length} total</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                selectedOperation === 'goals' ? 'border-brand-blue bg-blue-50' : ''
              }`}
              onClick={() => setSelectedOperation('goals')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="font-medium">Goals</div>
                  <div className="text-sm text-muted-foreground">{goals.length} total</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                selectedOperation === 'leads' ? 'border-brand-blue bg-blue-50' : ''
              }`}
              onClick={() => setSelectedOperation('leads')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-medium">Leads</div>
                  <div className="text-sm text-muted-foreground">{leads.length} total</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedOperation && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Operations - {selectedOperation}</CardTitle>
            <CardDescription>
              {selectedItems.size} items selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => setBulkUpdateDialogOpen(true)}
                disabled={selectedItems.size === 0}
              >
                <Edit className="mr-2 h-4 w-4" />
                Bulk Update
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setBulkDeleteDialogOpen(true)}
                disabled={selectedItems.size === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Bulk Delete
              </Button>
              
              {selectedOperation === 'users' && (
                <Button 
                  variant="outline" 
                  onClick={() => setBulkAssignDialogOpen(true)}
                  disabled={selectedItems.size === 0}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign to Coach
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setBulkExportDialogOpen(true)}
                disabled={selectedItems.size === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {selectedOperation && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedOperation} Data</CardTitle>
            <CardDescription>
              Select items to perform bulk operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === getAllIds(selectedOperation).length}
                      onCheckedChange={() => handleSelectAll(selectedOperation)}
                    />
                  </TableHead>
                  <TableHead>Name/ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getAllItems(selectedOperation).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {item.name || item.title || item.lead_name || item.id}
                    </TableCell>
                    <TableCell>
                      {item.role || item.goal_type || item.lead_source || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.status || item.has_paid ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Operation History */}
      <Card>
        <CardHeader>
          <CardTitle>Operation History</CardTitle>
          <CardDescription>
            Recent bulk operations and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bulkOperations.length === 0 ? (
            <div className="text-center py-8">
              <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No operations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bulkOperations.slice(-5).reverse().map((operation) => (
                <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {operation.operation} {operation.type} ({operation.itemsCount} items)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(operation.createdAt).toLocaleString()}
                    </div>
                    {operation.error && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {operation.error}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(operation.status)}
                    {operation.status === 'processing' && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update {selectedOperation}</DialogTitle>
            <DialogDescription>
              Update {selectedItems.size} selected items
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Update Fields</Label>
              <Textarea
                placeholder="Enter JSON data to update (e.g., {'status': 'active'})"
                value={JSON.stringify(operationData, null, 2)}
                onChange={(e) => {
                  try {
                    setOperationData(JSON.parse(e.target.value));
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkUpdate}>
                Update Items
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-black dark:text-white">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Bulk Delete {selectedOperation}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.size} selected {selectedOperation}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Delete Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Students to Coach</DialogTitle>
            <DialogDescription>
              Assign {selectedItems.size} selected students to a coach
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Coach</Label>
              <Select 
                value={operationData.coachId || ''} 
                onValueChange={(value) => setOperationData({ ...operationData, coachId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a coach" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'coach').map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.firstName} {coach.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setBulkAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAssign}>
                Assign Students
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Export Dialog */}
      <Dialog open={bulkExportDialogOpen} onOpenChange={setBulkExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export {selectedOperation}</DialogTitle>
            <DialogDescription>
              Export {selectedItems.size} selected items as CSV
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setBulkExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkExport}>
                Export CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 