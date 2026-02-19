export type ReportType = 'orders' | 'consumption' | 'city_usage' | 'meal_trends';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface ReportFilters {
  type: ReportType;
  period: ReportPeriod;
  dateFrom: string;
  dateTo: string;
  city?: string;
  employeeId?: string;
}

export interface OrdersReport {
  totalOrders: number;
  totalAmount: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByType: Record<string, number>;
  dailyTrend: Array<{
    date: string;
    orders: number;
    amount: number;
  }>;
}

export interface ConsumptionReport {
  employees: Array<{
    employeeId: string;
    employeeName: string;
    totalOrders: number;
    totalAmount: number;
    mealBreakdown: Record<string, number>;
  }>;
  topConsumers: Array<{
    employeeId: string;
    employeeName: string;
    amount: number;
  }>;
}

export interface CityUsageReport {
  cities: Array<{
    city: string;
    totalOrders: number;
    totalAmount: number;
    employeeCount: number;
    avgOrdersPerEmployee: number;
  }>;
}

export interface MealTrendsReport {
  mealTypes: Array<{
    type: string;
    orderCount: number;
    percentage: number;
  }>;
  popularItems: Array<{
    productId: string;
    productName: string;
    orderCount: number;
    totalQuantity: number;
  }>;
  weekdayDistribution: Array<{
    day: string;
    orders: number;
  }>;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface TrendData {
  date: string;
  orders: number;
  amount?: number;
}
