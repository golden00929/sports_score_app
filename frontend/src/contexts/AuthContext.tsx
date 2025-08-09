import React, { createContext, useContext, useEffect, useState } from 'react';
import { Admin, AuthResponse } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!admin;

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const { token, admin: adminData } = response.data as AuthResponse;
        
        // Store token and admin info
        localStorage.setItem('miiracer_token', token);
        localStorage.setItem('miiracer_admin', JSON.stringify(adminData));
        
        setAdmin(adminData);
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        '로그인 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('miiracer_token');
    localStorage.removeItem('miiracer_admin');
    setAdmin(null);
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('miiracer_token');
      const storedAdmin = localStorage.getItem('miiracer_admin');

      if (!token || !storedAdmin) {
        setAdmin(null);
        return;
      }

      try {
        // Parse stored admin data first
        const adminData = JSON.parse(storedAdmin);
        setAdmin(adminData);

        // Verify token with server only if we're on admin routes
        if (window.location.pathname.startsWith('/admin')) {
          const response = await apiService.getProfile();
          
          if (response.success && response.data) {
            setAdmin(response.data as Admin);
          } else {
            // Token invalid
            logout();
          }
        }
      } catch (parseError) {
        // Invalid stored data
        logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Only logout if we're on admin routes
      if (window.location.pathname.startsWith('/admin')) {
        logout();
      } else {
        setAdmin(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};