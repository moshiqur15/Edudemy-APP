import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI, usersAPI } from '../services/api';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Search,
  Filter,
  Download,
  Bell,
  CheckCircle,
  AlertCircle,
  BookOpen,
  User,
  MapPin,
  Timer,
  Award,
  BarChart3,
  Settings,
  Send,
  Mail,
  Phone,
  MessageSquare,
  UserPlus,
  GraduationCap,
  ClipboardList,
  Printer,
  Upload,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Target
} from 'lucide-react';

// Exam Creation/Edit Modal
const ExamModal = ({ exam, isOpen, onClose, onSave, classes, teachers }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'monthly', // daily, weekly, monthly, final, surprise
    subject: '',
    class_id: '',
    batch_id: '',
    date: '',
    start_time: '',
    end_time: '',
    duration: 60,
    total_marks: 100,
    passing_marks: 40,
    venue: '',
    instructions: '',
    syllabus: '',
    exam_type: 'written', // written, oral, practical, online
    difficulty_level: 'medium', // easy, medium, hard
    invigilator_ids: [],
    guard_ids: [],
    materials_allowed: [],
    status: 'scheduled'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (exam) {
      setFormData({
        ...exam,
        date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : '',
        start_time: exam.start_time || '',
        end_time: exam.end_time || '',
        invigilator_ids: exam.invigilator_ids || [],
        guard_ids: exam.guard_ids || [],
        materials_allowed: exam.materials_allowed || []
      });
    } else {
      // Reset form for new exam
      setFormData({
        title: '',
        type: 'monthly',
        subject: '',
        class_id: '',
        batch_id: '',
        date: '',
        start_time: '',
        end_time: '',
        duration: 60,
        total_marks: 100,
        passing_marks: 40,
        venue: '',
        instructions: '',
        syllabus: '',
        exam_type: 'written',
        difficulty_level: 'medium',
        invigilator_ids: [],
        guard_ids: [],
        materials_allowed: [],
        status: 'scheduled'
      });
    }
  }, [exam, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.class_id) newErrors.class_id = 'Class is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.venue) newErrors.venue = 'Venue is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {exam ? 'Edit Exam' : 'Create New Exam'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Mathematics Monthly Test"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily Test</option>
                    <option value="weekly">Weekly Test</option>
                    <option value="monthly">Monthly Exam</option>
                    <option value="final">Final Exam</option>
                    <option value="surprise">Surprise Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Format</label>
                  <select
                    value={formData.exam_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, exam_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="written">Written</option>
                    <option value="oral">Oral</option>
                    <option value="practical">Practical</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Mathematics"
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_id: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.class_id ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                {errors.class_id && <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>}
              </div>
            </div>

            {/* Schedule & Venue */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Schedule & Venue</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.start_time ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.end_time ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.venue ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Room 101, Main Hall"
                />
                {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="15"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_marks: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="10"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={formData.passing_marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, passing_marks: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max={formData.total_marks}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Staff Assignment</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invigilators</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {teachers.map(teacher => (
                    <label key={teacher.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.invigilator_ids.includes(teacher.id)}
                        onChange={(e) => handleArrayChange('invigilator_ids', teacher.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{teacher.full_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guards</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {teachers.map(teacher => (
                    <label key={teacher.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.guard_ids.includes(teacher.id)}
                        onChange={(e) => handleArrayChange('guard_ids', teacher.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{teacher.full_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Instructions for students during the exam..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus/Topics</label>
              <textarea
                value={formData.syllabus}
                onChange={(e) => setFormData(prev => ({ ...prev, syllabus: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Topics/chapters to be covered in the exam..."
              />
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
              {exam ? 'Update Exam' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Exam Details Modal
const ExamDetailsModal = ({ exam, isOpen, onClose, onEdit, onDelete, canEdit }) => {
  if (!isOpen || !exam) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'daily': return 'bg-purple-100 text-purple-800';
      case 'weekly': return 'bg-indigo-100 text-indigo-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'final': return 'bg-red-100 text-red-800';
      case 'surprise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{exam.title}</h2>
          <div className="flex items-center space-x-2">
            {canEdit && (
              <>
                <button
                  onClick={() => onEdit(exam)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => onDelete(exam.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Subject:</span>
                  <p className="font-medium text-gray-900">{exam.subject}</p>
                </div>
                <div>
                  <span className="text-gray-600">Class:</span>
                  <p className="font-medium text-gray-900">{exam.class_name || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(exam.type)}`}>
                    {exam.type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Format:</span>
                  <p className="font-medium text-gray-900">{exam.exam_type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Marks:</span>
                  <p className="font-medium text-gray-900">{exam.total_marks}</p>
                </div>
                <div>
                  <span className="text-gray-600">Passing Marks:</span>
                  <p className="font-medium text-gray-900">{exam.passing_marks}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Schedule & Venue</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <CalendarDays size={16} className="mr-2 text-gray-600" />
                  <span>{new Date(exam.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-600" />
                  <span>{exam.start_time} - {exam.end_time} ({exam.duration} minutes)</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-600" />
                  <span>{exam.venue}</span>
                </div>
              </div>
            </div>

            {exam.instructions && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{exam.instructions}</p>
              </div>
            )}

            {exam.syllabus && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Syllabus/Topics</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{exam.syllabus}</p>
              </div>
            )}
          </div>

          {/* Status & Staff */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(exam.status)}`}>
                {exam.status}
              </span>
            </div>

            {exam.invigilators && exam.invigilators.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <UserCheck size={16} className="mr-2" />
                  Invigilators
                </h3>
                <div className="space-y-2">
                  {exam.invigilators.map((invigilator, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      {invigilator.full_name || invigilator.name || `Invigilator ${index + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {exam.guards && exam.guards.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users size={16} className="mr-2" />
                  Guards
                </h3>
                <div className="space-y-2">
                  {exam.guards.map((guard, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      {guard.full_name || guard.name || `Guard ${index + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center">
                  <Bell size={14} className="mr-2" />
                  Send Reminder
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded flex items-center">
                  <Download size={14} className="mr-2" />
                  Export Details
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded flex items-center">
                  <FileText size={14} className="mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Exam Management Component
export default function ExamManagementSystem({ onBack }) {
  const { user, hasRole } = useAuth();
  const [currentView, setCurrentView] = useState('list'); // list, calendar, analytics
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load exams, classes, and teachers data
      await Promise.all([
        loadExams(),
        loadClasses(),
        loadTeachers()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      const response = await academicsAPI.getExams();
      
      // Handle different response formats
      let examData = [];
      if (Array.isArray(response)) {
        examData = response;
      } else if (response?.data) {
        examData = Array.isArray(response.data) ? response.data : [];
      }

      setExams(examData.length > 0 ? examData : generateMockExams());
    } catch (error) {
      console.error('Error loading exams:', error);
      setExams(generateMockExams());
    }
  };

  const loadClasses = async () => {
    try {
      const response = await academicsAPI.getClasses();
      let classData = Array.isArray(response) ? response : (response?.data || []);
      
      setClasses(classData.length > 0 ? classData : [
        { id: 1, name: 'Class 1' },
        { id: 2, name: 'Class 2' },
        { id: 3, name: 'Class 3' }
      ]);
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([
        { id: 1, name: 'Class 1' },
        { id: 2, name: 'Class 2' },
        { id: 3, name: 'Class 3' }
      ]);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await usersAPI.getUsersByRole('teacher');
      let teacherData = Array.isArray(response) ? response : (response?.data || []);
      
      setTeachers(teacherData.length > 0 ? teacherData : [
        { id: 1, full_name: 'Mr. John Smith' },
        { id: 2, full_name: 'Ms. Sarah Johnson' },
        { id: 3, full_name: 'Dr. Michael Brown' }
      ]);
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([
        { id: 1, full_name: 'Mr. John Smith' },
        { id: 2, full_name: 'Ms. Sarah Johnson' },
        { id: 3, full_name: 'Dr. Michael Brown' }
      ]);
    }
  };

  const generateMockExams = () => {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const types = ['daily', 'weekly', 'monthly', 'final'];
    const statuses = ['scheduled', 'ongoing', 'completed'];
    const venues = ['Room 101', 'Main Hall', 'Lab 1', 'Library', 'Room 205'];

    return Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 30));
      
      return {
        id: i + 1,
        title: `${subjects[i % subjects.length]} ${types[i % types.length]} Test`,
        subject: subjects[i % subjects.length],
        type: types[i % types.length],
        exam_type: 'written',
        class_id: (i % 3) + 1,
        class_name: `Class ${(i % 3) + 1}`,
        date: date.toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '11:00',
        duration: 120,
        total_marks: 100,
        passing_marks: 40,
        venue: venues[i % venues.length],
        status: statuses[i % statuses.length],
        instructions: 'Please bring your own stationery. Mobile phones are not allowed.',
        syllabus: 'Chapters 1-5',
        invigilator_ids: [1, 2],
        guard_ids: [3],
        invigilators: [{ full_name: 'Mr. John Smith' }, { full_name: 'Ms. Sarah Johnson' }],
        guards: [{ full_name: 'Dr. Michael Brown' }]
      };
    });
  };

  const handleSaveExam = async (examData) => {
    try {
      if (editingExam) {
        // Update existing exam
        const updatedExam = { ...examData, id: editingExam.id };
        await academicsAPI.updateExam(editingExam.id, updatedExam);
        
        setExams(prev => prev.map(exam => 
          exam.id === editingExam.id ? updatedExam : exam
        ));
        setEditingExam(null);
      } else {
        // Create new exam
        const newExam = { ...examData, id: Date.now() };
        await academicsAPI.createExam(newExam);
        
        setExams(prev => [newExam, ...prev]);
      }
      
      setShowExamModal(false);
    } catch (error) {
      console.error('Error saving exam:', error);
      // In demo mode, still update the local state
      if (editingExam) {
        const updatedExam = { ...examData, id: editingExam.id };
        setExams(prev => prev.map(exam => 
          exam.id === editingExam.id ? updatedExam : exam
        ));
        setEditingExam(null);
      } else {
        const newExam = { ...examData, id: Date.now() };
        setExams(prev => [newExam, ...prev]);
      }
      setShowExamModal(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      await academicsAPI.deleteExam(examId);
      setExams(prev => prev.filter(exam => exam.id !== examId));
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error deleting exam:', error);
      // In demo mode, still update the local state
      setExams(prev => prev.filter(exam => exam.id !== examId));
      setShowDetailsModal(false);
    }
  };

  const getFilteredExams = () => {
    return exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.venue.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
      const matchesType = filterType === 'all' || exam.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const getExamStats = () => {
    const total = exams.length;
    const scheduled = exams.filter(e => e.status === 'scheduled').length;
    const ongoing = exams.filter(e => e.status === 'ongoing').length;
    const completed = exams.filter(e => e.status === 'completed').length;
    
    return { total, scheduled, ongoing, completed };
  };

  const canManageExams = hasRole(['superadmin', 'admin', 'academics']);
  const canViewExams = hasRole(['superadmin', 'admin', 'academics', 'teacher']);

  if (!canViewExams) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access exam management.</p>
      </div>
    );
  }

  const filteredExams = getFilteredExams();
  const stats = getExamStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-2">Schedule, manage, and monitor examinations</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                currentView === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <ClipboardList size={16} className="inline mr-1" />
              List
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                currentView === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Calendar size={16} className="inline mr-1" />
              Calendar
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                currentView === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <BarChart3 size={16} className="inline mr-1" />
              Analytics
            </button>
          </div>

          {canManageExams && (
            <button
              onClick={() => {
                setEditingExam(null);
                setShowExamModal(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Schedule Exam
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Exams</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-xs text-gray-600">Scheduled</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Timer className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.ongoing}</p>
              <p className="text-xs text-gray-600">Ongoing</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-600">Completed</p>
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
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="daily">Daily Test</option>
              <option value="weekly">Weekly Test</option>
              <option value="monthly">Monthly Exam</option>
              <option value="final">Final Exam</option>
              <option value="surprise">Surprise Test</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download size={16} className="mr-2" />
              Export
            </button>
            <button className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Bell size={16} className="mr-2" />
              Send Reminders
            </button>
          </div>
        </div>
      </div>

      {/* Content based on current view */}
      {currentView === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Venue</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map((exam) => {
                  const getStatusColor = (status) => {
                    switch (status) {
                      case 'scheduled': return 'bg-blue-100 text-blue-800';
                      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
                      case 'completed': return 'bg-green-100 text-green-800';
                      case 'cancelled': return 'bg-red-100 text-red-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  const getTypeColor = (type) => {
                    switch (type) {
                      case 'daily': return 'bg-purple-100 text-purple-800';
                      case 'weekly': return 'bg-indigo-100 text-indigo-800';
                      case 'monthly': return 'bg-blue-100 text-blue-800';
                      case 'final': return 'bg-red-100 text-red-800';
                      case 'surprise': return 'bg-orange-100 text-orange-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  return (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{exam.title}</div>
                          <div className="text-sm text-gray-500">
                            {exam.subject} - {exam.class_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(exam.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {exam.start_time} - {exam.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-900">{exam.venue}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(exam.type)}`}>
                          {exam.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </button>
                          {canManageExams && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingExam(exam);
                                  setShowExamModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                  ? 'Try adjusting your search criteria.' 
                  : 'Get started by scheduling your first exam.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ExamModal
        exam={editingExam}
        isOpen={showExamModal}
        onClose={() => {
          setShowExamModal(false);
          setEditingExam(null);
        }}
        onSave={handleSaveExam}
        classes={classes}
        teachers={teachers}
      />

      <ExamDetailsModal
        exam={selectedExam}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedExam(null);
        }}
        onEdit={(exam) => {
          setEditingExam(exam);
          setShowExamModal(true);
          setShowDetailsModal(false);
        }}
        onDelete={handleDeleteExam}
        canEdit={canManageExams}
      />
    </div>
  );
}