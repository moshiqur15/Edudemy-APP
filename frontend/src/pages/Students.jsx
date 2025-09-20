import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
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
  Save
} from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsAPI.getStudents();
      console.log('Students response:', response); // Debug log
      
      // Handle different response formats
      const studentData = response?.students || response?.data?.students || response?.data || response || [];
      setStudents(Array.isArray(studentData) ? studentData : []);
    } catch (error) {
      console.error('Error loading students:', error);
      setError(`Failed to load students: ${error.response?.data?.detail || error.message}`);
      setStudents([]);
    } finally {
      setLoading(false);
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.student_reg_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = filterBatch === 'all' || 
                        (student.batch?.name === filterBatch) ||
                        (`Batch ${student.batch_id}` === filterBatch);
    return matchesSearch && matchesBatch;
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
            <p className="text-gray-600">Manage student profiles and enrollment information</p>
          </div>
          <button
            onClick={handleAddStudent}
            className="btn-primary inline-flex items-center px-4 py-2"
          >
            <Plus size={20} className="mr-2" />
            Add New Student
          </button>
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
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment
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
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {student.full_name ? student.full_name.charAt(0) : 'S'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.full_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.student_reg_number || 'No ID'} | {student.class_name || 'No Class'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{student.phone || student.father_contact || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.batch?.name || 'No Batch'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
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

          {!loading && filteredStudents.length === 0 && (
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
      </div>
    </Layout>
  );
}
