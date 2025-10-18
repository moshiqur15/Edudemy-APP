import { useState, useEffect } from 'react';
import StudentForm from '../components/forms/StudentForm';
import { studentsAPI } from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  BookOpen,
  GraduationCap,
  X,
  Save,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  UserCheck,
  AlertTriangle,
  Award,
  TrendingUp,
  BarChart3,
  RefreshCcw,
  CheckCircle
} from 'lucide-react';
import BatchAssignmentModal from '../components/batch/BatchAssignmentModal';
import StudentAnalyticsModal from '../components/modals/StudentAnalyticsModal';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Batch assignment state
  const [showBatchAssignment, setShowBatchAssignment] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [batchAssignmentLoading, setBatchAssignmentLoading] = useState(false);
  
  // Analytics state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState({});
  const [priorityAlerts, setPriorityAlerts] = useState({ critical: [], high_priority: [], medium_priority: [] });

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsAPI.getStudents();
      console.log('Students response:', response); // Debug log
      
      // Handle different response formats
      const studentData = response?.students || response?.data?.students || response?.data || response || [];
      setStudents(Array.isArray(studentData) ? studentData : []);
      
      // Load priority alerts for analytics integration
      await loadPriorityAlerts();
    } catch (error) {
      console.error('Error loading students:', error);
      setError(`Failed to load students: ${error.response?.data?.detail || error.message}`);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPriorityAlerts = async () => {
    try {
      const response = await fetch('/api/students/analytics/priority-alerts');
      if (response.ok) {
        const alerts = await response.json();
        setPriorityAlerts(alerts);
      }
    } catch (error) {
      console.error('Error loading priority alerts:', error);
    }
  };
  
  const loadAvailableBatches = async (classFilter = null) => {
    try {
      const url = classFilter 
        ? `/api/students/batch-assignment/available-batches?class_name=${encodeURIComponent(classFilter)}`
        : '/api/students/batch-assignment/available-batches';
      const response = await fetch(url);
      if (response.ok) {
        const batches = await response.json();
        setAvailableBatches(batches);
      }
    } catch (error) {
      console.error('Error loading available batches:', error);
    }
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

  useEffect(() => {
    loadStudents();
  }, []);
  
  // Get unique batches from students for filtering
  const getUniqueBatches = () => {
    const batches = new Set();
    students.forEach(student => {
      if (student.batch_id) {
        // Add batch name if available, otherwise use ID
        batches.add(student.batch?.name || `Batch ${student.batch_id}`);
      }
    });
    return Array.from(batches);
  };

  const uniqueBatches = getUniqueBatches();

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronUp size={14} className="text-blue-600" /> : 
      <ChevronDown size={14} className="text-blue-600" />;
  };

  const getStudentStatus = (student) => {
    // You can enhance this logic based on your requirements
    // For now, using a simple active/inactive logic
    return student.is_active !== false ? 'active' : 'inactive';
  };

  const filteredAndSortedStudents = students
    .filter(student => {
      const matchesSearch = (student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (student.student_reg_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBatch = filterBatch === 'all' || 
                          (student.batch?.name === filterBatch) ||
                          (`Batch ${student.batch_id}` === filterBatch);
      const matchesStatus = statusFilter === 'all' || getStudentStatus(student) === statusFilter;
      return matchesSearch && matchesBatch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = (a.full_name || '').toLowerCase();
          bVal = (b.full_name || '').toLowerCase();
          break;
        case 'rollNumber':
          aVal = a.student_reg_number || '';
          bVal = b.student_reg_number || '';
          break;
        case 'batch':
          aVal = (a.batch?.name || '').toLowerCase();
          bVal = (b.batch?.name || '').toLowerCase();
          break;
        case 'status':
          aVal = getStudentStatus(a);
          bVal = getStudentStatus(b);
          break;
        case 'enrollment':
          aVal = a.admission_date ? new Date(a.admission_date) : new Date(0);
          bVal = b.admission_date ? new Date(b.admission_date) : new Date(0);
          break;
        default:
          aVal = a.full_name || '';
          bVal = b.full_name || '';
      }
      
      if (sortBy === 'enrollment') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const comparison = aVal.localeCompare ? aVal.localeCompare(bVal) : 
                        (aVal < bVal ? -1 : aVal > bVal ? 1 : 0);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.deleteStudent(studentId);
        await loadStudents(); // Refresh the list
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const handleSubmit = async (studentData) => {
    try {
      if (editingStudent) {
        // Update existing student
        await studentsAPI.updateStudent(editingStudent.id, studentData);
      } else {
        // Add new student
        await studentsAPI.createStudent(studentData);
      }
      
      setShowModal(false);
      setEditingStudent(null);
      await loadStudents(); // Refresh the list
    } catch (error) {
      console.error('Error saving student:', error);
      throw error; // Let StudentForm handle the error display
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingStudent(null);
  };
  
  // Batch assignment handlers
  const handleBatchAssignment = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to assign to a batch.');
      return;
    }
    
    await loadAvailableBatches();
    setShowBatchAssignment(true);
  };
  
  const handleAssignToBatch = async (batchId) => {
    setBatchAssignmentLoading(true);
    try {
      let successCount = 0;
      let errors = [];
      
      for (const studentId of selectedStudents) {
        try {
          const response = await fetch(`/api/students/${studentId}/assign-batch/${batchId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            errors.push(`Student ${studentId}: ${errorData.detail}`);
          }
        } catch (error) {
          errors.push(`Student ${studentId}: ${error.message}`);
        }
      }
      
      if (successCount > 0) {
        alert(`Successfully assigned ${successCount} students to batch.`);
        await loadStudents(); // Refresh data
        setSelectedStudents([]);
      }
      
      if (errors.length > 0) {
        console.error('Assignment errors:', errors);
        alert(`Some assignments failed:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...and more' : ''}`);
      }
    } catch (error) {
      console.error('Batch assignment error:', error);
      alert('Failed to assign students to batch. Please try again.');
    } finally {
      setBatchAssignmentLoading(false);
      setShowBatchAssignment(false);
    }
  };
  
  const handleSelectStudent = (studentId, checked) => {
    setSelectedStudents(prev => 
      checked 
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    );
  };
  
  const handleSelectAll = (checked) => {
    setSelectedStudents(
      checked ? filteredAndSortedStudents.map(s => s.id) : []
    );
  };
  
  // Analytics handlers
  const handleViewAnalytics = async (student) => {
    setSelectedStudentForAnalytics(student);
    await loadStudentAnalytics(student.id);
    setShowAnalytics(true);
  };
  
  const getStudentPriorityLevel = (studentId) => {
    if (priorityAlerts.critical?.some(alert => alert.student_id === studentId)) {
      return 'critical';
    }
    if (priorityAlerts.high_priority?.some(alert => alert.student_id === studentId)) {
      return 'high';
    }
    if (priorityAlerts.medium_priority?.some(alert => alert.student_id === studentId)) {
      return 'medium';
    }
    return null;
  };
  
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'high':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'medium':
        return <TrendingUp size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Priority Alerts Summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-red-600 font-medium">{priorityAlerts.critical?.length || 0} Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" />
              <span className="text-orange-600 font-medium">{priorityAlerts.high_priority?.length || 0} High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-500" />
              <span className="text-yellow-600 font-medium">{priorityAlerts.medium_priority?.length || 0} Needs Attention</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Batch Assignment Button */}
            {selectedStudents.length > 0 && (
              <button
                onClick={handleBatchAssignment}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <UserCheck size={16} className="mr-2" />
                Assign to Batch ({selectedStudents.length})
              </button>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={() => {
                loadStudents();
                loadPriorityAlerts();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <RefreshCcw size={16} className="mr-2" />
              Refresh
            </button>
            
            {/* Add Student Button */}
            <button
              onClick={handleAddStudent}
              className="btn-primary inline-flex items-center px-4 py-2"
            >
              <Plus size={20} className="mr-2" />
              Add New Student
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, email, or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Batch Filter */}
            <div className="sm:w-48">
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Batches</option>
                {uniqueBatches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredAndSortedStudents.length && filteredAndSortedStudents.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Student</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('rollNumber')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Contact / Roll No.</span>
                      {getSortIcon('rollNumber')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('batch')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Batch</span>
                      {getSortIcon('batch')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('enrollment')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Enrollment</span>
                      {getSortIcon('enrollment')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredAndSortedStudents.map((student) => {
                    const priorityLevel = getStudentPriorityLevel(student.id);
                    const isSelected = selectedStudents.includes(student.id);
                    
                    return (
                    <tr key={student.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3 relative">
                            {student.full_name ? student.full_name.charAt(0) : 'S'}
                            {priorityLevel && (
                              <div className="absolute -top-1 -right-1">
                                {getPriorityIcon(priorityLevel)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {student.full_name || 'N/A'}
                              </div>
                              {priorityLevel && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  priorityLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                  priorityLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {priorityLevel === 'critical' ? 'Critical' : 
                                   priorityLevel === 'high' ? 'High Priority' : 'Needs Attention'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.student_reg_number || 'No ID'} | {student.class_name || 'No Class'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          Roll: {student.student_reg_number || 'N/A'} | 
                          Ph: {student.phone || student.father_contact || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.batch?.name || 'No Batch'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getStudentStatus(student) === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getStudentStatus(student) === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewAnalytics(student)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="View Analytics"
                          >
                            <BarChart3 size={16} />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="Edit Student"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete Student"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredAndSortedStudents.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterBatch !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first student.'
                }
              </p>
              {!searchTerm && filterBatch === 'all' && (
                <button onClick={handleAddStudent} className="btn-primary">
                  <Plus size={20} className="mr-2" />
                  Add First Student
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <StudentForm
                  student={editingStudent}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  mode={editingStudent ? 'edit' : 'create'}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Batch Assignment Modal */}
        {showBatchAssignment && (
          <BatchAssignmentModal
            students={selectedStudents.map(id => students.find(s => s.id === id)).filter(Boolean)}
            availableBatches={availableBatches}
            onAssign={handleAssignToBatch}
            onClose={() => setShowBatchAssignment(false)}
            loading={batchAssignmentLoading}
          />
        )}
        
        {/* Student Analytics Modal */}
        {showAnalytics && selectedStudentForAnalytics && (
          <StudentAnalyticsModal
            student={selectedStudentForAnalytics}
            analytics={studentAnalytics[selectedStudentForAnalytics.id]}
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </div>
  );
}
