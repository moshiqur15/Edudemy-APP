import React, { useState, useEffect, useContext, createContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { permissionsAPI } from '../services/api';

// Create Permissions Context
const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('role_default');

  // Fallback permissions based on role
  const getFallbackPermissions = (role) => {
    const defaultPermissions = {
      superadmin: ['dashboard', 'user_management', 'students', 'teachers', 'batches', 'analytics', 'attendance', 'gradebook', 'classes', 'exams', 'reports', 'behavior', 'tasks', 'feedback', 'permissions', 'settings'],
      admin: ['dashboard', 'user_management', 'students', 'teachers', 'batches', 'analytics', 'attendance', 'gradebook', 'classes', 'exams', 'reports', 'behavior', 'tasks', 'feedback', 'permissions', 'settings'],
      management: ['dashboard', 'analytics', 'attendance', 'gradebook', 'tasks', 'reports', 'feedback'],
      academics: ['dashboard', 'analytics', 'attendance', 'gradebook', 'classes', 'exams', 'reports', 'behavior', 'batches'],
      teacher: ['dashboard', 'classes', 'gradebook', 'attendance'],
      student: ['dashboard', 'gradebook', 'attendance', 'feedback']
    };

    return defaultPermissions[role] || [];
  };

  // Fetch user's effective permissions
  const fetchPermissions = async () => {
    if (!user?.id) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await permissionsAPI.getEffectiveSystemPermissions(user.id);
      setPermissions(response.permissions || []);
      setSource(response.source || 'role_default');
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      
      // Fallback to role-based permissions
      const fallbackPermissions = getFallbackPermissions(user.role);
      setPermissions(fallbackPermissions);
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!permission) return true;
    if (user?.role === 'superadmin') return true; // Superadmin has all permissions
    return permissions.includes(permission);
  };

  // Check if user has any of the given permissions
  const hasAnyPermission = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true;
    if (user?.role === 'superadmin') return true;
    return permissionList.some(permission => permissions.includes(permission));
  };

  // Check if user has all of the given permissions
  const hasAllPermissions = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true;
    if (user?.role === 'superadmin') return true;
    return permissionList.every(permission => permissions.includes(permission));
  };

  // Refresh permissions (useful when permissions are updated)
  const refreshPermissions = () => {
    fetchPermissions();
  };

  useEffect(() => {
    if (user?.id) {
      fetchPermissions();
    } else {
      setPermissions([]);
      setLoading(false);
    }
  }, [user?.id]);

  const value = {
    permissions,
    loading,
    source,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions
  };

  return React.createElement(PermissionsContext.Provider, { value }, children);
};

export default usePermissions;
