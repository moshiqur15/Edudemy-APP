import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Activity,
  CheckCircle,
  Users,
  RefreshCcw,
  Eye,
  Filter,
  Search,
  BookOpen,
  UserX,
  Brain,
  Zap,
  Clock,
  Calendar,
  Star,
  BarChart3
} from 'lucide-react';
import StudentAnalyticsModal from '../components/modals/StudentAnalyticsModal';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [sortBy, setSortBy] = useState('risk'); // risk, fifa_rating, name
  
  // Data states
  const [priorityAlerts, setPriorityAlerts] = useState({ critical: [], high_priority: [], medium_priority: [] });
  const [dashboardData, setDashboardData] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState({});
  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [mlInsights, setMlInsights] = useState({
    predictedDropouts: [],
    improvingStudents: [],
    consistentPerformers: [],
    needsAttention: []
  });

  const riskLevelOptions = [
    { value: 'all', label: 'All Risk Levels', color: 'gray' },
    { value: 'critical', label: 'Critical', color: 'red' },
    { value: 'high', label: 'High Priority', color: 'orange' },
    { value: 'medium', label: 'Needs Attention', color: 'yellow' },
    { value: 'low', label: 'Low Risk', color: 'green' }
  ];

  const sortOptions = [
    { value: 'risk', label: 'Risk Level' },
    { value: 'fifa_rating', label: 'FIFA Rating' },
    { value: 'name', label: 'Name' },
    { value: 'class', label: 'Class' }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  useEffect(() => {
    // Re-filter when filters change
  }, [searchTerm, selectedRiskLevel, selectedClass, sortBy]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load priority alerts
      const alertsResponse = await fetch('/api/students/analytics/priority-alerts');
      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json();
        setPriorityAlerts(alerts);
      }
      
      // Load dashboard data
      const dashboardResponse = await fetch('/api/students/analytics/dashboard-summary');
      if (dashboardResponse.ok) {
        const dashboard = await dashboardResponse.json();
        setDashboardData(dashboard);
        
        // Extract unique classes from dashboard data
        if (dashboard.class_performance) {
          const uniqueClasses = [...new Set(dashboard.class_performance.map(cp => cp.class_name).filter(Boolean))];
          setClasses(uniqueClasses);
        }
      }
      
      // Load students data
      const studentsResponse = await studentsAPI.getStudents();
      const studentData = Array.isArray(studentsResponse) ? studentsResponse : (studentsResponse.data || []);
      setAllStudents(studentData);
      
      // Generate ML insights based on loaded data
      generateMlInsights(alerts, studentData);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMlInsights = (alerts, students) => {
    // Predict potential dropouts based on risk levels and trends
    const predictedDropouts = [...alerts.critical || [], ...alerts.high_priority || []]
      .filter(alert => alert.fifa_rating < 45)
      .slice(0, 5);
    
    // Find improving students (mock logic - in real implementation would use trend analysis)
    const improvingStudents = students
      .filter(student => {
        // Mock logic: students not in alerts might be improving
        const isInAlerts = [...alerts.critical || [], ...alerts.high_priority || [], ...alerts.medium_priority || []]
          .some(alert => alert.student_id === student.id);
        return !isInAlerts;
      })
      .slice(0, 5);
    
    // Consistent performers
    const consistentPerformers = students
      .filter(student => !predictedDropouts.some(p => p.student_id === student.id))
      .slice(0, 5);
    
    setMlInsights({
      predictedDropouts,
      improvingStudents,
      consistentPerformers,
      needsAttention: [...alerts.critical || [], ...alerts.high_priority || []]
    });
  };

  const getFilteredPriorityStudents = () => {
    let allAlerts = [];
    
    // Combine all priority alerts
    if (selectedRiskLevel === 'all') {
      allAlerts = [
        ...priorityAlerts.critical?.map(s => ({...s, risk_level: 'critical'})) || [],
        ...priorityAlerts.high_priority?.map(s => ({...s, risk_level: 'high'})) || [],
        ...priorityAlerts.medium_priority?.map(s => ({...s, risk_level: 'medium'})) || []
      ];
    } else if (selectedRiskLevel === 'critical') {
      allAlerts = priorityAlerts.critical?.map(s => ({...s, risk_level: 'critical'})) || [];
    } else if (selectedRiskLevel === 'high') {
      allAlerts = priorityAlerts.high_priority?.map(s => ({...s, risk_level: 'high'})) || [];
    } else if (selectedRiskLevel === 'medium') {
      allAlerts = priorityAlerts.medium_priority?.map(s => ({...s, risk_level: 'medium'})) || [];
    }
    
    // Filter by search term
    if (searchTerm) {
      allAlerts = allAlerts.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by class
    if (selectedClass !== 'all') {
      allAlerts = allAlerts.filter(student => student.class === selectedClass);
    }
    
    // Sort students
    allAlerts.sort((a, b) => {
      if (sortBy === 'risk') {
        const riskOrder = { 'critical': 0, 'high': 1, 'medium': 2 };
        return riskOrder[a.risk_level] - riskOrder[b.risk_level];
      } else if (sortBy === 'fifa_rating') {
        return (a.fifa_rating || 0) - (b.fifa_rating || 0);
      } else if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'class') {
        return (a.class || '').localeCompare(b.class || '');
      }
      return 0;
    });
    
    return allAlerts;
  };
  
  const loadStudentAnalytics = async (studentId) => {
    try {
      const response = await fetch(`/api/students/analytics/${studentId}`);
      if (response.ok) {
        const analytics = await response.json();
        setStudentAnalytics(prev => ({...prev, [studentId]: analytics}));
        return analytics;
      }
    } catch (error) {
      console.error('Error loading student analytics:', error);
    }
  };
  
  const handleViewStudent = async (student) => {
    setSelectedStudentForModal(student);
    await loadStudentAnalytics(student.student_id);
    setShowStudentModal(true);
  };

  const colors = {
    present: '#10B981',
    absent: '#EF4444',
    late: '#F59E0B',
    admissions: '#3B82F6',
    left: '#EF4444',
    performance: '#8B5CF6'
  };

  const filteredStudents = getFilteredPriorityStudents();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Brain size={32} className="text-purple-200" />
              Student Analytics & ML Insights
            </h1>
            <p className="text-purple-100">Priority-based student monitoring with AI-powered insights and recommendations</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadAnalyticsData}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <RefreshCcw size={16} className="mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>
      
      {/* Priority Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Critical Students</p>
              <p className="text-2xl font-semibold text-red-600">{priorityAlerts.critical?.length || 0}</p>
              <p className="text-xs text-red-500 mt-1">Need immediate attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-semibold text-orange-600">{priorityAlerts.high_priority?.length || 0}</p>
              <p className="text-xs text-orange-500 mt-1">At risk students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Needs Attention</p>
              <p className="text-2xl font-semibold text-yellow-600">{priorityAlerts.medium_priority?.length || 0}</p>
              <p className="text-xs text-yellow-500 mt-1">Monitor closely</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average FIFA</p>
              <p className="text-2xl font-semibold text-green-600">{dashboardData?.system_stats?.avg_fifa_rating?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-green-500 mt-1">Overall performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New Admissions</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.newAdmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserMinus className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Students Left</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.studentsLeft}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Performance</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.avgPerformance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Attendance Trends
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill={colors.present} name="Present" />
                  <Bar dataKey="absent" fill={colors.absent} name="Absent" />
                  <Bar dataKey="late" fill={colors.late} name="Late" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Admissions vs Leaving Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Admissions vs Leaving
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="admissions" 
                    stroke={colors.admissions} 
                    strokeWidth={2}
                    name="New Admissions"
                    data={admissionData}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="left" 
                    stroke={colors.left} 
                    strokeWidth={2}
                    name="Students Left"
                    data={leavingData}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-600" />
            Student Performance Trends
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke={colors.performance} 
                  fill={colors.performance}
                  fillOpacity={0.3}
                  name="Average Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Today's Attendance Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-indigo-600" />
            Today's Attendance Breakdown
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">{summaryStats.presentToday}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Present</h4>
              <p className="text-green-600">Students attended today</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">{summaryStats.absentToday}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Absent</h4>
              <p className="text-red-600">Students absent today</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">{summaryStats.lateToday}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Late</h4>
              <p className="text-yellow-600">Students arrived late</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}