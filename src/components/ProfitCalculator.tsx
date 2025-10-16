import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Calculator, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Camera, 
  DollarSign,
  Target,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../hooks/useAuth';
import { useApolloClient } from '@apollo/client';
import ProfitCalculatorService, { 
  ProductWithCalculations 
} from '../services/profitCalculatorService';
import type { GlobalVariables, Product, Subitem } from '../types';

interface ProfitCalculatorProps {
  studentId?: string; // Optional prop to show specific student's calculator
}

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ studentId }) => {
  const { user } = useAuth();
  const apolloClient = useApolloClient();
  const [service, setService] = useState<ProfitCalculatorService | null>(null);
  
  // State for global variables
  const [globalVariables, setGlobalVariables] = useState<GlobalVariables | null>(null);
  
  // State for products and subitems
  const [products, setProducts] = useState<Product[]>([]);
  const [subitems, setSubitems] = useState<Subitem[]>([]);
  const [productsWithCalculations, setProductsWithCalculations] = useState<ProductWithCalculations[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddCostOpen, setIsAddCostOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Form states
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    price: 0
  });

  const [newCostForm, setNewCostForm] = useState({
    type: 'fixed' as 'fixed' | 'photo' | 'labor',
    label: '',
    value: 0
  });

  // Initialize service and load data
  useEffect(() => {
    const userId = studentId || user?.id;
    if (userId && apolloClient) {
      const profitService = new ProfitCalculatorService(userId);
      profitService.setApolloClient(apolloClient);
      setService(profitService);
      loadData(profitService);
    }
  }, [user?.id, studentId, apolloClient]);

  const loadData = async (profitService: ProfitCalculatorService) => {
    try {
      setIsLoading(true);
      const [globals, productsData] = await Promise.all([
        profitService.getGlobalVariables(),
        profitService.getProducts()
      ]);

      // Get all subitems for the user
      const subitemsData = await profitService.getAllSubitemsForUser();

      setGlobalVariables(globals);
      setProducts(productsData);
      setSubitems(subitemsData);

      // Calculate products with calculations
      if (globals) {
        const calculatedProducts = productsData.map(product => {
          const productSubitems = subitemsData.filter(s => s.product_id === product.id);
          return profitService.calculateProductCalculations(product, productSubitems, globals);
        });
        setProductsWithCalculations(calculatedProducts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle global variables update
  const handleGlobalVariablesUpdate = async (updates: Partial<GlobalVariables>) => {
    if (!service || !globalVariables) return;

    try {
      setIsSaving(true);
      const updated = await service.updateGlobalVariables(updates);
      setGlobalVariables(updated);
      
      // Recalculate products with new global variables
      const calculatedProducts = products.map(product => {
        const productSubitems = subitems.filter(s => s.product_id === product.id);
        return service.calculateProductCalculations(product, productSubitems, updated);
      });
      setProductsWithCalculations(calculatedProducts);
      
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Error updating global variables:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle add new service
  const handleAddService = async () => {
    if (!service || !newServiceForm.name || newServiceForm.price <= 0) return;

    try {
      setIsSaving(true);
      const newProduct = await service.createProduct({
        name: newServiceForm.name,
        price: newServiceForm.price
      });

      setProducts(prev => [...prev, newProduct]);
      
      // Add to calculations
      if (globalVariables) {
        const calculatedProduct = service.calculateProductCalculations(newProduct, [], globalVariables);
        setProductsWithCalculations(prev => [...prev, calculatedProduct]);
      }

      setNewServiceForm({ name: '', price: 0 });
      setIsAddServiceOpen(false);
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle add cost item
  const handleAddCost = async () => {
    if (!service || !newCostForm.label || newCostForm.value <= 0 || !selectedProductId) return;

    try {
      setIsSaving(true);
      const newSubitem = await service.createSubitem({
        product_id: selectedProductId,
        type: newCostForm.type,
        label: newCostForm.label,
        value: newCostForm.value
      });

      setSubitems(prev => [...prev, newSubitem]);
      
      // Recalculate the specific product
      if (globalVariables) {
        const product = products.find(p => p.id === selectedProductId);
        if (product) {
          const updatedSubitems = [...subitems, newSubitem].filter(s => s.product_id === selectedProductId);
          const calculatedProduct = service.calculateProductCalculations(product, updatedSubitems, globalVariables);
          
          setProductsWithCalculations(prev => 
            prev.map(p => p.id === selectedProductId ? calculatedProduct : p)
          );
        }
      }

      setNewCostForm({ type: 'fixed', label: '', value: 0 });
      setIsAddCostOpen(false);
    } catch (error) {
      console.error('Error creating cost item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!service) return;

    try {
      setIsSaving(true);
      await service.deleteProduct(productId);
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      setProductsWithCalculations(prev => prev.filter(p => p.id !== productId));
      setSubitems(prev => prev.filter(s => s.product_id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete subitem
  const handleDeleteSubitem = async (subitemId: string) => {
    if (!service) return;

    try {
      setIsSaving(true);
      await service.deleteSubitem(subitemId);
      
      const deletedSubitem = subitems.find(s => s.id === subitemId);
      if (deletedSubitem && globalVariables) {
        setSubitems(prev => prev.filter(s => s.id !== subitemId));
        
        // Recalculate the product
        const product = products.find(p => p.id === deletedSubitem.product_id);
        if (product) {
          const updatedSubitems = subitems.filter(s => s.id !== subitemId && s.product_id === deletedSubitem.product_id);
          const calculatedProduct = service.calculateProductCalculations(product, updatedSubitems, globalVariables);
          
          setProductsWithCalculations(prev => 
            prev.map(p => p.id === deletedSubitem.product_id ? calculatedProduct : p)
          );
        }
      }
    } catch (error) {
      console.error('Error deleting subitem:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get icon for cost type
  const getCostTypeIcon = (type: string) => {
    switch (type) {
      case 'labor': return <Clock className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-black text-gray-900 dark:text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading Profit Calculator...</span>
      </div>
    );
  }

  if (!globalVariables) {
    return (
      <div className="text-center py-8 bg-white dark:bg-black text-gray-900 dark:text-white">
        <p className="text-muted-foreground dark:text-gray-400">calculator settings are not set by student.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profit Calculator</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Calculate costs and optimize pricing for maximum profitability
          </p>
        </div>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Calculator Settings</DialogTitle>
              <p className="text-sm text-muted-foreground">
                These settings affect all cost calculations across your services.
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hourly_pay">Hourly Pay Rate</Label>
                <Input
                  id="hourly_pay"
                  type="number"
                  value={globalVariables.hourly_pay}
                  onChange={(e) => setGlobalVariables(prev => prev ? { ...prev, hourly_pay: parseFloat(e.target.value) || 0 } : null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to calculate labor costs for time-based work
                </p>
              </div>
              <div>
                <Label htmlFor="cost_per_photo">Cost Per Photo</Label>
                <Input
                  id="cost_per_photo"
                  type="number"
                  step="0.01"
                  value={globalVariables.cost_per_photo}
                  onChange={(e) => setGlobalVariables(prev => prev ? { ...prev, cost_per_photo: parseFloat(e.target.value) || 0 } : null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cost for editing/processing each photo
                </p>
              </div>
              <div>
                <Label htmlFor="target_margin">Target Profit Margin (%)</Label>
                <Input
                  id="target_margin"
                  type="number"
                  value={globalVariables.target_profit_margin}
                  onChange={(e) => setGlobalVariables(prev => prev ? { ...prev, target_profit_margin: parseFloat(e.target.value) || 0 } : null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to calculate minimum pricing recommendations
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleGlobalVariablesUpdate(globalVariables)}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Hourly Pay</p>
                <p className="text-2xl font-bold text-blue-600">${globalVariables.hourly_pay.toFixed(2)}/hr</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Cost Per Photo</p>
                <p className="text-2xl font-bold text-green-600">${globalVariables.cost_per_photo.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Target Margin</p>
                <p className="text-2xl font-bold text-purple-600">{globalVariables.target_profit_margin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Services</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on a service to see detailed cost breakdown
              </p>
            </div>
            <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Create a service package to analyze its profitability.
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="service_name">Service Name</Label>
                    <Input
                      id="service_name"
                      placeholder="e.g., Standard Photo Shoot"
                      value={newServiceForm.name}
                      onChange={(e) => setNewServiceForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_price">Price (What you charge)</Label>
                    <Input
                      id="service_price"
                      type="number"
                      value={newServiceForm.price}
                      onChange={(e) => setNewServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddServiceOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddService}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Create Service
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productsWithCalculations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
                <p>No services yet. Create your first service to get started!</p>
              </div>
            ) : (
              productsWithCalculations.map((product) => (
                <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  {/* Service Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Price: ${product.price.toFixed(2)} | Cost: ${product.total_cost.toFixed(2)} | 
                        Margin: {product.profit_margin.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.profit_margin >= globalVariables.target_profit_margin && (
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                          Target Met
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={isSaving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground dark:text-gray-300">Total Cost</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${product.total_cost.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground dark:text-gray-300">Profit</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">${product.profit.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground dark:text-gray-300">Profit Margin</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{product.profit_margin.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground dark:text-gray-300">Min. Price</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${product.minimum_price.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Cost Breakdown</h4>
                      <Dialog open={isAddCostOpen && selectedProductId === product.id} onOpenChange={(open) => {
                        setIsAddCostOpen(open);
                        if (open) setSelectedProductId(product.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Cost
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add Cost Item</DialogTitle>
                            <p className="text-sm text-muted-foreground">
                              Add a cost component to this service package.
                            </p>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="cost_type">Cost Type</Label>
                              <Select
                                value={newCostForm.type}
                                onValueChange={(value: 'fixed' | 'photo' | 'labor') => 
                                  setNewCostForm(prev => ({ ...prev, type: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed">Fixed Cost</SelectItem>
                                  <SelectItem value="photo">Per Photo</SelectItem>
                                  <SelectItem value="labor">Per Hour</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="cost_label">Description</Label>
                              <Input
                                id="cost_label"
                                placeholder="e.g., Mileage/Gas"
                                value={newCostForm.label}
                                onChange={(e) => setNewCostForm(prev => ({ ...prev, label: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cost_value">
                                {newCostForm.type === 'fixed' ? 'Amount ($)' : 
                                 newCostForm.type === 'photo' ? 'Number of Photos' : 'Hours'}
                              </Label>
                              <Input
                                id="cost_value"
                                type="number"
                                step={newCostForm.type === 'fixed' ? '0.01' : '0.1'}
                                value={newCostForm.value}
                                onChange={(e) => setNewCostForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                              />
                              {newCostForm.type === 'fixed' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Fixed cost of ${newCostForm.value.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button variant="outline" onClick={() => setIsAddCostOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleAddCost}
                                disabled={isSaving}
                              >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Add Cost Item
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Cost Table */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Type</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Description</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                              {product.subitems.some(s => s.type === 'photo') ? 'Quantity' : 'Hours'}
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Rate</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Cost</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.subitems.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground dark:text-gray-400">
                                No cost items yet. Add your first cost component above.
                              </td>
                            </tr>
                          ) : (
                            product.subitems.map((subitem) => {
                              let rate = 0;
                              let quantity = subitem.value;
                              
                              switch (subitem.type) {
                                case 'fixed':
                                  rate = subitem.value;
                                  quantity = 1;
                                  break;
                                case 'photo':
                                  rate = globalVariables.cost_per_photo;
                                  break;
                                case 'labor':
                                  rate = globalVariables.hourly_pay;
                                  break;
                              }

                              const cost = subitem.type === 'fixed' ? subitem.value : subitem.value * rate;

                              return (
                                <tr key={subitem.id} className="border-t border-gray-200 dark:border-gray-700">
                                  <td className="px-4 py-2">
                                    <div className="flex items-center space-x-2">
                                      {getCostTypeIcon(subitem.type)}
                                      <span className="capitalize text-gray-900 dark:text-white">{subitem.type}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-gray-900 dark:text-white">{subitem.label}</td>
                                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                                    {subitem.type === 'fixed' ? '1' : 
                                     subitem.type === 'photo' ? `${subitem.value} photos` : 
                                     `${subitem.value} hrs`}
                                  </td>
                                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                                    {subitem.type === 'fixed' ? '' : 
                                     subitem.type === 'photo' ? `$${rate.toFixed(2)}/photo` : 
                                     `$${rate.toFixed(2)}/hr`}
                                  </td>
                                  <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">${cost.toFixed(2)}</td>
                                  <td className="px-4 py-2">
                                    <div className="flex space-x-1">
                                      <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDeleteSubitem(subitem.id)}
                                        disabled={isSaving}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitCalculator;
