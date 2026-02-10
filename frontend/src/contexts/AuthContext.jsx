import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔐 [AUTH] Starting login process...');
      console.log('🔐 [AUTH] Username:', username);
      console.log('🔐 [AUTH] API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

      const response = await authAPI.login({ username, password });

      console.log('✅ [AUTH] Login successful!');
      console.log('✅ [AUTH] Response:', response.data);

      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH] Login failed!');
      console.error('❌ [AUTH] Error:', error.message);
      console.error('❌ [AUTH] Status:', error.response?.status);
      console.error('❌ [AUTH] Data:', error.response?.data);

      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
