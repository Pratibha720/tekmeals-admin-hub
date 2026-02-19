import apiClient from './client';
import { 
  ReportFilters, 
  OrdersReport, 
  ConsumptionReport, 
  CityUsageReport, 
  MealTrendsReport 
} from '@/types';

// Mock data for development
const mockOrdersReport: OrdersReport = {
  totalOrders: 3842,
  totalAmount: 892500,
  averageOrderValue: 232,
  ordersByStatus: {
    delivered: 3200,
    pending: 312,
    confirmed: 180,
    cancelled: 150,
  },
  ordersByType: {
    regular: 2800,
    custom: 542,
    guest: 300,
    company: 200,
  },
  dailyTrend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      orders: Math.floor(Math.random() * 50) + 100,
      amount: Math.floor(Math.random() * 20000) + 20000,
    };
  }),
};

const mockConsumptionReport: ConsumptionReport = {
  employees: [
    { employeeId: 'emp1', employeeName: 'Rahul Sharma', totalOrders: 45, totalAmount: 12500, mealBreakdown: { lunch: 30, dinner: 15 } },
    { employeeId: 'emp2', employeeName: 'Priya Patel', totalOrders: 38, totalAmount: 9800, mealBreakdown: { breakfast: 15, lunch: 23 } },
    { employeeId: 'emp3', employeeName: 'Amit Kumar', totalOrders: 42, totalAmount: 11200, mealBreakdown: { lunch: 42 } },
  ],
  topConsumers: [
    { employeeId: 'emp1', employeeName: 'Rahul Sharma', amount: 12500 },
    { employeeId: 'emp3', employeeName: 'Amit Kumar', amount: 11200 },
    { employeeId: 'emp2', employeeName: 'Priya Patel', amount: 9800 },
  ],
};

const mockCityUsageReport: CityUsageReport = {
  cities: [
    { city: 'Mumbai', totalOrders: 1250, totalAmount: 312500, employeeCount: 145, avgOrdersPerEmployee: 8.6 },
    { city: 'Delhi', totalOrders: 980, totalAmount: 245000, employeeCount: 112, avgOrdersPerEmployee: 8.75 },
    { city: 'Bangalore', totalOrders: 876, totalAmount: 219000, employeeCount: 98, avgOrdersPerEmployee: 8.94 },
    { city: 'Hyderabad', totalOrders: 456, totalAmount: 114000, employeeCount: 52, avgOrdersPerEmployee: 8.77 },
    { city: 'Chennai', totalOrders: 280, totalAmount: 70000, employeeCount: 35, avgOrdersPerEmployee: 8.0 },
  ],
};

const mockMealTrendsReport: MealTrendsReport = {
  mealTypes: [
    { type: 'Lunch', orderCount: 2500, percentage: 65 },
    { type: 'Breakfast', orderCount: 680, percentage: 18 },
    { type: 'Dinner', orderCount: 420, percentage: 11 },
    { type: 'Snacks', orderCount: 242, percentage: 6 },
  ],
  popularItems: [
    { productId: 'p1', productName: 'Butter Chicken', orderCount: 450, totalQuantity: 580 },
    { productId: 'p4', productName: 'Biryani', orderCount: 380, totalQuantity: 520 },
    { productId: 'p3', productName: 'Masala Dosa', orderCount: 320, totalQuantity: 480 },
    { productId: 'p2', productName: 'Paneer Tikka', orderCount: 280, totalQuantity: 350 },
  ],
  weekdayDistribution: [
    { day: 'Monday', orders: 580 },
    { day: 'Tuesday', orders: 620 },
    { day: 'Wednesday', orders: 650 },
    { day: 'Thursday', orders: 590 },
    { day: 'Friday', orders: 480 },
    { day: 'Saturday', orders: 120 },
    { day: 'Sunday', orders: 80 },
  ],
};

export const reportsApi = {
  /**
   * Get orders report
   */
  getOrdersReport: async (filters: ReportFilters): Promise<OrdersReport> => {
    // TODO: Replace with actual API call
    // return apiClient.get<OrdersReport>('/reports/orders', filters);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockOrdersReport), 600);
    });
  },

  /**
   * Get consumption report
   */
  getConsumptionReport: async (filters: ReportFilters): Promise<ConsumptionReport> => {
    // TODO: Replace with actual API call
    // return apiClient.get<ConsumptionReport>('/reports/consumption', filters);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockConsumptionReport), 600);
    });
  },

  /**
   * Get city usage report
   */
  getCityUsageReport: async (filters: ReportFilters): Promise<CityUsageReport> => {
    // TODO: Replace with actual API call
    // return apiClient.get<CityUsageReport>('/reports/city-usage', filters);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCityUsageReport), 600);
    });
  },

  /**
   * Get meal trends report
   */
  getMealTrendsReport: async (filters: ReportFilters): Promise<MealTrendsReport> => {
    // TODO: Replace with actual API call
    // return apiClient.get<MealTrendsReport>('/reports/meal-trends', filters);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMealTrendsReport), 600);
    });
  },

  /**
   * Export report to CSV/Excel
   */
  exportReport: async (type: string, filters: ReportFilters, format: 'csv' | 'xlsx'): Promise<Blob> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Blob>(`/reports/${type}/export?format=${format}`, filters);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = 'Report data...';
        resolve(new Blob([content], { type: 'text/csv' }));
      }, 500);
    });
  },
};

export default reportsApi;
