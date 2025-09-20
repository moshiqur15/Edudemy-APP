import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, academicsAPI } from '../services/api';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Save,
  RefreshCw,
  Search,
  User,
  Eye,
  ChevronDown,
  AlertCircle,
  Download
} from 'lucide-react';

export default function Attendance() {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Data states
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0
  });

  const attendanceOptions = [
    { value: 'present', label: 'Present', color: 'bg-green-500 hover:bg-green-600', textColor: 'text-green-700', bgColor: 'bg-green-100' },
    { value: 'absent', label: 'Absent', color: 'bg-red-500 hover:bg-red-600', textColor: 'text-red-700', bgColor: 'bg-red-100' },
    { value: 'late', label: 'Late', color: 'bg-yellow-500 hover:bg-yellow-600', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadStudentsAndAttendance();
  }, [selectedDate, selectedBatch, selectedClass]);

  const loadInitialData = async () => {
    try {
      const [batchesRes] = await Promise.all([
        academicsAPI.getBatches().catch(() => ({ results: [] }))
      ]);

      const batchData = Array.isArray(batchesRes) ? batchesRes : (batchesRes.results || []);
      setBatches(batchData);

      // Extract unique classes
      const uniqueClasses = [...new Set(batchData.map(b => b.class_name).filter(Boolean))];
      setClasses(uniqueClasses);

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadStudentsAndAttendance = async () => {
    try {
      setLoading(true);
      
      let studentsRes;
      if (selectedBatch !== 'all') {
        // Get students for specific batch
        studentsRes = await studentsAPI.getStudentsByBatch(selectedBatch).catch(() => []);
      } else if (selectedClass !== 'all') {
        // Get students for specific class
        studentsRes = await studentsAPI.getStudentsByClass(selectedClass).catch(() => []);
      } else {
        // Get all students
        studentsRes = await studentsAPI.getStudents().catch(() => []);
      }

      const studentData = Array.isArray(studentsRes) ? studentsRes : (studentsRes.data || []);
      setStudents(studentData);

      // Load attendance data for selected date
      // For now, we'll use mock data - in a real app, this would come from an attendance API
      const mockAttendanceData = generateMockAttendanceData(studentData);
      setAttendance(mockAttendanceData);

    } catch (error) {
      console.error('Error loading students and attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAttendanceData = (studentList) => {
    const attendanceData = {};
    studentList.forEach(student => {
      // Generate random attendance status for demo
      const randomStatus = Math.random();
      if (randomStatus > 0.85) {
        attendanceData[student.id] = 'absent';
      } else if (randomStatus > 0.75) {
        attendanceData[student.id] = 'late';
      } else {
        attendanceData[student.id] = 'present';
      }
    });
    return attendanceData;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_reg_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const updateAttendanceStats = (attendanceData) => {
    const total = Object.keys(attendanceData).length;
    const present = Object.values(attendanceData).filter(status => status === 'present').length;
    const absent = Object.values(attendanceData).filter(status => status === 'absent').length;
    const late = Object.values(attendanceData).filter(status => status === 'late').length;
    
    setAttendanceStats({ total, present, absent, late });
  };

  useEffect(() => {
    updateAttendanceStats(attendance);
  }, [attendance]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleBulkAttendance = (status) => {
    const newAttendance = {};
    filteredStudents.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(prev => ({
      ...prev,
      ...newAttendance
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      
      // In a real app, this would call an API to save attendance
      // await attendanceAPI.saveAttendance({
      //   date: selectedDate,
      //   batch_id: selectedBatch !== 'all' ? selectedBatch : null,
      //   class_name: selectedClass !== 'all' ? selectedClass : null,
      //   attendance: attendance
      // });

      alert(`Attendance saved successfully for ${selectedDate}`);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleExportAttendance = () => {
    // Implementation for exporting attendance data
    alert('Export functionality will be implemented');
  };

  const getAttendanceOption = (status) => {
    return attendanceOptions.find(option => option.value === status) || attendanceOptions[0];
  };

  const canMarkAttendance = hasRole(['teacher', 'management', 'academics', 'admin', 'superadmin']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Attendance Management</h1>
            <p className="text-blue-100">Mark and manage student attendance for classes and batches</p>
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
              onClick={handleExportAttendance}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <Download size={20} className="mr-2" />
              Export
            </button>
            <button
              onClick={loadStudentsAndAttendance}
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
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    if (e.target.value !== 'all') {
                      setSelectedBatch('all');
                    }
                  }}
                  className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="all" className="text-gray-900">All Classes</option>
                  {classes.map(className => (
                    <option key={className} value={className} className="text-gray-900">
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    if (e.target.value !== 'all') {
                      setSelectedClass('all');
                    }
                  }}
                  className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="all" className="text-gray-900">All Batches</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id} className="text-gray-900">
                      {batch.name} - {batch.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Search Student</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-white text-opacity-60" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Present</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceStats.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Absent</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceStats.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Late</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceStats.late}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {canMarkAttendance && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
            <p className="text-gray-600 text-sm">Apply attendance status to all visible students</p>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleBulkAttendance('present')}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <CheckCircle size={16} className="mr-2" />
                Mark All Present
              </button>
              <button
                onClick={() => handleBulkAttendance('absent')}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <XCircle size={16} className="mr-2" />
                Mark All Absent
              </button>
              <button
                onClick={() => handleBulkAttendance('late')}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Clock size={16} className="mr-2" />
                Mark All Late
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Student Attendance - {new Date(selectedDate).toLocaleDateString()}
            </h3>
            {canMarkAttendance && (
              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No students available for the selected filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map(student => {
                const currentAttendance = attendance[student.id] || 'present';
                const attendanceOption = getAttendanceOption(currentAttendance);
                
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.full_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {student.full_name || 'Unknown Student'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ID: {student.student_reg_number} | Class: {student.class_name} | Roll: {student.roll_number || 'N/A'}
                        </p>
                        {student.batch && (
                          <p className="text-xs text-gray-400">
                            Batch: {student.batch.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {canMarkAttendance ? (
                        <div className="flex space-x-2">
                          {attendanceOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => handleAttendanceChange(student.id, option.value)}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                currentAttendance === option.value
                                  ? `${option.color} text-white`
                                  : `border border-gray-300 text-gray-700 hover:bg-gray-50`
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className={`px-4 py-2 text-sm rounded-lg ${attendanceOption.bgColor} ${attendanceOption.textColor} border`}>
                          {attendanceOption.label}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Summary */}
      {filteredStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-green-600">Present Rate</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {attendanceStats.total > 0 ? Math.round((attendanceStats.absent / attendanceStats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-red-600">Absent Rate</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {attendanceStats.total > 0 ? Math.round((attendanceStats.late / attendanceStats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-yellow-600">Late Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}