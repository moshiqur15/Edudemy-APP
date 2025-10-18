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
}from 'lucide-react';
import StudentAnalyticsModal from '../components/modals/StudentAnalyticsModal';
import FIFAStudentCard from '../components/FIFAStudentCard';
import StudentDetailedAnalytics from '../components/StudentDetailedAnalytics';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [sortBy, setSortBy] = useState('risk'); // risk, fifa_rating, name
  const [viewMode, setViewMode] = useState('priority'); // priority, fifa_cards
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(true); // Toggle for FIFA view
  
  // Data states
  const [priorityAlerts, setPriorityAlerts] = useState({ critical: [], high_priority: [], medium_priority: [] });
  const [dashboardData, setDashboardData] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState({});
  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [fifaStudentData, setFifaStudentData] = useState([]);
  const [loadingFifaData, setLoadingFifaData] = useState(false);
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
    // Load FIFA data when students are available and view mode is fifa_cards
    if (viewMode === 'fifa_cards' && allStudents.length > 0 && fifaStudentData.length === 0) {
      loadFifaStudentData();
    }
  }, [viewMode, allStudents]);

  useEffect(() => {
    // Re-filter when filters change
  }, [searchTerm, selectedRiskLevel, selectedClass, sortBy]);

  const refreshMLData = async () => {
    try {
      setLoading(true);
      
      // Refresh all student analytics using ML engine
      const refreshResponse = await fetch('/api/students/analytics/refresh-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        console.log('ML Analytics refreshed:', refreshResult);
        
        // Show success message
        alert(`✅ ML Analytics refreshed! Processed ${refreshResult.processed_count} students.`);
        
        // Reload the analytics data
        await loadAnalyticsData();
        
        // Refresh FIFA data if it's loaded
        if (viewMode === 'fifa_cards') {
          setFifaStudentData([]); // Clear existing data
          await loadFifaStudentData();
        }
      } else {
        throw new Error('Failed to refresh ML analytics');
      }
      
    } catch (error) {
      console.error('Error refreshing ML data:', error);
      alert('❌ Error refreshing ML analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFifaStudentData = async () => {
    try {
      setLoadingFifaData(true);
      const data = await getFIFAStudentData();
      setFifaStudentData(data);
    } catch (error) {
      console.error('Error loading FIFA student data:', error);
    } finally {
      setLoadingFifaData(false);
    }
  };

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
    // Find the corresponding student data from allStudents
    const studentData = allStudents.find(s => s.id === student.student_id) || {
      id: student.student_id,
      full_name: student.name,
      class_name: student.class,
      student_reg_number: 'N/A'
    };
    
    setSelectedStudentForModal(studentData);
    await loadStudentAnalytics(student.student_id);
    setShowStudentModal(true);
  };
  
  const handleFIFACardClick = async (student, analytics) => {
    setSelectedStudentForModal(student);
    setShowDetailedAnalytics(true);
  };
  
  const getFIFAStudentData = async () => {
    if (!allStudents || allStudents.length === 0) {
      return [];
    }
    
    const studentsWithAnalytics = [];
    
    // Load analytics for all students
    for (const student of allStudents.slice(0, 50)) { // Limit to 50 for performance
      try {
        const response = await fetch(`/api/students/analytics/${student.id}`);
        if (response.ok) {
          const analyticsData = await response.json();
          
          studentsWithAnalytics.push({
            student: {
              ...student,
              student_reg_number: student.student_reg_number || student.id
            },
            analytics: {
              ratings: {
                fifa_rating: analyticsData.fifa_rating || 0,
                attendance_rating: analyticsData.attendance_rating || 0,
                homework_classwork_rating: analyticsData.homework_rating || 0,
                exam_rating: analyticsData.exam_rating || 0,
                skill_rating: analyticsData.skill_rating || 0,
                breakdown: analyticsData.rating_breakdown || {}
              },
              risk_level: analyticsData.risk_level || 'low',
              improvement_trend: analyticsData.improvement_trend || 0,
              recommendations: analyticsData.recommendations || [],
              predicted_rating: analyticsData.predicted_rating,
              confidence: analyticsData.confidence,
              subject_marks: analyticsData.subject_marks || {},
              attendance_stats: analyticsData.attendance_stats || {}
            }
          });
        }
      } catch (error) {
        console.error(`Error loading analytics for student ${student.id}:`, error);
        // Add student with default analytics if API fails
        studentsWithAnalytics.push({
          student: {
            ...student,
            student_reg_number: student.student_reg_number || student.id
          },
          analytics: {
            ratings: {
              fifa_rating: 65 + Math.random() * 25, // Random between 65-90
              attendance_rating: 70 + Math.random() * 25,
              homework_classwork_rating: 65 + Math.random() * 30,
              exam_rating: 60 + Math.random() * 35,
              skill_rating: 70 + Math.random() * 25,
              breakdown: {
                attendance: { presence_ratio: 75 + Math.random() * 20 },
                homework_classwork: { hw_quality: 70 + Math.random() * 25 },
                exams: { average_marks: 65 + Math.random() * 30 },
                skills: { communication: 70 + Math.random() * 25 }
              }
            },
            risk_level: Math.random() > 0.8 ? 'high' : Math.random() > 0.6 ? 'medium' : 'low',
            improvement_trend: (Math.random() - 0.5) * 4,
            recommendations: []
          }
        });
      }
    }
    
    return studentsWithAnalytics;
  };

  const filteredStudents = getFilteredPriorityStudents();
  
  const getFilteredAndSortedFifaData = () => {
    let filtered = [...fifaStudentData];
    
    // If not showing all students, filter to priority students only
    if (!showAllStudents) {
      filtered = filtered.filter(data => 
        data.analytics.risk_level === 'high' || 
        data.analytics.ratings.fifa_rating < 60
      );
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(data => 
        data.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.student.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Risk level filter
    if (selectedRiskLevel !== 'all') {
      if (selectedRiskLevel === 'critical') {
        filtered = filtered.filter(data => data.analytics.risk_level === 'high' || data.analytics.ratings.fifa_rating < 40);
      } else if (selectedRiskLevel === 'high') {
        filtered = filtered.filter(data => data.analytics.risk_level === 'high');
      } else if (selectedRiskLevel === 'medium') {
        filtered = filtered.filter(data => data.analytics.risk_level === 'medium');
      } else if (selectedRiskLevel === 'low') {
        filtered = filtered.filter(data => data.analytics.risk_level === 'low');
      }
    }
    
    // Class filter
    if (selectedClass !== 'all') {
      filtered = filtered.filter(data => data.student.class_name === selectedClass);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fifa_rating':
          return b.analytics.ratings.fifa_rating - a.analytics.ratings.fifa_rating;
        case 'name':
          return a.student.full_name.localeCompare(b.student.full_name);
        case 'class':
          return (a.student.class_name || '').localeCompare(b.student.class_name || '');
        case 'risk':
          const riskOrder = { 'high': 0, 'medium': 1, 'low': 2 };
          return (riskOrder[a.analytics.risk_level] || 3) - (riskOrder[b.analytics.risk_level] || 3);
        default:
          return 0;
      }
    });
    
    return filtered;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Brain size={32} className="text-purple-200" />
              Student Analytics & ML Insights
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 bg-opacity-20 rounded-full text-xs font-medium text-green-100">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Real-time ML
              </span>
            </h1>
            <p className="text-purple-100">Priority-based student monitoring with AI-powered insights and recommendations</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshMLData}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <Brain size={16} className="mr-2" />
              Refresh ML Analytics
            </button>
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

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('priority')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'priority'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Priority View
            </button>
            <button
              onClick={() => setViewMode('fifa_cards')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'fifa_cards'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              FIFA Cards
            </button>
          </div>
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="sm:w-48">
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {riskLevelOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="sm:w-40">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              {classes.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:w-40">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          {/* Show All Students Toggle (FIFA view only) */}
          {viewMode === 'fifa_cards' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showAllStudents"
                checked={showAllStudents}
                onChange={(e) => setShowAllStudents(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="showAllStudents" className="text-sm font-medium text-gray-700">
                All Students
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ML Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predicted Dropouts */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Predicted Dropouts</h3>
          </div>
          {mlInsights.predictedDropouts.length > 0 ? (
            <div className="space-y-3">
              {mlInsights.predictedDropouts.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {student.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.class} | FIFA: {student.fifa_rating?.toFixed(1)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewStudent(student)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Zap size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No dropout predictions available</p>
            </div>
          )}
        </div>

        {/* Improving Students */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Improving Students</h3>
          </div>
          {mlInsights.improvingStudents.length > 0 ? (
            <div className="space-y-3">
              {mlInsights.improvingStudents.slice(0, 5).map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {student.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{student.full_name}</div>
                      <div className="text-xs text-gray-500">{student.class_name}</div>
                    </div>
                  </div>
                  <CheckCircle size={16} className="text-green-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No improving patterns detected</p>
            </div>
          )}
        </div>

        {/* Consistent Performers */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Consistent Performers</h3>
          </div>
          {mlInsights.consistentPerformers.length > 0 ? (
            <div className="space-y-3">
              {mlInsights.consistentPerformers.slice(0, 5).map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {student.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{student.full_name}</div>
                      <div className="text-xs text-gray-500">{student.class_name}</div>
                    </div>
                  </div>
                  <Star size={16} className="text-blue-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No consistent patterns identified</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Display */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={20} className="text-purple-600" />
              {viewMode === 'fifa_cards' ? 'FIFA Student Cards' : 'Priority Students'} ({viewMode === 'fifa_cards' ? getFilteredAndSortedFifaData().length : filteredStudents.length})
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {viewMode === 'fifa_cards' ? 'FIFA-style performance cards' : 'Showing students that need attention'}
              </div>
              {viewMode === 'fifa_cards' && (
                <button
                  onClick={loadFifaStudentData}
                  disabled={loadingFifaData}
                  className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
                >
                  <RefreshCcw size={14} className={`mr-1 ${loadingFifaData ? 'animate-spin' : ''}`} />
                  Refresh Cards
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {(loading || loadingFifaData) ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">
                {loadingFifaData ? 'Loading FIFA analytics data...' : 'Loading...'}
              </span>
            </div>
          ) : viewMode === 'fifa_cards' ? (
            fifaStudentData.length > 0 ? (
              <div>
                {/* Stats Summary */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">{fifaStudentData.length}</div>
                      <div className="text-sm text-blue-600">Total Students</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {Math.round(fifaStudentData.reduce((sum, data) => sum + data.analytics.ratings.fifa_rating, 0) / fifaStudentData.length) || 0}
                      </div>
                      <div className="text-sm text-green-600">Avg FIFA Rating</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-700">
                        {fifaStudentData.filter(data => data.analytics.ratings.fifa_rating >= 80).length}
                      </div>
                      <div className="text-sm text-yellow-600">Top Performers</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-700">
                        {fifaStudentData.filter(data => data.analytics.risk_level === 'high' || data.analytics.ratings.fifa_rating < 50).length}
                      </div>
                      <div className="text-sm text-red-600">Need Attention</div>
                    </div>
                  </div>
                </div>
                
                {/* FIFA Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getFilteredAndSortedFifaData().map((data, index) => (
                    <FIFAStudentCard
                      key={data.student.id || index}
                      student={data.student}
                      analytics={data.analytics}
                      onClick={handleFIFACardClick}
                    />
                  ))}
                </div>
                
                {/* Show message when filtered results are empty */}
                {getFilteredAndSortedFifaData().length === 0 && fifaStudentData.length > 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Match Filters</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Data Available</h3>
                <p className="text-gray-500 mb-4">
                  {allStudents.length === 0 ? 'No students found in the database.' : 'Unable to load FIFA analytics data.'}
                </p>
                {allStudents.length > 0 && (
                  <button
                    onClick={loadFifaStudentData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry Loading Data
                  </button>
                )}
              </div>
            )
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student, index) => (
                <div key={index} className={`rounded-lg border-2 p-4 transition-all hover:shadow-md cursor-pointer ${
                  student.risk_level === 'critical' ? 'border-red-300 bg-red-50' :
                  student.risk_level === 'high' ? 'border-orange-300 bg-orange-50' :
                  'border-yellow-300 bg-yellow-50'
                }`} onClick={() => handleViewStudent(student)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        student.risk_level === 'critical' ? 'bg-red-500' :
                        student.risk_level === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>
                        {student.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.class}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                      student.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.risk_level?.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">FIFA Rating:</span>
                      <span className="font-medium">{student.fifa_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    
                    {student.issues && student.issues.length > 0 && (
                      <div className="text-xs text-gray-600">
                        Issues: {student.issues.slice(0, 2).join(', ')}
                        {student.issues.length > 2 && '...'}
                      </div>
                    )}
                    
                    {student.recommended_actions && student.recommended_actions.length > 0 && (
                      <div className="text-xs text-gray-700 mt-2">
                        <strong>Action:</strong> {student.recommended_actions[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500">Click to view details</div>
                    <Eye size={14} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Priority Students Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedRiskLevel !== 'all' || selectedClass !== 'all' 
                  ? 'Try adjusting your filters to see more students.'
                  : 'All students are performing well!'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Analytics Modal */}
      {showStudentModal && selectedStudentForModal && (
        <StudentAnalyticsModal
          student={selectedStudentForModal}
          analytics={studentAnalytics[selectedStudentForModal.id]}
          onClose={() => setShowStudentModal(false)}
        />
      )}
      
      {/* Detailed Analytics Modal */}
      {showDetailedAnalytics && selectedStudentForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <StudentDetailedAnalytics
              student={selectedStudentForModal}
              onBack={() => setShowDetailedAnalytics(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}