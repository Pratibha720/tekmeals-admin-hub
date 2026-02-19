export interface User {
  id: string;
  email: string;
  name: string;
  role: 'COMPANY_ADMIN';
  companyId: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  company: Company;
  token: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
