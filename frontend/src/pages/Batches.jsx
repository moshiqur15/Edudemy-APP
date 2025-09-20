import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import BatchForm from '../components/forms/BatchForm';
import BatchStudentAssignment from '../components/batch/BatchStudentAssignment';
import { academicsAPI } from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen,
  Calendar,
  Clock,
  User,
  GraduationCap,
  MapPin,
  UserPlus,
  Filter
} from 'lucide-react';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [versionFilter, setVersionFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);

  const classOptions = [
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC',
    'HSC 1st Year', 'HSC 2nd Year'
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await academicsAPI.getBatches();
      console.log('Batches response:', response); // Debug log
      // Handle different response formats - the API returns an array of BatchWithStats objects
      let batchData;
      if (Array.isArray(response)) {
        // Direct array response
        batchData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // Wrapped in data property
        batchData = response.data;
      } else if (response?.batches && Array.isArray(response.batches)) {
        // Wrapped in batches property
        batchData = response.batches;
      } else {
        // Fallback
        batchData = [];
      }
      setBatches(batchData);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
      
      // Provide specific error messages based on error type
      let errorMessage;
      if (error.response?.status === 500) {
        errorMessage = 'Server Error: The backend database may need setup. Please check if the database is properly migrated and the backend server is running correctly.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network Error: Cannot connect to the backend server. Please ensure the backend is running on http://127.0.0.1:8000';
      } else {
        errorMessage = 'Error loading batches: ' + (error.response?.data?.detail || error.message);
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(batch => {
    const batchData = batch.batch || batch;
    const matchesSearch = batchData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batchData.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batchData.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batchData.class_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || batchData.status === statusFilter;
    const matchesClass = !classFilter || batchData.class_name === classFilter;
    const matchesVersion = !versionFilter || batchData.version === versionFilter;
    
    return matchesSearch && matchesStatus && matchesClass && matchesVersion;
  });

  const handleAddBatch = () => {
    setEditingBatch(null);
    setShowModal(true);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch? This will deactivate the batch but preserve student records.')) {
      try {
        await academicsAPI.deleteBatch(batchId);
        await fetchBatches();
        alert('Batch deleted successfully');
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Error deleting batch');
      }
    }
  };

  const handleAssignStudents = (batch) => {
    const batchId = batch.batch?.id || batch.id;
    setSelectedBatchId(batchId);
    setShowStudentAssignment(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      console.log('Saving batch data:', formData); // Debug log
      
      if (editingBatch) {
        const batchId = editingBatch.batch?.id || editingBatch.id;
        console.log('Updating batch ID:', batchId); // Debug log
        const result = await academicsAPI.updateBatch(batchId, formData);
        console.log('Update result:', result); // Debug log
        alert('Batch updated successfully');
      } else {
        console.log('Creating new batch'); // Debug log
        const result = await academicsAPI.createBatch(formData);
        console.log('Create result:', result); // Debug log
        alert('Batch created successfully');
      }
      
      setShowModal(false);
      setEditingBatch(null);
      await fetchBatches();
    } catch (error) {
      console.error('Error saving batch:', error);
      console.error('Error details:', error.response); // Debug log
      
      let errorMessage = 'Error saving batch';
      if (error.response?.data?.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      } else if (error.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
      throw error; // Re-throw to let BatchForm handle it
    }
  };

  const handleFormCancel = () => {
    setShowModal(false);
    setEditingBatch(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'upcoming': return 'status-pending';
      case 'completed': return 'status-inactive';
      case 'cancelled': return 'status-inactive';
      default: return 'status-inactive';
    }
  };

  const getCapacityColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
            <p className="text-gray-600">Create and manage student batches and classes</p>
          </div>
          <button
            onClick={handleAddBatch}
            className="btn-primary inline-flex items-center px-4 py-2"
          >
            <Plus size={20} className="mr-2" />
            Create New Batch
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search batches by name, code, course, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {classOptions.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              
              <select
                value={versionFilter}
                onChange={(e) => setVersionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Versions</option>
                <option value="BV">BV</option>
                <option value="EV">EV</option>
              </select>
            </div>
          </div>
          
          {(statusFilter || classFilter || versionFilter) && (
            <div className="mt-3 flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Active filters:</span>
              {statusFilter && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Status: {statusOptions.find(s => s.value === statusFilter)?.label}
                </span>
              )}
              {classFilter && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Class: {classFilter}
                </span>
              )}
              {versionFilter && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Version: {versionFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setStatusFilter('');
                  setClassFilter('');
                  setVersionFilter('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            filteredBatches.map((batch) => {
              const batchData = batch.batch || batch;
              const studentCount = batchData.student_count || (batch.students ? batch.students.length : 0);
              
              return (
                <div key={batchData.id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{batchData.name}</h3>
                      <p className="text-sm text-gray-600">{batchData.code} • {batchData.class_name} ({batchData.version})</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(batchData.status)}`}>
                      {batchData.status?.charAt(0).toUpperCase() + batchData.status?.slice(1)}
                    </span>
                  </div>

                  {batchData.course && (
                    <p className="text-sm text-gray-600 mb-3">
                      <GraduationCap size={14} className="inline mr-1" />
                      {batchData.course}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    {batchData.time_slot && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-2" />
                        {batchData.time_slot}
                      </div>
                    )}
                    {batchData.schedule_days && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {JSON.parse(batchData.schedule_days || '[]').join(', ')}
                      </div>
                    )}
                    {(batchData.start_date || batchData.end_date) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {batchData.start_date ? new Date(batchData.start_date).toLocaleDateString() : 'TBD'} - {batchData.end_date ? new Date(batchData.end_date).toLocaleDateString() : 'TBD'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Students: </span>
                      <span className={`font-medium ${getCapacityColor(studentCount, batchData.max_students)}`}>
                        {studentCount}/{batchData.max_students}
                      </span>
                    </div>
                    {batchData.fee_amount && (
                      <div className="text-sm font-medium text-gray-900">
                        ৳{parseFloat(batchData.fee_amount).toLocaleString()}
                        {batchData.discount_percentage > 0 && (
                          <span className="text-xs text-green-600 ml-1">({batchData.discount_percentage}% off)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full ${
                        (studentCount / batchData.max_students) * 100 >= 90
                          ? 'bg-red-500'
                          : (studentCount / batchData.max_students) * 100 >= 75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((studentCount / batchData.max_students) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAssignStudents(batch)}
                      className="btn-primary text-sm flex-1 py-2"
                    >
                      <UserPlus size={16} className="mr-1" />
                      Manage Students
                    </button>
                    <button
                      onClick={() => handleEditBatch(batch)}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      title="Edit batch"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(batchData.id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                      title="Delete batch"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && filteredBatches.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first batch.'
              }
            </p>
            {!searchTerm && (
              <button onClick={handleAddBatch} className="btn-primary">
                <Plus size={20} className="mr-2" />
                Create First Batch
              </button>
            )}
          </div>
        )}

        {/* Batch Form Modal */}
        {showModal && (
          <BatchForm
            batch={editingBatch}
            mode={editingBatch ? 'edit' : 'create'}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}

        {/* Student Assignment Modal */}
        {showStudentAssignment && (
          <BatchStudentAssignment
            batchId={selectedBatchId}
            onClose={() => {
              setShowStudentAssignment(false);
              setSelectedBatchId(null);
            }}
            onUpdate={fetchBatches}
          />
        )}
      </div>
    </Layout>
  );
}
