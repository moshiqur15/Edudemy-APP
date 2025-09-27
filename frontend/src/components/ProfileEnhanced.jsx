import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import {
  User,
  Camera,
  Upload,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Award,
  BookOpen,
  Users,
  School,
  GraduationCap,
  FileText,
  Star,
  Target,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Building,
  Briefcase,
  Heart,
  Coffee,
  Music,
  Gamepad2,
  Book,
  Palette,
  Settings,
  Bell,
  Download,
  Share2,
  MoreHorizontal,
  Crown,
  UserCog,
  Zap,
  Sparkles,
  Filter,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react';

// Designation Management Component
const DesignationManagement = ({ user, onClose, onUpdate }) => {
  const { hasRole } = useAuth();
  const [selectedUser, setSelectedUser] = useState(user);
  const [newRole, setNewRole] = useState(user?.role || '');
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const roleHierarchy = {
    'superadmin': 5,
    'admin': 4,
    'academics': 3,
    'management': 3,
    'teacher': 2,
    'student': 1
  };

  const availableRoles = [
    { value: 'superadmin', label: 'Super Admin', description: 'Full system access and control' },
    { value: 'admin', label: 'Admin', description: 'Administrative privileges' },
    { value: 'academics', label: 'Academics', description: 'Academic management access' },
    { value: 'management', label: 'Management', description: 'Management functions' },
    { value: 'teacher', label: 'Teacher', description: 'Teaching and class management' },
    { value: 'student', label: 'Student', description: 'Student access only' }
  ];

  useEffect(() => {
    if (hasRole(['superadmin', 'admin'])) {
      loadAllUsers();
    }
  }, []);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers();
      let userData = Array.isArray(response) ? response : (response?.data || []);
      
      setAllUsers(userData.length > 0 ? userData : generateMockUsers());
    } catch (error) {
      console.error('Error loading users:', error);
      setAllUsers(generateMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const generateMockUsers = () => [
    { id: 1, full_name: 'John Smith', email: 'john@school.edu', role: 'teacher', department: 'Mathematics' },
    { id: 2, full_name: 'Sarah Johnson', email: 'sarah@school.edu', role: 'teacher', department: 'English' },
    { id: 3, full_name: 'Mike Brown', email: 'mike@school.edu', role: 'student', department: 'Science' },
    { id: 4, full_name: 'Emily Davis', email: 'emily@school.edu', role: 'academics', department: 'Administration' },
    { id: 5, full_name: 'David Wilson', email: 'david@school.edu', role: 'management', department: 'Operations' }
  ];

  const canEditRole = (currentUserRole, targetUserRole, newTargetRole) => {
    const currentLevel = roleHierarchy[currentUserRole] || 0;
    const targetLevel = roleHierarchy[targetUserRole] || 0;
    const newTargetLevel = roleHierarchy[newTargetRole] || 0;

    // Can only edit users with lower hierarchy level
    // Cannot promote users to same or higher level than current user
    return currentLevel > targetLevel && currentLevel > newTargetLevel;
  };

  const handleRoleUpdate = async () => {
    if (!canEditRole(user?.role, selectedUser.role, newRole)) {
      alert('You do not have permission to assign this role.');
      return;
    }

    try {
      setLoading(true);
      await usersAPI.updateUserRole(selectedUser.id, { role: newRole });
      
      // Update local state
      const updatedUser = { ...selectedUser, role: newRole };
      setAllUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      
      onUpdate && onUpdate(updatedUser);
      alert(`Successfully updated ${selectedUser.full_name}'s role to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'academics': return 'bg-blue-100 text-blue-800';
      case 'management': return 'bg-green-100 text-green-800';
      case 'teacher': return 'bg-yellow-100 text-yellow-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Crown className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Designation Management</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {hasRole(['superadmin', 'admin']) ? (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Users List */}
              <div className="space-y-3">
                {filteredUsers.map(userData => (
                  <div key={userData.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {userData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{userData.full_name}</div>
                        <div className="text-sm text-gray-600">{userData.email}</div>
                        <div className="text-xs text-gray-500">{userData.department}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                        {userData.role}
                      </span>
                      
                      {userData.id !== user?.id && (
                        <button
                          onClick={() => {
                            setSelectedUser(userData);
                            setNewRole(userData.role);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit Role
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Role Edit Modal */}
              {selectedUser && selectedUser.id !== user?.id && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Change Role for {selectedUser.full_name}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Role
                        </label>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Role
                        </label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {availableRoles.map(role => (
                            <option
                              key={role.value}
                              value={role.value}
                              disabled={!canEditRole(user?.role, selectedUser.role, role.value)}
                            >
                              {role.label} - {role.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      {!canEditRole(user?.role, selectedUser.role, newRole) && (
                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                          <AlertTriangle size={16} className="text-red-600 mr-2" />
                          <span className="text-red-800 text-sm">
                            You cannot assign this role due to hierarchy restrictions.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRoleUpdate}
                        disabled={loading || !canEditRole(user?.role, selectedUser.role, newRole) || selectedUser.role === newRole}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        {loading ? <RefreshCw size={16} className="mr-2 animate-spin" /> : null}
                        {loading ? 'Updating...' : 'Update Role'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">
                You don't have permission to manage user designations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Achievement Management Component
const AchievementModal = ({ isOpen, onClose, onSave, achievement = null }) => {
  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    description: achievement?.description || '',
    date: achievement?.date || '',
    category: achievement?.category || 'academic',
    level: achievement?.level || 'school'
  });

  const categories = [
    { value: 'academic', label: 'Academic Excellence' },
    { value: 'sports', label: 'Sports & Athletics' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'community', label: 'Community Service' },
    { value: 'research', label: 'Research & Innovation' }
  ];

  const levels = [
    { value: 'school', label: 'School Level' },
    { value: 'district', label: 'District Level' },
    { value: 'state', label: 'State Level' },
    { value: 'national', label: 'National Level' },
    { value: 'international', label: 'International Level' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...achievement, ...formData, id: achievement?.id || Date.now() });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {achievement ? 'Edit Achievement' : 'Add New Achievement'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {achievement ? 'Update' : 'Add'} Achievement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Enhanced Profile Component
export default function ProfileEnhanced() {
  const { user, hasRole, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileImage, setProfileImage] = useState(user?.profile_image || null);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [activityData, setActivityData] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    date_of_birth: user?.date_of_birth || '',
    bio: user?.bio || '',
    emergency_contact: user?.emergency_contact || '',
    emergency_phone: user?.emergency_phone || '',
    join_date: user?.join_date || '',
    department: user?.department || '',
    qualification: user?.qualification || '',
    experience: user?.experience || '',
    specialization: user?.specialization || '',
    subjects_taught: user?.subjects_taught || [],
    hobbies: user?.hobbies || [],
    languages: user?.languages || [],
    social_links: user?.social_links || {},
    skills: user?.skills || [],
    certifications: user?.certifications || []
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'academic', label: 'Academic Info', icon: GraduationCap },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const interests = [
    { id: 'reading', label: 'Reading', icon: Book },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'sports', label: 'Sports', icon: Target },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'art', label: 'Art & Design', icon: Palette },
    { id: 'travel', label: 'Travel', icon: Globe },
    { id: 'cooking', label: 'Cooking', icon: Coffee },
    { id: 'fitness', label: 'Fitness', icon: Heart }
  ];

  const subjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Economics', 'Computer Science', 'Art', 'Music'
  ];

  const languages = [
    'English', 'Bangla', 'Hindi', 'Arabic', 'Spanish', 'French', 'German', 'Chinese'
  ];

  useEffect(() => {
    loadUserAchievements();
    loadActivityData();
  }, []);

  const loadUserAchievements = async () => {
    try {
      // Load achievements from API or use mock data
      const mockAchievements = [
        {
          id: 1,
          title: 'Excellence in Teaching Award',
          description: 'Received for outstanding performance in academic year 2023-24',
          date: '2023-12-15',
          category: 'academic',
          level: 'school'
        },
        {
          id: 2,
          title: 'Best Performance Award',
          description: 'Top performer in department evaluation',
          date: '2023-06-20',
          category: 'leadership',
          level: 'district'
        },
        {
          id: 3,
          title: '100% Attendance Achievement',
          description: 'Perfect attendance for the entire academic year',
          date: '2023-03-30',
          category: 'academic',
          level: 'school'
        }
      ];
      setUserAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadActivityData = async () => {
    try {
      const mockActivity = [
        { 
          id: 1, 
          type: 'achievement', 
          title: 'Completed Mathematics Assignment', 
          time: '2 hours ago',
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50'
        },
        { 
          id: 2, 
          type: 'exam', 
          title: 'Attended Physics Exam', 
          time: '5 hours ago',
          icon: BookOpen,
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        },
        { 
          id: 3, 
          type: 'attendance', 
          title: 'Marked present for all classes', 
          time: '1 day ago',
          icon: Users,
          color: 'text-purple-600',
          bg: 'bg-purple-50'
        }
      ];
      setActivityData(mockActivity);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showMessage('error', 'Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update user profile via API
      const updatedData = { ...formData };
      if (profileImage && profileImage !== user?.profile_image) {
        updatedData.profile_image = profileImage;
      }

      await usersAPI.updateProfile(user.id, updatedData);
      
      // Update auth context
      updateUser({ ...user, ...updatedData });
      
      setIsEditing(false);
      showMessage('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleAchievementSave = (achievement) => {
    if (editingAchievement) {
      setUserAchievements(prev => prev.map(a => a.id === achievement.id ? achievement : a));
    } else {
      setUserAchievements(prev => [...prev, achievement]);
    }
    setEditingAchievement(null);
  };

  const handleAchievementDelete = (id) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      setUserAchievements(prev => prev.filter(a => a.id !== id));
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic': return BookOpen;
      case 'sports': return Target;
      case 'arts': return Palette;
      case 'leadership': return Crown;
      case 'community': return Heart;
      case 'research': return Zap;
      default: return Award;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' };
      case 'sports': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' };
      case 'arts': return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' };
      case 'leadership': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' };
      case 'community': return { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' };
      case 'research': return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' };
    }
  };

  const renderOverviewTab = () => {
    const stats = {
      totalClasses: hasRole(['teacher']) ? 5 : hasRole(['student']) ? 8 : 12,
      totalStudents: hasRole(['teacher']) ? 150 : hasRole(['admin']) ? 500 : 0,
      attendance: hasRole(['student']) ? 92 : 0,
      performance: hasRole(['student']) ? 88 : hasRole(['teacher']) ? 95 : 0
    };

    return (
      <div className="space-y-6">
        {/* Enhanced Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white ring-opacity-30">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-white opacity-80" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors ring-2 ring-white"
              >
                <Camera size={16} className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold">{user?.full_name}</h1>
                {hasRole(['superadmin']) && <Crown size={24} className="text-yellow-300" />}
                {hasRole(['admin']) && <Shield size={24} className="text-blue-300" />}
              </div>
              
              <div className="flex items-center justify-center md:justify-start mb-2">
                <Shield size={16} className="mr-2" />
                <span className="text-lg opacity-90 capitalize">{user?.role}</span>
                {hasRole(['superadmin', 'admin']) && (
                  <button
                    onClick={() => setShowDesignationModal(true)}
                    className="ml-3 text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-colors"
                  >
                    <UserCog size={14} className="inline mr-1" />
                    Manage Roles
                  </button>
                )}
              </div>
              
              {formData.department && (
                <div className="flex items-center justify-center md:justify-start mb-2">
                  <Building size={16} className="mr-2" />
                  <span className="opacity-90">{formData.department}</span>
                </div>
              )}
              
              <div className="flex items-center justify-center md:justify-start">
                <Calendar size={16} className="mr-2" />
                <span className="opacity-90">
                  Joined {new Date(formData.join_date || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </button>
              <button className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                <Share2 size={16} className="mr-2" />
                Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hasRole(['teacher', 'admin']) && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalClasses}</div>
                <div className="text-sm text-gray-600">Classes</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users size={20} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
            </>
          )}
          
          {hasRole(['student']) && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalClasses}</div>
                <div className="text-sm text-gray-600">Subjects</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.attendance}%</div>
                <div className="text-sm text-gray-600">Attendance</div>
              </div>
            </>
          )}
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.performance}%</div>
            <div className="text-sm text-gray-600">Performance</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award size={20} className="text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userAchievements.length}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity size={20} className="mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {activityData.slice(0, 5).map(activity => (
              <div key={activity.id} className={`flex items-center p-3 ${activity.bg} rounded-lg`}>
                <activity.icon size={20} className={`${activity.color} mr-3`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-600">{activity.time}</div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bio Section */}
        {formData.bio && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User size={20} className="mr-2 text-purple-600" />
              About Me
            </h3>
            <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
          </div>
        )}

        {/* Quick Achievements Preview */}
        {userAchievements.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award size={20} className="mr-2 text-yellow-600" />
                Recent Achievements
              </h3>
              <button 
                onClick={() => setActiveTab('achievements')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAchievements.slice(0, 2).map(achievement => {
                const categoryStyle = getCategoryColor(achievement.category);
                const CategoryIcon = getCategoryIcon(achievement.category);
                
                return (
                  <div key={achievement.id} className={`flex items-center p-4 ${categoryStyle.bg} rounded-lg border ${categoryStyle.border}`}>
                    <CategoryIcon size={24} className={`${categoryStyle.text} mr-4`} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPersonalInfoTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{formData.full_name || 'Not provided'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center">
                <Mail size={16} className="text-gray-400 mr-2" />
                <div className="text-gray-900">{formData.email}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Email cannot be changed</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <div className="flex items-center">
                  <Phone size={16} className="text-gray-400 mr-2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <Phone size={16} className="text-gray-400 mr-2" />
                  <div className="text-gray-900">{formData.phone || 'Not provided'}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <div className="text-gray-900">
                    {formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Address */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-start">
                  <MapPin size={16} className="text-gray-400 mr-2 mt-0.5" />
                  <div className="text-gray-900">{formData.address || 'Not provided'}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{formData.emergency_contact || 'Not provided'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{formData.emergency_phone || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows="4"
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="text-gray-900 bg-gray-50 p-4 rounded-lg">
              {formData.bio || 'Not provided'}
            </div>
          )}
        </div>

        {/* Languages & Hobbies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                {languages.map(lang => (
                  <label key={lang} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang)}
                      onChange={(e) => {
                        const newLanguages = e.target.checked
                          ? [...formData.languages, lang]
                          : formData.languages.filter(l => l !== lang);
                        setFormData({...formData, languages: newLanguages});
                      }}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.languages.length > 0 ? (
                  formData.languages.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">Not specified</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hobbies & Interests</label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                {interests.map(interest => (
                  <label key={interest.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hobbies.includes(interest.id)}
                      onChange={(e) => {
                        const newHobbies = e.target.checked
                          ? [...formData.hobbies, interest.id]
                          : formData.hobbies.filter(h => h !== interest.id);
                        setFormData({...formData, hobbies: newHobbies});
                      }}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <interest.icon size={14} className="mr-1 text-gray-500" />
                    <span className="text-sm">{interest.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.hobbies.length > 0 ? (
                  formData.hobbies.map(hobbyId => {
                    const hobby = interests.find(i => i.id === hobbyId);
                    return hobby ? (
                      <span key={hobbyId} className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <hobby.icon size={12} className="mr-1" />
                        {hobby.label}
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-gray-500">Not specified</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAcademicInfoTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <GraduationCap size={20} className="mr-2 text-blue-600" />
          Academic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center">
                  <Building size={16} className="text-gray-400 mr-2" />
                  <div className="text-gray-900">{formData.department || 'Not specified'}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center">
                  <GraduationCap size={16} className="text-gray-400 mr-2" />
                  <div className="text-gray-900">{formData.qualification || 'Not specified'}</div>
                </div>
              )}
            </div>

            {hasRole(['teacher']) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    placeholder="e.g., 5 years"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <Clock size={16} className="text-gray-400 mr-2" />
                    <div className="text-gray-900">{formData.experience || 'Not specified'}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center">
                  <Star size={16} className="text-gray-400 mr-2" />
                  <div className="text-gray-900">{formData.specialization || 'Not specified'}</div>
                </div>
              )}
            </div>

            {hasRole(['teacher']) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Taught</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 p-2 rounded-lg">
                    {subjects.map(subject => (
                      <label key={subject} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.subjects_taught.includes(subject)}
                          onChange={(e) => {
                            const newSubjects = e.target.checked
                              ? [...formData.subjects_taught, subject]
                              : formData.subjects_taught.filter(s => s !== subject);
                            setFormData({...formData, subjects_taught: newSubjects});
                          }}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{subject}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.subjects_taught.length > 0 ? (
                      formData.subjects_taught.map(subject => (
                        <span key={subject} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {subject}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award size={20} className="mr-2 text-yellow-600" />
            Achievements & Awards
          </h3>
          <button
            onClick={() => setShowAchievementModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Add Achievement
          </button>
        </div>
        
        {userAchievements.length === 0 ? (
          <div className="text-center py-12">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Achievements Yet</h3>
            <p className="text-gray-600 mb-4">Start adding your achievements and awards to showcase your accomplishments.</p>
            <button
              onClick={() => setShowAchievementModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Achievement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userAchievements.map(achievement => {
              const categoryStyle = getCategoryColor(achievement.category);
              const CategoryIcon = getCategoryIcon(achievement.category);
              
              return (
                <div key={achievement.id} className={`relative p-4 ${categoryStyle.bg} rounded-lg border ${categoryStyle.border} hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between mb-2">
                    <CategoryIcon size={24} className={categoryStyle.text} />
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setEditingAchievement(achievement);
                          setShowAchievementModal(true);
                        }}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleAchievementDelete(achievement.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {new Date(achievement.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-gray-600 capitalize">
                        {achievement.category}
                      </span>
                      <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-gray-600 capitalize">
                        {achievement.level}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity size={20} className="mr-2 text-blue-600" />
            Activity History
          </h3>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="all">All Activities</option>
              <option value="achievements">Achievements</option>
              <option value="attendance">Attendance</option>
              <option value="exams">Exams</option>
              <option value="assignments">Assignments</option>
            </select>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {activityData.map(activity => (
            <div key={activity.id} className={`flex items-center p-4 ${activity.bg} rounded-lg border-l-4 border-l-blue-500`}>
              <activity.icon size={20} className={`${activity.color} mr-4`} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.title}</div>
                <div className="text-sm text-gray-600">{activity.time}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs text-gray-600 capitalize">
                  {activity.type}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {activityData.length === 0 && (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-600">Your recent activities will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Settings size={20} className="mr-2 text-gray-600" />
          Profile Settings
        </h3>
        
        <div className="space-y-6">
          {/* Privacy Settings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Privacy Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Public Profile</div>
                  <div className="text-sm text-gray-500">Allow others to view your profile</div>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Show Email</div>
                  <div className="text-sm text-gray-500">Display your email on public profile</div>
                </div>
                <input type="checkbox" className="toggle" />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Show Phone</div>
                  <div className="text-sm text-gray-500">Display your phone number on profile</div>
                </div>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive updates via email</div>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Achievement Alerts</div>
                  <div className="text-sm text-gray-500">Get notified about new achievements</div>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Weekly Summary</div>
                  <div className="text-sm text-gray-500">Receive weekly activity summary</div>
                </div>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </div>

          {/* Data Export */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Data Management</h4>
            <div className="space-y-3">
              <button className="flex items-center text-blue-600 hover:text-blue-800">
                <Download size={16} className="mr-2" />
                Export Profile Data
              </button>
              
              <button className="flex items-center text-blue-600 hover:text-blue-800">
                <Share2 size={16} className="mr-2" />
                Generate Profile URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your profile information and settings</p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={16} className="mr-2" />
              Export
            </button>
            <button className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Message Bar */}
      {message.text && (
        <div className={`px-6 py-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' :
          message.type === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircle size={16} className="mr-2" />}
            {message.type === 'error' && <AlertCircle size={16} className="mr-2" />}
            {message.type === 'info' && <Info size={16} className="mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 truncate">{user?.full_name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} className="mr-3" />
                  {tab.label}
                  {tab.id === 'achievements' && userAchievements.length > 0 && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {userAchievements.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'personal' && renderPersonalInfoTab()}
          {activeTab === 'academic' && renderAcademicInfoTab()}
          {activeTab === 'achievements' && renderAchievementsTab()}
          {activeTab === 'activity' && renderActivityTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>

      {/* Modals */}
      {showDesignationModal && (
        <DesignationManagement
          user={user}
          onClose={() => setShowDesignationModal(false)}
          onUpdate={(updatedUser) => {
            if (updatedUser.id === user.id) {
              updateUser(updatedUser);
            }
          }}
        />
      )}

      <AchievementModal
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false);
          setEditingAchievement(null);
        }}
        onSave={handleAchievementSave}
        achievement={editingAchievement}
      />
    </div>
  );
}