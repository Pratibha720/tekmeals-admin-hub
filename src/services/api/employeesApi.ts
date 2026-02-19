import apiClient from './client';
import { 
  Employee, 
  EmployeeFilters, 
  EmployeesResponse, 
  CreateEmployeePayload, 
  UpdateEmployeePayload,
  BulkImportResult,
  EmployeeStats
} from '@/types';

// Mock data for development
const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    name: 'Rahul Sharma',
    email: 'rahul@company.com',
    phone: '+91 98765 43210',
    city: 'Mumbai',
    department: 'Engineering',
    mealTypes: ['lunch', 'dinner'],
    status: 'active',
    joinedAt: '2023-06-15',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
  },
  {
    id: 'emp2',
    name: 'Priya Patel',
    email: 'priya@company.com',
    phone: '+91 98765 43211',
    city: 'Delhi',
    department: 'Marketing',
    mealTypes: ['breakfast', 'lunch'],
    status: 'active',
    joinedAt: '2023-08-20',
    createdAt: '2023-08-20T09:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z',
  },
  {
    id: 'emp3',
    name: 'Amit Kumar',
    email: 'amit@company.com',
    phone: '+91 98765 43212',
    city: 'Bangalore',
    department: 'Sales',
    mealTypes: ['lunch'],
    status: 'active',
    joinedAt: '2023-09-01',
    createdAt: '2023-09-01T10:00:00Z',
    updatedAt: '2024-01-08T16:00:00Z',
  },
  {
    id: 'emp4',
    name: 'Sneha Reddy',
    email: 'sneha@company.com',
    phone: '+91 98765 43213',
    city: 'Hyderabad',
    department: 'HR',
    mealTypes: ['breakfast', 'lunch', 'snacks'],
    status: 'inactive',
    joinedAt: '2023-04-10',
    createdAt: '2023-04-10T10:00:00Z',
    updatedAt: '2024-01-05T09:00:00Z',
  },
  {
    id: 'emp5',
    name: 'Vikram Singh',
    email: 'vikram@company.com',
    phone: '+91 98765 43214',
    city: 'Chennai',
    department: 'Finance',
    mealTypes: ['lunch', 'snacks'],
    status: 'active',
    joinedAt: '2023-07-22',
    createdAt: '2023-07-22T10:00:00Z',
    updatedAt: '2024-01-11T13:00:00Z',
  },
];

export const employeesApi = {
  /**
   * Get all employees with optional filters
   */
  getAll: async (filters: EmployeeFilters = {}): Promise<EmployeesResponse> => {
    // TODO: Replace with actual API call
    // return apiClient.get<EmployeesResponse>('/employees', filters);
    
    return new Promise((resolve) => {
      let filtered = [...mockEmployees];
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(e => 
          e.name.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search)
        );
      }
      
      if (filters.status) {
        filtered = filtered.filter(e => e.status === filters.status);
      }
      
      if (filters.city) {
        filtered = filtered.filter(e => e.city === filters.city);
      }

      setTimeout(() => resolve({
        employees: filtered,
        total: filtered.length,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: Math.ceil(filtered.length / (filters.limit || 10)),
      }), 500);
    });
  },

  /**
   * Get a single employee by ID
   */
  getById: async (id: string): Promise<Employee> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Employee>(`/employees/${id}`);
    
    return new Promise((resolve, reject) => {
      const employee = mockEmployees.find(e => e.id === id);
      setTimeout(() => {
        if (employee) resolve(employee);
        else reject({ message: 'Employee not found', status: 404 });
      }, 300);
    });
  },

  /**
   * Create a new employee
   */
  create: async (data: CreateEmployeePayload): Promise<Employee> => {
    // TODO: Replace with actual API call
    // return apiClient.post<Employee>('/employees', data);
    
    return new Promise((resolve) => {
      const newEmployee: Employee = {
        id: `emp${Date.now()}`,
        ...data,
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTimeout(() => resolve(newEmployee), 500);
    });
  },

  /**
   * Update an existing employee
   */
  update: async (id: string, data: UpdateEmployeePayload): Promise<Employee> => {
    // TODO: Replace with actual API call
    // return apiClient.patch<Employee>(`/employees/${id}`, data);
    
    return new Promise((resolve, reject) => {
      const employee = mockEmployees.find(e => e.id === id);
      setTimeout(() => {
        if (employee) {
          resolve({ ...employee, ...data, updatedAt: new Date().toISOString() });
        } else {
          reject({ message: 'Employee not found', status: 404 });
        }
      }, 500);
    });
  },

  /**
   * Toggle employee status
   */
  toggleStatus: async (id: string): Promise<Employee> => {
    // TODO: Replace with actual API call
    // return apiClient.patch<Employee>(`/employees/${id}/toggle-status`);
    
    return new Promise((resolve, reject) => {
      const employee = mockEmployees.find(e => e.id === id);
      setTimeout(() => {
        if (employee) {
          resolve({ 
            ...employee, 
            status: employee.status === 'active' ? 'inactive' : 'active',
            updatedAt: new Date().toISOString() 
          });
        } else {
          reject({ message: 'Employee not found', status: 404 });
        }
      }, 300);
    });
  },

  /**
   * Bulk import employees from CSV/XLSX
   */
  bulkImport: async (file: File): Promise<BulkImportResult> => {
    // TODO: Replace with actual API call
    // const formData = new FormData();
    // formData.append('file', file);
    // return apiClient.upload<BulkImportResult>('/employees/import', formData);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        success: 45,
        failed: 3,
        errors: [
          { row: 12, message: 'Invalid email format' },
          { row: 23, message: 'City not found' },
          { row: 45, message: 'Duplicate email' },
        ],
      }), 1500);
    });
  },

  /**
   * Export employees to CSV/Excel
   */
  export: async (format: 'csv' | 'xlsx'): Promise<Blob> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Blob>(`/employees/export?format=${format}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = 'Name,Email,Phone,City,Department,Status\n';
        resolve(new Blob([content], { type: 'text/csv' }));
      }, 500);
    });
  },

  /**
   * Get employee statistics
   */
  getStats: async (): Promise<EmployeeStats> => {
    // TODO: Replace with actual API call
    // return apiClient.get<EmployeeStats>('/employees/stats');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        totalEmployees: mockEmployees.length,
        activeEmployees: mockEmployees.filter(e => e.status === 'active').length,
        inactiveEmployees: mockEmployees.filter(e => e.status === 'inactive').length,
      }), 300);
    });
  },
};

export default employeesApi;
