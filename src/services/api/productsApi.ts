import apiClient from './client';
import { Product, ProductFilters, ProductsResponse, City, Kitchen } from '@/types';

// Mock data for development
const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces',
    category: 'lunch',
    price: 250,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop',
    city: 'Mumbai',
    kitchenId: 'k1',
    kitchenName: 'Spice Garden',
    isAvailable: true,
    nutritionInfo: { calories: 450, protein: 28, carbs: 20, fat: 25 },
    tags: ['non-veg', 'curry', 'popular'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
  },
  {
    id: 'p2',
    name: 'Paneer Tikka',
    description: 'Grilled cottage cheese marinated in spiced yogurt',
    category: 'snacks',
    price: 180,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop',
    city: 'Delhi',
    kitchenId: 'k2',
    kitchenName: 'Punjab Grill',
    isAvailable: true,
    nutritionInfo: { calories: 320, protein: 18, carbs: 12, fat: 22 },
    tags: ['veg', 'starter', 'grilled'],
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-11T14:00:00Z',
  },
  {
    id: 'p3',
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato filling',
    category: 'breakfast',
    price: 120,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&h=200&fit=crop',
    city: 'Bangalore',
    kitchenId: 'k3',
    kitchenName: 'South Express',
    isAvailable: true,
    nutritionInfo: { calories: 280, protein: 8, carbs: 45, fat: 8 },
    tags: ['veg', 'south-indian', 'popular'],
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'p4',
    name: 'Hyderabadi Biryani',
    description: 'Aromatic rice layered with spiced meat and herbs',
    category: 'lunch',
    price: 280,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop',
    city: 'Hyderabad',
    kitchenId: 'k4',
    kitchenName: 'Paradise Kitchen',
    isAvailable: true,
    nutritionInfo: { calories: 550, protein: 25, carbs: 60, fat: 22 },
    tags: ['non-veg', 'rice', 'signature'],
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z',
  },
  {
    id: 'p5',
    name: 'Filter Coffee',
    description: 'Traditional South Indian filter coffee',
    category: 'beverages',
    price: 40,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop',
    city: 'Chennai',
    kitchenId: 'k5',
    kitchenName: 'Madras Cafe',
    isAvailable: true,
    nutritionInfo: { calories: 80, protein: 2, carbs: 8, fat: 4 },
    tags: ['beverage', 'hot', 'popular'],
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-14T14:00:00Z',
  },
  {
    id: 'p6',
    name: 'Idli Sambar',
    description: 'Steamed rice cakes served with lentil soup',
    category: 'breakfast',
    price: 80,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=200&fit=crop',
    city: 'Chennai',
    kitchenId: 'k5',
    kitchenName: 'Madras Cafe',
    isAvailable: false,
    nutritionInfo: { calories: 200, protein: 6, carbs: 38, fat: 2 },
    tags: ['veg', 'south-indian', 'healthy'],
    createdAt: '2024-01-06T10:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
];

const mockCities: City[] = [
  { id: 'c1', name: 'Mumbai', code: 'MUM' },
  { id: 'c2', name: 'Delhi', code: 'DEL' },
  { id: 'c3', name: 'Bangalore', code: 'BLR' },
  { id: 'c4', name: 'Hyderabad', code: 'HYD' },
  { id: 'c5', name: 'Chennai', code: 'CHN' },
];

const mockKitchens: Kitchen[] = [
  { id: 'k1', name: 'Spice Garden', city: 'Mumbai' },
  { id: 'k2', name: 'Punjab Grill', city: 'Delhi' },
  { id: 'k3', name: 'South Express', city: 'Bangalore' },
  { id: 'k4', name: 'Paradise Kitchen', city: 'Hyderabad' },
  { id: 'k5', name: 'Madras Cafe', city: 'Chennai' },
];

export const productsApi = {
  /**
   * Get all products with optional filters
   */
  getAll: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    // TODO: Replace with actual API call
    // return apiClient.get<ProductsResponse>('/products', filters);
    
    return new Promise((resolve) => {
      let filtered = [...mockProducts];
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
        );
      }
      
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      if (filters.city) {
        filtered = filtered.filter(p => p.city === filters.city);
      }
      
      if (filters.isAvailable !== undefined) {
        filtered = filtered.filter(p => p.isAvailable === filters.isAvailable);
      }

      setTimeout(() => resolve({
        products: filtered,
        total: filtered.length,
        page: filters.page || 1,
        limit: filters.limit || 12,
        totalPages: Math.ceil(filtered.length / (filters.limit || 12)),
      }), 500);
    });
  },

  /**
   * Get a single product by ID
   */
  getById: async (id: string): Promise<Product> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Product>(`/products/${id}`);
    
    return new Promise((resolve, reject) => {
      const product = mockProducts.find(p => p.id === id);
      setTimeout(() => {
        if (product) resolve(product);
        else reject({ message: 'Product not found', status: 404 });
      }, 300);
    });
  },

  /**
   * Get available cities
   */
  getCities: async (): Promise<City[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get<City[]>('/cities');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCities), 200);
    });
  },

  /**
   * Get kitchens by city
   */
  getKitchens: async (city?: string): Promise<Kitchen[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Kitchen[]>('/kitchens', { city });
    
    return new Promise((resolve) => {
      const kitchens = city 
        ? mockKitchens.filter(k => k.city === city)
        : mockKitchens;
      setTimeout(() => resolve(kitchens), 200);
    });
  },

  /**
   * Get products by city
   */
  getByCity: async (city: string): Promise<ProductsResponse> => {
    return productsApi.getAll({ city });
  },

  /**
   * Get products by category
   */
  getByCategory: async (category: string): Promise<ProductsResponse> => {
    return productsApi.getAll({ category: category as ProductFilters['category'] });
  },
};

export default productsApi;
