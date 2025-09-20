import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TeacherForm from '../components/forms/TeacherForm';
import { teachersAPI } from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck, 
  Mail, 
  Phone, 
  GraduationCap,
  BookOpen,
  X,
  Save,
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [error, setError] = useState(null);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teachersAPI.getTeachers();
      console.log('Teachers response:', response); // Debug log
      
      // Handle different response formats - backend returns array of TeacherRead objects
      let teacherData;
      if (Array.isArray(response)) {
        // Direct array response
        teacherData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // Wrapped in data property
        teacherData = response.data;
      } else if (response?.teachers && Array.isArray(response.teachers)) {
        // Wrapped in teachers property
        teacherData = response.teachers;
      } else {
        // Fallback
        teacherData = [];
      }
      setTeachers(teacherData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      
      // Check if it's a server error (500) and provide helpful message
      if (error.response?.status === 500) {
        setError('Server error: The backend database may need setup. Please check if the database is properly migrated and the backend server is running correctly.');
      } else if (error.message === 'Network Error') {
        setError('Network Error: Cannot connect to the backend server. Please ensure the backend is running on http://127.0.0.1:8000');
      } else {
        setError(`Failed to load teachers: ${error.response?.data?.detail || error.message}`);
      }
      
      // Set empty array so UI doesn't break
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const subjects = ['Bangla', 'English', 'I.C.T', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Multi'];

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.first_name || teacher.firstName || ''} ${teacher.last_name || teacher.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.subject || teacher.subjects || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || (teacher.subject || teacher.subjects) === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowModal(true);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setShowModal(true);
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      try {
        await teachersAPI.deleteTeacher(teacherId);
        await loadTeachers(); // Refresh the list
        alert('Teacher deleted successfully');
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher. Please try again.');
      }
    }
  };

  const handleSubmit = async (teacherData) => {
    try {
      if (editingTeacher) {
        // Update existing teacher
        await teachersAPI.updateTeacher(editingTeacher.id, teacherData);
        alert('Teacher updated successfully');
      } else {
        // Add new teacher
        await teachersAPI.createTeacher(teacherData);
        alert('Teacher created successfully');
      }
      
      setShowModal(false);
      setEditingTeacher(null);
      await loadTeachers(); // Refresh the list
    } catch (error) {
      console.error('Error saving teacher:', error);
      throw error; // Let TeacherForm handle the error display
    }
  };
  
  const handleCancel = () => {
    setShowModal(false);
    setEditingTeacher(null);
  };

  // Helper functions for backward compatibility
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on leave':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
            <p className="text-gray-600">Manage teacher profiles and assignments</p>
          </div>
          <button
            onClick={handleAddTeacher}
            className="btn-primary inline-flex items-center px-4 py-2"
          >
            <Plus size={20} className="mr-2" />
            Add New Teacher
          </button>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertCircle size={20} className="mr-2" />
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
                placeholder="Search teachers by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <div className="sm:w-48">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {(teacher.first_name || teacher.firstName || 'T').charAt(0)}{(teacher.last_name || teacher.lastName || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.first_name || teacher.firstName} {teacher.last_name || teacher.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{teacher.qualification || 'No qualification listed'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{teacher.email}</div>
                        <div className="text-sm text-gray-500">{teacher.phone || teacher.contact_number || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{teacher.subjects || teacher.subject || 'No subject'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {teacher.experience_years || teacher.experience || 0} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{teacher.activeBatches || 0} batches</div>
                        <div className="text-sm text-gray-500">{teacher.totalStudents || 0} students</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (teacher.is_active !== undefined ? teacher.is_active : teacher.status === 'Active') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.is_active !== undefined 
                            ? (teacher.is_active ? 'Active' : 'Inactive')
                            : (teacher.status || 'Unknown')
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterSubject !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first teacher.'
                }
              </p>
              {!searchTerm && filterSubject === 'all' && (
                <button onClick={handleAddTeacher} className="btn-primary">
                  <Plus size={20} className="mr-2" />
                  Add First Teacher
                </button>
              )}
            </div>
          )}
        </div>

        {/* Teacher Form Modal */}
        {showModal && (
          <TeacherForm
            teacher={editingTeacher}
            mode={editingTeacher ? 'edit' : 'create'}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </Layout>
  );
}
