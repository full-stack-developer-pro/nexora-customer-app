import React, { createContext, useContext, useState, useEffect } from 'react';
import customerAuthService, { CustomerUser } from '../services/customerAuthService';

interface AuthContextType {
  user: CustomerUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<CustomerUser>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<CustomerUser>;
  loginWithGoogle: (idToken: string) => Promise<CustomerUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CustomerUser | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await customerAuthService.getToken();
        const cached = await customerAuthService.getCachedUser();
        if (token && cached) {
          setUser(cached);
        }

        if (token) {
          customerAuthService
            .getMe()
            .then((fresh) => {
              if (fresh) setUser(fresh);
            })
            .catch(() => {});
        }
      } catch (err) {
        console.warn('Failed to load customer session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<CustomerUser> => {
    setIsLoading(true);
    try {
      const res = await customerAuthService.login(email, password);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }): Promise<CustomerUser> => {
    setIsLoading(true);
    try {
      const res = await customerAuthService.register(payload);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<CustomerUser> => {
    setIsLoading(true);
    try {
      const res = await customerAuthService.loginWithGoogle(idToken);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await customerAuthService.logout();
    setUser(null);
  };

  const refreshUser = async (): Promise<CustomerUser | null> => {
    const fresh = await customerAuthService.getMe();
    if (fresh) setUser(fresh);
    return fresh;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

