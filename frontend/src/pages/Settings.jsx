import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Download,
  Globe,
  Smartphone,
  HelpCircle,
  Info,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Languages,
  FileText,
  LogOut,
  AlertTriangle,
  CheckCircle,
  X,
  Key,
  Monitor,
  HardDrive,
  Network,
  Zap,
  Activity,
  BarChart3,
  MessageSquare,
  Award,
  Share2,
  Menu
} from 'lucide-react';

const Settings = () => {
  const { user, logout, hasRole } = useAuth();
  
  // Main states
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Settings states
  const [settings, setSettings] = useState({
    // General settings
    language: localStorage.getItem('language') || 'en',
    timezone: localStorage.getItem('timezone') || 'Asia/Dhaka',
    dateFormat: localStorage.getItem('dateFormat') || 'DD/MM/YYYY',
    timeFormat: localStorage.getItem('timeFormat') || '24h',
    
    // Notification settings
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
    pushNotifications: JSON.parse(localStorage.getItem('pushNotifications') || 'true'),
    smsNotifications: JSON.parse(localStorage.getItem('smsNotifications') || 'false'),
    soundEnabled: JSON.parse(localStorage.getItem('soundEnabled') || 'true'),
    achievementAlerts: JSON.parse(localStorage.getItem('achievementAlerts') || 'true'),
    weeklySummary: JSON.parse(localStorage.getItem('weeklySummary') || 'false'),
    reminderNotifications: JSON.parse(localStorage.getItem('reminderNotifications') || 'true'),
    systemAlerts: JSON.parse(localStorage.getItem('systemAlerts') || 'true'),
    
    // Privacy & Security
    twoFactorEnabled: JSON.parse(localStorage.getItem('twoFactorEnabled') || 'false'),
    sessionTimeout: parseInt(localStorage.getItem('sessionTimeout') || '30'),
    showOnlineStatus: JSON.parse(localStorage.getItem('showOnlineStatus') || 'true'),
    publicProfile: JSON.parse(localStorage.getItem('publicProfile') || 'true'),
    showEmail: JSON.parse(localStorage.getItem('showEmail') || 'false'),
    showPhone: JSON.parse(localStorage.getItem('showPhone') || 'false'),
    
    // Performance & Data
    autoSave: JSON.parse(localStorage.getItem('autoSave') || 'true'),
    offlineMode: JSON.parse(localStorage.getItem('offlineMode') || 'true'),
    dataSync: JSON.parse(localStorage.getItem('dataSync') || 'true'),
    autoBackup: JSON.parse(localStorage.getItem('autoBackup') || 'false'),
    dataCompression: JSON.parse(localStorage.getItem('dataCompression') || 'true'),
    cacheEnabled: JSON.parse(localStorage.getItem('cacheEnabled') || 'true'),
    
    // Interface settings
    compactView: JSON.parse(localStorage.getItem('compactView') || 'false'),
    animationsEnabled: JSON.parse(localStorage.getItem('animationsEnabled') || 'true'),
    tooltipsEnabled: JSON.parse(localStorage.getItem('tooltipsEnabled') || 'true'),
    sidebarCollapsed: JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false')
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  // Log system states
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [logSortBy, setLogSortBy] = useState('date_desc');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Mock log data - In real app, this would come from API
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      userId: user?.id,
      userName: user?.full_name || 'Current User',
      userRole: user?.role || 'user',
      action: 'Report Card Updated',
      details: 'Updated report card for Student John Doe - Class 10A',
      timestamp: '2024-01-15 14:30:25',
      category: 'academic'
    },
    {
      id: 2,
      userId: 'teacher1',
      userName: 'Jane Teacher',
      userRole: 'teacher',
      action: 'Attendance Taken',
      details: 'Marked attendance for Class 10A - Mathematics',
      timestamp: '2024-01-15 09:15:10',
      category: 'attendance'
    },
    {
      id: 3,
      userId: user?.id,
      userName: user?.full_name || 'Current User',
      userRole: user?.role || 'user',
      action: 'Student Created',
      details: 'Added new student: Sarah Smith to Class 9B',
      timestamp: '2024-01-14 16:45:30',
      category: 'user_management'
    },
    {
      id: 4,
      userId: 'admin1',
      userName: 'Sarah Admin',
      userRole: 'admin',
      action: 'Teacher Created',
      details: 'Added new teacher: Michael Brown - Science Department',
      timestamp: '2024-01-14 11:20:45',
      category: 'user_management'
    },
    {
      id: 5,
      userId: 'teacher2',
      userName: 'Mike Teacher',
      userRole: 'teacher',
      action: 'Report Card Viewed',
      details: 'Viewed report card for Student Emma Wilson - Class 8A',
      timestamp: '2024-01-13 13:25:15',
      category: 'academic'
    },
    {
      id: 6,
      userId: user?.id,
      userName: user?.full_name || 'Current User',
      userRole: user?.role || 'user',
      action: 'Batch Created',
      details: 'Created new batch: Advanced Mathematics - Grade 11',
      timestamp: '2024-01-12 10:15:30',
      category: 'batch_management'
    },
    {
      id: 7,
      userId: 'teacher1',
      userName: 'Jane Teacher',
      userRole: 'teacher',
      action: 'Grade Book Updated',
      details: 'Updated grades for Physics Quiz - Class 10A',
      timestamp: '2024-01-11 15:40:20',
      category: 'academic'
    },
    {
      id: 8,
      userId: 'admin1',
      userName: 'Sarah Admin',
      userRole: 'admin',
      action: 'System Settings Changed',
      details: 'Modified notification settings for all users',
      timestamp: '2024-01-10 12:30:00',
      category: 'system'
    }
  ]);

  // Mock hierarchical users - In real app, this would come from API based on current user's role
  const [hierarchicalUsers, setHierarchicalUsers] = useState([
    { id: user?.id, name: user?.full_name || 'Current User', role: user?.role || 'user' },
    { id: 'teacher1', name: 'Jane Teacher', role: 'teacher' },
    { id: 'teacher2', name: 'Mike Teacher', role: 'teacher' },
    { id: 'admin1', name: 'Sarah Admin', role: 'admin' },
    { id: 'staff1', name: 'Tom Staff', role: 'staff' }
  ]);

  const settingsSections = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'performance', label: 'Performance & Data', icon: Zap },
    { id: 'interface', label: 'Interface', icon: Monitor },
    { id: 'logs', label: 'Activity Logs', icon: FileText },
    { id: 'system', label: 'System Info', icon: Database },
    { id: 'about', label: 'About', icon: Info }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const timezones = [
    { value: 'Asia/Dhaka', label: 'Dhaka (GMT+6)' },
    { value: 'Asia/Karachi', label: 'Karachi (GMT+5)' },
    { value: 'Asia/Kolkata', label: 'New Delhi (GMT+5:30)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
    { value: 'UTC', label: 'UTC (GMT+0)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'Europe/London', label: 'London (GMT+0)' }
  ];

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(key, JSON.stringify(value));
    showMessage('success', 'Setting updated successfully');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Implement actual password change API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });
      
      showMessage('success', 'Password changed successfully');
    } catch (error) {
      showMessage('error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const installPWA = () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showMessage('success', 'App installed successfully');
        }
        window.deferredPrompt = null;
      });
    } else {
      showMessage('info', 'App is already installed or not available for installation');
    }
  };

  const clearAllData = async () => {
    setLoading(true);
    try {
      // Clear localStorage (except auth tokens)
      const keysToKeep = ['authToken', 'refreshToken', 'user'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      showMessage('success', 'All data cleared successfully');
      setShowClearDataModal(false);
    } catch (error) {
      showMessage('error', 'Failed to clear data');
    } finally {
      setLoading(false);
    }
  };

  const exportSettings = () => {
    const exportData = {
      settings,
      user: {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        full_name: user?.full_name,
        role: user?.role
      },
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `edudemy-settings-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showMessage('success', 'Settings exported successfully');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Language & Region */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Language & Region</h3>
            <p className="text-sm text-gray-600">Configure your language and regional preferences</p>
          </div>
          <Globe size={20} className="text-blue-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Timezone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            </select>
          </div>
          
          {/* Time Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => updateSetting('timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">24 Hour (23:59)</option>
              <option value="12h">12 Hour (11:59 PM)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={user?.full_name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={user?.role || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 capitalize"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={user?.id || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>To update your profile information, please contact your administrator.</p>
        </div>
      </div>

      {/* Profile Privacy Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Privacy</h3>
            <p className="text-sm text-gray-600">Control who can see your profile information</p>
          </div>
          <Eye size={20} className="text-blue-600" />
        </div>
        
        <div className="space-y-4">
          {[
            { key: 'publicProfile', label: 'Public Profile', description: 'Allow others to view your profile' },
            { key: 'showEmail', label: 'Show Email', description: 'Display your email on public profile' },
            { key: 'showPhone', label: 'Show Phone', description: 'Display your phone number on profile' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => updateSetting(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={passwordForm.showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setPasswordForm({...passwordForm, showCurrentPassword: !passwordForm.showCurrentPassword})}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {passwordForm.showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={passwordForm.showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setPasswordForm({...passwordForm, showNewPassword: !passwordForm.showNewPassword})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {passwordForm.showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={passwordForm.showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setPasswordForm({...passwordForm, showConfirmPassword: !passwordForm.showConfirmPassword})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {passwordForm.showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <Lock size={16} className="mr-2" />}
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h3>
            <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
          </div>
          <Bell size={20} className="text-blue-600" />
        </div>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', icon: Bell, description: 'Receive browser push notifications' },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: Phone, description: 'Receive notifications via SMS' },
            { key: 'soundEnabled', label: 'Sound Notifications', icon: Volume2, description: 'Play sound for notifications' },
            { key: 'achievementAlerts', label: 'Achievement Alerts', icon: Award, description: 'Get notified about new achievements' },
            { key: 'weeklySummary', label: 'Weekly Summary', icon: Calendar, description: 'Receive weekly activity summary' },
            { key: 'reminderNotifications', label: 'Reminder Notifications', icon: Clock, description: 'Get reminders for upcoming tasks' },
            { key: 'systemAlerts', label: 'System Alerts', icon: AlertTriangle, description: 'Receive important system notifications' }
          ].map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Icon size={20} className="text-gray-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600">{description}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => updateSetting(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Privacy</h3>
        
        <div className="space-y-4">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Shield size={20} className="text-gray-500 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => updateSetting('twoFactorEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Session Timeout */}
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock size={20} className="text-gray-500 mr-3" />
              <div className="font-medium text-gray-900">Session Timeout</div>
            </div>
            <div className="text-sm text-gray-600 mb-2">Automatically log out after period of inactivity</div>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={0}>Never</option>
            </select>
          </div>

          {/* Show Online Status */}
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Eye size={20} className="text-gray-500 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Show Online Status</div>
                <div className="text-sm text-gray-600">Let others see when you're online</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showOnlineStatus}
                onChange={(e) => updateSetting('showOnlineStatus', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Performance & Data</h3>
            <p className="text-sm text-gray-600">Manage data usage and application performance</p>
          </div>
          <Zap size={20} className="text-blue-600" />
        </div>
        
        <div className="space-y-4">
          {[
            { key: 'autoSave', label: 'Auto Save', icon: Save, description: 'Automatically save your work' },
            { key: 'offlineMode', label: 'Offline Mode', icon: WifiOff, description: 'Enable offline functionality' },
            { key: 'dataSync', label: 'Data Sync', icon: RefreshCw, description: 'Sync data across devices' },
            { key: 'autoBackup', label: 'Auto Backup', icon: HardDrive, description: 'Automatically backup your data' },
            { key: 'dataCompression', label: 'Data Compression', icon: Database, description: 'Compress data to save bandwidth' },
            { key: 'cacheEnabled', label: 'Enable Caching', icon: Activity, description: 'Cache data for faster loading' }
          ].map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Icon size={20} className="text-gray-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600">{description}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => updateSetting(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* PWA Installation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progressive Web App</h3>
        
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-4">
          <div className="flex items-center">
            <Smartphone size={20} className="text-gray-500 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Install App</div>
              <div className="text-sm text-gray-600">Install EduDemy as a native app</div>
            </div>
          </div>
          <button
            onClick={installPWA}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Install
          </button>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Management</h3>
            <p className="text-sm text-gray-600">Export and manage your data</p>
          </div>
          <Download size={20} className="text-blue-600" />
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={exportSettings}
            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Download size={20} className="text-gray-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Export Settings</div>
                <div className="text-sm text-gray-600">Download your settings as JSON file</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setShowClearDataModal(true)}
            className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
          >
            <div className="flex items-center">
              <Trash2 size={20} className="mr-3" />
              <div className="text-left">
                <div className="font-medium">Clear All Data</div>
                <div className="text-sm text-red-500">Remove all local data and cache</div>
              </div>
            </div>
            <AlertTriangle size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderInterfaceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Interface Settings</h3>
            <p className="text-sm text-gray-600">Customize the look and feel of the application</p>
          </div>
          <Monitor size={20} className="text-blue-600" />
        </div>
        
        <div className="space-y-4">
          {[
            { key: 'compactView', label: 'Compact View', icon: BarChart3, description: 'Use a more compact layout to fit more content' },
            { key: 'animationsEnabled', label: 'Animations', icon: Activity, description: 'Enable smooth animations and transitions' },
            { key: 'tooltipsEnabled', label: 'Tooltips', icon: HelpCircle, description: 'Show helpful tooltips on hover' },
            { key: 'sidebarCollapsed', label: 'Collapsed Sidebar', icon: Menu, description: 'Keep sidebar collapsed by default' }
          ].map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Icon size={20} className="text-gray-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600">{description}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => updateSetting(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Platform:</span>
            <span className="text-gray-900">{navigator.platform}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Browser:</span>
            <span className="text-gray-900">{navigator.userAgent.split(' ')[0]}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Language:</span>
            <span className="text-gray-900">{navigator.language}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Screen Resolution:</span>
            <span className="text-gray-900">{screen.width} × {screen.height}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Color Depth:</span>
            <span className="text-gray-900">{screen.colorDepth} bits</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Cookies Enabled:</span>
            <span className="text-gray-900">{navigator.cookieEnabled ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Online Status:</span>
            <span className={`${navigator.onLine ? 'text-green-600' : 'text-red-600'}`}>
              {navigator.onLine ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Storage Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Local Storage:</span>
            <span className="text-gray-900">
              {Object.keys(localStorage).length} items
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Session Storage:</span>
            <span className="text-gray-900">
              {Object.keys(sessionStorage).length} items
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">IndexedDB:</span>
            <span className="text-gray-900">Available</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogsSection = () => {
    // Filter and sort logs
    const filteredLogs = activityLogs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
                           log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
                           log.userName.toLowerCase().includes(logSearch.toLowerCase());
      
      const matchesCategory = logFilter === 'all' || log.category === logFilter;
      
      const matchesUser = !selectedUserId || log.userId === selectedUserId;
      
      // For hierarchical access - if user has admin/management role, they can see all logs
      // Otherwise, only show their own logs and their subordinates
      const hasAccess = hasRole(['superadmin', 'admin', 'management']) || 
                       log.userId === user?.id ||
                       hierarchicalUsers.some(u => u.id === log.userId);
      
      return matchesSearch && matchesCategory && matchesUser && hasAccess;
    });
    
    // Sort logs
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      switch (logSortBy) {
        case 'date_desc':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'date_asc':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'user':
          return a.userName.localeCompare(b.userName);
        case 'action':
          return a.action.localeCompare(b.action);
        default:
          return 0;
      }
    });

    const getCategoryIcon = (category) => {
      switch (category) {
        case 'academic': return <BookOpen size={16} className="text-blue-600" />;
        case 'attendance': return <Clock size={16} className="text-green-600" />;
        case 'user_management': return <Users size={16} className="text-purple-600" />;
        case 'batch_management': return <Award size={16} className="text-orange-600" />;
        case 'system': return <SettingsIcon size={16} className="text-gray-600" />;
        default: return <Activity size={16} className="text-gray-500" />;
      }
    };

    const getCategoryColor = (category) => {
      switch (category) {
        case 'academic': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'attendance': return 'bg-green-50 text-green-700 border-green-200';
        case 'user_management': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'batch_management': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'system': return 'bg-gray-50 text-gray-700 border-gray-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Activity Logs</h3>
              <p className="text-sm text-gray-600">Track user activities and system events</p>
            </div>
            <Activity size={20} className="text-blue-600" />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <Activity size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="attendance">Attendance</option>
                <option value="user_management">User Management</option>
                <option value="batch_management">Batch Management</option>
                <option value="system">System</option>
              </select>
            </div>
            
            {hasRole(['superadmin', 'admin', 'management']) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Users</option>
                  {hierarchicalUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={logSortBy}
                onChange={(e) => setLogSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="user">User Name</option>
                <option value="action">Action</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Activity Log ({sortedLogs.length} entries)</h4>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {sortedLogs.length === 0 ? (
              <div className="p-8 text-center">
                <Activity size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium mb-1">No logs found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters</p>
              </div>
            ) : (
              sortedLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getCategoryIcon(log.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{log.action}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                            {log.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <User size={12} className="mr-1" />
                            {log.userName} ({log.userRole})
                          </div>
                          <div className="flex items-center">
                            <Clock size={12} className="mr-1" />
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Log Statistics</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['academic', 'attendance', 'user_management', 'batch_management', 'system'].map(category => {
              const count = activityLogs.filter(log => log.category === category).length;
              return (
                <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="font-semibold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">
                    {category.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAboutSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SettingsIcon size={32} className="text-blue-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">EduDemy</h3>
        <p className="text-gray-600 mb-4">Complete Education Management System</p>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900">Version</div>
            <div className="text-sm text-gray-600">1.0.0</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900">Build</div>
            <div className="text-sm text-gray-600">2024.12.26</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center p-2">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>User Management</span>
          </div>
          <div className="flex items-center p-2">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>Student Management</span>
          </div>
          <div className="flex items-center p-2">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>Teacher Management</span>
          </div>
          <div className="flex items-center p-2">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>Batch Management</span>
          </div>
          <div className="flex items-center p-2">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>Attendance Tracking</span>
          </div>
          <div className="flex items-center p-2">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>Grade Book</span>
          </div>
          <div className="flex items-center p-2">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>Exam Management</span>
          </div>
          <div className="flex items-center p-2">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>Analytics & Reports</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Help</h3>
        
        <div className="space-y-3">
          <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <HelpCircle size={20} className="text-gray-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Help Center</div>
              <div className="text-sm text-gray-600">Get help and support</div>
            </div>
          </button>
          
          <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <FileText size={20} className="text-gray-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Documentation</div>
              <div className="text-sm text-gray-600">View user documentation</div>
            </div>
          </button>
          
          <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <MessageSquare size={20} className="text-gray-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Contact Support</div>
              <div className="text-sm text-gray-600">Get in touch with our support team</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderLogoutModal = () => {
    if (!showLogoutModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center mb-4">
            <LogOut size={24} className="text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
          </div>
          
          <p className="text-gray-600 mb-6">Are you sure you want to logout? You will need to login again to access your account.</p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                logout();
                setShowLogoutModal(false);
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderClearDataModal = () => {
    if (!showClearDataModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle size={24} className="text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Clear All Data</h3>
          </div>
          
          <p className="text-gray-600 mb-6">This will permanently delete all local data including settings, cache, and offline content. This action cannot be undone.</p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowClearDataModal(false)}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={clearAllData}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Clearing...' : 'Clear Data'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and application preferences</p>
          </div>
          
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
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
            {message.type === 'error' && <AlertTriangle size={16} className="mr-2" />}
            {message.type === 'info' && <Info size={16} className="mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <section.icon size={16} className="mr-3" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeSection === 'general' && renderGeneralSettings()}
          {activeSection === 'account' && renderAccountSettings()}
          {activeSection === 'notifications' && renderNotificationSettings()}
          {activeSection === 'security' && renderSecuritySettings()}
          {activeSection === 'performance' && renderPerformanceSettings()}
          {activeSection === 'interface' && renderInterfaceSettings()}
          {activeSection === 'logs' && renderLogsSection()}
          {activeSection === 'system' && renderSystemInfo()}
          {activeSection === 'about' && renderAboutSection()}
        </div>
      </div>

      {/* Modals */}
      {renderLogoutModal()}
      {renderClearDataModal()}
    </div>
  );
};

export default Settings;