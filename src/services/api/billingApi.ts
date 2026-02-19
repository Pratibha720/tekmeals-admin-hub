import apiClient from './client';
import { Invoice, InvoiceFilters, InvoicesResponse, BillingSummary, PaymentHistory } from '@/types';

// Mock data for development
const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    companyId: 'comp1',
    amount: 45000,
    tax: 8100,
    totalAmount: 53100,
    status: 'paid',
    dueDate: '2024-01-15',
    paidDate: '2024-01-12',
    paymentMethod: 'bank_transfer',
    periodStart: '2023-12-01',
    periodEnd: '2023-12-31',
    itemsCount: 450,
    ordersCount: 320,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    companyId: 'comp1',
    amount: 52000,
    tax: 9360,
    totalAmount: 61360,
    status: 'pending',
    dueDate: '2024-02-15',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    itemsCount: 520,
    ordersCount: 380,
    createdAt: '2024-02-02T10:00:00Z',
    updatedAt: '2024-02-02T10:00:00Z',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2023-012',
    companyId: 'comp1',
    amount: 38000,
    tax: 6840,
    totalAmount: 44840,
    status: 'overdue',
    dueDate: '2023-12-15',
    periodStart: '2023-11-01',
    periodEnd: '2023-11-30',
    itemsCount: 380,
    ordersCount: 290,
    createdAt: '2023-12-02T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2023-011',
    companyId: 'comp1',
    amount: 41500,
    tax: 7470,
    totalAmount: 48970,
    status: 'paid',
    dueDate: '2023-11-15',
    paidDate: '2023-11-14',
    paymentMethod: 'credit_card',
    periodStart: '2023-10-01',
    periodEnd: '2023-10-31',
    itemsCount: 415,
    ordersCount: 310,
    createdAt: '2023-11-02T10:00:00Z',
    updatedAt: '2023-11-14T14:00:00Z',
  },
];

const mockBillingSummary: BillingSummary = {
  totalPaid: 102070,
  totalPending: 61360,
  totalOverdue: 44840,
  upcomingDue: 61360,
  lastPaymentDate: '2024-01-12',
  lastPaymentAmount: 53100,
};

export const billingApi = {
  /**
   * Get all invoices with optional filters
   */
  getAll: async (filters: InvoiceFilters = {}): Promise<InvoicesResponse> => {
    // TODO: Replace with actual API call
    // return apiClient.get<InvoicesResponse>('/billing/invoices', filters);
    
    return new Promise((resolve) => {
      let filtered = [...mockInvoices];
      
      if (filters.status) {
        filtered = filtered.filter(i => i.status === filters.status);
      }

      setTimeout(() => resolve({
        invoices: filtered,
        total: filtered.length,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: Math.ceil(filtered.length / (filters.limit || 10)),
      }), 500);
    });
  },

  /**
   * Get a single invoice by ID
   */
  getById: async (id: string): Promise<Invoice> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Invoice>(`/billing/invoices/${id}`);
    
    return new Promise((resolve, reject) => {
      const invoice = mockInvoices.find(i => i.id === id);
      setTimeout(() => {
        if (invoice) resolve(invoice);
        else reject({ message: 'Invoice not found', status: 404 });
      }, 300);
    });
  },

  /**
   * Get billing summary
   */
  getSummary: async (): Promise<BillingSummary> => {
    // TODO: Replace with actual API call
    // return apiClient.get<BillingSummary>('/billing/summary');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBillingSummary), 400);
    });
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get<PaymentHistory[]>('/billing/payments');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve([
        {
          id: 'pay1',
          invoiceId: 'inv1',
          invoiceNumber: 'INV-2024-001',
          amount: 53100,
          paymentMethod: 'bank_transfer',
          paidDate: '2024-01-12',
          transactionId: 'TXN123456789',
        },
        {
          id: 'pay2',
          invoiceId: 'inv4',
          invoiceNumber: 'INV-2023-011',
          amount: 48970,
          paymentMethod: 'credit_card',
          paidDate: '2023-11-14',
          transactionId: 'TXN987654321',
        },
      ]), 400);
    });
  },

  /**
   * Download invoice as PDF
   */
  downloadPdf: async (id: string): Promise<Blob> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Blob>(`/billing/invoices/${id}/download?format=pdf`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Blob(['PDF content'], { type: 'application/pdf' }));
      }, 500);
    });
  },

  /**
   * Download invoice as Excel
   */
  downloadExcel: async (id: string): Promise<Blob> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Blob>(`/billing/invoices/${id}/download?format=xlsx`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Blob(['Excel content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      }, 500);
    });
  },
};

export default billingApi;
