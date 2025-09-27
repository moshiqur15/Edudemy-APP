import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI } from '../services/api';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Save,
  Download,
  Printer,
  Search,
  Filter,
  Eye,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  FileText,
  MessageCircle,
  Star,
  Target,
  ArrowLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Individual student grade modal
const StudentGradeModal = ({ student, grades, onClose, onSave, canEdit, currentMonth }) => {
  const [dailyExams, setDailyExams] = useState(grades?.dailyExams || {});
  const [monthlyExam, setMonthlyExam] = useState(grades?.monthlyExam || '');
  const [attendance, setAttendance] = useState(grades?.attendance || '');
  const [comments, setComments] = useState(grades?.comments || '');

  const handleDailyExamChange = (date, score) => {
    if (score < 0 || score > 10) return;
    setDailyExams(prev => ({
      ...prev,
      [date]: parseFloat(score) || 0
    }));
  };

  const handleSave = () => {
    const updatedGrades = {
      dailyExams,
      monthlyExam: parseFloat(monthlyExam) || 0,
      attendance: parseFloat(attendance) || 0,
      comments
    };
    onSave(student.id, updatedGrades);
    onClose();
  };

  const getDailyAverage = () => {
    const scores = Object.values(dailyExams).filter(score => score > 0);
    return scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : '0.0';
  };

  const getOverallGrade = () => {
    const dailyAvg = parseFloat(getDailyAverage());
    const monthly = parseFloat(monthlyExam) || 0;
    const attendanceScore = parseFloat(attendance) || 0;
    
    // Weighted calculation: 40% daily, 50% monthly, 10% attendance
    const overall = (dailyAvg * 0.4) + (monthly * 0.5) + (attendanceScore * 0.1);
    return overall.toFixed(1);
  };

  const getGradeLevel = (score) => {
    if (score >= 9) return { level: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 8) return { level: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 7) return { level: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 6) return { level: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 5) return { level: 'C+', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 4) return { level: 'C', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGradeLevel(parseFloat(getOverallGrade()));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{student.full_name}</h3>
              <p className="text-sm text-gray-500">Roll: {student.student_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Edit size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Grades Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Exams */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar size={16} className="mr-2" />
                Daily Exams (Out of 10)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const dateKey = date.toISOString().split('T')[0];
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <div key={day} className={`${isWeekend ? 'opacity-50' : ''}`}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Day {day}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={dailyExams[dateKey] || ''}
                        onChange={(e) => handleDailyExamChange(dateKey, e.target.value)}
                        disabled={!canEdit || isWeekend}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Exam & Attendance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Award size={16} className="mr-2" />
                  Monthly Exam (Out of 10)
                </h4>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={monthlyExam}
                  onChange={(e) => setMonthlyExam(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="0.0"
                />
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users size={16} className="mr-2" />
                  Attendance Score (Out of 10)
                </h4>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Comments */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MessageCircle size={16} className="mr-2" />
                Comments & Improvement Notes
              </h4>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={!canEdit}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Add notes about student's performance, areas for improvement, achievements, etc."
              />
            </div>
          </div>

          {/* Right Column - Grade Summary */}
          <div className="space-y-4">
            {/* Overall Grade */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
              <div className="mb-3">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold ${gradeInfo.bg} ${gradeInfo.color}`}>
                  {gradeInfo.level}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Overall Grade</p>
              <p className="text-3xl font-bold text-gray-900">{getOverallGrade()}/10</p>
            </div>

            {/* Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Grade Breakdown</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Average (40%)</span>
                  <span className="font-medium">{getDailyAverage()}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Exam (50%)</span>
                  <span className="font-medium">{monthlyExam || '0.0'}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Attendance (10%)</span>
                  <span className="font-medium">{attendance || '0.0'}/10</span>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Daily Exams Taken</span>
                <span className="font-medium">{Object.keys(dailyExams).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Highest Daily Score</span>
                <span className="font-medium">
                  {Object.values(dailyExams).length > 0 ? Math.max(...Object.values(dailyExams)).toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          {canEdit && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function GradeBookEnhanced({ 
  selectedClass, 
  selectedBatch, 
  students, 
  onBack 
}) {
  const { user, hasRole } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [gradeData, setGradeData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grades'); // grades or analytics

  useEffect(() => {
    if (selectedBatch) {
      loadGradeData();
    }
  }, [selectedBatch, currentMonth]);

  const loadGradeData = async () => {
    try {
      setLoading(true);
      
      // Load existing grade data for the current month
      const response = await academicsAPI.getExamResults({
        batch_id: selectedBatch.id,
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear()
      });

      // Process grade data
      const processedGrades = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(record => {
          if (!processedGrades[record.student_id]) {
            processedGrades[record.student_id] = {
              dailyExams: {},
              monthlyExam: 0,
              attendance: 0,
              comments: ''
            };
          }
          
          if (record.exam_type === 'daily') {
            processedGrades[record.student_id].dailyExams[record.date] = record.score;
          } else if (record.exam_type === 'monthly') {
            processedGrades[record.student_id].monthlyExam = record.score;
          }
        });
      }

      setGradeData(processedGrades);
    } catch (error) {
      console.error('Error loading grade data:', error);
      // Generate mock data for demonstration
      const mockGrades = {};
      students.forEach(student => {
        const dailyExams = {};
        // Generate random daily exam scores
        for (let day = 1; day <= 15; day++) {
          if (Math.random() > 0.3) { // 70% chance of having an exam on any day
            dailyExams[new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0]] = 
              Math.round((Math.random() * 4 + 6) * 10) / 10; // Random score between 6-10
          }
        }
        
        mockGrades[student.id] = {
          dailyExams,
          monthlyExam: Math.round((Math.random() * 3 + 7) * 10) / 10,
          attendance: Math.round((Math.random() * 2 + 8) * 10) / 10,
          comments: [
            'Excellent performance, keep it up!',
            'Good work, but can improve in problem-solving.',
            'Needs to focus more on homework completion.',
            'Strong understanding of concepts.',
            'Participates well in class discussions.'
          ][Math.floor(Math.random() * 5)]
        };
      });
      setGradeData(mockGrades);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrades = async (studentId, grades) => {
    try {
      // Update local state immediately
      setGradeData(prev => ({
        ...prev,
        [studentId]: grades
      }));

      // Sync with API when available
      await academicsAPI.createExamResult({
        student_id: studentId,
        batch_id: selectedBatch.id,
        grades,
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear()
      });
    } catch (error) {
      console.error('Error saving grades:', error);
      // In mock mode, this is expected
    }
  };

  const calculateStudentGrade = (studentId) => {
    const grades = gradeData[studentId];
    if (!grades) return { overall: 0, letter: 'F' };

    const dailyScores = Object.values(grades.dailyExams).filter(score => score > 0);
    const dailyAvg = dailyScores.length > 0 ? dailyScores.reduce((sum, score) => sum + score, 0) / dailyScores.length : 0;
    const monthly = parseFloat(grades.monthlyExam) || 0;
    const attendance = parseFloat(grades.attendance) || 0;

    const overall = (dailyAvg * 0.4) + (monthly * 0.5) + (attendance * 0.1);
    
    let letter = 'F';
    if (overall >= 9) letter = 'A+';
    else if (overall >= 8) letter = 'A';
    else if (overall >= 7) letter = 'B+';
    else if (overall >= 6) letter = 'B';
    else if (overall >= 5) letter = 'C+';
    else if (overall >= 4) letter = 'C';

    return { overall: overall.toFixed(1), letter };
  };

  const getFilteredAndSortedStudents = () => {
    let filtered = students.filter(student =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toString().includes(searchTerm)
    );

    // Sort students
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.full_name || '';
          bValue = b.full_name || '';
          break;
        case 'grade':
          aValue = parseFloat(calculateStudentGrade(a.id).overall);
          bValue = parseFloat(calculateStudentGrade(b.id).overall);
          break;
        case 'roll':
          aValue = a.student_id || '';
          bValue = b.student_id || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const exportGradeBook = () => {
    const csvData = getFilteredAndSortedStudents().map(student => {
      const grade = calculateStudentGrade(student.id);
      const grades = gradeData[student.id];
      const dailyScores = grades ? Object.values(grades.dailyExams) : [];
      const dailyAvg = dailyScores.length > 0 ? (dailyScores.reduce((sum, score) => sum + score, 0) / dailyScores.length).toFixed(1) : '0.0';

      return {
        'Student Name': student.full_name,
        'Roll Number': student.student_id,
        'Class': student.class_name,
        'Batch': selectedBatch.name,
        'Month': currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        'Daily Average': dailyAvg,
        'Monthly Exam': grades?.monthlyExam || '0.0',
        'Attendance Score': grades?.attendance || '0.0',
        'Overall Grade': grade.overall,
        'Letter Grade': grade.letter,
        'Comments': grades?.comments || ''
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradebook_${selectedBatch.name}_${currentMonth.getFullYear()}_${currentMonth.getMonth() + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getGradeStats = () => {
    const allGrades = students.map(student => parseFloat(calculateStudentGrade(student.id).overall));
    const validGrades = allGrades.filter(grade => grade > 0);
    
    if (validGrades.length === 0) return { average: 0, highest: 0, lowest: 0 };
    
    return {
      average: (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(1),
      highest: Math.max(...validGrades).toFixed(1),
      lowest: Math.min(...validGrades).toFixed(1)
    };
  };

  const canEditGrades = hasRole(['superadmin', 'admin', 'academics', 'teacher']);
  const filteredStudents = getFilteredAndSortedStudents();
  const stats = getGradeStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grade book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Selection
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grade Book</h2>
            <p className="text-sm text-gray-600">
              {selectedClass?.name} - {selectedBatch?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Month Navigation */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-2 text-sm font-medium border-x border-gray-300">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              <p className="text-xs text-gray-600">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.average}</p>
              <p className="text-xs text-gray-600">Class Average</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.highest}</p>
              <p className="text-xs text-gray-600">Highest Grade</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.lowest}</p>
              <p className="text-xs text-gray-600">Lowest Grade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="grade">Sort by Grade</option>
            <option value="roll">Sort by Roll Number</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span className="ml-2">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={exportGradeBook}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Daily Avg</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Monthly</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Overall</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const grade = calculateStudentGrade(student.id);
                const grades = gradeData[student.id];
                const dailyScores = grades ? Object.values(grades.dailyExams) : [];
                const dailyAvg = dailyScores.length > 0 ? (dailyScores.reduce((sum, score) => sum + score, 0) / dailyScores.length).toFixed(1) : '0.0';

                const getGradeColor = (letter) => {
                  switch (letter) {
                    case 'A+':
                    case 'A':
                      return 'bg-green-100 text-green-800';
                    case 'B+':
                    case 'B':
                      return 'bg-blue-100 text-blue-800';
                    case 'C+':
                    case 'C':
                      return 'bg-yellow-100 text-yellow-800';
                    default:
                      return 'bg-red-100 text-red-800';
                  }
                };

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.full_name}</div>
                          <div className="text-sm text-gray-500">Roll: {student.student_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{dailyAvg}/10</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{grades?.monthlyExam || '0.0'}/10</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{grades?.attendance || '0.0'}/10</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{grade.overall}/10</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(grade.letter)}`}>
                        {grade.letter}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowGradeModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        {canEditGrades ? 'Edit' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No students are enrolled in this batch.'}
            </p>
          </div>
        )}
      </div>

      {/* Student Grade Modal */}
      {showGradeModal && selectedStudent && (
        <StudentGradeModal
          student={selectedStudent}
          grades={gradeData[selectedStudent.id]}
          canEdit={canEditGrades}
          currentMonth={currentMonth}
          onClose={() => setShowGradeModal(false)}
          onSave={handleSaveGrades}
        />
      )}
    </div>
  );
}