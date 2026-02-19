export type EmployeeStatus = 'active' | 'inactive';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city: string;
  department?: string;
  mealTypes: MealType[];
  status: EmployeeStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
  city?: string;
  mealType?: MealType;
  page?: number;
  limit?: number;
}

export interface EmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  phone?: string;
  city: string;
  department?: string;
  mealTypes: MealType[];
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  status?: EmployeeStatus;
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
}
