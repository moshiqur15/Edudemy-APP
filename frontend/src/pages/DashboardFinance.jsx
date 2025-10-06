import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  UserPlus,
  CreditCard,
  FileText,
  Receipt,
  TrendingDown,
  Activity
} from 'lucide-react';

const DashboardFinance = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMonthlyCollections: 0,
    pendingAdmissions: 0,
    totalDuesOutstanding: 0,
    overdueStudents: 0,
    thisMonthCollections: 0,
    lastMonthCollections: 0,
    upcomingDueDates: 0,
    paymentsToday: 0,
    receiptsPrinted: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the finance API
      // const response = await financeAPI.getDashboardStats();
      // setStats(response.data);

      // Mock data for demonstration
      setStats({
        totalMonthlyCollections: 450000,
        pendingAdmissions: 8,
        totalDuesOutstanding: 125000,
        overdueStudents: 15,
        thisMonthCollections: 280000,
        lastMonthCollections: 170000,
        upcomingDueDates: 32,
        paymentsToday: 12,
        receiptsPrinted: 45
      });

      // Mock recent activities
      setRecentActivities([
        {
          id: 1,
          type: 'payment',
          description: 'Payment received from Ahmed Hassan - ৳3,000',
          time: '10 minutes ago',
          icon: CreditCard,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'admission',
          description: 'Admission fee processed for Fatima Ahmed',
          time: '25 minutes ago',
          icon: UserPlus,
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'receipt',
          description: 'Receipt printed for Mohammad Rahman',
          time: '1 hour ago',
          icon: Receipt,
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'due_cleared',
          description: 'Due cleared for Rashida Begum (Admin Action)',
          time: '2 hours ago',
          icon: CheckCircle,
          color: 'text-orange-600'
        },
        {
          id: 5,
          type: 'overdue',
          description: 'Student marked as overdue - Karim Khan',
          time: '3 hours ago',
          icon: AlertCircle,
          color: 'text-red-600'
        }
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Collections',
      value: `৳${stats.totalMonthlyCollections.toLocaleString()}`,
      change: stats.thisMonthCollections > stats.lastMonthCollections ? 'increase' : 'decrease',
      changeValue: `${((stats.thisMonthCollections - stats.lastMonthCollections) / stats.lastMonthCollections * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      title: 'Outstanding Dues',
      value: `৳${stats.totalDuesOutstanding.toLocaleString()}`,
      subtitle: `${stats.overdueStudents} students overdue`,
      icon: AlertCircle,
      color: 'text-red-600 bg-red-100',
      bgColor: 'bg-red-50 border-red-200'
    },
    {
      title: 'Pending Admissions',
      value: stats.pendingAdmissions.toString(),
      subtitle: 'Awaiting processing',
      icon: UserPlus,
      color: 'text-blue-600 bg-blue-100',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Today\'s Payments',
      value: stats.paymentsToday.toString(),
      subtitle: `${stats.receiptsPrinted} receipts printed`,
      icon: CreditCard,
      color: 'text-purple-600 bg-purple-100',
      bgColor: 'bg-purple-50 border-purple-200'
    }
  ];

  const quickActions = [
    {
      title: 'Fee Collection',
      description: 'Collect monthly fees from students',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      href: '/finance/fee-collection'
    },
    {
      title: 'Admission Fee Collection',
      description: 'Process admission fees for new students',
      icon: UserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      href: '/finance/admission-fee'
    },
    {
      title: 'Payment Sheet',
      description: 'View and manage all payment records',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      href: '/finance/payment-sheet'
    },
    {
      title: 'Finance Management',
      description: 'Access full finance management interface',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      href: '/finance'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DollarSign className="mr-3 h-8 w-8 text-green-600" />
            Finance Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.full_name || user?.username}! Here's your finance overview.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} border rounded-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <span className={`ml-2 text-sm font-medium ${
                      stat.change === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change === 'increase' ? '↑' : '↓'} {stat.changeValue}
                    </span>
                  )}
                </div>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`flex-shrink-0 p-3 rounded-full ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className={`${action.bgColor} border border-gray-200 rounded-lg p-4 block hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center mb-3">
                <action.icon size={20} className={action.color} />
                <h4 className="font-medium text-gray-900 ml-2">{action.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <Activity size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-full bg-gray-100`}>
                  <activity.icon size={16} className={activity.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a href="/finance" className="text-sm text-green-600 hover:text-green-700 font-medium">
              Go to Finance Management →
            </a>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Performance</h3>
            <Calendar size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month Collections</span>
              <span className="text-lg font-semibold text-green-600">
                ৳{stats.thisMonthCollections.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Month Collections</span>
              <span className="text-lg font-semibold text-gray-900">
                ৳{stats.lastMonthCollections.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Growth</span>
              <span className={`text-lg font-semibold ${
                stats.thisMonthCollections > stats.lastMonthCollections ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.thisMonthCollections > stats.lastMonthCollections ? '↑' : '↓'} 
                {((stats.thisMonthCollections - stats.lastMonthCollections) / stats.lastMonthCollections * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Collection Target</span>
                <span className="font-medium">85% achieved</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Reminders */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Clock className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-yellow-800">Reminders & Alerts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span>{stats.overdueStudents} students have overdue payments</span>
          </div>
          <div className="flex items-center">
            <UserPlus className="w-4 h-4 text-blue-500 mr-2" />
            <span>{stats.pendingAdmissions} admission fees pending</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-orange-500 mr-2" />
            <span>{stats.upcomingDueDates} payments due this week</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinance;