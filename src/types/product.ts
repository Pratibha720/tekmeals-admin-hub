export type ProductCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: ProductCategory;
  price: number;
  image?: string;
  city: string;
  kitchenId: string;
  kitchenName: string;
  isAvailable: boolean;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  city?: string;
  kitchenId?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface City {
  id: string;
  name: string;
  code: string;
}

export interface Kitchen {
  id: string;
  name: string;
  city: string;
}
