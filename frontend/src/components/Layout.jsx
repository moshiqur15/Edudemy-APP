import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { notificationsAPI } from '../services/api';
import MessagingWidget from './MessagingWidget';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  UserCheck, 
  BookOpen, 
  Settings, 
  LogOut,
  GraduationCap,
  BarChart3,
  Calendar,
  FileText,
  Bell,
  MessageCircle,
  User,
  Shield,
  ClipboardList,
  TrendingUp,
  GraduationCap as Student,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Target,
  Briefcase,
  Award,
  Book,
  UserPlus,
  DollarSign,
  BarChart,
  PieChart,
  Activity
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const { notifications, isConnected, markNotificationAsRead } = useWebSocket();

  // Load initial notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationsAPI.getNotifications({ limit: 5 }),
          notificationsAPI.getUnreadCount()
        ]);
        setRecentNotifications(notifs);
        setUnreadCount(count.unread_count);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    loadNotifications();
  }, []);

  // Update notifications from WebSocket
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      setUnreadCount(prev => prev + unreadNotifications.length);
      setRecentNotifications(prev => [...notifications.slice(-5), ...prev].slice(0, 5));
    }
  }, [notifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await notificationsAPI.markAsRead(notification.id);
        markNotificationAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    setNotificationsOpen(false);
  };

  const getNavItems = () => {
    const baseItems = [
      { path: '/profile', icon: User, label: 'Profile', color: 'text-green-600' },
    ];

    if (hasRole(['superadmin', 'admin'])) {
      return [
        { path: '/admin', icon: Home, label: 'Dashboard', color: 'text-blue-600' },
        { path: '/admin/users', icon: Users, label: 'User Management', color: 'text-red-600' },
        { path: '/admin/students', icon: Student, label: 'Students', color: 'text-green-600' },
        { path: '/admin/teachers', icon: UserCheck, label: 'Teachers', color: 'text-purple-600' },
        { path: '/admin/batches', icon: BookOpen, label: 'Batches', color: 'text-orange-600' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'text-indigo-600' },
        { path: '/admin/attendance', icon: CheckCircle, label: 'Attendance', color: 'text-blue-500' },
        { path: '/admin/feedback', icon: Star, label: 'Feedback', color: 'text-pink-600' },
        { path: '/admin/permissions', icon: Shield, label: 'Permissions', color: 'text-red-500' },
        { path: '/admin/settings', icon: Settings, label: 'Settings', color: 'text-gray-600' },
        ...baseItems
      ];
    }
    
    if (hasRole('management')) {
      return [
        { path: '/management', icon: Home, label: 'Dashboard', color: 'text-blue-600' },
        { path: '/management/analytics', icon: BarChart3, label: 'Analytics', color: 'text-indigo-600' },
        { path: '/management/attendance', icon: CheckCircle, label: 'Attendance', color: 'text-blue-500' },
        { path: '/management/gradebook', icon: Book, label: 'Grade Book', color: 'text-purple-600' },
        { path: '/management/tasks', icon: ClipboardList, label: 'Task Management', color: 'text-green-600' },
        { path: '/management/reports', icon: FileText, label: 'Reports', color: 'text-purple-600' },
        { path: '/management/feedback', icon: Star, label: 'Feedback', color: 'text-pink-600' },
        ...baseItems
      ];
    }
    
    if (hasRole('academics')) {
      return [
        { path: '/academics', icon: Home, label: 'Dashboard', color: 'text-blue-600' },
        { path: '/academics/analytics', icon: BarChart3, label: 'Analytics', color: 'text-indigo-600' },
        { path: '/academics/attendance', icon: CheckCircle, label: 'Attendance', color: 'text-blue-500' },
        { path: '/academics/gradebook', icon: Book, label: 'Grade Book', color: 'text-purple-600' },
        { path: '/academics/classes', icon: Calendar, label: 'Class Management', color: 'text-green-600' },
        { path: '/academics/exams', icon: Award, label: 'Exam Management', color: 'text-purple-600' },
        { path: '/academics/reports', icon: FileText, label: 'Report Cards', color: 'text-purple-600' },
        { path: '/academics/behavior', icon: Target, label: 'Behavior Records', color: 'text-orange-600' },
        { path: '/academics/batches', icon: BookOpen, label: 'Batches', color: 'text-teal-600' },
        ...baseItems
      ];
    }
    
    if (hasRole('teacher')) {
      return [
        { path: '/teacher', icon: Home, label: 'Dashboard', color: 'text-blue-600' },
        { path: '/teacher/classes', icon: BookOpen, label: 'My Classes', color: 'text-green-600' },
        { path: '/teacher/gradebook', icon: Book, label: 'Grade Book', color: 'text-purple-600' },
        { path: '/teacher/attendance', icon: CheckCircle, label: 'Attendance', color: 'text-blue-500' },
        ...baseItems
      ];
    }
    
    if (hasRole('student')) {
      return [
        { path: '/student', icon: Home, label: 'Dashboard', color: 'text-blue-600' },
        { path: '/student/grades', icon: TrendingUp, label: 'My Grades', color: 'text-green-600' },
        { path: '/student/attendance', icon: Calendar, label: 'My Attendance', color: 'text-blue-500' },
        { path: '/student/feedback', icon: Star, label: 'Submit Feedback', color: 'text-pink-600' },
        ...baseItems
      ];
    }
    
    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'class_reminder': return <Calendar size={16} className="text-blue-500" />;
      case 'exam_reminder': return <Award size={16} className="text-purple-500" />;
      case 'task_assigned': return <ClipboardList size={16} className="text-green-500" />;
      case 'student_issue': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <GraduationCap size={32} />
            <span className="ml-2 text-xl font-bold">EduDemy</span>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className={`text-xs ${
                    isConnected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} className={`mr-3 ${isActive(item.path) ? 'text-blue-600' : item.color}`} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors duration-200"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 relative">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 flex justify-between items-center lg:ml-0 ml-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <button
                          onClick={() => navigate('/notifications')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View all
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map((notification, index) => (
                          <div
                            key={notification.id || index}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.is_read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium text-gray-900 ${
                                  !notification.is_read ? 'font-semibold' : ''
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatTimeAgo(notification.created_at)}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                          <p>No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile */}
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </button>
            </div>
          </div>
          
          {/* Close notifications dropdown when clicking outside */}
          {notificationsOpen && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setNotificationsOpen(false)}
            ></div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      
      {/* Messaging Widget */}
      <MessagingWidget />
    </div>
  );
}
