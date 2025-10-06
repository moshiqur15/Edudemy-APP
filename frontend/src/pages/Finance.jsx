import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import FeeCollection from '../components/finance/FeeCollection';
import AdmissionFeeCollection from '../components/finance/AdmissionFeeCollection';
import PaymentSheet from '../components/finance/PaymentSheet';
import { 
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  CreditCard,
  Receipt,
  UserPlus,
  ClipboardList
} from 'lucide-react';

const Finance = () => {
  const { user, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fee-collection');
  const [stats, setStats] = useState({
    totalMonthlyCollections: 0,
    pendingAdmissions: 0,
    totalDuesOutstanding: 0,
    overdueStudents: 0,
    thisMonthCollections: 0,
    lastMonthCollections: 0,
    upcomingDueDates: 0
  });
  const [loading, setLoading] = useState(true);

  // Check permissions - only finance, admin, and superadmin can access
  if (!hasRole(['superadmin', 'admin', 'finance'])) {
    return (
      <div className="text-center py-12">
        <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access the finance module.</p>
      </div>
    );
  }

  // Handle URL-based tab routing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    // Check URL path for tab routing
    if (location.pathname.includes('/fee-collection')) {
      setActiveTab('fee-collection');
    } else if (location.pathname.includes('/admission-fee')) {
      setActiveTab('admission-fee');
    } else if (location.pathname.includes('/payment-sheet')) {
      setActiveTab('payment-sheet');
    } else if (tab) {
      // Handle query parameters for backward compatibility
      switch(tab) {
        case 'fee-collection':
          setActiveTab('fee-collection');
          break;
        case 'admission':
        case 'admission-fee':
          setActiveTab('admission-fee');
          break;
        case 'payment-sheet':
          setActiveTab('payment-sheet');
          break;
        default:
          setActiveTab('fee-collection');
      }
    }
  }, [location]);

  // Load finance dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call the finance API
        // const response = await financeAPI.getDashboardStats();
        // setStats(response.data);
        
        // Mock data for now
        setStats({
          totalMonthlyCollections: 150000,
          pendingAdmissions: 12,
          totalDuesOutstanding: 45000,
          overdueStudents: 8,
          thisMonthCollections: 85000,
          lastMonthCollections: 65000,
          upcomingDueDates: 23
        });
      } catch (error) {
        console.error('Failed to load finance stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const tabs = [
    {
      id: 'fee-collection',
      name: 'Fee Collection',
      icon: CreditCard,
      description: 'Monthly fee collection for students with sorting and search capabilities'
    },
    {
      id: 'admission-fee',
      name: 'Admission Fee Collection',
      icon: UserPlus,
      description: 'Collect admission fees from students with remaining dues'
    },
    {
      id: 'payment-sheet',
      name: 'Payment Sheet',
      icon: ClipboardList,
      description: 'View and edit all student payment records and dues'
    }
  ];

  const statsCards = [
    {
      title: 'Total Collections',
      value: `৳${stats.totalMonthlyCollections.toLocaleString()}`,
      change: stats.thisMonthCollections > stats.lastMonthCollections ? 'increase' : 'decrease',
      changeValue: `${((stats.thisMonthCollections - stats.lastMonthCollections) / stats.lastMonthCollections * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Pending Admissions',
      value: stats.pendingAdmissions.toString(),
      subtitle: 'Students awaiting admission processing',
      icon: UserPlus,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Outstanding Dues',
      value: `৳${stats.totalDuesOutstanding.toLocaleString()}`,
      subtitle: 'Total amount pending collection',
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'Overdue Students',
      value: stats.overdueStudents.toString(),
      subtitle: 'Students with overdue payments',
      icon: Calendar,
      color: 'text-red-600 bg-red-100'
    }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'fee-collection':
        return <FeeCollection />;
      case 'admission-fee':
        return <AdmissionFeeCollection />;
      case 'payment-sheet':
        return <PaymentSheet />;
      default:
        return <FeeCollection />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DollarSign className="mr-3 h-8 w-8 text-green-600" />
            Finance Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage fee collection, admission processing, and payment records
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="/finance/dashboard"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Finance Dashboard
          </a>
          <div className="text-sm text-gray-500">
            Welcome back, {user?.full_name || user?.username}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-full ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Update URL for better navigation
                  navigate(`/finance/${tab.id}`, { replace: true });
                }}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
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
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Finance;