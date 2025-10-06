import { createContext, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (username, password) => {
    setLoading(true);
    
    try {
      // Call real backend API for authentication
      const response = await authAPI.login({ username, password });
      
      if (response && response.access_token) {
        const { access_token, user: userData } = response;
        
        // Store token and user data
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        // Navigate based on role
        const redirectPath = getRedirectPath(userData.role.toLowerCase());
        navigate(redirectPath, { replace: true });
        
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.detail || 'Invalid credentials';
        return { success: false, error: errorMessage };
      } else if (error.response?.status === 500) {
        return { success: false, error: 'Server error. Please try again later.' };
      } else if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
        return { success: false, error: 'Cannot connect to server. Please ensure the backend is running.' };
      } else {
        return { success: false, error: 'Login failed. Please try again.' };
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case 'superadmin':
      case 'admin':
        return '/admin';
      case 'management':
        return '/management';
      case 'academics':
        return '/academics';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      default:
        return '/dashboard';
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      loading,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);