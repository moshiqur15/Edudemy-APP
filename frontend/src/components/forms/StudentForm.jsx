import React, { useState, useEffect } from 'react';
import { studentsAPI, academicsAPI } from '../../services/api';

const StudentForm = ({ student = null, onSubmit, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    full_name: '',
    father_name: '',
    mother_name: '',
    gender: 'male',
    date_of_birth: '',
    address: '',
    
    // Academic Information
    class_name: '',
    version: 'BV',
    current_school: '',
    batch_id: '',
    admission_date: new Date().toISOString().split('T')[0],
    
    // Contact Information
    student_contact: '',
    father_contact: '',
    mother_contact: '',
    
    // Legacy fields
    phone: '',
    email: ''
  });

  const [batches, setBatches] = useState([]);
  const [idPreview, setIdPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Predefined options
  const classOptions = [
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10','SSC',
    'HSC 1st Year', 'HSC 2nd Year'
  ];

  useEffect(() => {
    fetchBatches();
    if (student) {
      setFormData({
        full_name: student.full_name || '',
        father_name: student.father_name || '',
        mother_name: student.mother_name || '',
        gender: student.gender || 'male',
        date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
        address: student.address || '',
        class_name: student.class_name || '',
        version: student.version || 'BV',
        current_school: student.current_school || '',
        batch_id: student.batch_id || '',
        admission_date: student.admission_date ? new Date(student.admission_date).toISOString().split('T')[0] : '',
        student_contact: student.student_contact || '',
        father_contact: student.father_contact || '',
        mother_contact: student.mother_contact || '',
        phone: student.phone || '',
        email: student.email || ''
      });
    }
  }, [student]);

  const fetchBatches = async () => {
    try {
      const response = await academicsAPI.getBatches();
      setBatches(response.data?.batches || response.data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

  // Generate ID preview when relevant fields change
    if (['gender', 'class_name', 'admission_date'].includes(name) && mode === 'create') {
      generateIdPreview({
        ...formData,
        [name]: value
      });
    }
  };

  const generateIdPreview = async (data = formData) => {
    if (!data.gender || !data.class_name) return;

    try {
      const preview = await studentsAPI.previewStudentID(
        data.gender,
        data.class_name,
        data.admission_date || null
      );
      setIdPreview(preview);
    } catch (error) {
      console.error('Error generating ID preview:', error);
    }
  };

  // Generate preview when component loads (create mode)
  useEffect(() => {
    if (mode === 'create' && formData.gender && formData.class_name) {
      generateIdPreview();
    }
  }, [mode]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.full_name.trim()) newErrors.full_name = 'Student name is required';
    if (!formData.father_name.trim()) newErrors.father_name = 'Father name is required';
    if (!formData.mother_name.trim()) newErrors.mother_name = 'Mother name is required';
    if (!formData.class_name) newErrors.class_name = 'Class is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Contact validation
    if (formData.student_contact && !/^[0-9+\-\s()]+$/.test(formData.student_contact)) {
      newErrors.student_contact = 'Invalid phone format';
    }
    if (formData.father_contact && !/^[0-9+\-\s()]+$/.test(formData.father_contact)) {
      newErrors.father_contact = 'Invalid phone format';
    }
    if (formData.mother_contact && !/^[0-9+\-\s()]+$/.test(formData.mother_contact)) {
      newErrors.mother_contact = 'Invalid phone format';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Filter batches based on selected class
  const getFilteredBatches = () => {
    if (!formData.class_name || !batches.length) return [];
    
    // Extract class number from class name for filtering
    let classNumber = '';
    if (formData.class_name.includes('6')) classNumber = '6';
    else if (formData.class_name.includes('7')) classNumber = '7';
    else if (formData.class_name.includes('8')) classNumber = '8';
    else if (formData.class_name.includes('9')) classNumber = '9';
    else if (formData.class_name.includes('10') || formData.class_name === 'SSC') classNumber = '10';
    else if (formData.class_name.includes('11') || formData.class_name === 'HSC 1st Year') classNumber = '11';
    else if (formData.class_name.includes('12') || formData.class_name === 'HSC 2nd Year') classNumber = '12';
    
    return batches.filter(batchData => {
      const batch = batchData.batch || batchData;
      const batchClassName = batch.class_name || '';
      
      // Check if batch class matches selected class
      if (classNumber) {
        return batchClassName.includes(classNumber) || 
               (classNumber === '10' && batchClassName.includes('SSC')) ||
               (classNumber === '11' && batchClassName.includes('HSC 1st')) ||
               (classNumber === '12' && batchClassName.includes('HSC 2nd'));
      }
      
      return false;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : null,
        admission_date: formData.admission_date ? new Date(formData.admission_date).toISOString() : null,
        batch_id: formData.batch_id ? parseInt(formData.batch_id) : null
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle specific API errors
      if (error.response?.data?.detail) {
        alert('Error: ' + error.response.data.detail);
      } else {
        alert('An error occurred while saving the student profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Student Admission Form' : 'Edit Student Profile'}
        </h2>
        <p className="text-gray-600 mt-2">
          {mode === 'create' 
            ? 'Fill in all required information for new student admission'
            : 'Update student information'
          }
        </p>
      </div>

      {/* ID Preview Section (Create Mode Only) */}
      {mode === 'create' && idPreview && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Student ID Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700">Registration Number</label>
              <p className="text-lg font-mono text-blue-900">{idPreview.student_reg_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">Roll Number</label>
              <p className="text-lg font-mono text-blue-900">{idPreview.student_roll_number}</p>
            </div>
          </div>
            <div className="mt-3 text-sm text-blue-600">
              <p><strong>Format:</strong> {idPreview.format_explanation.reg_number}</p>
              <p>Class: {idPreview.format_explanation.class_codes[idPreview.class_code]}, Gender: {idPreview.format_explanation.gender_codes[idPreview.gender_code]}, Serial: {idPreview.serial}</p>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.full_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter student's full name"
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.gender ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.father_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter father's name"
              />
              {errors.father_name && <p className="text-red-500 text-sm mt-1">{errors.father_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mother's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.mother_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter mother's name"
              />
              {errors.mother_name && <p className="text-red-500 text-sm mt-1">{errors.mother_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter complete address"
            />
          </div>
        </div>

        {/* Academic Information Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class_name"
                value={formData.class_name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.class_name ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Class</option>
                {classOptions.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors.class_name && <p className="text-red-500 text-sm mt-1">{errors.class_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version <span className="text-red-500">*</span>
              </label>
              <select
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="BV">BV (Bangla Version)</option>
                <option value="EV">EV (English Version)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select
                name="batch_id"
                value={formData.batch_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Batch (Optional)</option>
                {getFilteredBatches().map(batch => (
                  <option key={batch.batch?.id || batch.id} value={batch.batch?.id || batch.id}>
                    {batch.batch?.name || batch.name} - {batch.batch?.class_name || batch.class_name} ({batch.batch?.version || batch.version})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current School</label>
            <input
              type="text"
              name="current_school"
              value={formData.current_school}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current school name"
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student's Contact</label>
              <input
                type="tel"
                name="student_contact"
                value={formData.student_contact}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.student_contact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Student's phone number"
              />
              {errors.student_contact && <p className="text-red-500 text-sm mt-1">{errors.student_contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Contact</label>
              <input
                type="tel"
                name="father_contact"
                value={formData.father_contact}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.father_contact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Father's phone number"
              />
              {errors.father_contact && <p className="text-red-500 text-sm mt-1">{errors.father_contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Contact</label>
              <input
                type="tel"
                name="mother_contact"
                value={formData.mother_contact}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.mother_contact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mother's phone number"
              />
              {errors.mother_contact && <p className="text-red-500 text-sm mt-1">{errors.mother_contact}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address (optional)"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Admit Student' : 'Update Profile')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
