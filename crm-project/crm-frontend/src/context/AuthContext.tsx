import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '@/graphql/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  // Auto-login on mount (read token from localStorage)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Token exists, set it in state
      setToken(storedToken);
      // Optionally, you could decode the JWT to get user data
      // For now, we'll just trust the token exists
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await loginMutation({
      variables: { input: { email, password } }
    });
    const { token: newToken, user: newUser } = data.login;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    navigate('/dashboard');
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    await registerMutation({
      variables: { input: { email, password, firstName, lastName } }
    });
    // Registration successful - redirect to login page with success message
    navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
