import apiClient from './client';
import { OrderStats, TrendData, ChartDataPoint } from '@/types';

// Mock data for development
const mockDashboardStats: OrderStats = {
  todayOrders: 156,
  todayOrdersTrend: 12.5,
  monthlyOrders: 3842,
  monthlyOrdersTrend: 8.2,
};

const mockEmployeeStats = {
  activeEmployees: 487,
  totalEmployees: 512,
};

const mockPendingInvoices = {
  count: 3,
  amount: 125400,
};

const mockOrdersTrend: TrendData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    orders: Math.floor(Math.random() * 100) + 80,
    amount: Math.floor(Math.random() * 50000) + 30000,
  };
});

const mockCityDistribution: ChartDataPoint[] = [
  { name: 'Mumbai', value: 1250, label: '32%' },
  { name: 'Delhi', value: 980, label: '25%' },
  { name: 'Bangalore', value: 876, label: '23%' },
  { name: 'Hyderabad', value: 456, label: '12%' },
  { name: 'Chennai', value: 280, label: '8%' },
];

export const dashboardApi = {
  /**
   * Get order statistics for the dashboard
   */
  getOrderStats: async (): Promise<OrderStats> => {
    // TODO: Replace with actual API call
    // return apiClient.get<OrderStats>('/dashboard/order-stats');
    
    // Return mock data
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDashboardStats), 500);
    });
  },

  /**
   * Get employee statistics
   */
  getEmployeeStats: async (): Promise<{ activeEmployees: number; totalEmployees: number }> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/dashboard/employee-stats');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockEmployeeStats), 400);
    });
  },

  /**
   * Get pending invoices summary
   */
  getPendingInvoices: async (): Promise<{ count: number; amount: number }> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/dashboard/pending-invoices');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPendingInvoices), 450);
    });
  },

  /**
   * Get orders trend for the last 30 days
   */
  getOrdersTrend: async (): Promise<TrendData[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get<TrendData[]>('/dashboard/orders-trend');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockOrdersTrend), 600);
    });
  },

  /**
   * Get city-wise order distribution
   */
  getCityDistribution: async (): Promise<ChartDataPoint[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get<ChartDataPoint[]>('/dashboard/city-distribution');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCityDistribution), 550);
    });
  },
};

export default dashboardApi;
