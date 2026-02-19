import apiClient from './client';
import { Order, OrderFilters, OrdersResponse } from '@/types';

// Mock data for development
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    employeeId: 'emp1',
    employeeName: 'Rahul Sharma',
    employeeEmail: 'rahul@company.com',
    city: 'Mumbai',
    type: 'regular',
    status: 'delivered',
    items: [
      { id: '1', productId: 'p1', productName: 'Butter Chicken', quantity: 1, unitPrice: 250, totalPrice: 250 },
      { id: '2', productId: 'p2', productName: 'Naan', quantity: 2, unitPrice: 40, totalPrice: 80 },
    ],
    totalAmount: 330,
    totalQuantity: 3,
    orderDate: '2024-01-15T10:30:00Z',
    deliveryDate: '2024-01-15T12:00:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    employeeId: 'emp2',
    employeeName: 'Priya Patel',
    employeeEmail: 'priya@company.com',
    city: 'Delhi',
    type: 'custom',
    status: 'confirmed',
    items: [
      { id: '3', productId: 'p3', productName: 'Veg Thali', quantity: 1, unitPrice: 180, totalPrice: 180 },
    ],
    totalAmount: 180,
    totalQuantity: 1,
    orderDate: '2024-01-15T11:00:00Z',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    employeeId: 'emp3',
    employeeName: 'Amit Kumar',
    employeeEmail: 'amit@company.com',
    city: 'Bangalore',
    type: 'regular',
    status: 'pending',
    items: [
      { id: '4', productId: 'p4', productName: 'Biryani', quantity: 2, unitPrice: 200, totalPrice: 400 },
    ],
    totalAmount: 400,
    totalQuantity: 2,
    orderDate: '2024-01-15T12:00:00Z',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    employeeId: 'emp4',
    employeeName: 'Sneha Reddy',
    employeeEmail: 'sneha@company.com',
    city: 'Hyderabad',
    type: 'guest',
    status: 'preparing',
    items: [
      { id: '5', productId: 'p5', productName: 'Dosa', quantity: 3, unitPrice: 80, totalPrice: 240 },
    ],
    totalAmount: 240,
    totalQuantity: 3,
    orderDate: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    employeeId: 'emp5',
    employeeName: 'Vikram Singh',
    employeeEmail: 'vikram@company.com',
    city: 'Chennai',
    type: 'company',
    status: 'cancelled',
    items: [
      { id: '6', productId: 'p6', productName: 'Idli Sambar', quantity: 4, unitPrice: 60, totalPrice: 240 },
    ],
    totalAmount: 240,
    totalQuantity: 4,
    orderDate: '2024-01-14T10:00:00Z',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:30:00Z',
  },
];

export const ordersApi = {
  /**
   * Get all orders with optional filters
   */
  getAll: async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
    // TODO: Replace with actual API call
    // return apiClient.get<OrdersResponse>('/orders', filters as Record<string, string | number | boolean | undefined>);
    
    return new Promise((resolve) => {
      let filtered = [...mockOrders];
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(o => 
          o.employeeName.toLowerCase().includes(search) ||
          o.orderNumber.toLowerCase().includes(search)
        );
      }
      
      if (filters.status) {
        filtered = filtered.filter(o => o.status === filters.status);
      }
      
      if (filters.type) {
        filtered = filtered.filter(o => o.type === filters.type);
      }
      
      if (filters.city) {
        filtered = filtered.filter(o => o.city === filters.city);
      }

      setTimeout(() => resolve({
        orders: filtered,
        total: filtered.length,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: Math.ceil(filtered.length / (filters.limit || 10)),
      }), 500);
    });
  },

  /**
   * Get a single order by ID
   */
  getById: async (id: string): Promise<Order> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Order>(`/orders/${id}`);
    
    return new Promise((resolve, reject) => {
      const order = mockOrders.find(o => o.id === id);
      setTimeout(() => {
        if (order) resolve(order);
        else reject({ message: 'Order not found', status: 404 });
      }, 300);
    });
  },

  /**
   * Get today's orders
   */
  getTodayOrders: async (): Promise<OrdersResponse> => {
    // TODO: Replace with actual API call
    // return apiClient.get<OrdersResponse>('/orders/today');
    
    return ordersApi.getAll({ dateFrom: new Date().toISOString().split('T')[0] });
  },

  /**
   * Get orders by type (custom, guest, company)
   */
  getByType: async (type: string): Promise<OrdersResponse> => {
    // TODO: Replace with actual API call
    return ordersApi.getAll({ type: type as OrderFilters['type'] });
  },

  /**
   * Export orders to CSV/Excel
   */
  exportOrders: async (filters: OrderFilters, format: 'csv' | 'xlsx'): Promise<Blob> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Blob>(`/orders/export?format=${format}`, filters);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = 'Order Number,Employee,City,Amount,Status\n';
        resolve(new Blob([content], { type: 'text/csv' }));
      }, 500);
    });
  },
};

export default ordersApi;
