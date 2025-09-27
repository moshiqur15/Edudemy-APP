import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { submitFeedback } from '../../services/api';

export default function SendFeedback() {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    is_anonymous: false
  });
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();

  console.log('SendFeedback component loaded');
  console.log('User in SendFeedback:', user);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
      }
      
      // Check file type (allow images and documents)
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        showNotification('Only images and documents (PDF, DOC, DOCX) are allowed', 'error');
        return;
      }
      
      setAttachment(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.content.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('is_anonymous', formData.is_anonymous);
      
      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      const response = await submitFeedback(formDataToSend);
      
      showNotification('Feedback submitted successfully!', 'success');
      
      // Reset form
      setFormData({
        subject: '',
        content: '',
        is_anonymous: false
      });
      setAttachment(null);
      
      // Clear file input
      const fileInput = document.getElementById('attachment');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showNotification(
        error.response?.data?.detail || 'Failed to submit feedback. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Submit Feedback</h2>
        <p className="text-gray-600 text-sm">
          Share your thoughts, suggestions, or report issues. Your feedback helps us improve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Anonymous Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_anonymous"
            name="is_anonymous"
            checked={formData.is_anonymous}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-700">
            Submit anonymously
          </label>
          <div className="ml-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {formData.is_anonymous ? 'Anonymous' : `${user?.full_name} (${user?.role})`}
            </span>
          </div>
        </div>

        {/* Subject/Scope */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject/Scope <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Brief summary of your feedback"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={200}
          />
          <p className="mt-1 text-sm text-gray-500">{formData.subject.length}/200 characters</p>
        </div>

        {/* Feedback Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Feedback Details <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Please provide detailed feedback..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* File Attachment */}
        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
            Attach Image/Document (Optional)
          </label>
          <input
            type="file"
            id="attachment"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {attachment && (
            <div className="mt-2 flex items-center">
              <span className="text-sm text-green-600">
                📎 {attachment.name} ({Math.round(attachment.size / 1024)}KB)
              </span>
              <button
                type="button"
                onClick={() => {
                  setAttachment(null);
                  document.getElementById('attachment').value = '';
                }}
                className="ml-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Supported formats: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX. Max size: 10MB
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setFormData({ subject: '', content: '', is_anonymous: false });
              setAttachment(null);
              document.getElementById('attachment').value = '';
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}