import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { adminApi } from '@/modules/church-management/api';
import type { Admin } from '@/modules/church-management/api/types';

interface ChurchMgmtAuthContextType {
  user: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const ChurchMgmtAuthContext = createContext<ChurchMgmtAuthContextType | undefined>(undefined);

export function ChurchMgmtAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await adminApi.getMe();
      if (response.data) {
        setUser(response.data);
      } else {
        adminApi.logout();
        setUser(null);
      }
    } catch {
      adminApi.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await adminApi.login({ email, password });
    if (response.error) {
      adminApi.logout();
      throw new Error(response.error);
    }
    if (response.data?.admin) {
      setUser(response.data.admin);
    } else {
      throw new Error('Login failed: No user data received');
    }
  };

  const logout = () => {
    adminApi.logout();
    setUser(null);
  };

  return (
    <ChurchMgmtAuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </ChurchMgmtAuthContext.Provider>
  );
}

export function useChurchMgmtAuth() {
  const context = useContext(ChurchMgmtAuthContext);
  if (context === undefined) {
    throw new Error('useChurchMgmtAuth must be used within ChurchMgmtAuthProvider');
  }
  return context;
}
