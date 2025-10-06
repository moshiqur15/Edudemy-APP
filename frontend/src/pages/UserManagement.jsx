import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { usersAPI, adminAPI, permissionsAPI, accessRequestAPI } from '../services/api';
import AccessRequestManagement from '../components/AccessRequestManagement';
import AdminUserCreation from '../components/AdminUserCreation';
import {
  Users,
  Shield,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  UserPlus,
  Crown,
  Key,
  Search,
  Filter,
  Eye,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Activity,
  User,
  Home,
  BookOpen,
  UserCheck,
  BarChart3,
  FileText,
  Target,
  ClipboardList,
  Award,
  Book,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  UserX,
  FileCheck,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';

// Available tabs/permissions that can be granted to users
const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
  { id: 'user_management', label: 'User Management', icon: Users, color: 'text-red-600' },
  { id: 'students', label: 'Students', icon: User, color: 'text-green-600' },
  { id: 'teachers', label: 'Teachers', icon: UserCheck, color: 'text-purple-600' },
  { id: 'batches', label: 'Batches', icon: BookOpen, color: 'text-orange-600' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-600' },
  { id: 'attendance', label: 'Attendance', icon: CheckCircle, color: 'text-blue-500' },
  { id: 'gradebook', label: 'Grade Book', icon: Book, color: 'text-purple-600' },
  { id: 'classes', label: 'Class Management', icon: Calendar, color: 'text-green-600' },
  { id: 'exams', label: 'Exam Management', icon: Award, color: 'text-purple-600' },
  { id: 'reports', label: 'Reports', icon: FileText, color: 'text-purple-600' },
  { id: 'behavior', label: 'Behavior Records', icon: Target, color: 'text-orange-600' },
  { id: 'tasks', label: 'Task Management', icon: ClipboardList, color: 'text-green-600' },
  { id: 'feedback', label: 'Feedback', icon: Star, color: 'text-pink-600' },
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-green-600' },
  { id: 'permissions', label: 'Permissions', icon: Shield, color: 'text-red-500' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
];

// Default permissions for each role
const DEFAULT_ROLE_PERMISSIONS = {
  superadmin: AVAILABLE_PERMISSIONS.map(p => p.id),
  admin: ['dashboard', 'user_management', 'students', 'teachers', 'batches', 'analytics', 'attendance', 'gradebook', 'classes', 'exams', 'reports', 'behavior', 'tasks', 'feedback', 'permissions', 'settings'],
  management: ['dashboard', 'analytics', 'attendance', 'gradebook', 'tasks', 'reports', 'feedback'],
  finance: ['dashboard', 'students', 'analytics', 'reports', 'finance'],
  academics: ['dashboard', 'analytics', 'attendance', 'gradebook', 'classes', 'exams', 'reports', 'behavior', 'batches'],
  teacher: ['dashboard', 'classes', 'gradebook', 'attendance'],
  student: ['dashboard', 'gradebook', 'attendance', 'feedback']
};

export default function UserManagement() {
  const { hasRole, user: currentUser } = useAuth();
  const { refreshPermissions } = usePermissions();
  const [activeTab, setActiveTab] = useState('role-management');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [userPermissions, setUserPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [popupRole, setPopupRole] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Helper function to show success messages
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const roles = [
    { 
      value: 'superadmin', 
      label: 'Super Administrator', 
      color: 'text-purple-600 bg-purple-100',
      icon: Crown,
      description: 'Full system access and control',
      level: 5
    },
    { 
      value: 'admin', 
      label: 'Administrator', 
      color: 'text-red-600 bg-red-100',
      icon: Key,
      description: 'Administrative access with user management',
      level: 4
    },
    { 
      value: 'management', 
      label: 'Management', 
      color: 'text-blue-600 bg-blue-100',
      icon: Shield,
      description: 'Management level access to academics and reports',
      level: 3
    },
    { 
      value: 'finance', 
      label: 'Finance', 
      color: 'text-green-600 bg-green-100',
      icon: DollarSign,
      description: 'Finance management with fee collection and payment processing',
      level: 3
    },
    { 
      value: 'academics', 
      label: 'Academics', 
      color: 'text-green-600 bg-green-100',
      icon: Book,
      description: 'Academic oversight and curriculum management',
      level: 3
    },
    { 
      value: 'teacher', 
      label: 'Teacher', 
      color: 'text-yellow-600 bg-yellow-100',
      icon: UserCheck,
      description: 'Teaching access with class management',
      level: 2
    },
    { 
      value: 'student', 
      label: 'Student', 
      color: 'text-gray-600 bg-gray-100',
      icon: User,
      description: 'Student access to academic resources',
      level: 1
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchUsers();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Manual refresh function
  const handleRefresh = async () => {
    setLoading(true);
    await fetchUsers();
    setLastRefresh(new Date());
    showSuccessMessage('User list refreshed successfully');
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getUsers();
      let userData;
      if (Array.isArray(response)) {
        userData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        userData = response.data;
      } else if (response?.users && Array.isArray(response.users)) {
        userData = response.users;
      } else {
        userData = [];
      }
      setUsers(userData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleStats = () => {
    return roles.map(role => ({
      ...role,
      count: users.filter(user => user.role === role.value).length,
      activeCount: users.filter(user => user.role === role.value && user.is_active).length
    }));
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesSearch = !searchTerm || 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  };

  const updateRolePermissions = async (role, permissions) => {
    try {
      // Immediately update local state for instant feedback
      setRolePermissions(prev => ({
        ...prev,
        [role]: permissions
      }));
      
      // Show success message immediately
      showSuccessMessage(`Updated default permissions for ${role} role`);
      
      // Then sync with API (will work when backend is available)
      await permissionsAPI.updateSystemRolePermissions(role, permissions);
    } catch (error) {
      console.error('API sync failed (expected in mock mode):', error);
      // In mock mode, this is expected - permissions are already updated locally
    }
  };

  const updateUserPermissions = async (userId, permissions) => {
    try {
      // Immediately update local state for instant feedback
      setUserPermissions(prev => ({
        ...prev,
        [userId]: permissions
      }));
      
      // Show success message immediately
      showSuccessMessage('Updated user permissions');
      
      // Refresh permissions immediately if it's the current user
      if (currentUser && currentUser.id === userId) {
        await refreshPermissions();
      }
      
      // Then sync with API (will work when backend is available)
      await permissionsAPI.updateSystemUserPermissions(userId, permissions);
    } catch (error) {
      console.error('API sync failed (expected in mock mode):', error);
      // In mock mode, this is expected - permissions are already updated locally
    }
  };

  const getUserEffectivePermissions = (user) => {
    // User-specific permissions override role permissions
    const userSpecific = userPermissions[user.id];
    if (userSpecific) {
      return userSpecific;
    }
    return rolePermissions[user.role] || [];
  };

  const tabs = [
    {
      id: 'role-management',
      name: 'Role Management',
      icon: Key,
      description: 'Manage role-based permissions and view user statistics by role'
    },
    {
      id: 'user-permissions',
      name: 'User Permissions',
      icon: Shield,
      description: 'Manage individual user permissions and overrides'
    },
    {
      id: 'access-requests',
      name: 'Access Requests',
      icon: FileCheck,
      description: 'Review and approve new user account requests'
    },
    {
      id: 'create-user',
      name: 'Create New User',
      icon: UserPlus,
      description: 'Create user accounts directly without approval process'
    },
    {
      id: 'system-settings',
      name: 'System Settings',
      icon: Settings,
      description: 'Configure system-wide permission settings'
    }
  ];

  if (!hasRole(['superadmin', 'admin'])) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access user management.</p>
      </div>
    );
  }

  const renderRoleManagement = () => (
    <div className="space-y-6">
      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getRoleStats().map(role => (
          <div 
            key={role.value} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setPopupRole(role);
              setShowRolePopup(true);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                <role.icon size={16} className="mr-2" />
                {role.label}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{role.count}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active:</span>
                <span className="text-green-600 font-medium">{role.activeCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Inactive:</span>
                <span className="text-red-600 font-medium">{role.count - role.activeCount}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Role Permissions Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Role Permissions</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure the default permissions for each role. Users in each role will have these permissions by default.
        </p>
        
        <div className="space-y-6">
          {roles.map(role => (
            <RolePermissionEditor
              key={role.value}
              role={role}
              permissions={rolePermissions[role.value] || []}
              onUpdatePermissions={(permissions) => updateRolePermissions(role.value, permissions)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserPermissions = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Users & Individual Permissions</h3>
          <p className="text-sm text-gray-600">Click on a user to view and modify their specific permissions</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500">Loading users...</div>
                  </td>
                </tr>
              ) : getFilteredUsers().length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <div className="text-gray-500 mb-4">No users found</div>
                  </td>
                </tr>
              ) : (
                getFilteredUsers().map(user => {
                  const roleInfo = roles.find(r => r.value === user.role);
                  const effectivePermissions = getUserEffectivePermissions(user);
                  const hasCustomPermissions = !!userPermissions[user.id];
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.full_name || user.username}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo?.color || 'text-gray-600 bg-gray-100'}`}>
                          {roleInfo && <roleInfo.icon size={12} className="mr-1" />}
                          {roleInfo?.label || user.role}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'text-green-800 bg-green-100' 
                            : 'text-red-800 bg-red-100'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {effectivePermissions.length} permissions
                          </span>
                          {hasCustomPermissions && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-800 bg-blue-100">
                              Custom
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetail(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          <Eye size={16} className="inline mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Coming Soon
              </h4>
              <p className="mt-1 text-sm text-yellow-700">
                Advanced system settings and global permission configurations will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management & Permissions</h1>
          <p className="text-gray-600 mt-2">
            Manage users, roles, and permissions across the system
          </p>
          {lastRefresh && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* Auto-refresh toggle */}
          <div className="flex items-center">
            <input
              id="auto-refresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="auto-refresh" className="ml-2 text-sm text-gray-600">
              Auto-refresh
            </label>
          </div>
          
          {/* Manual refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {/* User count */}
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            {users.length} users
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Description */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'role-management' && renderRoleManagement()}
          {activeTab === 'user-permissions' && renderUserPermissions()}
          {activeTab === 'access-requests' && <AccessRequestManagement onRequestProcessed={fetchUsers} />}
          {activeTab === 'create-user' && <AdminUserCreation onUserCreated={fetchUsers} />}
          {activeTab === 'system-settings' && renderSystemSettings()}
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          effectivePermissions={getUserEffectivePermissions(selectedUser)}
          hasCustomPermissions={!!userPermissions[selectedUser.id]}
          onUpdatePermissions={(permissions) => updateUserPermissions(selectedUser.id, permissions)}
          onClose={() => {
            setShowUserDetail(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Role Statistics Popup */}
      {showRolePopup && popupRole && (
        <RoleStatisticsPopup
          role={popupRole}
          users={users.filter(user => user.role === popupRole.value)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
          onEditPermissions={(user) => {
            setSelectedUser(user);
            setShowUserDetail(true);
            setShowRolePopup(false);
          }}
          onClose={() => {
            setShowRolePopup(false);
            setPopupRole(null);
          }}
          getUserEffectivePermissions={getUserEffectivePermissions}
          userPermissions={userPermissions}
        />
      )}
    </div>
  );
}

// Role Permission Editor Component
const RolePermissionEditor = ({ role, permissions, onUpdatePermissions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempPermissions, setTempPermissions] = useState(permissions);

  const togglePermission = (permissionId) => {
    const newPermissions = tempPermissions.includes(permissionId)
      ? tempPermissions.filter(p => p !== permissionId)
      : [...tempPermissions, permissionId];
    setTempPermissions(newPermissions);
  };

  const savePermissions = () => {
    onUpdatePermissions(tempPermissions);
    setIsExpanded(false);
  };

  const resetPermissions = () => {
    setTempPermissions(permissions);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${role.color} mr-4`}>
            <role.icon size={16} className="mr-2" />
            {role.label}
          </div>
          <span className="text-sm text-gray-600">
            {permissions.length} permissions enabled
          </span>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {AVAILABLE_PERMISSIONS.map(permission => (
              <label 
                key={permission.id} 
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={tempPermissions.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                  className="w-4 h-4 text-blue-600 rounded mr-3"
                />
                <permission.icon size={16} className={`${permission.color} mr-2`} />
                <span className="text-sm font-medium text-gray-900">{permission.label}</span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={resetPermissions}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Reset
            </button>
            <button
              onClick={savePermissions}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Role Statistics Popup Component
const RoleStatisticsPopup = ({ role, users, sortBy, sortOrder, onSort, onEditPermissions, onClose, getUserEffectivePermissions, userPermissions }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedUsers = [...users].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'name':
        aVal = a.full_name || a.username || '';
        bVal = b.full_name || b.username || '';
        break;
      case 'email':
        aVal = a.email || '';
        bVal = b.email || '';
        break;
      case 'created_at':
        aVal = new Date(a.created_at || 0);
        bVal = new Date(b.created_at || 0);
        break;
      case 'last_login':
        aVal = new Date(a.last_login || 0);
        bVal = new Date(b.last_login || 0);
        break;
      default:
        aVal = a[sortBy] || '';
        bVal = b[sortBy] || '';
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const filteredUsers = sortedUsers.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortOrder === 'asc' ? 
      <SortAsc size={14} className="text-blue-600" /> : 
      <SortDesc size={14} className="text-blue-600" />;
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${role.color} mr-4`}>
                <role.icon size={16} className="mr-2" />
                {role.label}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {users.length} User{users.length !== 1 ? 's' : ''}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-y-auto" style={{maxHeight: 'calc(95vh - 200px)'}}>
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <div className="text-gray-500 mb-4">No users found</div>
              <p className="text-sm text-gray-400">
                {searchTerm ? 'No users match your search criteria.' : 'No users have this role yet.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      {getSortIcon('email')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Created
                      {getSortIcon('created_at')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSort('last_login')}
                  >
                    <div className="flex items-center">
                      Last Login
                      {getSortIcon('last_login')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => {
                  const effectivePermissions = getUserEffectivePermissions(user);
                  const hasCustomPermissions = !!userPermissions[user.id];
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-600">
                              {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.full_name || user.username}
                            </div>
                            <div className="text-xs text-gray-500">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'text-green-800 bg-green-100' 
                            : 'text-red-800 bg-red-100'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.last_login)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {effectivePermissions.length} permissions
                          </span>
                          {hasCustomPermissions && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-800 bg-blue-100">
                              Custom
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onEditPermissions(user)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ user, effectivePermissions, hasCustomPermissions, onUpdatePermissions, onClose }) => {
  const [tempPermissions, setTempPermissions] = useState(effectivePermissions);
  const [showPermissionEditor, setShowPermissionEditor] = useState(false);

  const togglePermission = (permissionId) => {
    const newPermissions = tempPermissions.includes(permissionId)
      ? tempPermissions.filter(p => p !== permissionId)
      : [...tempPermissions, permissionId];
    setTempPermissions(newPermissions);
  };

  const savePermissions = () => {
    onUpdatePermissions(tempPermissions);
    setShowPermissionEditor(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Profile & Permissions</h3>
              <p className="text-gray-600 text-sm">Manage individual user permissions and view profile details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* User Profile */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                <span className="text-xl font-medium text-gray-600">
                  {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{user.full_name || user.username}</h4>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {hasCustomPermissions && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-800 bg-blue-100">
                      Custom Permissions
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Role:</span>
                <div className="font-medium text-gray-900 capitalize">{user.role}</div>
              </div>
              <div>
                <span className="text-gray-500">Department:</span>
                <div className="font-medium text-gray-900">{user.department || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-500">Designation:</span>
                <div className="font-medium text-gray-900">{user.designation || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-500">Last Login:</span>
                <div className="font-medium text-gray-900">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Permissions</h4>
                <p className="text-sm text-gray-600">
                  Tabs and features this user can access ({effectivePermissions.length} permissions)
                </p>
              </div>
              <button
                onClick={() => setShowPermissionEditor(!showPermissionEditor)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                <Edit size={16} className="inline mr-1" />
                Edit Permissions
              </button>
            </div>

            {showPermissionEditor ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <label 
                      key={permission.id} 
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={tempPermissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="w-4 h-4 text-blue-600 rounded mr-3"
                      />
                      <permission.icon size={16} className={`${permission.color} mr-2`} />
                      <span className="text-sm font-medium text-gray-900">{permission.label}</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setTempPermissions(effectivePermissions);
                      setShowPermissionEditor(false);
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePermissions}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Save Permissions
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {effectivePermissions.map(permissionId => {
                  const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
                  if (!permission) return null;
                  
                  return (
                    <div key={permission.id} className="flex items-center p-3 border rounded-lg bg-green-50 border-green-200">
                      <CheckCircle size={16} className="text-green-600 mr-3" />
                      <permission.icon size={16} className={`${permission.color} mr-2`} />
                      <span className="text-sm font-medium text-gray-900">{permission.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
