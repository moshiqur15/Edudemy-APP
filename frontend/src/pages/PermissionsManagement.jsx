import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI, adminAPI } from '../services/api';
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
  MoreVertical,
  Eye,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Activity
} from 'lucide-react';

export default function PermissionsManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisMonth: 0
  });

  const roles = [
    { 
      value: 'superadmin', 
      label: 'Super Administrator', 
      color: 'text-purple-600 bg-purple-100',
      icon: Crown,
      description: 'Full system access and control',
      permissions: ['All System Permissions', 'User Management', 'System Configuration', 'Data Access'],
      level: 5
    },
    { 
      value: 'admin', 
      label: 'Administrator', 
      color: 'text-red-600 bg-red-100',
      icon: Key,
      description: 'Administrative access with user management',
      permissions: ['User Management', 'Academic Operations', 'Reports', 'Settings'],
      level: 4
    },
    { 
      value: 'management', 
      label: 'Management', 
      color: 'text-blue-600 bg-blue-100',
      icon: Shield,
      description: 'Management level access to academics and reports',
      permissions: ['Academic View', 'Report Generation', 'Student Management', 'Teacher Assignment'],
      level: 3
    },
    { 
      value: 'teacher', 
      label: 'Teacher', 
      color: 'text-green-600 bg-green-100',
      icon: Users,
      description: 'Teaching access with class management',
      permissions: ['Class Management', 'Student Records', 'Attendance', 'Gradebook'],
      level: 2
    },
    { 
      value: 'student', 
      label: 'Student', 
      color: 'text-yellow-600 bg-yellow-100',
      icon: Users,
      description: 'Student access to academic resources',
      permissions: ['View Grades', 'View Attendance', 'Submit Assignments', 'Class Schedule'],
      level: 1
    },
  ];

  const permissions = {
    'superadmin': [
      'Create/Edit/Delete Users',
      'System Configuration',
      'All Academic Operations',
      'Financial Management',
      'System Analytics',
      'Backup & Restore'
    ],
    'admin': [
      'Create/Edit/Delete Students & Teachers',
      'Academic Management',
      'User Role Management',
      'System Reports',
      'Bulk Operations'
    ],
    'management': [
      'View All Academic Data',
      'Generate Reports',
      'Student Admission',
      'Teacher Assignment',
      'Batch Management'
    ],
    'teacher': [
      'Manage Own Classes',
      'Student Attendance',
      'Grade Management',
      'Communication with Students',
      'View Own Schedule'
    ],
    'student': [
      'View Own Academic Records',
      'Submit Assignments',
      'View Attendance',
      'Communication with Teachers',
      'View Class Schedule'
    ]
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getUsers();
      console.log('Users response:', response); // Debug log
      
      // Handle different response formats
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
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Provide specific error messages
      let errorMessage;
      if (error.response?.status === 500) {
        errorMessage = 'Server Error: The backend database may need setup. Please run the database migration first.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network Error: Cannot connect to the backend server. Please ensure the backend is running.';
      } else {
        errorMessage = 'Error loading users: ' + (error.response?.data?.detail || error.message);
      }
      
      alert(errorMessage);
      setUsers([]); // Set empty array so UI doesn't break
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      if (userData.role === 'superadmin' || userData.role === 'admin') {
        await authAPI.register(userData);
      } else {
        await adminAPI.createUser(userData);
      }
      await fetchUsers();
      setShowCreateUser(false);
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await usersAPI.updateUser(userId, userData);
      await fetchUsers();
      setEditingUser(null);
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await usersAPI.deleteUser(userId);
        await fetchUsers();
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await usersAPI.toggleUserStatus(userId);
      await fetchUsers();
      alert('User status updated successfully!');
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error updating user status: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to activate');
      return;
    }
    
    try {
      await adminAPI.bulkActivateUsers(selectedUsers);
      await fetchUsers();
      setSelectedUsers([]);
      alert('Users activated successfully!');
    } catch (error) {
      console.error('Error activating users:', error);
      alert('Error activating users: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to deactivate');
      return;
    }
    
    if (window.confirm(`Are you sure you want to deactivate ${selectedUsers.length} users?`)) {
      try {
        await adminAPI.bulkDeactivateUsers(selectedUsers);
        await fetchUsers();
        setSelectedUsers([]);
        alert('Users deactivated successfully!');
      } catch (error) {
        console.error('Error deactivating users:', error);
        alert('Error deactivating users: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[roles.length - 1];
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex justify-end gap-3">
          {selectedUsers.length > 0 && (
            <>
              <button
                onClick={handleBulkActivate}
                className="btn-primary px-4 py-2 text-sm"
              >
                <Check size={16} className="mr-1" />
                Activate ({selectedUsers.length})
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <X size={16} className="mr-1" />
                Deactivate ({selectedUsers.length})
              </button>
            </>
          )}
          <button
            onClick={() => setShowCreateUser(true)}
            className="btn-primary inline-flex items-center px-4 py-2"
          >
            <UserPlus size={20} className="mr-2" />
            Create User
          </button>
        </div>

        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {roles.map(role => {
            const userCount = users.filter(user => user.role === role.value).length;
            return (
              <div key={role.value} className="card p-4">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${role.color} mb-2`}>
                  {role.value === 'superadmin' && <Crown size={12} className="mr-1" />}
                  {role.value === 'admin' && <Key size={12} className="mr-1" />}
                  {role.label}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{userCount}</div>
                <div className="text-sm text-gray-600">{role.description}</div>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role & Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">Loading users...</div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Users size={48} className="mx-auto text-gray-400 mb-4" />
                      <div className="text-gray-500 mb-4">No users found</div>
                      <button onClick={() => setShowCreateUser(true)} className="btn-primary">
                        Create First User
                      </button>
                    </td>
                  </tr>
                ) : (
                  users.map(user => {
                    const roleInfo = getRoleInfo(user.role);
                    const userPermissions = permissions[user.role] || [];
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
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
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} mb-2`}>
                            {user.role === 'superadmin' && <Crown size={12} className="mr-1" />}
                            {user.role === 'admin' && <Key size={12} className="mr-1" />}
                            {roleInfo.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {userPermissions.slice(0, 2).join(', ')}
                            {userPermissions.length > 2 && `... +${userPermissions.length - 2} more`}
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
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit user"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`p-1 ${
                                user.is_active 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={user.is_active ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.is_active ? <X size={16} /> : <Check size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateUser && (
          <UserForm
            mode="create"
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateUser(false)}
            roles={roles}
          />
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <UserForm
            mode="edit"
            user={editingUser}
            onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
            onCancel={() => setEditingUser(null)}
            roles={roles}
          />
        )}
      </div>
  );
}

// User Form Component
const UserForm = ({ mode = 'create', user = null, onSubmit, onCancel, roles }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    designation: user?.designation || '',
    department: user?.department || '',
    role: user?.role || 'student',
    password: '',
    confirm_password: '',
    is_active: user?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.phone && !/^[+]?[0-9\-\s\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (mode === 'create') {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = { ...formData };
      if (mode === 'edit') {
        delete submitData.password;
        delete submitData.confirm_password;
      }
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(role => role.value === formData.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Create New User' : 'Edit User'}
              </h3>
              <p className="text-gray-600 text-sm">
                {mode === 'create' 
                  ? 'Set up a new user account with appropriate permissions'
                  : 'Update user information and permissions'
                }
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter designation/position"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter complete address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter department"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map(role => (
                  <label
                    key={role.value}
                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer hover:border-blue-300 ${
                      formData.role === role.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        {role.value === 'superadmin' && <Crown size={16} className="mr-2 text-purple-600" />}
                        {role.value === 'admin' && <Key size={16} className="mr-2 text-red-600" />}
                        <span className="font-medium text-gray-900">{role.label}</span>
                      </div>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Password Fields (Create mode only) */}
            {mode === 'create' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded mr-3"
              />
              <label className="text-sm font-medium text-gray-700">
                Active User
              </label>
            </div>

            {/* Role Permissions Preview */}
            {selectedRole && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">Role Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  {(permissions[selectedRole.value] || []).map((permission, index) => (
                    <div key={index} className="flex items-center">
                      <Check size={14} className="mr-2 text-green-500" />
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Update User')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};