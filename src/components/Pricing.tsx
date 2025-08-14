import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Pricing as PricingType } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, DollarSign, Package, CheckCircle } from 'lucide-react';

export function Pricing() {
  const { user } = useAuth();
  const [pricingData, setPricingData] = useState<PricingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [packageFormData, setPackageFormData] = useState({
    service_name: '',
    your_price: 0,
    competitor_price: 0,
    estimated_cost: 0,
    estimated_profit: 0,
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadPricingData();
  }, [user]);

  const loadPricingData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await eightbaseService.getPricing(user.id);
      setPricingData(data);
    } catch (error) {
      console.error('Failed to load pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pricing: PricingType) => {
    setEditingId(pricing.id);
    setPackageFormData({
      service_name: pricing.service_name,
      your_price: pricing.your_price,
      competitor_price: pricing.competitor_price,
      estimated_cost: pricing.estimated_cost,
      estimated_profit: pricing.estimated_profit,
      status: pricing.status
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      if (editingId) {
        const updated = await eightbaseService.updatePricing(editingId, packageFormData);
        console.log('Updated pricing:', updated);
      } else {
        const newPricing = await eightbaseService.createPricing({
          ...packageFormData,
          user_id: user.id
        });
        console.log('Created pricing:', newPricing);
      }

      await loadPricingData();
      setEditDialogOpen(false);
      setEditingId(null);
      setPackageFormData({
        service_name: '',
        your_price: 0,
        competitor_price: 0,
        estimated_cost: 0,
        estimated_profit: 0,
        status: 'active'
      });
    } catch (error) {
      console.error('Failed to save pricing:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eightbaseService.deletePricing(id);
      await loadPricingData();
    } catch (error) {
      console.error('Failed to delete pricing:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading pricing data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
          <div className="flex justify-between items-center">
            <div>
          <h1 className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-brand-blue" />
            Pricing Management
          </h1>
          <p className="text-muted-foreground">
            Manage your service pricing and competitive analysis
          </p>
            </div>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Pricing Package
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                {editingId ? 'Edit Pricing Package' : 'Add New Pricing Package'}
                    </DialogTitle>
                    <DialogDescription>
                Configure your service pricing and competitive analysis
                    </DialogDescription>
                  </DialogHeader>
            <div className="space-y-4">
                    <div>
                      <Label htmlFor="service_name">Service Name</Label>
                      <Input
                        id="service_name"
                  value={packageFormData.service_name}
                  onChange={(e) => setPackageFormData({...packageFormData, service_name: e.target.value})}
                  placeholder="e.g., Standard Photo Shoot"
                      />
                    </div>
              
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                  <Label htmlFor="your_price">Your Price ($)</Label>
                        <Input
                          id="your_price"
                          type="number"
                    value={packageFormData.your_price}
                    onChange={(e) => setPackageFormData({...packageFormData, your_price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                  <Label htmlFor="competitor_price">Competitor Price ($)</Label>
                        <Input
                          id="competitor_price"
                          type="number"
                    value={packageFormData.competitor_price}
                    onChange={(e) => setPackageFormData({...packageFormData, competitor_price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
              
              <div className="grid grid-cols-2 gap-4">
                    <div>
                  <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
                      <Input
                        id="estimated_cost"
                        type="number"
                    value={packageFormData.estimated_cost}
                    onChange={(e) => setPackageFormData({...packageFormData, estimated_cost: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                <div>
                  <Label htmlFor="estimated_profit">Estimated Profit ($)</Label>
                  <Input
                    id="estimated_profit"
                    type="number"
                    value={packageFormData.estimated_profit}
                    onChange={(e) => setPackageFormData({...packageFormData, estimated_profit: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                  value={packageFormData.status}
                  onValueChange={(value: 'active' | 'inactive') => setPackageFormData({...packageFormData, status: value})}
                      >
                        <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
              
                    <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                <Button onClick={handleSave}>
                  {editingId ? 'Update Package' : 'Create Package'}
                      </Button>
                    </div>
            </div>
                </DialogContent>
              </Dialog>
          </div>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Pricing Packages</CardTitle>
          <CardDescription>
            Manage your service offerings and competitive positioning
          </CardDescription>
        </CardHeader>
        <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Your Price</TableHead>
                <TableHead>Competitor Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Profit</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {pricingData.map((pricing) => {
                const margin = pricing.your_price > 0 ? ((pricing.estimated_profit / pricing.your_price) * 100).toFixed(1) : '0';
                const priceDifference = pricing.your_price - pricing.competitor_price;
                    
                    return (
                  <TableRow key={pricing.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pricing.service_name}</div>
                        <Badge className="bg-green-100 text-green-800">
                          {pricing.status || 'active'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${pricing.your_price.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-600">
                        ${pricing.competitor_price.toLocaleString()}
                      </div>
                      {priceDifference !== 0 && (
                        <div className={`text-xs ${priceDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {priceDifference > 0 ? '+' : ''}{priceDifference > 0 ? priceDifference : Math.abs(priceDifference)}
                        </div>
                      )}
                    </TableCell>
                        <TableCell>
                      <div className="font-medium text-red-600">
                        ${pricing.estimated_cost.toLocaleString()}
                          </div>
                        </TableCell>
                    <TableCell>
                      <div className="font-medium text-emerald-600">
                        ${pricing.estimated_profit.toLocaleString()}
                      </div>
                        </TableCell>
                        <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {margin}%
                          </Badge>
                        </TableCell>
                          <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(pricing)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                            <Button
                              size="sm"
                          variant="outline"
                          onClick={() => handleDelete(pricing.id)}
                            >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                            </Button>
                      </div>
                          </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingData.length}</div>
            <p className="text-xs text-muted-foreground">Active pricing packages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${pricingData.length > 0 ? (pricingData.reduce((sum, p) => sum + p.your_price, 0) / pricingData.length).toFixed(0) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Average your price</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pricingData.length > 0 ? 
                (pricingData.reduce((sum, p) => sum + (p.your_price > 0 ? (p.estimated_profit / p.your_price) * 100 : 0), 0) / pricingData.length).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">Average profit margin</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}