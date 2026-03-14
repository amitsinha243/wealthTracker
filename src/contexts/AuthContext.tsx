import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import { API_BASE_URL } from '@/config/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, name: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyStoredSession = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('currentUser');

      if (!storedToken || !storedUser) {
        // Nothing stored — go straight to login
        setLoading(false);
        return;
      }

      try {
        // Validate the token against the backend
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          // Token is valid — use fresh data from server
          const userData = await response.json();
          setUser({ id: userData.id, email: userData.email, name: userData.name });
        } else if (response.status === 401 || response.status === 403) {
          // Server explicitly rejected the token — clear everything
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setUser(null);
        } else {
          // Unexpected server error (5xx, etc.) — trust local session to avoid false logouts
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // Network error (server down, no internet, CORS) — trust local session
        // so the user isn't logged out just because the server is temporarily unreachable
        setUser(JSON.parse(storedUser));
      } finally {
        setLoading(false);
      }
    };

    verifyStoredSession();
  }, []);

  const signup = async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      const response = await authAPI.signup(email, password, name);
      const userToStore = { id: response.id, email: response.email, name: response.name };

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      setUser(userToStore);
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Email already exists or signup failed';
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await authAPI.login(email, password);
      const userToStore = { id: response.id, email: response.email, name: response.name };

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      setUser(userToStore);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid email or password';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
