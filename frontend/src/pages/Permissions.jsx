import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AccessRequestManagement from '../components/AccessRequestManagement';
import AdminUserCreation from '../components/AdminUserCreation';
import {
  Shield,
  UserPlus,
  FileCheck,
  Settings,
  Users,
  Key
} from 'lucide-react';

export default function Permissions() {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('access-requests');

  const tabs = [
    {
      id: 'access-requests',
      name: 'Access Requests',
      icon: FileCheck,
      description: 'Review and approve new user account requests',
      roles: ['superadmin', 'admin', 'management']
    },
    {
      id: 'create-user',
      name: 'Create New User',
      icon: UserPlus,
      description: 'Create user accounts directly without approval process',
      roles: ['superadmin', 'admin', 'management']
    },
    {
      id: 'role-permissions',
      name: 'Role Permissions',
      icon: Key,
      description: 'Manage permissions and access levels for different roles',
      roles: ['superadmin', 'admin']
    },
    {
      id: 'system-settings',
      name: 'System Settings',
      icon: Settings,
      description: 'Configure system-wide permission settings',
      roles: ['superadmin']
    }
  ];

  // Filter tabs based on user role
  const availableTabs = tabs.filter(tab => hasRole(tab.roles));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'access-requests':
        return <AccessRequestManagement />;
      case 'create-user':
        return <AdminUserCreation />;
      case 'role-permissions':
        return <RolePermissionsTab />;
      case 'system-settings':
        return <SystemSettingsTab />;
      default:
        return <AccessRequestManagement />;
    }
  };

  if (!hasRole(['superadmin', 'admin', 'management'])) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access the permissions management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
        <p className="text-gray-600 mt-2">
          Manage user access requests, create new users, and configure system permissions
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {availableTabs.map((tab) => {
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
            {availableTabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Role Permissions Tab Component
function RolePermissionsTab() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Role Permissions Management</h3>
        <p className="text-gray-600 mb-4">
          This feature will allow you to manage detailed permissions for each role.
        </p>
        <div className="bg-blue-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
          <h4 className="font-medium text-blue-900 mb-3">Current Role Hierarchy:</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="font-medium">Super Admin:</span>
              <span>Ultimate system control, can manage all users and settings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">Admin:</span>
              <span>Full system administration, can manage users below admin level</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Management:</span>
              <span>Administrative and operational management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">Academics:</span>
              <span>Academic oversight and curriculum management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">Teacher:</span>
              <span>Manage classes, students, and assignments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="font-medium">Student:</span>
              <span>Access to courses, assignments, and grades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// System Settings Tab Component
function SystemSettingsTab() {
  const [settings, setSettings] = useState({
    autoApproveStudents: false,
    requireEmailVerification: true,
    allowSelfRegistration: true,
    maxPasswordAttempts: 5,
    sessionTimeout: 60, // minutes
    enableTwoFactor: false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        
        <div className="space-y-6">
          {/* Registration Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Registration Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Allow Self Registration</label>
                  <p className="text-xs text-gray-500">Enable users to register for accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowSelfRegistration}
                  onChange={(e) => handleSettingChange('allowSelfRegistration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Require Email Verification</label>
                  <p className="text-xs text-gray-500">Require users to verify their email before account activation</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-Approve Student Accounts</label>
                  <p className="text-xs text-gray-500">Automatically approve student account requests</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoApproveStudents}
                  onChange={(e) => handleSettingChange('autoApproveStudents', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Security Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Maximum Password Attempts</label>
                  <p className="text-xs text-gray-500">Number of failed attempts before account lockout</p>
                </div>
                <select
                  value={settings.maxPasswordAttempts}
                  onChange={(e) => handleSettingChange('maxPasswordAttempts', parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value={3}>3 attempts</option>
                  <option value={5}>5 attempts</option>
                  <option value={10}>10 attempts</option>
                  <option value={-1}>No limit</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Session Timeout</label>
                  <p className="text-xs text-gray-500">Minutes of inactivity before auto-logout</p>
                </div>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                  <option value={-1}>No timeout</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</label>
                  <p className="text-xs text-gray-500">Require additional verification for login</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableTwoFactor}
                  onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
              Reset to Defaults
            </button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}