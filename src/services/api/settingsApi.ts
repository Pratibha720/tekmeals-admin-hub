import apiClient from './client';
import { Company, ChangePasswordPayload } from '@/types';

// Mock data for development
const mockCompany: Company = {
  id: 'comp1',
  name: 'TechCorp Solutions',
  logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
  email: 'admin@techcorp.com',
  phone: '+91 22 1234 5678',
  address: '123 Business Park, Sector 5',
  city: 'Mumbai',
  description: 'Leading technology solutions provider with offices across India.',
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2024-01-10T14:00:00Z',
};

export interface CompanySettings {
  company: Company;
  notifications: {
    emailOrders: boolean;
    emailBilling: boolean;
    emailReports: boolean;
    smsOrders: boolean;
  };
  preferences: {
    defaultCity: string;
    timezone: string;
    currency: string;
    language: string;
  };
}

const mockSettings: CompanySettings = {
  company: mockCompany,
  notifications: {
    emailOrders: true,
    emailBilling: true,
    emailReports: false,
    smsOrders: false,
  },
  preferences: {
    defaultCity: 'Mumbai',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
  },
};

export const settingsApi = {
  /**
   * Get company profile
   */
  getCompanyProfile: async (): Promise<Company> => {
    // TODO: Replace with actual API call
    // return apiClient.get<Company>('/settings/company');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCompany), 400);
    });
  },

  /**
   * Update company profile
   */
  updateCompanyProfile: async (data: Partial<Company>): Promise<Company> => {
    // TODO: Replace with actual API call
    // return apiClient.patch<Company>('/settings/company', data);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...mockCompany, ...data, updatedAt: new Date().toISOString() }), 500);
    });
  },

  /**
   * Upload company logo
   */
  uploadLogo: async (file: File): Promise<{ url: string }> => {
    // TODO: Replace with actual API call
    // const formData = new FormData();
    // formData.append('logo', file);
    // return apiClient.upload<{ url: string }>('/settings/company/logo', formData);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve({ url: URL.createObjectURL(file) }), 800);
    });
  },

  /**
   * Get all settings
   */
  getSettings: async (): Promise<CompanySettings> => {
    // TODO: Replace with actual API call
    // return apiClient.get<CompanySettings>('/settings');
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSettings), 400);
    });
  },

  /**
   * Update notification settings
   */
  updateNotifications: async (data: CompanySettings['notifications']): Promise<CompanySettings['notifications']> => {
    // TODO: Replace with actual API call
    // return apiClient.patch<CompanySettings['notifications']>('/settings/notifications', data);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 400);
    });
  },

  /**
   * Update preferences
   */
  updatePreferences: async (data: CompanySettings['preferences']): Promise<CompanySettings['preferences']> => {
    // TODO: Replace with actual API call
    // return apiClient.patch<CompanySettings['preferences']>('/settings/preferences', data);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 400);
    });
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordPayload): Promise<{ success: boolean }> => {
    // TODO: Replace with actual API call
    // return apiClient.post<{ success: boolean }>('/settings/change-password', data);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.newPassword === data.confirmPassword && data.newPassword.length >= 8) {
          resolve({ success: true });
        } else {
          reject({ message: 'Invalid password', status: 400 });
        }
      }, 500);
    });
  },
};

export default settingsApi;
