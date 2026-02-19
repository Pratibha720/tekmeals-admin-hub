import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthState, LoginCredentials, User, Company } from '@/types/auth';
import apiClient from '@/services/api/client';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    company: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: !!localStorage.getItem('auth_token'),
    isLoading: true,
  });

  // On mount, if token exists try to validate / fetch profile
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }

    // TODO: Replace with actual profile fetch when backend is ready
    // For now, mark as authenticated if token exists
    setState(s => ({
      ...s,
      isAuthenticated: true,
      isLoading: false,
      user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
      company: JSON.parse(localStorage.getItem('auth_company') || 'null'),
    }));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    // TODO: Replace with actual API call: const res = await authApi.login(credentials);
    // For now, simulate a successful login for development
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      name: credentials.email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      role: 'COMPANY_ADMIN',
      companyId: 'comp-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockCompany: Company = {
      id: 'comp-1',
      name: 'TekMeals Corp',
      email: 'admin@tekmeals.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockToken = 'mock-jwt-token';

    apiClient.setToken(mockToken);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_company', JSON.stringify(mockCompany));

    setState({
      user: mockUser,
      company: mockCompany,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    apiClient.setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_company');
    setState({
      user: null,
      company: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
