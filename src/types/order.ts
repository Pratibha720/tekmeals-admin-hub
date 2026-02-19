export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
export type OrderType = 'regular' | 'custom' | 'guest' | 'company';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  city: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  totalQuantity: number;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  type?: OrderType;
  city?: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderStats {
  todayOrders: number;
  todayOrdersTrend: number;
  monthlyOrders: number;
  monthlyOrdersTrend: number;
}
