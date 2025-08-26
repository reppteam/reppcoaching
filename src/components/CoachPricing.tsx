import React, { useState, useEffect } from 'react';
import { CoachPricingItem } from '../types'; // Or define it here if not already
import { useAuth } from '../hooks/useAuth';
import {
  eightbaseService
} from '../services/8baseService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './ui/alert-dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import {
  Package,
  DollarSign,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Star,
  TrendingUp,
  Users,
  Copy
} from 'lucide-react';
import { Badge } from './ui/badge';
import PricingList from './PricingList';

interface PricingPackage {
  id: string;
  coach_id: string;
  name: string;
  description: string;
  duration_weeks: number;
  price: number;
  is_active: boolean;
  features: string[];
  category: 'basic' | 'standard' | 'premium' | 'custom';
  created_at: string;
  updated_at: string;
}

export function CoachPricing() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [data, setData] = useState<CoachPricingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [createPackageDialogOpen, setCreatePackageDialogOpen] = useState(false);
  const [editPackageDialogOpen, setEditPackageDialogOpen] = useState(false);
  const [deletePackageDialogOpen, setDeletePackageDialogOpen] = useState(false);

  const [packageFormData, setPackageFormData] = useState<{
    name: string;
    description: string;
    duration_weeks: number;
    price: number;
    category: 'basic' | 'standard' | 'premium' | 'custom'; // 🔧 fix here
    features: string[];
    is_active: boolean;
  }>({
    name: '',
    description: '',
    duration_weeks: 4,
    price: 0,
    category: 'basic',
    features: [],
    is_active: true
  });


  const [editingPackage, setEditingPackage] = useState<PricingPackage | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<PricingPackage | null>(null);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadPackages();
    }
  }, [user?.id]);


  const loadPackages = async () => {
    setLoading(true);
    try {
      console.log('Loading packages for user:', user?.id);
      const response = await eightbaseService.getCoachPricing(user?.id);
      console.log('Raw response from service:', response);
      console.log('Response length:', response.length);

      const transformed: CoachPricingItem[] = response.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        duration_weeks: pkg.duration_weeks,
        category: pkg.category,
        package_Features: pkg.package_Features || [],
        status: pkg.status,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        user: {
          id: pkg.user?.id || '',
          firstName: pkg.user?.firstName || '',
          lastName: pkg.user?.lastName || '',
          email: pkg.user?.email || '',
        }
      }));

      console.log('Transformed data:', transformed);
      console.log('Transformed data length:', transformed.length);
      setData(transformed);
      console.log("Final data state:", transformed);

      setPackages(
        transformed.map(pkg => {
          return {
            id: pkg.id,
            coach_id: pkg.user.id,
            name: pkg.name,
            description: pkg.description,
            duration_weeks: pkg.duration_weeks,
            price: pkg.price,
            category: pkg.category as any,
            created_at: pkg.createdAt,
            updated_at: pkg.updatedAt,
            features: pkg.package_Features || [],
            is_active: pkg.status === 'active'
          };
        })
      );
    } catch (err) {
      console.error('Failed to load packages', err);
    } finally {
      setLoading(false);
    }
  };




  const resetPackageForm = () => {
    setPackageFormData({
      name: '',
      description: '',
      duration_weeks: 4,
      price: 0,
      category: 'basic',
      features: [],
      is_active: true,
    });
    setNewFeature('');
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ Prevents page reload

    try {
      const success = await eightbaseService.createCoachPricing({
        name: packageFormData.name,
        description: packageFormData.description,
        duration_weeks: packageFormData.duration_weeks,
        price: packageFormData.price,
        category: packageFormData.category,
        package_Features: packageFormData.features,
        status: packageFormData.is_active ? 'active' : 'inactive',
      } as any);

      if (success) {
        await loadPackages();
        setCreatePackageDialogOpen(false);
        resetPackageForm();
      } else {
        console.error('Create failed - no success response');
      }
    } catch (err) {
      console.error('Create failed', err);
    }
  };


  const handleEditPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    try {
      const success = await eightbaseService.updateCoachPricing(editingPackage.id, {
        name: packageFormData.name,
        description: packageFormData.description,
        duration_weeks: packageFormData.duration_weeks,
        price: packageFormData.price,
        category: packageFormData.category,
        package_Features: packageFormData.features,
        status: packageFormData.is_active ? 'active' : 'inactive'
      } as any);

      if (success) {
        await loadPackages();
        setEditPackageDialogOpen(false);
        setEditingPackage(null);
        resetPackageForm(); // Clear all form values
        setNewFeature(''); // Clear the new feature input
      } else {
        console.error('Update failed - no success response');
      }
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;
    try {
      const success = await eightbaseService.deleteCoachPricing(packageToDelete.id);
      if (success) {
        await loadPackages();
        setDeletePackageDialogOpen(false);
        setPackageToDelete(null);
      } else {
        console.error('Delete failed - no success response');
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };





  const handleTogglePackageStatus = async (id: string, isActive: boolean) => {
    try {
      const success = await eightbaseService.updateCoachPricing(id, { 
        status: isActive ? 'active' : 'inactive' 
      });
      if (success) {
        await loadPackages();
      } else {
        console.error('Status update failed - no success response');
      }
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const openEditDialog = (pkg: PricingPackage) => {
    setEditingPackage(pkg);
    setPackageFormData({
      name: pkg.name,
      description: pkg.description,
      duration_weeks: pkg.duration_weeks,
      price: pkg.price,
      category: pkg.category,
      features: [...pkg.features],
      is_active: pkg.is_active
    });
    setEditPackageDialogOpen(true);
  };

  const openDeleteDialog = (pkg: PricingPackage) => {
    setPackageToDelete(pkg);
    setDeletePackageDialogOpen(true);
  };
  const addFeature = () => {
    if (!newFeature.trim()) return;

    setPackageFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeature.trim()],
    }));

    setNewFeature('');
  };


  const removeFeature = (featureToRemove: string) => {
    setPackageFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const duplicatePackage = (pkg: PricingPackage) => {
    setPackageFormData({
      name: `${pkg.name} (Copy)`,
      description: pkg.description,
      duration_weeks: pkg.duration_weeks,
      price: pkg.price,
      category: pkg.category,
      features: [...pkg.features],
      is_active: false
    });
    setCreatePackageDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return <Package className="h-4 w-4" />;
      case 'standard': return <TrendingUp className="h-4 w-4" />;
      case 'premium': return <Star className="h-4 w-4" />;
      case 'custom': return <Users className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Check if user can manage pricing
  // const canManagePricing = user?.role === 'coach' || user?.role === 'coach_manager' || user?.role === 'super_admin';
  const canManagePricing = user?.role === 'coach' || user?.role === 'coach_manager' || user?.role === 'super_admin' || user?.role === 'user';


  if (!canManagePricing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only coaches and coach managers can access pricing management.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading pricing packages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Pricing Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage your coaching packages and services
          </p>
        </div>

        <Dialog open={createPackageDialogOpen} onOpenChange={setCreatePackageDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{data.length}</div>
                <div className="text-sm text-muted-foreground">Total Packages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{data.filter(p => p.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground">Active Packages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  ${data.length > 0 ? Math.round(data.reduce((sum, p) => sum + p.price, 0) / data.length) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Price</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {data.length > 0 ? Math.round(data.reduce((sum, p) => sum + p.duration_weeks, 0) / data.length) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Duration (weeks)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Manage Packages</TabsTrigger>
          <TabsTrigger value="analytics">Package Analytics</TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          {data.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No packages yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first coaching package to get started
                  </p>
                  <Button onClick={() => setCreatePackageDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PricingList
              data={data}
              onEdit={(pkg) => {
                setEditingPackage({
                  id: pkg.id,
                  coach_id: pkg.user.id,
                  name: pkg.name,
                  description: pkg.description,
                  price: pkg.price,
                  duration_weeks: pkg.duration_weeks,
                  category: pkg.category as any,
                  features: pkg.package_Features || [],
                  is_active: pkg.status === 'active',
                  created_at: pkg.createdAt,
                  updated_at: pkg.updatedAt,
                });
                setPackageFormData({
                  name: pkg.name,
                  description: pkg.description,
                  price: pkg.price,
                  duration_weeks: pkg.duration_weeks,
                  category: pkg.category as any,
                  features: pkg.package_Features || [],
                  is_active: pkg.status === 'active',
                });
                setEditPackageDialogOpen(true);
              }}
              onDelete={(pkg) => {
                setPackageToDelete({
                  id: pkg.id,
                  coach_id: pkg.user.id,
                  name: pkg.name,
                  description: pkg.description,
                  price: pkg.price,
                  duration_weeks: pkg.duration_weeks,
                  category: pkg.category as any,
                  features: pkg.package_Features || [],
                  is_active: pkg.status === 'active',
                  created_at: pkg.createdAt,
                  updated_at: pkg.updatedAt,
                });
                setDeletePackageDialogOpen(true);
              }}
              onDuplicate={(pkg) => {
                setPackageFormData({
                  name: `${pkg.name} (Copy)`,
                  description: pkg.description,
                  price: pkg.price,
                  duration_weeks: pkg.duration_weeks,
                  category: pkg.category as any,
                  features: pkg.package_Features || [],
                  is_active: false,
                });
                setCreatePackageDialogOpen(true);
              }}
              onToggleStatus={(pkg) => {
                handleTogglePackageStatus(pkg.id, pkg.status === 'inactive');
              }}
            />




          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Package Performance</CardTitle>
              <CardDescription>
                Analytics and insights for your pricing packages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Package performance metrics and insights will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Package Dialog */}
      <Dialog open={createPackageDialogOpen} onOpenChange={setCreatePackageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Package
            </DialogTitle>
            <DialogDescription>
              Design a new coaching package with pricing and features
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePackage} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package-name">Package Name *</Label>
                <Input
                  id="package-name"
                  value={packageFormData.name}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Professional Development"
                  required
                />
              </div>
              <div>
                <Label htmlFor="package-category">Category *</Label>
                <Select value={packageFormData.category} onValueChange={(value: any) => setPackageFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="package-description">Description *</Label>
              <Textarea
                id="package-description"
                value={packageFormData.description}
                onChange={(e) => setPackageFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this package includes..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package-price">Price ($) *</Label>
                <Input
                  id="package-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={packageFormData.price}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="299.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="package-duration">Duration (weeks) *</Label>
                <Input
                  id="package-duration"
                  type="number"
                  min="1"
                  value={packageFormData.duration_weeks}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) || 1 }))}
                  placeholder="4"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Package Features</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addFeature}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {packageFormData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between rounded border px-2 py-1 text-sm">
                  {feature}
                  <button
                    type="button"
                    className="text-red-500 text-xs"
                    onClick={() =>
                      setPackageFormData((prev) => ({
                        ...prev,
                        features: prev.features.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="package-active"
                checked={packageFormData.is_active}
                onCheckedChange={(checked) => setPackageFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="package-active">Make package active immediately</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreatePackageDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Package
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={editPackageDialogOpen} onOpenChange={setEditPackageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Package
            </DialogTitle>
            <DialogDescription>
              Update your package details and features
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPackage} className="space-y-4">
            {/* Same form fields as create, but for editing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-package-name">Package Name *</Label>
                <Input
                  id="edit-package-name"
                  value={packageFormData.name}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-package-category">Category *</Label>
                <Select value={packageFormData.category} onValueChange={(value: any) => setPackageFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-package-description">Description *</Label>
              <Textarea
                id="edit-package-description"
                value={packageFormData.description}
                onChange={(e) => setPackageFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-package-price">Price ($) *</Label>
                <Input
                  id="edit-package-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={packageFormData.price}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-package-duration">Duration (weeks) *</Label>
                <Input
                  id="edit-package-duration"
                  type="number"
                  min="1"
                  value={packageFormData.duration_weeks}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Package Features</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addFeature}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {packageFormData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between rounded border px-2 py-1 text-sm mt-2">
                  {feature}
                  <button
                    type="button"
                    className="text-red-500 text-xs"
                    onClick={() =>
                      setPackageFormData((prev) => ({
                        ...prev,
                        features: prev.features.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditPackageDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Package
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Package Dialog */}
      <AlertDialog open={deletePackageDialogOpen} onOpenChange={setDeletePackageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Package
            </AlertDialogTitle>
            <AlertDialogDescription>
              {packageToDelete && (
                <>
                  Are you sure you want to delete <strong>{packageToDelete.name}</strong>?
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePackage} className="bg-red-600 hover:bg-red-700">
              Delete Package
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}