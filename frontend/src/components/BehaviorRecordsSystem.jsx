import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, behaviorAPI } from '../services/api';
import { useDebounce, useOptimizedSearch, useAsyncOperation } from '../utils/performance';
import logger from '../utils/logger';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Heart,
  Zap,
  Shield,
  Target,
  BookOpen,
  User,
  Phone,
  Mail,
  MessageSquare,
  Bell,
  Send,
  Download,
  Upload,
  BarChart3,
  PieChart,
  FileText,
  Save,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Info,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Flag,
  RefreshCw,
  Settings
} from 'lucide-react';

// Behavior Record Modal Component
const BehaviorRecordModal = ({ isOpen, onClose, onSave, record = null, students }) => {
  const [formData, setFormData] = useState({
    student_id: record?.student_id || '',
    type: record?.type || 'positive', // positive, negative, neutral
    category: record?.category || 'academic',
    severity: record?.severity || 'low',
    title: record?.title || '',
    description: record?.description || '',
    date: record?.date || new Date().toISOString().split('T')[0],
    time: record?.time || new Date().toTimeString().slice(0, 5),
    location: record?.location || '',
    witnesses: record?.witnesses || [],
    action_taken: record?.action_taken || '',
    follow_up_required: record?.follow_up_required || false,
    parent_notified: record?.parent_notified || false,
    resolution_status: record?.resolution_status || 'pending'
  });

  const [errors, setErrors] = useState({});

  const behaviorTypes = [
    { value: 'positive', label: 'Positive Behavior', color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'negative', label: 'Negative Behavior', color: 'text-red-600', bg: 'bg-red-50' },
    { value: 'neutral', label: 'General Observation', color: 'text-gray-600', bg: 'bg-gray-50' }
  ];

  const categories = [
    { value: 'academic', label: 'Academic Performance', icon: BookOpen },
    { value: 'social', label: 'Social Interaction', icon: Users },
    { value: 'discipline', label: 'Discipline', icon: Shield },
    { value: 'participation', label: 'Class Participation', icon: Target },
    { value: 'leadership', label: 'Leadership', icon: Star },
    { value: 'creativity', label: 'Creativity', icon: Zap },
    { value: 'attendance', label: 'Attendance', icon: Calendar },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const locations = [
    'Classroom', 'Library', 'Playground', 'Cafeteria', 'Hallway', 'Assembly Hall', 
    'Sports Ground', 'Laboratory', 'Art Room', 'Music Room', 'Other'
  ];

  useEffect(() => {
    if (record) {
      setFormData({
        ...record,
        date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: record.time || new Date().toTimeString().slice(0, 5),
        witnesses: record.witnesses || []
      });
    }
  }, [record]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.student_id) newErrors.student_id = 'Student selection is required';
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      id: record?.id || Date.now(),
      created_at: record?.created_at || new Date().toISOString()
    });
    
    onClose();
  };

  const handleWitnessAdd = () => {
    setFormData({
      ...formData,
      witnesses: [...formData.witnesses, '']
    });
  };

  const handleWitnessChange = (index, value) => {
    const newWitnesses = [...formData.witnesses];
    newWitnesses[index] = value;
    setFormData({ ...formData, witnesses: newWitnesses });
  };

  const handleWitnessRemove = (index) => {
    const newWitnesses = formData.witnesses.filter((_, i) => i !== index);
    setFormData({ ...formData, witnesses: newWitnesses });
  };

  if (!isOpen) return null;

  const selectedType = behaviorTypes.find(t => t.value === formData.type);
  const selectedCategory = categories.find(c => c.value === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {record ? 'Edit Behavior Record' : 'Add New Behavior Record'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.student_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} - {student.student_id}
                    </option>
                  ))}
                </select>
                {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Behavior Type *</label>
                <div className="grid grid-cols-1 gap-2">
                  {behaviorTypes.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mr-2"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm ${type.bg} ${type.color}`}>
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {formData.type === 'negative' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Incident Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Brief title of the behavior incident"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Detailed description of the behavior incident..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Witnesses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Witnesses</label>
              <button
                type="button"
                onClick={handleWitnessAdd}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Witness
              </button>
            </div>
            <div className="space-y-2">
              {formData.witnesses.map((witness, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={witness}
                    onChange={(e) => handleWitnessChange(index, e.target.value)}
                    placeholder="Witness name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleWitnessRemove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions and Follow-up */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
              <textarea
                value={formData.action_taken}
                onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any immediate actions taken..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.follow_up_required}
                    onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Follow-up Required</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.parent_notified}
                    onChange={(e) => setFormData({ ...formData, parent_notified: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Parent Notified</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Status</label>
                <select
                  value={formData.resolution_status}
                  onChange={(e) => setFormData({ ...formData, resolution_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save size={16} className="mr-2" />
              {record ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Behavior Analytics Component
const BehaviorAnalytics = ({ records, students, onClose }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedStudent, setSelectedStudent] = useState('all');

  const getAnalyticsData = () => {
    let filteredRecords = records;
    
    // Filter by time range
    const now = new Date();
    const timeRangeDate = new Date();
    switch (timeRange) {
      case 'week':
        timeRangeDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeRangeDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        timeRangeDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        timeRangeDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    filteredRecords = filteredRecords.filter(record => 
      new Date(record.date) >= timeRangeDate
    );

    // Filter by student
    if (selectedStudent !== 'all') {
      filteredRecords = filteredRecords.filter(record => 
        record.student_id === selectedStudent
      );
    }

    const totalRecords = filteredRecords.length;
    const positiveRecords = filteredRecords.filter(r => r.type === 'positive').length;
    const negativeRecords = filteredRecords.filter(r => r.type === 'negative').length;
    const neutralRecords = filteredRecords.filter(r => r.type === 'neutral').length;

    const categoryBreakdown = {};
    const severityBreakdown = {};
    
    filteredRecords.forEach(record => {
      categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + 1;
      if (record.type === 'negative') {
        severityBreakdown[record.severity] = (severityBreakdown[record.severity] || 0) + 1;
      }
    });

    return {
      totalRecords,
      positiveRecords,
      negativeRecords,
      neutralRecords,
      categoryBreakdown,
      severityBreakdown,
      positivePercentage: totalRecords > 0 ? ((positiveRecords / totalRecords) * 100).toFixed(1) : 0,
      negativePercentage: totalRecords > 0 ? ((negativeRecords / totalRecords) * 100).toFixed(1) : 0
    };
  };

  const analytics = getAnalyticsData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Behavior Analytics</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Students</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalRecords}</p>
                  <p className="text-xs text-gray-600">Total Records</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <ThumbsUp className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{analytics.positiveRecords}</p>
                  <p className="text-xs text-gray-600">Positive ({analytics.positivePercentage}%)</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center">
                <ThumbsDown className="w-8 h-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{analytics.negativeRecords}</p>
                  <p className="text-xs text-gray-600">Negative ({analytics.negativePercentage}%)</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-gray-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{analytics.neutralRecords}</p>
                  <p className="text-xs text-gray-600">Observations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(analytics.categoryBreakdown).map(([category, count]) => {
                  const percentage = ((count / analytics.totalRecords) * 100).toFixed(1);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Severity Breakdown (for negative behaviors) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Breakdown</h3>
              {Object.keys(analytics.severityBreakdown).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(analytics.severityBreakdown).map(([severity, count]) => {
                    const percentage = ((count / analytics.negativeRecords) * 100).toFixed(1);
                    const severityColors = {
                      low: 'bg-green-600',
                      medium: 'bg-yellow-600',
                      high: 'bg-orange-600',
                      critical: 'bg-red-600'
                    };
                    
                    return (
                      <div key={severity} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {severity}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${severityColors[severity]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No negative behaviors to analyze</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Behavior Records Component
export default function BehaviorRecordsSystem({ batch, students, onBack }) {
  const { user, hasRole } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    loadBehaviorRecords();
  }, [batch]);

  const loadBehaviorRecords = async () => {
    try {
      setLoading(true);
      const response = await behaviorAPI.getBehaviorRecords(batch?.id);
      
      let behaviorData = Array.isArray(response) ? response : (response?.data || []);
      setRecords(behaviorData.length > 0 ? behaviorData : generateMockRecords());
    } catch (error) {
      logger.error('Error loading behavior records:', error);
      setRecords(generateMockRecords());
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecords = () => {
    const types = ['positive', 'negative', 'neutral'];
    const categories = ['academic', 'social', 'discipline', 'participation', 'leadership', 'creativity'];
    const severities = ['low', 'medium', 'high'];
    const locations = ['Classroom', 'Library', 'Playground', 'Cafeteria', 'Hallway'];
    
    const titles = {
      positive: [
        'Excellent Class Participation',
        'Helped Classmate with Assignment',
        'Outstanding Project Presentation',
        'Showed Leadership in Group Work',
        'Demonstrated Creativity in Art Class'
      ],
      negative: [
        'Disruptive Behavior in Class',
        'Did Not Complete Homework',
        'Inappropriate Language Use',
        'Late Arrival to Class',
        'Conflict with Peer'
      ],
      neutral: [
        'General Observation',
        'Parent Meeting Discussion',
        'Academic Progress Note',
        'Attendance Pattern Note',
        'Health Related Observation'
      ]
    };

    return Array.from({ length: 25 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      return {
        id: i + 1,
        student_id: students[Math.floor(Math.random() * students.length)]?.id || 1,
        type,
        category,
        severity: type === 'negative' ? severities[Math.floor(Math.random() * severities.length)] : 'low',
        title: titles[type][Math.floor(Math.random() * titles[type].length)],
        description: `Detailed description of the ${type} behavior incident observed on ${date.toDateString()}.`,
        date: date.toISOString().split('T')[0],
        time: `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 6) * 10}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        witnesses: Math.random() > 0.5 ? [`Teacher ${Math.floor(Math.random() * 5) + 1}`] : [],
        action_taken: type === 'negative' ? 'Discussed with student and provided guidance' : 'Recognized and praised the positive behavior',
        follow_up_required: type === 'negative' && Math.random() > 0.5,
        parent_notified: Math.random() > 0.6,
        resolution_status: ['pending', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)],
        created_at: date.toISOString(),
        created_by: user?.full_name || 'System'
      };
    });
  };

  const handleSaveRecord = async (recordData) => {
    try {
      if (selectedRecord) {
        // Update existing record
        const updatedRecord = { ...recordData, updated_at: new Date().toISOString() };
        await behaviorAPI.updateBehaviorRecord(selectedRecord.id, updatedRecord);
        setRecords(prev => prev.map(r => r.id === selectedRecord.id ? updatedRecord : r));
      } else {
        // Create new record
        const newRecord = { ...recordData, created_by: user?.full_name || 'System' };
        await behaviorAPI.createBehaviorRecord(newRecord);
        setRecords(prev => [newRecord, ...prev]);
      }
      
      setSelectedRecord(null);
      setShowRecordModal(false);
    } catch (error) {
      logger.error('Error saving behavior record:', error);
      // In demo mode, still update local state
      if (selectedRecord) {
        const updatedRecord = { ...recordData, updated_at: new Date().toISOString() };
        setRecords(prev => prev.map(r => r.id === selectedRecord.id ? updatedRecord : r));
      } else {
        const newRecord = { ...recordData, created_by: user?.full_name || 'System' };
        setRecords(prev => [newRecord, ...prev]);
      }
      setSelectedRecord(null);
      setShowRecordModal(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this behavior record?')) return;
    
    try {
      await behaviorAPI.deleteBehaviorRecord(recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (error) {
      logger.error('Error deleting behavior record:', error);
      // In demo mode, still update local state
      setRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

  const getFilteredRecords = () => {
    return records.filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getStudentName(record.student_id).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || record.type === filterType;
      const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.full_name : 'Unknown Student';
  };

  const getBehaviorTypeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRecordStats = () => {
    const total = records.length;
    const positive = records.filter(r => r.type === 'positive').length;
    const negative = records.filter(r => r.type === 'negative').length;
    const pending = records.filter(r => r.resolution_status === 'pending').length;
    
    return { total, positive, negative, pending };
  };

  const canManageBehavior = hasRole(['superadmin', 'admin', 'academics', 'teacher']);
  const filteredRecords = getFilteredRecords();
  const stats = getRecordStats();

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading behavior records...</p>
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
            Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Behavior Records</h2>
            <p className="text-sm text-gray-600">
              {batch?.name} - Track student behavior and progress
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <BarChart3 size={16} className="mr-2" />
            Analytics
          </button>
          
          {canManageBehavior && (
            <button
              onClick={() => {
                setSelectedRecord(null);
                setShowRecordModal(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Add Record
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Records</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ThumbsUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.positive}</p>
              <p className="text-xs text-gray-600">Positive</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.negative}</p>
              <p className="text-xs text-gray-600">Negative</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="social">Social</option>
              <option value="discipline">Discipline</option>
              <option value="participation">Participation</option>
              <option value="leadership">Leadership</option>
              <option value="creativity">Creativity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {getStudentName(record.student_id).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{getStudentName(record.student_id)}</div>
                        <div className="text-sm text-gray-500 capitalize">{record.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBehaviorTypeColor(record.type)}`}>
                      {record.type === 'positive' && <ThumbsUp size={12} className="mr-1" />}
                      {record.type === 'negative' && <ThumbsDown size={12} className="mr-1" />}
                      {record.type === 'neutral' && <Eye size={12} className="mr-1" />}
                      {record.type}
                    </span>
                    {record.type === 'negative' && record.severity && (
                      <div className={`text-xs mt-1 ${getSeverityColor(record.severity)} capitalize`}>
                        {record.severity}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{record.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{record.description}</div>
                      {record.location && (
                        <div className="text-xs text-gray-400 mt-1">{record.location}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                    {record.time && (
                      <div className="text-xs text-gray-500">{record.time}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.resolution_status === 'resolved' ? 'bg-green-100 text-green-800' :
                      record.resolution_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      record.resolution_status === 'escalated' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.resolution_status.replace('_', ' ')}
                    </span>
                    {record.follow_up_required && (
                      <div className="text-xs text-orange-600 mt-1">Follow-up needed</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          // Show details modal (you can implement this)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} />
                      </button>
                      {canManageBehavior && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowRecordModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Behavior Records Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your search criteria.' 
                : 'Get started by adding your first behavior record.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BehaviorRecordModal
        isOpen={showRecordModal}
        onClose={() => {
          setShowRecordModal(false);
          setSelectedRecord(null);
        }}
        onSave={handleSaveRecord}
        record={selectedRecord}
        students={students}
      />

      {showAnalytics && (
        <BehaviorAnalytics
          records={records}
          students={students}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
}