import React, { useState, useEffect } from 'react';
import FIFAStudentCard from './FIFAStudentCard';
import StudentDetailedAnalytics from './StudentDetailedAnalytics';
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Filter,
  Search,
  BarChart3,
  Trophy,
  Target,
  ArrowLeft,
  Zap,
  Star,
  RefreshCcw,
  Download,
  Eye
} from 'lucide-react';

const BatchAnalysisView = ({ batch, onBack }) => {
  const [students, setStudents] = useState([]);
  const [studentAnalytics, setStudentAnalytics] = useState({});
  const [batchStats, setBatchStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('fifa_rating');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    if (batch) {
      loadBatchData();
    }
  }, [batch]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      
      // Load students in batch
      const studentsResponse = await fetch(`/api/students/by-batch/${batch.id}`);
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
        
        // Load analytics for each student
        const analyticsPromises = studentsData.map(student => 
          loadStudentAnalytics(student.id)
        );
        
        const analyticsResults = await Promise.all(analyticsPromises);
        const analyticsMap = {};
        
        analyticsResults.forEach((analytics, index) => {
          if (analytics) {
            analyticsMap[studentsData[index].id] = analytics;
          }
        });
        
        setStudentAnalytics(analyticsMap);
        calculateBatchStats(studentsData, analyticsMap);
      }
    } catch (error) {
      console.error('Error loading batch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAnalytics = async (studentId) => {
    try {
      const response = await fetch(`/api/students/analytics/${studentId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error loading analytics for student ${studentId}:`, error);
    }
    return null;
  };

  const calculateBatchStats = (studentsData, analyticsMap) => {
    const validAnalytics = Object.values(analyticsMap).filter(a => a && a.fifa_rating);
    
    if (validAnalytics.length === 0) {
      setBatchStats({
        totalStudents: studentsData.length,
        averageFifa: 0,
        topPerformers: 0,
        atRisk: 0,
        improving: 0
      });
      return;
    }

    const fifaRatings = validAnalytics.map(a => a.fifa_rating);
    const averageFifa = fifaRatings.reduce((sum, rating) => sum + rating, 0) / fifaRatings.length;
    
    const topPerformers = validAnalytics.filter(a => a.fifa_rating >= 80).length;
    const atRisk = validAnalytics.filter(a => 
      a.risk_level === 'high' || a.fifa_rating < 50
    ).length;
    const improving = validAnalytics.filter(a => 
      a.improvement_trend > 0
    ).length;

    setBatchStats({
      totalStudents: studentsData.length,
      averageFifa: Math.round(averageFifa),
      topPerformers,
      atRisk,
      improving,
      categoryAverages: {
        attendance: validAnalytics.reduce((sum, a) => sum + (a.attendance_rating || 0), 0) / validAnalytics.length,
        homework: validAnalytics.reduce((sum, a) => sum + (a.homework_rating || 0), 0) / validAnalytics.length,
        exams: validAnalytics.reduce((sum, a) => sum + (a.exam_rating || 0), 0) / validAnalytics.length,
        skills: validAnalytics.reduce((sum, a) => sum + (a.skill_rating || 0), 0) / validAnalytics.length,
      }
    });
  };

  const handleStudentClick = (student, analytics) => {
    setSelectedStudent({ ...student, analytics });
    setShowDetailedAnalytics(true);
  };

  const getFilteredAndSortedStudents = () => {
    let filtered = students.filter(student => {
      const analytics = studentAnalytics[student.id];
      
      // Search filter
      if (searchTerm && !student.full_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Risk filter
      if (filterRisk !== 'all') {
        if (!analytics) return false;
        if (filterRisk === 'high' && analytics.risk_level !== 'high') return false;
        if (filterRisk === 'medium' && analytics.risk_level !== 'medium') return false;
        if (filterRisk === 'low' && analytics.risk_level !== 'low') return false;
      }
      
      return true;
    });

    // Sort students
    filtered.sort((a, b) => {
      const aAnalytics = studentAnalytics[a.id];
      const bAnalytics = studentAnalytics[b.id];
      
      if (!aAnalytics && !bAnalytics) return 0;
      if (!aAnalytics) return 1;
      if (!bAnalytics) return -1;
      
      switch (sortBy) {
        case 'fifa_rating':
          return (bAnalytics.fifa_rating || 0) - (aAnalytics.fifa_rating || 0);
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'attendance':
          return (bAnalytics.attendance_rating || 0) - (aAnalytics.attendance_rating || 0);
        case 'risk':
          const riskOrder = { 'high': 0, 'medium': 1, 'low': 2 };
          return (riskOrder[aAnalytics.risk_level] || 3) - (riskOrder[bAnalytics.risk_level] || 3);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getBatchGrade = () => {
    if (!batchStats) return 'N/A';
    
    const avg = batchStats.averageFifa;
    if (avg >= 85) return 'A+';
    if (avg >= 75) return 'A';
    if (avg >= 65) return 'B';
    if (avg >= 55) return 'C';
    return 'D';
  };

  const refreshBatchData = () => {
    loadBatchData();
  };

  if (showDetailedAnalytics && selectedStudent) {
    return (
      <StudentDetailedAnalytics
        student={selectedStudent}
        onBack={() => setShowDetailedAnalytics(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{batch.name}</h1>
            <p className="text-gray-600">{batch.class_name} - FIFA Style Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshBatchData}
            className="flex items-center px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Batch Stats Overview */}
      {batchStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{batchStats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg FIFA Rating</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900">{batchStats.averageFifa}</p>
                  <span className="ml-2 text-sm font-medium text-yellow-600">({getBatchGrade()})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Top Performers</p>
                <p className="text-2xl font-semibold text-green-600">{batchStats.topPerformers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">At Risk</p>
                <p className="text-2xl font-semibold text-red-600">{batchStats.atRisk}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Improving</p>
                <p className="text-2xl font-semibold text-purple-600">{batchStats.improving}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Performance Chart */}
      {batchStats?.categoryAverages && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(batchStats.categoryAverages).map(([category, average]) => (
              <div key={category} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={
                        category === 'attendance' ? '#3b82f6' :
                        category === 'homework' ? '#8b5cf6' :
                        category === 'exams' ? '#10b981' : '#6366f1'
                      }
                      strokeWidth="8"
                      strokeDasharray={`${(average / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(average)}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {category}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="sm:w-40">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fifa_rating">FIFA Rating</option>
              <option value="name">Name</option>
              <option value="attendance">Attendance</option>
              <option value="risk">Risk Level</option>
            </select>
          </div>
          
          <div className="sm:w-32">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getFilteredAndSortedStudents().map((student) => (
            <FIFAStudentCard
              key={student.id}
              student={student}
              analytics={studentAnalytics[student.id]}
              onClick={handleStudentClick}
              isSelected={selectedStudent?.id === student.id}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && getFilteredAndSortedStudents().length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-500">
            {searchTerm || filterRisk !== 'all' 
              ? 'Try adjusting your filters to see more students.'
              : 'No students found in this batch.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BatchAnalysisView;