'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkSessionApi, logoutApi, googleLoginApi } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar_url?: string | null;
  address_line1?: string;
  town?: string;
  district?: string;
  province?: string;
  postal_code?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (userData: User, token?: string) => void;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAdmin: false,
  login: () => {},
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check HTTP-only cookie session on initial mount
  useEffect(() => {
    async function verifyUserSession() {
      try {
        const res = await checkSessionApi();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    verifyUserSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await googleLoginApi(credential);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, message: res.message || 'Google login failed' };
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user ? 'cookie-session' : null,
        isAdmin,
        login,
        loginWithGoogle,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);