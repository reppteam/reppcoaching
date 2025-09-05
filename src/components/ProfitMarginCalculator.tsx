import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { GlobalVariables, Product, Subitem, ProductWithCalculations, SubitemWithCalculation } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { 
  Calculator, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Target,
  Settings,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export function ProfitMarginCalculator() {
  const { user } = useAuth();
  const [globalVars, setGlobalVars] = useState<GlobalVariables | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subitems, setSubitems] = useState<Subitem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [globalVarsDialogOpen, setGlobalVarsDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [subitemDialogOpen, setSubitemDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSubitem, setEditingSubitem] = useState<Subitem | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Form states
  const [globalVarsForm, setGlobalVarsForm] = useState({
    hourly_pay: 50,
    cost_per_photo: 1.25,
    target_profit_margin: 40
  });
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0
  });
  const [subitemForm, setSubitemForm] = useState({
    type: 'fixed' as 'fixed' | 'photo' | 'labor',
    label: '',
    value: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Starting data load...');
      
      const [globalVarsData, productsData] = await Promise.all([
        eightbaseService.getGlobalVariables(user.id),
        eightbaseService.getProducts(user.id)
      ]);
      
      console.log('Loaded global vars:', globalVarsData);
      console.log('Loaded products:', productsData);
      
      setGlobalVars(globalVarsData);
      if (globalVarsData) {
        setGlobalVarsForm({
          hourly_pay: globalVarsData.hourly_pay,
          cost_per_photo: globalVarsData.cost_per_photo,
          target_profit_margin: globalVarsData.target_profit_margin
        });
      }
      
      setProducts(productsData);
      
      // Load all subitems for the products
      const allSubitems: Subitem[] = [];
      for (const product of productsData) {
        console.log(`Loading subitems for product: ${product.name} (${product.id})`);
        const productSubitems = await eightbaseService.getSubitems(product.id);
        console.log(`Loaded subitems for product ${product.name}:`, productSubitems);
        allSubitems.push(...productSubitems);
      }
      setSubitems(allSubitems);
      console.log('All loaded subitems:', allSubitems);
      
    } catch (error) {
      console.error('Failed to load calculator data:', error);
    } finally {
      setLoading(false);
      console.log('Data loading completed');
    }
  };

  // Calculate costs and derived values
  const calculateSubitemCost = (subitem: Subitem): number => {
    // Debug logging
    console.log('Calculating subitem cost:', {
      id: subitem.id,
      type: subitem.type,
      value: subitem.value,
      label: subitem.label
    });
    
    // For fixed costs, we don't need globalVars
    if (subitem.type === 'fixed') {
      const cost = subitem.value || 0;
      console.log(`Fixed cost calculation: ${subitem.value} = $${cost}`);
      return cost;
    }
    
    if (!globalVars) return 0;
    
    switch (subitem.type) {
      case 'photo':
        const photoCost = (subitem.value || 0) * globalVars.cost_per_photo;
        console.log(`Photo cost calculation: ${subitem.value} × $${globalVars.cost_per_photo} = $${photoCost}`);
        return photoCost;
      case 'labor':
        const laborCost = (subitem.value || 0) * globalVars.hourly_pay;
        console.log(`Labor cost calculation: ${subitem.value} × $${globalVars.hourly_pay} = $${laborCost}`);
        return laborCost;
      default:
        return 0;
    }
  };

  const calculateProductTotalCost = (productId: string): number => {
    const productSubitems = subitems.filter(s => s.product_id === productId);
    const totalCost = productSubitems.reduce((total, subitem) => {
      const subitemCost = calculateSubitemCost(subitem);
      console.log(`Adding subitem cost: ${subitem.label} = $${subitemCost}`);
      return total + subitemCost;
    }, 0);
    console.log(`Total cost for product ${productId}: $${totalCost}`);
    return totalCost;
  };

  const calculateProfit = (price: number, totalCost: number): number => {
    return price - totalCost;
  };

  const calculateProfitMargin = (profit: number, price: number): number => {
    return price > 0 ? (profit / price) * 100 : 0;
  };

  const calculateMinimumPrice = (totalCost: number): number => {
    if (!globalVars) return totalCost;
    if (totalCost === 0) return 0; // If no costs, minimum price is 0
    const targetMarginDecimal = globalVars.target_profit_margin / 100;
    return totalCost / (1 - targetMarginDecimal);
  };

  // Enhanced products with calculations
  const productsWithCalculations: ProductWithCalculations[] = useMemo(() => {
    return products.map(product => {
      const productSubitems = subitems.filter(s => s.product_id === product.id);
      const total_cost = calculateProductTotalCost(product.id);
      const profit = calculateProfit(product.price, total_cost);
      const profit_margin = calculateProfitMargin(profit, product.price);
      const minimum_price = calculateMinimumPrice(total_cost);

      // Debug logging
      console.log(`Product: ${product.name}`, {
        price: product.price,
        subitems: productSubitems,
        total_cost,
        profit,
        profit_margin,
        minimum_price
      });

      return {
        ...product,
        subitems: productSubitems,
        total_cost,
        profit,
        profit_margin,
        minimum_price
      };
    });
  }, [products, subitems, globalVars]);

  // Debug effect to log when calculations change
  useEffect(() => {
    console.log('Products with calculations updated:', productsWithCalculations);
  }, [productsWithCalculations]);

  // Debug effect to log when subitems change
  useEffect(() => {
    console.log('Subitems state updated:', subitems);
  }, [subitems]);

  const handleSaveGlobalVars = async () => {
    if (!user) return;
    
    try {
      const updatedGlobalVars = await eightbaseService.updateGlobalVariables(user.id, globalVarsForm);
      setGlobalVars(updatedGlobalVars);
      setGlobalVarsDialogOpen(false);
    } catch (error) {
      console.error('Failed to update global variables:', error);
    }
  };

  const handleSaveProduct = async () => {
    if (!user) return;
    
    try {
      if (editingProduct) {
        await eightbaseService.updateProduct(editingProduct.id, productForm);
      } else {
        await eightbaseService.createProduct({
          ...productForm,
          user: { connect: { id: user.id } }
        });
      }
      
      await loadData();
      setProductDialogOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: 0 });
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await eightbaseService.deleteProduct(productId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleSaveSubitem = async () => {
    if (!selectedProductId) return;
    
    try {
      console.log('Saving subitem:', subitemForm);
      console.log('Selected product ID:', selectedProductId);
      
      if (editingSubitem) {
        console.log('Updating existing subitem:', editingSubitem.id);
        const updatedSubitem = await eightbaseService.updateSubitem(editingSubitem.id, subitemForm);
        console.log('Updated subitem result:', updatedSubitem);
      } else {
        console.log('Creating new subitem...');
        const newSubitem = await eightbaseService.createSubitem({
          ...subitemForm,
          product: { connect: { id: selectedProductId } }
        });
        console.log('Created new subitem result:', newSubitem);
      }
      
      console.log('Reloading data after subitem save...');
      await loadData();
      setSubitemDialogOpen(false);
      setEditingSubitem(null);
      const resetForm = { type: 'fixed' as 'fixed' | 'photo' | 'labor', label: '', value: 0 };
      console.log('Resetting subitem form to:', resetForm);
      setSubitemForm(resetForm);
    } catch (error) {
      console.error('Failed to save subitem:', error);
    }
  };

  const handleDeleteSubitem = async (subitemId: string) => {
    try {
      await eightbaseService.deleteSubitem(subitemId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete subitem:', error);
    }
  };

  const toggleProductExpanded = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price
    });
    setProductDialogOpen(true);
  };

  const openAddSubitem = (productId: string) => {
    console.log('Opening add subitem for product:', productId);
    setSelectedProductId(productId);
    setEditingSubitem(null);
    const initialForm = { type: 'fixed' as 'fixed' | 'photo' | 'labor', label: '', value: 0 };
    console.log('Setting initial subitem form:', initialForm);
    setSubitemForm(initialForm);
    setSubitemDialogOpen(true);
  };

  const openEditSubitem = (subitem: Subitem) => {
    console.log('Opening edit subitem:', subitem);
    if (subitem.product_id) {
      setSelectedProductId(subitem.product_id);
    }
    setEditingSubitem(subitem);
    const formData = {
      type: subitem.type,
      label: subitem.label,
      value: subitem.value
    };
    console.log('Setting subitem form data:', formData);
    setSubitemForm(formData);
    setSubitemDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getProfitMarginColor = (margin: number) => {
    if (!globalVars) return 'text-muted-foreground';
    if (margin >= globalVars.target_profit_margin) return 'text-green-600';
    if (margin >= globalVars.target_profit_margin * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSubitemIcon = (type: string) => {
    switch (type) {
      case 'labor': return '⏱️';
      case 'photo': return '📸';
      case 'fixed': return '💰';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading calculator...</span>
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
            <Calculator className="h-6 w-6 text-brand-blue" />
            Profit Margin Calculator
          </h2>
          <p className="text-muted-foreground">
            Analyze your service costs and optimize pricing for maximum profitability
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => {
              console.log('Current state:', { products, subitems, globalVars });
              console.log('Products with calculations:', productsWithCalculations);
            }} 
            variant="outline"
          >
            Debug
          </Button>
          <Button 
            onClick={() => {
              console.log('Force refreshing data...');
              loadData();
            }} 
            variant="outline"
          >
            Refresh
          </Button>
          <Button onClick={() => setGlobalVarsDialogOpen(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Global Variables Summary */}
      {globalVars && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="font-medium text-brand-blue">Hourly Pay</div>
                <div>{formatCurrency(globalVars.hourly_pay)}/hr</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="font-medium text-green-600">Cost Per Photo</div>
                <div>{formatCurrency(globalVars.cost_per_photo)}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="font-medium text-purple-600">Target Margin</div>
                <div>{globalVars.target_profit_margin}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Services</CardTitle>
              <CardDescription>Click on a service to see detailed cost breakdown</CardDescription>
            </div>
            <Button 
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: '', price: 0 });
                setProductDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {productsWithCalculations.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No services added yet.</p>
              <p className="text-sm text-muted-foreground">Add your first service to start calculating profit margins.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {productsWithCalculations.map(product => {
                const isExpanded = expandedProducts.has(product.id);
                const isUnderpriced = product.price < product.minimum_price;
                const profitMarginColor = getProfitMarginColor(product.profit_margin);
                
                return (
                  <div key={product.id} className="border rounded-lg overflow-hidden">
                    {/* Product Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleProductExpanded(product.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Price: {formatCurrency(product.price)}</span>
                              <span>Cost: {formatCurrency(product.total_cost)}</span>
                              <span className={profitMarginColor}>
                                Margin: {product.profit_margin.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isUnderpriced && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Underpriced
                            </Badge>
                          )}
                          {product.profit_margin >= (globalVars?.target_profit_margin || 40) && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Target Met
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditProduct(product);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t bg-muted/25">
                        <div className="p-4 space-y-4">
                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-background rounded-lg">
                              <div className="text-sm text-muted-foreground">Total Cost</div>
                              <div className="font-medium">{formatCurrency(product.total_cost)}</div>
                            </div>
                            <div className="text-center p-3 bg-background rounded-lg">
                              <div className="text-sm text-muted-foreground">Profit</div>
                              <div className={`font-medium ${product.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(product.profit)}
                              </div>
                            </div>
                            <div className="text-center p-3 bg-background rounded-lg">
                              <div className="text-sm text-muted-foreground">Profit Margin</div>
                              <div className={`font-medium ${profitMarginColor}`}>
                                {product.profit_margin.toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-center p-3 bg-background rounded-lg">
                              <div className="text-sm text-muted-foreground">Min. Price</div>
                              <div className="font-medium">{formatCurrency(product.minimum_price)}</div>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">Cost Breakdown</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAddSubitem(product.id)}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Add Cost
                              </Button>
                            </div>
                            
                            {product.subitems.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground">
                                No cost items added yet.
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {product.subitems.map(subitem => {
                                    const calculatedCost = calculateSubitemCost(subitem);
                                    let rate = '';
                                    let quantity = '';
                                    
                                    // Debug logging for table display
                                    console.log(`Table display for subitem:`, {
                                      id: subitem.id,
                                      type: subitem.type,
                                      value: subitem.value,
                                      label: subitem.label,
                                      calculatedCost
                                    });
                                    
                                    switch (subitem.type) {
                                      case 'fixed':
                                        rate = 'Fixed';
                                        quantity = '1';
                                        break;
                                      case 'photo':
                                        rate = formatCurrency(globalVars?.cost_per_photo || 0);
                                        quantity = `${subitem.value} photos`;
                                        break;
                                      case 'labor':
                                        rate = formatCurrency(globalVars?.hourly_pay || 0) + '/hr';
                                        quantity = `${subitem.value} hrs`;
                                        break;
                                    }
                                    
                                    return (
                                      <TableRow key={subitem.id}>
                                        <TableCell>
                                          <div className="flex items-center space-x-2">
                                            <span>{getSubitemIcon(subitem.type)}</span>
                                            <span className="capitalize">{subitem.type}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>{subitem.label}</TableCell>
                                        <TableCell>{quantity}</TableCell>
                                        <TableCell>{rate}</TableCell>
                                        <TableCell className="font-medium">
                                          {formatCurrency(calculatedCost)}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex space-x-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => openEditSubitem(subitem)}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteSubitem(subitem.id)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            )}
                          </div>

                          {/* Pricing Recommendations */}
                          {isUnderpriced && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Pricing Alert:</strong> Your current price of {formatCurrency(product.price)} is 
                                below the minimum recommended price of {formatCurrency(product.minimum_price)} for 
                                a {globalVars?.target_profit_margin}% profit margin. 
                                Consider increasing your price by {formatCurrency(product.minimum_price - product.price)}.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Variables Dialog */}
      <Dialog open={globalVarsDialogOpen} onOpenChange={setGlobalVarsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calculator Settings</DialogTitle>
            <DialogDescription>
              These settings affect all cost calculations across your services.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hourly_pay">Hourly Pay Rate</Label>
              <Input
                id="hourly_pay"
                type="number"
                step="0.01"
                value={globalVarsForm.hourly_pay}
                onChange={(e) => setGlobalVarsForm({
                  ...globalVarsForm,
                  hourly_pay: parseFloat(e.target.value) || 0
                })}
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
                value={globalVarsForm.cost_per_photo}
                onChange={(e) => setGlobalVarsForm({
                  ...globalVarsForm,
                  cost_per_photo: parseFloat(e.target.value) || 0
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cost for editing/processing each photo
              </p>
            </div>
            <div>
              <Label htmlFor="target_profit_margin">Target Profit Margin (%)</Label>
              <Input
                id="target_profit_margin"
                type="number"
                step="1"
                min="0"
                max="100"
                value={globalVarsForm.target_profit_margin}
                onChange={(e) => setGlobalVarsForm({
                  ...globalVarsForm,
                  target_profit_margin: parseFloat(e.target.value) || 0
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used to calculate minimum pricing recommendations
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setGlobalVarsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGlobalVars}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              Create a service package to analyze its profitability.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product_name">Service Name</Label>
              <Input
                id="product_name"
                value={productForm.name}
                onChange={(e) => setProductForm({
                  ...productForm,
                  name: e.target.value
                })}
                placeholder="e.g., Standard Photo Shoot"
              />
            </div>
            <div>
              <Label htmlFor="product_price">Price (What you charge)</Label>
              <Input
                id="product_price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({
                  ...productForm,
                  price: parseFloat(e.target.value) || 0
                })}
                placeholder="250.00"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>
                {editingProduct ? 'Update' : 'Create'} Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subitem Dialog */}
      <Dialog open={subitemDialogOpen} onOpenChange={setSubitemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubitem ? 'Edit Cost Item' : 'Add Cost Item'}</DialogTitle>
            <DialogDescription>
              Add a cost component to this service package.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subitem_type">Cost Type</Label>
              <Select 
                value={subitemForm.type} 
                onValueChange={(value: 'fixed' | 'photo' | 'labor') => 
                  setSubitemForm({ ...subitemForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">💰 Fixed Cost</SelectItem>
                  <SelectItem value="photo">📸 Photo Cost</SelectItem>
                  <SelectItem value="labor">⏱️ Labor Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subitem_label">Description</Label>
              <Input
                id="subitem_label"
                value={subitemForm.label}
                onChange={(e) => setSubitemForm({
                  ...subitemForm,
                  label: e.target.value
                })}
                placeholder={
                  subitemForm.type === 'fixed' ? 'e.g., Mileage/Gas' :
                  subitemForm.type === 'photo' ? 'e.g., Photo Editing' :
                  'e.g., Shooting Time'
                }
              />
            </div>
            <div>
              <Label htmlFor="subitem_value">
                {subitemForm.type === 'fixed' ? 'Amount ($)' :
                 subitemForm.type === 'photo' ? 'Number of Photos' :
                 'Hours'}
              </Label>
              <Input
                id="subitem_value"
                type="number"
                step={subitemForm.type === 'labor' ? '0.25' : '1'}
                value={subitemForm.value}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  console.log(`Setting subitem value: ${e.target.value} -> ${newValue}`);
                  setSubitemForm({
                    ...subitemForm,
                    value: newValue
                  });
                }}
                placeholder={
                  subitemForm.type === 'fixed' ? '15.00' :
                  subitemForm.type === 'photo' ? '30' :
                  '1.5'
                }
              />
              {globalVars && (
                <p className="text-xs text-muted-foreground mt-1">
                  {subitemForm.type === 'photo' && 
                    `Will be calculated as: ${subitemForm.value} × ${formatCurrency(globalVars.cost_per_photo)} = ${formatCurrency(subitemForm.value * globalVars.cost_per_photo)}`
                  }
                  {subitemForm.type === 'labor' && 
                    `Will be calculated as: ${subitemForm.value} × ${formatCurrency(globalVars.hourly_pay)} = ${formatCurrency(subitemForm.value * globalVars.hourly_pay)}`
                  }
                  {subitemForm.type === 'fixed' && 
                    `Fixed cost of ${formatCurrency(subitemForm.value)}`
                  }
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSubitemDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                console.log('Subitem form submit clicked');
                console.log('Current form state:', subitemForm);
                console.log('Selected product ID:', selectedProductId);
                handleSaveSubitem();
              }}>
                {editingSubitem ? 'Update' : 'Add'} Cost Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}