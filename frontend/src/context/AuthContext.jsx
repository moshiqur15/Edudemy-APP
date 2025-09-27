import { createContext, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
    
    // Simple mock authentication
    const mockUsers = {
      superadmin: { id: 0, username: 'superadmin', role: 'superadmin', email: 'superadmin@edudemy.com', full_name: 'Super Administrator' },
      admin: { id: 1, username: 'admin', role: 'admin', email: 'admin@edudemy.com', full_name: 'System Administrator' },
      teacher: { id: 2, username: 'teacher', role: 'teacher', email: 'teacher@edudemy.com', full_name: 'Demo Teacher' },
      student: { id: 3, username: 'student', role: 'student', email: 'student@edudemy.com', full_name: 'Demo Student' },
      management: { id: 4, username: 'management', role: 'management', email: 'management@edudemy.com', full_name: 'Demo Management' },
      academics: { id: 5, username: 'academics', role: 'academics', email: 'academics@edudemy.com', full_name: 'Demo Academics' }
    };
    
    const mockUser = mockUsers[username.toLowerCase()];
    const validPasswords = ['admin123', 'teacher123', 'student123', 'demo123', 'super123'];
    
    if (mockUser && validPasswords.includes(password)) {
      const userData = mockUser;
      const access_token = 'mock_token_' + Date.now();
      
      // Store token and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Navigate based on role
      const redirectPath = getRedirectPath(userData.role);
      navigate(redirectPath, { replace: true });
      
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: 'Invalid demo credentials' };
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