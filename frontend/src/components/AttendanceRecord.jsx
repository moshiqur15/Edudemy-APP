import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Edit,
  Eye,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  User
} from 'lucide-react';

const AttendanceRecord = ({ batch, students, onBack }) => {
  const { user, hasRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState(new Set());

  const subjects = [
    'Mathematics', 'English', 'Science', 'Social Studies', 'Bangla', 
    'Physics', 'Chemistry', 'Biology', 'History', 'Geography'
  ];

  useEffect(() => {
    loadAttendanceData();
    loadMarkedDates();
  }, [selectedDate, batch.id]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await attendanceAPI.getAttendanceByDate(batch.id, selectedDate);
      
      // Mock data for demonstration
      const mockData = generateMockAttendanceData();
      setAttendanceRecords(mockData);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMarkedDates = async () => {
    try {
      // TODO: Replace with actual API call to get dates with attendance records
      // const response = await attendanceAPI.getMarkedDates(batch.id, calendarDate.getFullYear(), calendarDate.getMonth());
      
      // Mock marked dates
      const mockMarkedDates = new Set([
        formatDateKey(new Date(2024, 11, 15)),
        formatDateKey(new Date(2024, 11, 16)),
        formatDateKey(new Date(2024, 11, 17)),
        formatDateKey(new Date(2024, 11, 18)),
        formatDateKey(new Date(2024, 11, 19)),
      ]);
      setMarkedDates(mockMarkedDates);
    } catch (error) {
      console.error('Error loading marked dates:', error);
    }
  };

  const generateMockAttendanceData = () => {
    return students.map(student => ({
      id: Math.random(),
      student_id: student.id,
      student_name: student.full_name,
      student_roll: student.student_roll_number || student.admission_serial,
      subject: 'Mathematics',
      is_present: Math.random() > 0.2,
      is_late: Math.random() > 0.8,
      remarks: Math.random() > 0.7 ? 'Good participation' : '',
      teacher_name: user?.full_name || 'Teacher',
      date: formatDate(selectedDate),
      time_marked: '10:30 AM'
    }));
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatDateDisplay = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const navigateMonth = (direction) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCalendarDate(newDate);
    loadMarkedDates();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setViewMode('list');
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const canEditRecord = () => {
    return hasRole(['superadmin', 'admin', 'academics', 'teacher']) && 
           !hasRole(['student']);
  };

  const getFilteredRecords = () => {
    let filtered = attendanceRecords;

    if (filterSubject !== 'all') {
      filtered = filtered.filter(record => record.subject === filterSubject);
    }

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.student_roll && record.student_roll.includes(searchTerm))
      );
    }

    return filtered;
  };

  const getAttendanceStats = (records) => {
    const stats = {
      total: records.length,
      present: records.filter(r => r.is_present && !r.is_late).length,
      absent: records.filter(r => !r.is_present).length,
      late: records.filter(r => r.is_late).length
    };
    return stats;
  };

  const exportAttendance = () => {
    // TODO: Implement export functionality
    const csvData = getFilteredRecords().map(record => ({
      'Student Name': record.student_name,
      'Roll Number': record.student_roll || 'N/A',
      'Subject': record.subject,
      'Status': record.is_present ? (record.is_late ? 'Late' : 'Present') : 'Absent',
      'Remarks': record.remarks || '',
      'Teacher': record.teacher_name,
      'Time': record.time_marked
    }));
    
    console.log('Export data:', csvData);
    alert(`Attendance data for ${formatDateDisplay(selectedDate)} is ready for export`);
  };

  const renderCalendarView = () => {
    const days = getDaysInMonth(calendarDate);
    const monthYear = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance Calendar - {monthYear}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2"></div>;
            }

            const dateKey = formatDateKey(day);
            const hasAttendance = markedDates.has(dateKey);
            const isSelected = formatDateKey(day) === formatDateKey(selectedDate);
            const isToday = formatDateKey(day) === formatDateKey(new Date());

            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day)}
                className={`p-2 text-sm rounded-lg transition-colors relative ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : hasAttendance
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                {day.getDate()}
                {hasAttendance && (
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-green-500'
                  }`}></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Has Attendance
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 rounded-full mr-2"></div>
            Today
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const filteredRecords = getFilteredRecords();
    const stats = getAttendanceStats(filteredRecords);

    return (
      <div className="space-y-6">
        {/* Date and Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Attendance for {formatDateDisplay(selectedDate)}
              </h3>
              <p className="text-sm text-gray-600">
                {batch.name} - {stats.total} students
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                <Calendar size={16} className="inline mr-1" />
                Calendar View
              </button>
              <button
                onClick={exportAttendance}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
              >
                <Download size={16} className="inline mr-1" />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <div className="text-sm text-gray-600">Present</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <div className="text-sm text-gray-600">Late</div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  {canEditRecord() && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={canEditRecord() ? 7 : 6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">Loading attendance records...</div>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={canEditRecord() ? 7 : 6} className="px-6 py-12 text-center">
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <div className="text-gray-500">No attendance records found for this date</div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <User size={16} className="text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {record.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Roll: {record.student_roll || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.subject}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.is_present
                            ? record.is_late
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.is_present
                            ? record.is_late
                              ? <><Clock size={12} className="mr-1" /> Late</>
                              : <><CheckCircle size={12} className="mr-1" /> Present</>
                            : <><XCircle size={12} className="mr-1" /> Absent</>
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.remarks || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.teacher_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.time_marked}
                      </td>
                      {canEditRecord() && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit record"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to Features
        </button>
        
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900">Attendance Records - {batch.name}</h2>
          <p className="text-sm text-gray-600">{students.length} students</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar size={16} className="inline mr-2" />
            Calendar View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={16} className="inline mr-2" />
            Records View
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'calendar' ? renderCalendarView() : renderListView()}

      {/* Edit Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Attendance Record
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Student: {selectedRecord.student_name}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Edit functionality will be implemented in the next update.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRecord;