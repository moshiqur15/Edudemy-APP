import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Download,
  Moon,
  Sun,
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
  Camera,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Monitor,
  Palette,
  Volume2,
  VolumeX,
  Vibrate,
  Languages,
  FileText,
  LogOut,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

const Settings = () => {
  const { user, logout, hasRole } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  
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
    
    // Notification settings
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
    pushNotifications: JSON.parse(localStorage.getItem('pushNotifications') || 'true'),
    smsNotifications: JSON.parse(localStorage.getItem('smsNotifications') || 'false'),
    soundEnabled: JSON.parse(localStorage.getItem('soundEnabled') || 'true'),
    
    // Privacy & Security
    twoFactorEnabled: JSON.parse(localStorage.getItem('twoFactorEnabled') || 'false'),
    sessionTimeout: parseInt(localStorage.getItem('sessionTimeout') || '30'),
    showOnlineStatus: JSON.parse(localStorage.getItem('showOnlineStatus') || 'true'),
    
    // System preferences
    autoSave: JSON.parse(localStorage.getItem('autoSave') || 'true'),
    offlineMode: JSON.parse(localStorage.getItem('offlineMode') || 'true'),
    dataSync: JSON.parse(localStorage.getItem('dataSync') || 'true')
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const settingsSections = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
    { id: 'about', label: 'About', icon: Info }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const timezones = [
    { value: 'Asia/Dhaka', label: 'Dhaka (GMT+6)' },
    { value: 'Asia/Karachi', label: 'Karachi (GMT+5)' },
    { value: 'Asia/Kolkata', label: 'New Delhi (GMT+5:30)' },
    { value: 'UTC', label: 'UTC (GMT+0)' }
  ];

  // Theme is now handled by ThemeProvider

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

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        
        <div className="space-y-4">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => {
                const currentTheme = localStorage.getItem('theme') || 'light';
                const isActive = currentTheme === value;
                
                return (
                  <button
                    key={value}
                    onClick={() => {
                      setTheme(value);
                      showMessage('success', `Theme changed to ${label}`);
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', icon: Bell, description: 'Receive browser push notifications' },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: Phone, description: 'Receive notifications via SMS' },
            { key: 'soundEnabled', label: 'Sound Notifications', icon: Volume2, description: 'Play sound for notifications' }
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

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h3>
        
        <div className="space-y-4">
          {[
            { key: 'autoSave', label: 'Auto Save', icon: Save, description: 'Automatically save your work' },
            { key: 'offlineMode', label: 'Offline Mode', icon: WifiOff, description: 'Enable offline functionality' },
            { key: 'dataSync', label: 'Data Sync', icon: RefreshCw, description: 'Sync data across devices' }
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

      {/* Data Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowClearDataModal(true)}
            className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
          >
            <div className="flex items-center">
              <Trash2 size={20} className="mr-3" />
              <div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Platform:</span>
            <span className="text-gray-900">{navigator.platform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Browser:</span>
            <span className="text-gray-900">{navigator.userAgent.split(' ')[0]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Language:</span>
            <span className="text-gray-900">{navigator.language}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Online Status:</span>
            <span className={`${navigator.onLine ? 'text-green-600' : 'text-red-600'}`}>
              {navigator.onLine ? 'Online' : 'Offline'}
            </span>
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
            className="flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
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
                      ? 'bg-blue-100 text-blue-700'
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
          {activeSection === 'system' && renderSystemSettings()}
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