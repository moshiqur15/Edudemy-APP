import React, { useState, useEffect } from 'react';
import { teachersAPI } from '../../services/api';

const TeacherForm = ({ teacher = null, onSubmit, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    // User Account Information (for create mode)
    email: '',
    username: '',
    full_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Professional Information
    employee_id: '',
    subjects: '',
    specialization: '',
    qualification: '',
    additional_qualifications: '',
    experience_years: '',
    previous_experience: '',
    
    // Employment Details
    joining_date: new Date().toISOString().split('T')[0],
    employment_type: 'full_time',
    hourly_rate: '',
    monthly_salary: '',
    
    // Emergency Contact
    emergency_contact: '',
    emergency_contact_relation: '',
    
    // Teaching Preferences
    preferred_classes: '',
    max_classes_per_day: 6,
    preferred_time_slots: '',
    
    // Additional Information
    bio: '',
    achievements: '',
    department: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Predefined options
  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' }
  ];

  const subjectOptions = [
    'Bangla', 'English', 'I.C.T', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Multi'
  ];

  const classLevels = [
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC',
    'HSC 1st Year', 'HSC 2nd Year'
  ];

  const relationOptions = [
    'Spouse', 'Parent', 'Sibling', 'Friend', 'Relative', 'Other'
  ];

  useEffect(() => {
    if (teacher) {
      // If editing existing teacher, populate form
      const teacherData = teacher.teacher || teacher;
      const userData = teacher.user || {};
      
      setFormData({
        // User information
        email: userData.email || '',
        username: userData.username || '',
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        department: userData.department || '',
        
        // Teacher profile
        employee_id: teacherData.employee_id || '',
        subjects: teacherData.subjects || '',
        specialization: teacherData.specialization || '',
        qualification: teacherData.qualification || '',
        additional_qualifications: teacherData.additional_qualifications || '',
        experience_years: teacherData.experience_years || '',
        previous_experience: teacherData.previous_experience || '',
        joining_date: teacherData.joining_date ? new Date(teacherData.joining_date).toISOString().split('T')[0] : '',
        employment_type: teacherData.employment_type || 'full_time',
        hourly_rate: teacherData.hourly_rate || '',
        monthly_salary: teacherData.monthly_salary || '',
        emergency_contact: teacherData.emergency_contact || '',
        emergency_contact_relation: teacherData.emergency_contact_relation || '',
        preferred_classes: teacherData.preferred_classes || '',
        max_classes_per_day: teacherData.max_classes_per_day || 6,
        preferred_time_slots: teacherData.preferred_time_slots || '',
        bio: teacherData.bio || '',
        achievements: teacherData.achievements || '',
        
        // Clear password fields for edit mode
        password: '',
        confirmPassword: ''
      });
    }
  }, [teacher]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (value ? parseInt(value) : '') : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubjectToggle = (subject) => {
    const currentSubjects = formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [];
    let newSubjects;

    if (currentSubjects.includes(subject)) {
      newSubjects = currentSubjects.filter(s => s !== subject);
    } else {
      newSubjects = [...currentSubjects, subject];
    }

    setFormData(prev => ({
      ...prev,
      subjects: newSubjects.join(', ')
    }));
  };

  const handleClassToggle = (classLevel) => {
    try {
      const currentClasses = formData.preferred_classes ? JSON.parse(formData.preferred_classes) : [];
      let newClasses;

      if (currentClasses.includes(classLevel)) {
        newClasses = currentClasses.filter(c => c !== classLevel);
      } else {
        newClasses = [...currentClasses, classLevel];
      }

      setFormData(prev => ({
        ...prev,
        preferred_classes: JSON.stringify(newClasses)
      }));
    } catch {
      // If parsing fails, start fresh
      setFormData(prev => ({
        ...prev,
        preferred_classes: JSON.stringify([classLevel])
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'create') {
      // User account validation for create mode
      if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      // Email format validation
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    // Professional validation - qualification and experience no longer required
    if (!formData.subjects.trim()) newErrors.subjects = 'At least one subject is required';

    // Phone validation - make phone required
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }
    if (formData.emergency_contact && !/^[0-9+\-\s()]+$/.test(formData.emergency_contact)) {
      newErrors.emergency_contact = 'Invalid phone format';
    }

    // Numeric validation
    if (formData.experience_years && (isNaN(formData.experience_years) || formData.experience_years < 0)) {
      newErrors.experience_years = 'Experience years must be a valid number';
    }
    // Salary/Rate validation based on employment type - make required
    if (formData.employment_type === 'full_time') {
      if (!formData.monthly_salary) {
        newErrors.monthly_salary = 'Monthly salary is required for full-time employment';
      } else if (isNaN(formData.monthly_salary) || formData.monthly_salary < 0) {
        newErrors.monthly_salary = 'Monthly salary must be a valid number';
      }
    } else {
      if (!formData.hourly_rate) {
        newErrors.hourly_rate = 'Hourly rate is required for part-time/contract employment';
      } else if (isNaN(formData.hourly_rate) || formData.hourly_rate < 0) {
        newErrors.hourly_rate = 'Hourly rate must be a valid number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        joining_date: formData.joining_date ? new Date(formData.joining_date).toISOString() : null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        monthly_salary: formData.monthly_salary ? parseFloat(formData.monthly_salary) : null,
        max_classes_per_day: parseInt(formData.max_classes_per_day)
      };

      // Remove password confirmation from submission
      delete submissionData.confirmPassword;

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.detail) {
        alert('Error: ' + error.response.data.detail);
      } else {
        alert('An error occurred while saving the teacher profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSelectedSubjects = () => {
    return formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [];
  };

  const getSelectedClasses = () => {
    try {
      return formData.preferred_classes ? JSON.parse(formData.preferred_classes) : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Create Teacher Profile' : 'Edit Teacher Profile'}
              </h2>
              <p className="text-gray-600 mt-1">
                {mode === 'create' 
                  ? 'Create a comprehensive teacher profile with user account'
                  : 'Update teacher information and preferences'
                }
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Account Information (Create Mode Only) */}
        {mode === 'create' && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Professional Information Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generated if empty"
                disabled={mode === 'edit'}
              />
              <p className="text-sm text-gray-500 mt-1">Will be auto-generated if left empty</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., M.Sc in Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Advanced Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                min="0"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.experience_years ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Years of experience"
              />
              {errors.experience_years && <p className="text-red-500 text-sm mt-1">{errors.experience_years}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {employmentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Qualifications</label>
            <textarea
              name="additional_qualifications"
              value={formData.additional_qualifications}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="List any additional qualifications, certifications, etc."
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Experience</label>
            <textarea
              name="previous_experience"
              value={formData.previous_experience}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe previous teaching or relevant experience"
            />
          </div>
        </div>

        {/* Subjects Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Teaching Subjects <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {subjectOptions.map(subject => {
              const isSelected = getSelectedSubjects().includes(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleSubjectToggle(subject)}
                  className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
          {errors.subjects && <p className="text-red-500 text-sm mt-2">{errors.subjects}</p>}
          <p className="text-sm text-gray-500 mt-2">Selected: {formData.subjects || 'None'}</p>
        </div>

        {/* Teaching Preferences */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Preferences</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Class Levels</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {classLevels.map(classLevel => {
                const isSelected = getSelectedClasses().includes(classLevel);
                return (
                  <button
                    key={classLevel}
                    type="button"
                    onClick={() => handleClassToggle(classLevel)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {classLevel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Classes Per Day</label>
              <input
                type="number"
                name="max_classes_per_day"
                value={formData.max_classes_per_day}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Science, Humanities"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time Slots</label>
            <textarea
              name="preferred_time_slots"
              value={formData.preferred_time_slots}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Morning (8AM-12PM), Afternoon (2PM-6PM)"
            />
          </div>
        </div>

        {/* Emergency Contact & Additional Info */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact & Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <input
                type="tel"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.emergency_contact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Emergency contact number"
              />
              {errors.emergency_contact && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
              <select
                name="emergency_contact_relation"
                value={formData.emergency_contact_relation}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Relation</option>
                {relationOptions.map(relation => (
                  <option key={relation} value={relation.toLowerCase()}>{relation}</option>
                ))}
              </select>
            </div>

            {formData.employment_type === 'full_time' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.monthly_salary ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter monthly salary"
                />
                {errors.monthly_salary && <p className="text-red-500 text-sm mt-1">{errors.monthly_salary}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.hourly_rate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter hourly rate"
                />
                {errors.hourly_rate && <p className="text-red-500 text-sm mt-1">{errors.hourly_rate}</p>}
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief biography or introduction"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notable achievements, awards, recognitions"
            />
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
                {loading ? 'Saving...' : (mode === 'create' ? 'Create Teacher' : 'Update Profile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;
