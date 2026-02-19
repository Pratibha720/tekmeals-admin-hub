export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'upi' | 'other';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  periodStart: string;
  periodEnd: string;
  itemsCount: number;
  ordersCount: number;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BillingSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  upcomingDue: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface PaymentHistory {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidDate: string;
  transactionId?: string;
}
