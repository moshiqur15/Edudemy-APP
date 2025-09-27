import React, { useState, useEffect } from 'react';
import { studentsAPI, academicsAPI, dashboardAPI } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import {
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  BookOpen,
  UserPlus,
  UserMinus,
  Award,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronDown,
  BarChart3,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Star,
  AlertTriangle,
  UserCheck,
  FileText,
  Printer,
  Share2,
  Settings,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [selectedTimeline, setSelectedTimeline] = useState('today');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Data states
  const [attendanceData, setAttendanceData] = useState([]);
  const [admissionData, setAdmissionData] = useState([]);
  const [leavingData, setLeavingData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    newAdmissions: 0,
    studentsLeft: 0,
    avgPerformance: 0
  });
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const timelineOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Last Day' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Batches' },
    { value: 'class', label: 'Class Wise' },
    { value: 'batch', label: 'Batch Wise' },
    { value: 'student', label: 'Student Wise' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeline, selectedFilter, selectedBatch, selectedClass, selectedStudent]);

  const loadInitialData = async () => {
    try {
      const [batchesRes, studentsRes] = await Promise.all([
        academicsAPI.getBatches().catch(() => ({ results: [] })),
        studentsAPI.getStudents().catch(() => [])
      ]);

      const batchData = Array.isArray(batchesRes) ? batchesRes : (batchesRes.results || []);
      const studentData = Array.isArray(studentsRes) ? studentsRes : (studentsRes.data || []);

      setBatches(batchData);
      setStudents(studentData);

      // Extract unique classes
      const uniqueClasses = [...new Set(batchData.map(b => b.class_name).filter(Boolean))];
      setClasses(uniqueClasses);

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock data generation based on filters
      const mockAttendanceData = generateMockAttendanceData();
      const mockAdmissionData = generateMockAdmissionData();
      const mockLeavingData = generateMockLeavingData();
      const mockPerformanceData = generateMockPerformanceData();
      const mockSummaryStats = generateMockSummaryStats();

      setAttendanceData(mockAttendanceData);
      setAdmissionData(mockAdmissionData);
      setLeavingData(mockLeavingData);
      setPerformanceData(mockPerformanceData);
      setSummaryStats(mockSummaryStats);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAttendanceData = () => {
    const baseData = {
      today: [{ name: 'Today', present: 85, absent: 12, late: 8 }],
      yesterday: [{ name: 'Yesterday', present: 82, absent: 15, late: 6 }],
      week: [
        { name: 'Mon', present: 85, absent: 12, late: 8 },
        { name: 'Tue', present: 88, absent: 10, late: 7 },
        { name: 'Wed', present: 82, absent: 15, late: 8 },
        { name: 'Thu', present: 90, absent: 8, late: 7 },
        { name: 'Fri', present: 87, absent: 11, late: 9 },
        { name: 'Sat', present: 78, absent: 16, late: 11 }
      ],
      month: [
        { name: 'Week 1', present: 85, absent: 12, late: 8 },
        { name: 'Week 2', present: 88, absent: 10, late: 7 },
        { name: 'Week 3', present: 82, absent: 15, late: 8 },
        { name: 'Week 4', present: 90, absent: 8, late: 7 }
      ],
      year: [
        { name: 'Jan', present: 85, absent: 12, late: 8 },
        { name: 'Feb', present: 88, absent: 10, late: 7 },
        { name: 'Mar', present: 82, absent: 15, late: 8 },
        { name: 'Apr', present: 90, absent: 8, late: 7 },
        { name: 'May', present: 87, absent: 11, late: 9 },
        { name: 'Jun', present: 89, absent: 9, late: 7 }
      ]
    };
    return baseData[selectedTimeline] || baseData.today;
  };

  const generateMockAdmissionData = () => {
    const baseData = {
      today: [{ name: 'Today', admissions: 3 }],
      yesterday: [{ name: 'Yesterday', admissions: 1 }],
      week: [
        { name: 'Mon', admissions: 3 },
        { name: 'Tue', admissions: 2 },
        { name: 'Wed', admissions: 1 },
        { name: 'Thu', admissions: 4 },
        { name: 'Fri', admissions: 2 },
        { name: 'Sat', admissions: 1 }
      ],
      month: [
        { name: 'Week 1', admissions: 8 },
        { name: 'Week 2', admissions: 12 },
        { name: 'Week 3', admissions: 6 },
        { name: 'Week 4', admissions: 9 }
      ],
      year: [
        { name: 'Jan', admissions: 25 },
        { name: 'Feb', admissions: 32 },
        { name: 'Mar', admissions: 18 },
        { name: 'Apr', admissions: 28 },
        { name: 'May', admissions: 22 },
        { name: 'Jun', admissions: 30 }
      ]
    };
    return baseData[selectedTimeline] || baseData.today;
  };

  const generateMockLeavingData = () => {
    const baseData = {
      today: [{ name: 'Today', left: 0 }],
      yesterday: [{ name: 'Yesterday', left: 1 }],
      week: [
        { name: 'Mon', left: 0 },
        { name: 'Tue', left: 1 },
        { name: 'Wed', left: 0 },
        { name: 'Thu', left: 0 },
        { name: 'Fri', left: 1 },
        { name: 'Sat', left: 0 }
      ],
      month: [
        { name: 'Week 1', left: 2 },
        { name: 'Week 2', left: 1 },
        { name: 'Week 3', left: 3 },
        { name: 'Week 4', left: 1 }
      ],
      year: [
        { name: 'Jan', left: 5 },
        { name: 'Feb', left: 3 },
        { name: 'Mar', left: 7 },
        { name: 'Apr', left: 2 },
        { name: 'May', left: 4 },
        { name: 'Jun', left: 3 }
      ]
    };
    return baseData[selectedTimeline] || baseData.today;
  };

  const generateMockPerformanceData = () => {
    const baseData = {
      today: [{ name: 'Today', avgScore: 78 }],
      yesterday: [{ name: 'Yesterday', avgScore: 75 }],
      week: [
        { name: 'Mon', avgScore: 78 },
        { name: 'Tue', avgScore: 82 },
        { name: 'Wed', avgScore: 75 },
        { name: 'Thu', avgScore: 85 },
        { name: 'Fri', avgScore: 80 },
        { name: 'Sat', avgScore: 77 }
      ],
      month: [
        { name: 'Week 1', avgScore: 78 },
        { name: 'Week 2', avgScore: 82 },
        { name: 'Week 3', avgScore: 75 },
        { name: 'Week 4', avgScore: 85 }
      ],
      year: [
        { name: 'Jan', avgScore: 75 },
        { name: 'Feb', avgScore: 78 },
        { name: 'Mar', avgScore: 72 },
        { name: 'Apr', avgScore: 80 },
        { name: 'May', avgScore: 77 },
        { name: 'Jun', avgScore: 82 }
      ]
    };
    return baseData[selectedTimeline] || baseData.today;
  };

  const generateMockSummaryStats = () => {
    return {
      totalStudents: students.length || 105,
      presentToday: 85,
      absentToday: 12,
      lateToday: 8,
      newAdmissions: selectedTimeline === 'today' ? 3 : selectedTimeline === 'week' ? 13 : 35,
      studentsLeft: selectedTimeline === 'today' ? 0 : selectedTimeline === 'week' ? 2 : 7,
      avgPerformance: 78.5
    };
  };

  const getFilteredOptions = () => {
    if (selectedFilter === 'class') {
      return classes;
    } else if (selectedFilter === 'batch') {
      return batches;
    } else if (selectedFilter === 'student') {
      return students;
    }
    return [];
  };

  const handleExportData = () => {
    // Implementation for exporting analytics data
    alert('Export functionality will be implemented');
  };

  const colors = {
    present: '#10B981',
    absent: '#EF4444',
    late: '#F59E0B',
    admissions: '#3B82F6',
    left: '#EF4444',
    performance: '#8B5CF6'
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-indigo-100">Comprehensive insights into student attendance, admissions, and performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <Filter size={20} className="mr-2" />
              Filters
              <ChevronDown size={16} className={`ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <Download size={20} className="mr-2" />
              Export
            </button>
            <button
              onClick={loadAnalyticsData}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Timeline Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Timeline</label>
                <select
                  value={selectedTimeline}
                  onChange={(e) => setSelectedTimeline(e.target.value)}
                  className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  {timelineOptions.map(option => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Filter Type</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Filter Options */}
              {selectedFilter !== 'all' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Select {selectedFilter === 'class' ? 'Class' : selectedFilter === 'batch' ? 'Batch' : 'Student'}
                  </label>
                  <select
                    value={selectedFilter === 'class' ? selectedClass : selectedFilter === 'batch' ? selectedBatch : selectedStudent}
                    onChange={(e) => {
                      if (selectedFilter === 'class') setSelectedClass(e.target.value);
                      else if (selectedFilter === 'batch') setSelectedBatch(e.target.value);
                      else setSelectedStudent(e.target.value);
                    }}
                    className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  >
                    <option value="all" className="text-gray-900">All</option>
                    {getFilteredOptions().map((option, index) => (
                      <option key={index} value={selectedFilter === 'student' ? option.id : option.name || option} className="text-gray-900">
                        {selectedFilter === 'student' ? `${option.full_name} (${option.student_reg_number})` : option.name || option}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
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