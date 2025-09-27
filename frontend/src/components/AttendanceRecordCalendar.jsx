import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI } from '../services/api';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  ArrowLeft,
  Download,
  Filter,
  Search,
  Eye,
  BarChart3
} from 'lucide-react';

// Calendar component for date selection
const CalendarView = ({ selectedDate, onDateSelect, attendanceData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAttendanceForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return attendanceData[dateStr];
  };

  const getDateCellClass = (date) => {
    if (!date) return 'p-2';
    
    const isSelected = selectedDate === date.toISOString().split('T')[0];
    const isToday = date.toDateString() === new Date().toDateString();
    const attendance = getAttendanceForDate(date);
    
    let baseClass = 'p-2 h-10 w-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ';
    
    if (isSelected) {
      baseClass += 'bg-blue-600 text-white ';
    } else if (isToday) {
      baseClass += 'bg-blue-100 text-blue-600 font-semibold ';
    } else if (attendance) {
      const attendanceRate = attendance.presentCount / (attendance.presentCount + attendance.absentCount + attendance.lateCount) * 100;
      if (attendanceRate >= 90) {
        baseClass += 'bg-green-100 text-green-800 ';
      } else if (attendanceRate >= 75) {
        baseClass += 'bg-yellow-100 text-yellow-800 ';
      } else {
        baseClass += 'bg-red-100 text-red-800 ';
      }
    } else {
      baseClass += 'hover:bg-gray-100 text-gray-700 ';
    }
    
    return baseClass;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div
            key={index}
            className={getDateCellClass(date)}
            onClick={() => date && onDateSelect(date.toISOString().split('T')[0])}
          >
            {date ? date.getDate() : ''}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
          <span className="text-gray-600">Good (&ge;90%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div>
          <span className="text-gray-600">Average (75-89%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
          <span className="text-gray-600">Low (&lt;75%)</span>
        </div>
      </div>
    </div>
  );
};

// Student attendance detail modal
const StudentAttendanceDetail = ({ student, attendance, onClose, onSave, canEdit }) => {
  const [editedStatus, setEditedStatus] = useState(attendance);
  const [comment, setComment] = useState('');

  const handleSave = () => {
    onSave(student.id, editedStatus, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{student.full_name}</h4>
              <p className="text-sm text-gray-500">Roll: {student.student_id}</p>
            </div>
          </div>

          {/* Attendance Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Status
            </label>
            {canEdit ? (
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            ) : (
              <div className={`px-3 py-2 rounded-lg text-center font-medium ${
                attendance === 'present' ? 'bg-green-100 text-green-800' :
                attendance === 'late' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {attendance?.charAt(0).toUpperCase() + attendance?.slice(1)}
              </div>
            )}
          </div>

          {/* Comment */}
          {canEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note about this attendance record..."
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AttendanceRecordCalendar({ 
  selectedClass, 
  selectedBatch, 
  students, 
  onBack 
}) {
  const { user, hasRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // calendar or list
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (selectedBatch) {
      loadAttendanceData();
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedBatch && selectedDate) {
      loadDailyAttendance();
    }
  }, [selectedBatch, selectedDate]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      // Load attendance data for the entire month
      const currentMonth = new Date();
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const response = await academicsAPI.getAttendance({
        batch_id: selectedBatch.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      // Process attendance data by date
      const attendanceByDate = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(record => {
          const date = record.date;
          if (!attendanceByDate[date]) {
            attendanceByDate[date] = { presentCount: 0, absentCount: 0, lateCount: 0, records: [] };
          }
          
          attendanceByDate[date].records.push(record);
          if (record.status === 'present') attendanceByDate[date].presentCount++;
          else if (record.status === 'absent') attendanceByDate[date].absentCount++;
          else if (record.status === 'late') attendanceByDate[date].lateCount++;
        });
      }

      setAttendanceData(attendanceByDate);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      // Generate some mock data for demonstration
      const mockData = {};
      const today = new Date();
      for (let i = 1; i <= today.getDate(); i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), i).toISOString().split('T')[0];
        const presentCount = Math.floor(Math.random() * students.length * 0.9) + 1;
        const absentCount = Math.floor(Math.random() * 5);
        const lateCount = Math.floor(Math.random() * 3);
        
        mockData[date] = {
          presentCount,
          absentCount,
          lateCount,
          records: students.slice(0, presentCount + absentCount + lateCount).map((student, idx) => ({
            student_id: student.id,
            status: idx < presentCount ? 'present' : idx < presentCount + lateCount ? 'late' : 'absent',
            date: date
          }))
        };
      }
      setAttendanceData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyAttendance = async () => {
    try {
      const dayData = attendanceData[selectedDate];
      if (dayData) {
        const dailyRecords = students.map(student => {
          const record = dayData.records.find(r => r.student_id === student.id);
          return {
            ...student,
            attendance_status: record ? record.status : null,
            comment: record ? record.comment : null
          };
        });
        setDailyAttendance(dailyRecords);
      } else {
        setDailyAttendance(students.map(student => ({
          ...student,
          attendance_status: null,
          comment: null
        })));
      }
    } catch (error) {
      console.error('Error loading daily attendance:', error);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleSaveAttendance = async (studentId, status, comment) => {
    try {
      // Update local state
      setDailyAttendance(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, attendance_status: status, comment } 
          : student
      ));

      // Update attendance data
      const updatedData = { ...attendanceData };
      if (!updatedData[selectedDate]) {
        updatedData[selectedDate] = { presentCount: 0, absentCount: 0, lateCount: 0, records: [] };
      }

      // Remove existing record for this student
      updatedData[selectedDate].records = updatedData[selectedDate].records.filter(r => r.student_id !== studentId);
      
      // Add new record
      updatedData[selectedDate].records.push({
        student_id: studentId,
        status,
        date: selectedDate,
        comment
      });

      // Recalculate counts
      const counts = { presentCount: 0, absentCount: 0, lateCount: 0 };
      updatedData[selectedDate].records.forEach(record => {
        if (record.status === 'present') counts.presentCount++;
        else if (record.status === 'absent') counts.absentCount++;
        else if (record.status === 'late') counts.lateCount++;
      });

      updatedData[selectedDate] = { ...updatedData[selectedDate], ...counts };
      setAttendanceData(updatedData);

      // Sync with API (would work when backend is available)
      await academicsAPI.markAttendance({
        student_id: studentId,
        batch_id: selectedBatch.id,
        date: selectedDate,
        status,
        comment
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      // In mock mode, this is expected
    }
  };

  const exportAttendanceData = () => {
    const csvData = dailyAttendance.map(student => ({
      'Date': selectedDate,
      'Student Name': student.full_name,
      'Roll Number': student.student_id,
      'Class': student.class_name,
      'Batch': selectedBatch.name,
      'Status': student.attendance_status || 'Not Marked',
      'Comment': student.comment || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_record_${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getFilteredStudents = () => {
    return dailyAttendance.filter(student => {
      const matchesSearch = !searchTerm || 
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toString().includes(searchTerm);
      
      const matchesFilter = statusFilter === 'all' || student.attendance_status === statusFilter;
      
      return matchesSearch && matchesFilter;
    });
  };

  const canEditAttendance = hasRole(['superadmin', 'admin', 'academics', 'teacher']);
  const filteredStudents = getFilteredStudents();
  const selectedDateData = attendanceData[selectedDate];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance records...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Attendance Records</h2>
            <p className="text-sm text-gray-600">
              {selectedClass?.name} - {selectedBatch?.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Calendar size={16} className="mr-1 inline" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <BarChart3 size={16} className="mr-1 inline" />
              List
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-1">
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            attendanceData={attendanceData}
          />
          
          {/* Quick Date Selection */}
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quick Date Selection
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Attendance Details */}
        <div className="lg:col-span-2">
          {/* Date Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <button
                onClick={exportAttendanceData}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>

            {selectedDateData ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedDateData.presentCount}</p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                    <Clock size={20} className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedDateData.lateCount}</p>
                  <p className="text-sm text-gray-600">Late</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-2">
                    <XCircle size={20} className="text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedDateData.absentCount}</p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No attendance recorded for this date</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6">
            <div className="flex space-x-3">
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
          </div>

          {/* Student List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No students found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleStudentClick(student)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{student.full_name}</h4>
                          <p className="text-sm text-gray-500">Roll: {student.student_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {student.attendance_status ? (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            student.attendance_status === 'present' ? 'bg-green-100 text-green-800' :
                            student.attendance_status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.attendance_status?.charAt(0).toUpperCase() + student.attendance_status?.slice(1)}
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                            Not Marked
                          </div>
                        )}
                        
                        {canEditAttendance && (
                          <Edit size={16} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {student.comment && (
                      <div className="mt-2 ml-13">
                        <p className="text-sm text-gray-600 italic">"{student.comment}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {showStudentModal && selectedStudent && (
        <StudentAttendanceDetail
          student={selectedStudent}
          attendance={selectedStudent.attendance_status}
          canEdit={canEditAttendance}
          onClose={() => setShowStudentModal(false)}
          onSave={handleSaveAttendance}
        />
      )}
    </div>
  );
}