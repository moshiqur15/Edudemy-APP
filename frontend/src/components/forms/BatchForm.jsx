import React, { useState, useEffect } from 'react';

const BatchForm = ({ batch = null, onSubmit, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    code: '',
    course: '',
    class_name: '',
    version: 'BV',
    
    // Dates
    start_date: '',
    end_date: '',
    
    // Capacity
    max_students: 30,
    min_students: 5,
    
    // Schedule
    schedule_days: '',
    time_slot: '',
    
    // Financial
    fee_amount: '',
    fee_period: 'monthly',
    discount_percentage: 0,
    
    // Status & Notes
    status: 'active',
    notes: ''
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Predefined options
  const classOptions = [
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC',
    'HSC 1st Year', 'HSC 2nd Year'
  ];

  const weekDays = [
    { value: 'monday', label: 'Monday', short: 'Mon' },
    { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { value: 'thursday', label: 'Thursday', short: 'Thu' },
    { value: 'friday', label: 'Friday', short: 'Fri' },
    { value: 'saturday', label: 'Saturday', short: 'Sat' },
    { value: 'sunday', label: 'Sunday', short: 'Sun' }
  ];

  const feePeriodsOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'one-time', label: 'One-time' }
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const timeSlotOptions = [
    '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
    '16:00-18:00', '18:00-20:00', '20:00-22:00'
  ];

  useEffect(() => {
    if (batch) {
      const batchData = batch.batch || batch;
      
      setFormData({
        name: batchData.name || '',
        code: batchData.code || '',
        course: batchData.course || '',
        class_name: batchData.class_name || '',
        version: batchData.version || 'BV',
        start_date: batchData.start_date ? new Date(batchData.start_date).toISOString().split('T')[0] : '',
        end_date: batchData.end_date ? new Date(batchData.end_date).toISOString().split('T')[0] : '',
        max_students: batchData.max_students || 30,
        min_students: batchData.min_students || 5,
        schedule_days: batchData.schedule_days || '',
        time_slot: batchData.time_slot || '',
        fee_amount: batchData.fee_amount || '',
        fee_period: batchData.fee_period || 'monthly',
        discount_percentage: batchData.discount_percentage || 0,
        status: batchData.status || 'active',
        notes: batchData.notes || ''
      });

      // Parse selected days
      try {
        if (batchData.schedule_days) {
          setSelectedDays(JSON.parse(batchData.schedule_days));
        }
      } catch (error) {
        console.error('Error parsing schedule days:', error);
      }
    }
  }, [batch]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (value ? parseFloat(value) : '') : value;
    
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

    // Auto-generate batch code when relevant fields change
    if (['class_name', 'version'].includes(name) && mode === 'create') {
      generateBatchCode({
        ...formData,
        [name]: finalValue
      });
    }
  };

  const generateBatchCode = (data = formData) => {
    if (data.class_name && data.version) {
      const year = new Date().getFullYear() % 100; // Last 2 digits
      const classShort = data.class_name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const version = data.version;
      
      // Generate sequential number (this is a preview, actual will be calculated on backend)
      const seq = Math.floor(Math.random() * 99) + 1; // Random for preview
      const code = `${year}${classShort}${version}${seq.toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        code: code
      }));
    }
  };

  const handleDayToggle = (day) => {
    let newDays;
    if (selectedDays.includes(day)) {
      newDays = selectedDays.filter(d => d !== day);
    } else {
      newDays = [...selectedDays, day];
    }
    
    setSelectedDays(newDays);
    setFormData(prev => ({
      ...prev,
      schedule_days: JSON.stringify(newDays)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Batch name is required';
    if (!formData.class_name) newErrors.class_name = 'Class is required';

    // Date validation
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    // Capacity validation
    if (formData.max_students <= 0) {
      newErrors.max_students = 'Max students must be greater than 0';
    }
    if (formData.min_students <= 0) {
      newErrors.min_students = 'Min students must be greater than 0';
    }
    if (formData.min_students > formData.max_students) {
      newErrors.min_students = 'Min students cannot be greater than max students';
    }

    // Fee validation
    if (formData.fee_amount && formData.fee_amount < 0) {
      newErrors.fee_amount = 'Fee amount cannot be negative';
    }
    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
      newErrors.discount_percentage = 'Discount must be between 0 and 100';
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
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        max_students: parseInt(formData.max_students),
        min_students: parseInt(formData.min_students),
        fee_amount: formData.fee_amount ? parseFloat(formData.fee_amount) : null,
        discount_percentage: parseFloat(formData.discount_percentage)
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.detail) {
        alert('Error: ' + error.response.data.detail);
      } else {
        alert('An error occurred while saving the batch');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Create New Batch' : 'Edit Batch'}
              </h2>
              <p className="text-gray-600 mt-2">
                {mode === 'create' 
                  ? 'Set up a new batch with students and scheduling information'
                  : 'Update batch information and settings'
                }
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Morning Batch A"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generated if empty"
              />
              <p className="text-sm text-gray-500 mt-1">Will be auto-generated if left empty</p>
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Course/Subject Focus</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Science, Commerce, Arts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule Information Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Class Days</label>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {weekDays.map(day => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{day.short}</div>
                    <div className="text-xs">{day.label}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected days: {selectedDays.length > 0 ? selectedDays.join(', ') : 'None'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
              <select
                name="time_slot"
                value={formData.time_slot}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Time Slot</option>
                {timeSlotOptions.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
            </div>
          </div>
        </div>

        {/* Capacity & Financial Information Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity & Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Students <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="max_students"
                value={formData.max_students}
                onChange={handleInputChange}
                min="1"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.max_students ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="30"
              />
              {errors.max_students && <p className="text-red-500 text-sm mt-1">{errors.max_students}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Students <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="min_students"
                value={formData.min_students}
                onChange={handleInputChange}
                min="1"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.min_students ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="5"
              />
              {errors.min_students && <p className="text-red-500 text-sm mt-1">{errors.min_students}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount</label>
              <input
                type="number"
                name="fee_amount"
                value={formData.fee_amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fee_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter fee amount"
              />
              {errors.fee_amount && <p className="text-red-500 text-sm mt-1">{errors.fee_amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Period</label>
              <select
                name="fee_period"
                value={formData.fee_period}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {feePeriodsOptions.map(period => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
              <input
                type="number"
                name="discount_percentage"
                value={formData.discount_percentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.discount_percentage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.discount_percentage && <p className="text-red-500 text-sm mt-1">{errors.discount_percentage}</p>}
            </div>
          </div>

          {/* Calculate effective fee display */}
          {formData.fee_amount && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Effective Fee:</strong> ৳{(
                  parseFloat(formData.fee_amount) * 
                  (1 - parseFloat(formData.discount_percentage || 0) / 100)
                ).toFixed(2)} 
                {formData.discount_percentage > 0 && (
                  <span className="ml-2">
                    (Original: ৳{parseFloat(formData.fee_amount).toFixed(2)}, 
                     Discount: {formData.discount_percentage}%)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Additional Information Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about this batch (requirements, special instructions, etc.)"
            />
          </div>

          {/* Batch Summary */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Batch Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Class & Version:</strong> {formData.class_name || 'Not selected'} ({formData.version})
              </div>
              <div>
                <strong>Capacity:</strong> {formData.min_students}-{formData.max_students} students
              </div>
              <div>
                <strong>Schedule:</strong> {selectedDays.length > 0 ? selectedDays.join(', ') : 'No days selected'}
                {formData.time_slot && ` at ${formData.time_slot}`}
              </div>
              <div>
                <strong>Duration:</strong> 
                {formData.start_date && formData.end_date 
                  ? `${formData.start_date} to ${formData.end_date}`
                  : 'Not specified'
                }
              </div>
            </div>
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
            {loading ? 'Saving...' : (mode === 'create' ? 'Create Batch' : 'Update Batch')}
          </button>
        </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default BatchForm;
