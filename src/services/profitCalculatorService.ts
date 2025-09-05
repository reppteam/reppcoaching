import { setApolloClient } from './8baseService';
import * as queries from '../graphql/operations';
import { ApolloClient } from '@apollo/client';

// Types for the profit calculator
export interface GlobalVariables {
  id: string;
  user_id: string;
  hourly_pay: number;
  cost_per_photo: number;
  target_profit_margin: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Subitem {
  id: string;
  product_id: string;
  type: 'fixed' | 'photo' | 'labor';
  label: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCalculations extends Product {
  subitems: Subitem[];
  total_cost: number;
  profit: number;
  profit_margin: number;
  minimum_price: number;
}

export class ProfitCalculatorService {
  private userId: string;
  private apolloClient: ApolloClient<any> | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  setApolloClient(client: ApolloClient<any>) {
    this.apolloClient = client;
  }

  private async executeQuery(query: any, variables?: any) {
    if (!this.apolloClient) {
      throw new Error('Apollo Client not initialized. Please call setApolloClient first.');
    }
    
    try {
      const { data } = await this.apolloClient.query({
        query,
        variables
      });
      return data;
    } catch (error) {
      console.error('GraphQL Query Error:', error);
      throw error;
    }
  }

  private async executeMutation(mutation: any, variables?: any) {
    if (!this.apolloClient) {
      throw new Error('Apollo Client not initialized. Please call setApolloClient first.');
    }
    
    try {
      console.log('🔥 ExecuteMutation - Variables:', JSON.stringify(variables, null, 2));
      const { data } = await this.apolloClient.mutate({
        mutation,
        variables
      });
      return data;
    } catch (error) {
      console.error('GraphQL Mutation Error:', error);
      console.error('Variables that caused error:', JSON.stringify(variables, null, 2));
      throw error;
    }
  }

  // Global Variables Management
  async getGlobalVariables(): Promise<GlobalVariables | null> {
    try {
      const data = await this.executeQuery(queries.GET_GLOBAL_VARIABLES_BY_FILTER, {
        filter: { user: { id: { equals: this.userId } } }
      });
      
      if (data.globalVariablesList?.items && data.globalVariablesList.items.length > 0) {
        return this.transformGlobalVariables(data.globalVariablesList.items[0]);
      }
      return null;
    } catch (error) {
      console.error('Error fetching global variables:', error);
      return null;
    }
  }

  async createGlobalVariables(variables: Partial<GlobalVariables>): Promise<GlobalVariables> {
    try {
      const data = await this.executeMutation(queries.CREATE_GLOBAL_VARIABLES, {
        data: {
          hourly_pay: variables.hourly_pay || 50,
          cost_per_photo: variables.cost_per_photo || 1.25,
          target_profit_margin: variables.target_profit_margin || 40,
          user: { connect: { id: this.userId } }
        }
      });
      
      return this.transformGlobalVariables(data.globalVariableCreate);
    } catch (error) {
      console.error('Error creating global variables:', error);
      throw error;
    }
  }

  async updateGlobalVariables(variables: Partial<GlobalVariables>): Promise<GlobalVariables> {
    try {
      const existing = await this.getGlobalVariables();
      if (!existing) {
        return this.createGlobalVariables(variables);
      }

      const data = await this.executeMutation(queries.UPDATE_GLOBAL_VARIABLES, {
        id: existing.id,
        data: {
          hourly_pay: variables.hourly_pay,
          cost_per_photo: variables.cost_per_photo,
          target_profit_margin: variables.target_profit_margin
        }
      });

      return this.transformGlobalVariables(data.globalVariableUpdate);
    } catch (error) {
      console.error('Error updating global variables:', error);
      throw error;
    }
  }

  // Products Management
  async getProducts(): Promise<Product[]> {
    try {
      const data = await this.executeQuery(queries.GET_PRODUCTS_BY_FILTER, {
        filter: { user: { id: { equals: this.userId } } }
      });
      
      if (data.productsList?.items) {
        return data.productsList.items.map(this.transformProduct);
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>, subitemId?: string): Promise<Product> {
    try {
      const mutationData: any = {
        name: product.name,
        price: product.price,
        user: { connect: { id: this.userId } }
      };

      // Optionally connect a subitem if provided
      if (subitemId) {
        mutationData.subitem = { connect: { id: subitemId } };
      }

      console.log('🚀 CREATE_PRODUCT - Mutation Data:', JSON.stringify(mutationData, null, 2));
      console.log('🚀 CREATE_PRODUCT - User ID:', this.userId);

      const data = await this.executeMutation(queries.CREATE_PRODUCT, {
        data: mutationData
      });

      return this.transformProduct(data.productCreate);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const data = await this.executeMutation(queries.UPDATE_PRODUCT, {
        id,
        data: {
          name: updates.name,
          price: updates.price
        }
      });

      return this.transformProduct(data.productUpdate);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.executeMutation(queries.DELETE_PRODUCT, { id });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Subitems Management
  async getSubitems(productId: string): Promise<Subitem[]> {
    try {
      if (!productId) {
        return [];
      }
      
      // Verify the product belongs to the current user
      const userProducts = await this.getProducts();
      if (!userProducts.some(p => p.id === productId)) {
        return [];
      }
      
      const data = await this.executeQuery(queries.GET_SUBITEMS_BY_FILTER, {
        filter: { product: { id: { equals: productId } } }
      });
      
      if (data.subitemsList?.items) {
        return data.subitemsList.items.map(this.transformSubitem);
      }
      return [];
    } catch (error) {
      console.error('Error fetching subitems:', error);
      return [];
    }
  }

  // Get all subitems for a user (across all products)
  async getAllSubitemsForUser(): Promise<Subitem[]> {
    try {
      // Get user's products first
      const userProducts = await this.getProducts();
      const userProductIds = userProducts.map(p => p.id);
      
      if (userProductIds.length === 0) {
        return [];
      }
      
      // Get subitems for user's products
      const data = await this.executeQuery(queries.GET_SUBITEMS_BY_FILTER, {
        filter: { product: { id: { in: userProductIds } } }
      });
      
      if (data.subitemsList?.items) {
        return data.subitemsList.items.map(this.transformSubitem);
      }
      return [];
    } catch (error) {
      console.error('Error fetching all subitems for user:', error);
      return [];
    }
  }

  async createSubitem(subitem: Omit<Subitem, 'id' | 'created_at' | 'updated_at'>): Promise<Subitem> {
    try {
      const data = await this.executeMutation(queries.CREATE_SUBITEM, {
        data: {
          type: subitem.type,
          label: subitem.label,
          value: subitem.value,
          product: { connect: { id: subitem.product_id } }
        }
      });

      return this.transformSubitem(data.subitemCreate);
    } catch (error) {
      console.error('Error creating subitem:', error);
      throw error;
    }
  }

  async updateSubitem(id: string, updates: Partial<Subitem>): Promise<Subitem> {
    try {
      const data = await this.executeMutation(queries.UPDATE_SUBITEM, {
        id,
        data: {
          type: updates.type,
          label: updates.label,
          value: updates.value
        }
      });

      return this.transformSubitem(data.subitemUpdate);
    } catch (error) {
      console.error('Error updating subitem:', error);
      throw error;
    }
  }

  async deleteSubitem(id: string): Promise<void> {
    try {
      await this.executeMutation(queries.DELETE_SUBITEM, { id });
    } catch (error) {
      console.error('Error deleting subitem:', error);
      throw error;
    }
  }



  // Calculate product costs and profits
  calculateProductCalculations(
    product: Product, 
    subitems: Subitem[], 
    globalVariables: GlobalVariables
  ): ProductWithCalculations {
    let totalCost = 0;
    subitems.forEach(subitem => {
      switch (subitem.type) {
        case 'fixed':
          totalCost += subitem.value;
          break;
        case 'photo':
          totalCost += subitem.value * globalVariables.cost_per_photo;
          break;
        case 'labor':
          totalCost += subitem.value * globalVariables.hourly_pay;
          break;
      }
    });

    const profit = product.price - totalCost;
    const profitMargin = totalCost > 0 ? (profit / product.price) * 100 : 0;
    const minimumPrice = totalCost / (1 - globalVariables.target_profit_margin / 100);

    return {
      ...product,
      subitems,
      total_cost: totalCost,
      profit,
      profit_margin: profitMargin,
      minimum_price: minimumPrice
    };
  }

  // Get all products with calculations
  async getProductsWithCalculations(): Promise<ProductWithCalculations[]> {
    try {
      const [products, globalVariables] = await Promise.all([
        this.getProducts(),
        this.getGlobalVariables()
      ]);

      let finalGlobalVariables = globalVariables;
      if (!finalGlobalVariables) {
        // Create default global variables if none exist
        const newGlobals = await this.createGlobalVariables({
          hourly_pay: 50,
          cost_per_photo: 1.25,
          target_profit_margin: 40
        });
        finalGlobalVariables = newGlobals;
      }

      const productsWithCalculations = await Promise.all(
        products.map(async (product) => {
          const subitems = await this.getSubitems(product.id);
          return this.calculateProductCalculations(product, subitems, finalGlobalVariables!);
        })
      );

      return productsWithCalculations;
    } catch (error) {
      console.error('Error getting products with calculations:', error);
      return [];
    }
  }

  // Transform functions for 8base data
  private transformGlobalVariables(data: any): GlobalVariables {
    return {
      id: data.id,
      user_id: data.user?.id || this.userId,
      hourly_pay: data.hourly_pay || 50,
      cost_per_photo: data.cost_per_photo || 1.25,
      target_profit_margin: data.target_profit_margin || 40,
      created_at: data.createdAt || new Date().toISOString(),
      updated_at: data.updatedAt || new Date().toISOString()
    };
  }

  private transformProduct(data: any): Product {
    return {
      id: data.id,
      user_id: data.user?.id || this.userId,
      name: data.name,
      price: data.price,
      created_at: data.createdAt || new Date().toISOString(),
      updated_at: data.updatedAt || new Date().toISOString()
    };
  }

  private transformSubitem(data: any): Subitem {
    return {
      id: data.id,
      product_id: data.product?.id || '',
      type: data.type || 'fixed',
      label: data.label,
      value: data.value,
      created_at: data.createdAt || new Date().toISOString(),
      updated_at: data.updatedAt || new Date().toISOString()
    };
  }
}

export default ProfitCalculatorService;
