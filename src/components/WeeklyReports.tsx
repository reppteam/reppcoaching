import React, { useState, useEffect } from 'react';
import { eightbaseService } from '../services/8baseService';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Camera, 
  Plus,
  Edit,
  Eye,
  BarChart3,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { WeeklyReport } from '../types';

export const WeeklyReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingReport, setAddingReport] = useState(false);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<WeeklyReport | null>(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    new_clients: 0,
    paid_shoots: 0,
    free_shoots: 0,
    unique_clients: 0,
    aov: 0,
    revenue: 0,
    expenses: 0,
    editing_cost: 0,
    status: 'active' as 'active' | 'completed'
  });

  useEffect(() => {
    if (user?.id) {
    loadReports();
    }
  }, [user?.id]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const userId = user?.role === 'user' ? user.id : undefined;
      const data = await eightbaseService.getWeeklyReports(userId);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const netProfit = formData.revenue - formData.expenses - formData.editing_cost;
      const report = await eightbaseService.createWeeklyReport({
        user_id: user.id,
        ...formData,
        net_profit: netProfit
      });

      setReports([report, ...reports]);
      setAddingReport(false);
      resetForm();
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleUpdate = async (reportId: string) => {
    try {
      const updatedReport = await eightbaseService.updateWeeklyReport(reportId, formData);
      setReports(reports.map(r => r.id === reportId ? updatedReport : r));
      setEditingReport(null);
      resetForm();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

    const resetForm = () => {
      setFormData({
        start_date: '',
        end_date: '',
        new_clients: 0,
        paid_shoots: 0,
        free_shoots: 0,
        unique_clients: 0,
        aov: 0,
        revenue: 0,
        expenses: 0,
        editing_cost: 0,
      status: 'active' as 'active' | 'completed'
    });
  };

  const calculateNetProfit = () => {
    return formData.revenue - formData.expenses - formData.editing_cost;
  };

  const calculateAOV = () => {
    const totalShoots = formData.paid_shoots + formData.free_shoots;
    return totalShoots > 0 ? formData.revenue / totalShoots : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading weekly reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
            <div>
          <h2 className="text-3xl font-bold tracking-tight">Weekly Reports</h2>
          <p className="text-muted-foreground">
            Track your weekly performance and revenue
          </p>
      </div>
        <Dialog open={addingReport} onOpenChange={setAddingReport}>
                <DialogTrigger asChild>
                  <Button>
              <Plus className="h-4 w-4 mr-2" />
                    Add Report
                  </Button>
                </DialogTrigger>
          <DialogContent className="max-w-2xl">
                  <DialogHeader>
              <DialogTitle>Add Weekly Report</DialogTitle>
                    <DialogDescription>
                Record your weekly business performance
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                          required
                        />
                      </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new_clients">New Clients</Label>
                        <Input
                          id="new_clients"
                          type="number"
                          value={formData.new_clients}
                          onChange={(e) => setFormData({...formData, new_clients: parseInt(e.target.value) || 0})}
                        />
                      </div>
                <div>
                  <Label htmlFor="unique_clients">Unique Clients</Label>
                  <Input
                    id="unique_clients"
                    type="number"
                    value={formData.unique_clients}
                    onChange={(e) => setFormData({...formData, unique_clients: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="paid_shoots">Paid Shoots</Label>
                        <Input
                          id="paid_shoots"
                          type="number"
                          value={formData.paid_shoots}
                          onChange={(e) => setFormData({...formData, paid_shoots: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="free_shoots">Free Shoots</Label>
                        <Input
                          id="free_shoots"
                          type="number"
                          value={formData.free_shoots}
                          onChange={(e) => setFormData({...formData, free_shoots: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                  <Label htmlFor="aov">AOV ($)</Label>
                        <Input
                          id="aov"
                          type="number"
                          value={formData.aov}
                          onChange={(e) => setFormData({...formData, aov: parseFloat(e.target.value) || 0})}
                        />
                      </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                      <div>
                  <Label htmlFor="revenue">Revenue ($)</Label>
                        <Input
                          id="revenue"
                          type="number"
                          value={formData.revenue}
                          onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                  <Label htmlFor="expenses">Expenses ($)</Label>
                        <Input
                          id="expenses"
                          type="number"
                          value={formData.expenses}
                          onChange={(e) => setFormData({...formData, expenses: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                  <Label htmlFor="editing_cost">Editing Cost ($)</Label>
                        <Input
                          id="editing_cost"
                          type="number"
                          value={formData.editing_cost}
                          onChange={(e) => setFormData({...formData, editing_cost: parseFloat(e.target.value) || 0})}
                        />
                      </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                        <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'completed') => setFormData({...formData, status: value})}>
                          <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

              {/* Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Shoots</p>
                      <p className="text-2xl font-bold">{formData.paid_shoots + formData.free_shoots}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Calculated AOV</p>
                      <p className="text-2xl font-bold">${calculateAOV().toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Profit</p>
                      <p className="text-2xl font-bold text-green-600">${calculateNetProfit().toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddingReport(false)}>
                        Cancel
                      </Button>
                <Button type="submit">Save Report</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reports.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{reports.length > 0 ? ((reports[0].revenue / reports[reports.length - 1].revenue - 1) * 100).toFixed(1) : 0}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shoots</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum, r) => sum + r.paid_shoots + r.free_shoots, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {reports.reduce((sum, r) => sum + r.new_clients, 0)} new clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average AOV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reports.length > 0 ? (reports.reduce((sum, r) => sum + r.aov, 0) / reports.length).toFixed(2) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per shoot average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${reports.reduce((sum, r) => sum + r.net_profit, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total profit
            </p>
          </CardContent>
        </Card>
          </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Your weekly performance reports
          </CardDescription>
        </CardHeader>
        <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Shoots</TableHead>
                <TableHead>New Clients</TableHead>
                <TableHead>AOV</TableHead>
                    <TableHead>Net Profit</TableHead>
                    <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                        {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${report.revenue.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{report.paid_shoots + report.free_shoots}</span>
                      <div className="text-xs text-muted-foreground">
                        {report.paid_shoots} paid, {report.free_shoots} free
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{report.new_clients}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${report.aov.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">
                      ${report.net_profit.toFixed(2)}
                    </div>
                      </TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                      </TableCell>
                        <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewingReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setFormData({
                            start_date: report.start_date,
                            end_date: report.end_date,
                            new_clients: report.new_clients,
                            paid_shoots: report.paid_shoots,
                            free_shoots: report.free_shoots,
                            unique_clients: report.unique_clients,
                            aov: report.aov,
                            revenue: report.revenue,
                            expenses: report.expenses,
                            editing_cost: report.editing_cost,
                            status: report.status
                          });
                          setEditingReport(report.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
        </CardContent>
      </Card>

      {/* Edit Report Dialog */}
      <Dialog open={!!editingReport} onOpenChange={() => setEditingReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Weekly Report</DialogTitle>
            <DialogDescription>
              Update your weekly report information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_start_date">Start Date</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_end_date">End Date</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_new_clients">New Clients</Label>
                <Input
                  id="edit_new_clients"
                  type="number"
                  value={formData.new_clients}
                  onChange={(e) => setFormData({...formData, new_clients: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit_unique_clients">Unique Clients</Label>
                <Input
                  id="edit_unique_clients"
                  type="number"
                  value={formData.unique_clients}
                  onChange={(e) => setFormData({...formData, unique_clients: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_paid_shoots">Paid Shoots</Label>
                <Input
                  id="edit_paid_shoots"
                  type="number"
                  value={formData.paid_shoots}
                  onChange={(e) => setFormData({...formData, paid_shoots: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit_free_shoots">Free Shoots</Label>
                <Input
                  id="edit_free_shoots"
                  type="number"
                  value={formData.free_shoots}
                  onChange={(e) => setFormData({...formData, free_shoots: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit_aov">AOV ($)</Label>
                <Input
                  id="edit_aov"
                  type="number"
                  value={formData.aov}
                  onChange={(e) => setFormData({...formData, aov: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_revenue">Revenue ($)</Label>
                <Input
                  id="edit_revenue"
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit_expenses">Expenses ($)</Label>
                <Input
                  id="edit_expenses"
                  type="number"
                  value={formData.expenses}
                  onChange={(e) => setFormData({...formData, expenses: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit_editing_cost">Editing Cost ($)</Label>
                <Input
                  id="edit_editing_cost"
                  type="number"
                  value={formData.editing_cost}
                  onChange={(e) => setFormData({...formData, editing_cost: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'completed') => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Shoots</p>
                    <p className="text-2xl font-bold">{formData.paid_shoots + formData.free_shoots}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Calculated AOV</p>
                    <p className="text-2xl font-bold">${calculateAOV().toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold text-green-600">${calculateNetProfit().toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingReport(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingReport && handleUpdate(editingReport)}>
                Update Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Weekly Report</DialogTitle>
            <DialogDescription>
              Read-only view of the weekly report
            </DialogDescription>
          </DialogHeader>
          {viewingReport && (
            <div className="space-y-6">
              {/* Report Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p className="text-lg font-semibold">{new Date(viewingReport.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p className="text-lg font-semibold">{new Date(viewingReport.end_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Client Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">New Clients</Label>
                  <p className="text-2xl font-bold text-blue-600">{viewingReport.new_clients}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unique Clients</Label>
                  <p className="text-2xl font-bold text-green-600">{viewingReport.unique_clients}</p>
                </div>
              </div>

              {/* Shoot Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Paid Shoots</Label>
                  <p className="text-2xl font-bold text-emerald-600">{viewingReport.paid_shoots}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Free Shoots</Label>
                  <p className="text-2xl font-bold text-orange-600">{viewingReport.free_shoots}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Shoots</Label>
                  <p className="text-2xl font-bold">{viewingReport.paid_shoots + viewingReport.free_shoots}</p>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Revenue</Label>
                  <p className="text-2xl font-bold text-green-600">${viewingReport.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Expenses</Label>
                  <p className="text-2xl font-bold text-red-600">${viewingReport.expenses.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Editing Cost</Label>
                  <p className="text-2xl font-bold text-orange-600">${viewingReport.editing_cost.toLocaleString()}</p>
                </div>
              </div>

              {/* AOV and Net Profit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Average Order Value (AOV)</Label>
                  <p className="text-2xl font-bold text-purple-600">${viewingReport.aov.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Net Profit</Label>
                  <p className="text-2xl font-bold text-green-600">${viewingReport.net_profit.toFixed(2)}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant={viewingReport.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                  {viewingReport.status}
                </Badge>
              </div>

              {/* Created Date */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Report Created</Label>
                <p className="text-sm">{new Date(viewingReport.created_at).toLocaleString()}</p>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewingReport(null)}>
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