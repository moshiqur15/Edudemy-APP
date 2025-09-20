import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  GraduationCap,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader,
  Save,
  X
} from 'lucide-react';

export default function AdminUserCreation() {
  const { user, hasRole } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Define role hierarchy for permission checking
  const roleHierarchy = {
    'superadmin': 6,
    'admin': 5,
    'management': 4,
    'academics': 3,
    'teacher': 2,
    'student': 1
  };

  const getAvailableRoles = () => {
    const currentUserLevel = roleHierarchy[user?.role] || 0;
    
    const allRoles = [
      { value: 'student', label: 'Student', icon: GraduationCap, description: 'Access to courses, assignments, and grades', level: 1 },
      { value: 'teacher', label: 'Teacher', icon: User, description: 'Manage classes, students, and assignments', level: 2 },
      { value: 'academics', label: 'Academics', icon: Shield, description: 'Academic oversight and curriculum management', level: 3 },
      { value: 'management', label: 'Management', icon: Shield, description: 'Administrative and operational management', level: 4 },
      { value: 'admin', label: 'Admin', icon: Shield, description: 'Full system administration access', level: 5 },
      { value: 'superadmin', label: 'Super Admin', icon: Shield, description: 'Ultimate system control', level: 6 }
    ];

    // Users can only create accounts for roles below their level
    // Superadmin can create any role including other superadmins
    if (user?.role === 'superadmin') {
      return allRoles;
    }
    
    return allRoles.filter(role => role.level < currentUserLevel);
  };

  const availableRoles = getAvailableRoles();

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const userData = {
        full_name: formData.full_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        is_active: formData.is_active
      };
      
      const response = await adminAPI.createUser(userData);
      
      setSuccess(`User "${formData.full_name}" created successfully!`);
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        is_active: true
      });
    } catch (error) {
      console.error('User creation error:', error);
      setError(error.response?.data?.detail || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(''); // Clear error when user starts typing
    if (success) setSuccess(''); // Clear success when user starts typing
  };

  const generateUsername = () => {
    const name = formData.full_name.toLowerCase().replace(/\s+/g, '.');
    const randomSuffix = Math.floor(Math.random() * 1000);
    setFormData(prev => ({
      ...prev,
      username: `${name}.${randomSuffix}`
    }));
  };

  // Clear messages after 5 seconds
  useState(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!hasRole(['superadmin', 'admin', 'management'])) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to create user accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
          <p className="text-gray-600 mt-1">
            Create user accounts directly without requiring approval
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* User Creation Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateUsername}
                    className="absolute right-2 top-2 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Username will be used for login
                </p>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  User Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {availableRoles.find(r => r.value === formData.role)?.description}
                </p>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
            <div className="flex items-center">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Account is active
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Inactive accounts cannot log in to the system
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  full_name: '',
                  email: '',
                  username: '',
                  password: '',
                  confirmPassword: '',
                  role: 'student',
                  is_active: true
                });
                setError('');
                setSuccess('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Reset Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Role Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRoles.map(role => {
            const Icon = role.icon;
            return (
              <div key={role.value} className="flex items-start space-x-3">
                <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">{role.label}</h4>
                  <p className="text-sm text-blue-700">{role.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}