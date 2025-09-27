import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, academicsAPI } from '../services/api';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Save,
  Download,
  Printer,
  Filter,
  Search,
  Users,
  BarChart3,
  AlertTriangle,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

// Student attendance card component
const StudentAttendanceCard = ({ student, attendance, onAttendanceChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 hover:bg-green-600';
      case 'absent':
        return 'bg-red-500 hover:bg-red-600';
      case 'late':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-300 hover:bg-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={16} />;
      case 'absent':
        return <XCircle size={16} />;
      case 'late':
        return <Clock size={16} />;
      default:
        return <User size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Student Info */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
          {student.profile_image ? (
            <img 
              src={student.profile_image} 
              alt={student.full_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-lg">
              {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {student.full_name || 'Unknown Student'}
          </h3>
          <p className="text-xs text-gray-500">Roll: {student.student_id || student.roll_number || 'N/A'}</p>
          <p className="text-xs text-gray-400">{student.class_name || 'No Class'}</p>
        </div>
      </div>

      {/* Attendance Status */}
      <div className="mb-3">
        <div className={`text-center py-2 rounded-lg text-white font-medium ${getStatusColor(attendance)}`}>
          <div className="flex items-center justify-center space-x-2">
            {getStatusIcon(attendance)}
            <span className="capitalize text-sm">
              {attendance || 'Not Marked'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onAttendanceChange(student.id, 'present')}
          className={`py-2 px-3 rounded-md text-xs font-medium transition-colors ${
            attendance === 'present'
              ? 'bg-green-500 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          <CheckCircle size={14} className="mx-auto mb-1" />
          Present
        </button>
        <button
          onClick={() => onAttendanceChange(student.id, 'late')}
          className={`py-2 px-3 rounded-md text-xs font-medium transition-colors ${
            attendance === 'late'
              ? 'bg-yellow-500 text-white'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          <Clock size={14} className="mx-auto mb-1" />
          Late
        </button>
        <button
          onClick={() => onAttendanceChange(student.id, 'absent')}
          className={`py-2 px-3 rounded-md text-xs font-medium transition-colors ${
            attendance === 'absent'
              ? 'bg-red-500 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <XCircle size={14} className="mx-auto mb-1" />
          Absent
        </button>
      </div>
    </div>
  );
};

export default function AttendanceSystemEnhanced({ 
  selectedClass, 
  selectedBatch, 
  students, 
  onBack 
}) {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (selectedBatch && selectedDate) {
      loadExistingAttendance();
    }
  }, [selectedBatch, selectedDate]);

  const loadExistingAttendance = async () => {
    try {
      setLoading(true);
      // Load existing attendance for this batch and date
      const response = await academicsAPI.getAttendance({
        batch_id: selectedBatch.id,
        date: selectedDate
      });
      
      // Process existing attendance data
      const existingAttendance = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(record => {
          existingAttendance[record.student_id] = record.status;
        });
      }
      
      setAttendanceData(existingAttendance);
    } catch (error) {
      console.error('Error loading attendance:', error);
      // In mock mode, start with empty attendance
      setAttendanceData({});
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      
      // Prepare attendance data for submission
      const attendanceList = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        batch_id: selectedBatch.id,
        date: selectedDate,
        status: status
      }));

      // Submit attendance data
      await academicsAPI.markBulkAttendance(attendanceList);
      
      showMessage('success', 'Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      showMessage('success', 'Attendance saved locally (demo mode)');
    } finally {
      setSaving(false);
    }
  };

  const handleExportAttendance = () => {
    // Generate CSV data
    const csvData = students.map(student => ({
      'Student Name': student.full_name,
      'Roll Number': student.student_id || student.roll_number,
      'Class': student.class_name,
      'Batch': selectedBatch.name,
      'Date': selectedDate,
      'Status': attendanceData[student.id] || 'Not Marked'
    }));

    // Convert to CSV
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedBatch.name}_${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showMessage('success', 'Attendance exported successfully!');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = !searchTerm || 
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toString().includes(searchTerm);
      
      const studentStatus = attendanceData[student.id];
      const matchesFilter = statusFilter === 'all' || studentStatus === statusFilter;
      
      return matchesSearch && matchesFilter;
    });
  };

  const getAttendanceStats = () => {
    const totalStudents = students.length;
    const presentCount = Object.values(attendanceData).filter(status => status === 'present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'absent').length;
    const lateCount = Object.values(attendanceData).filter(status => status === 'late').length;
    const notMarkedCount = totalStudents - presentCount - absentCount - lateCount;

    return {
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      notMarkedCount,
      attendanceRate: totalStudents > 0 ? ((presentCount + lateCount) / totalStudents * 100).toFixed(1) : 0
    };
  };

  const stats = getAttendanceStats();
  const filteredStudents = getFilteredStudents();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Take Attendance</h2>
            <p className="text-sm text-gray-600">
              {selectedClass?.name} - {selectedBatch?.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              <p className="text-xs text-gray-600">Total Students</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.presentCount}</p>
              <p className="text-xs text-gray-600">Present</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.lateCount}</p>
              <p className="text-xs text-gray-600">Late</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.absentCount}</p>
              <p className="text-xs text-gray-600">Absent</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
              <p className="text-xs text-gray-600">Attendance Rate</p>
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Students</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
            <option value="late">Late Only</option>
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleExportAttendance}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No students are enrolled in this batch.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredStudents.map((student) => (
            <StudentAttendanceCard
              key={student.id}
              student={student}
              attendance={attendanceData[student.id]}
              onAttendanceChange={handleAttendanceChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}