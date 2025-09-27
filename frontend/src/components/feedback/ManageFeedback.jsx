import React, { useState, useEffect, useContext } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { 
  getFeedbackList, 
  getFeedbackDetails, 
  respondToFeedback, 
  updateFeedbackStatus,
  downloadFeedbackAttachment 
} from '../../services/api';

export default function ManageFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadFeedbackList();
  }, []);

  const loadFeedbackList = async () => {
    try {
      setIsLoading(true);
      const response = await getFeedbackList();
      setFeedbackList(response.data);
    } catch (error) {
      console.error('Error loading feedback list:', error);
      showNotification(
        error.response?.data?.detail || 'Failed to load feedback list',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (feedbackId) => {
    try {
      setIsLoadingDetails(true);
      const response = await getFeedbackDetails(feedbackId);
      setSelectedFeedback(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading feedback details:', error);
      showNotification(
        error.response?.data?.detail || 'Failed to load feedback details',
        'error'
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, status) => {
    try {
      await updateFeedbackStatus(feedbackId, status);
      showNotification('Status updated successfully', 'success');
      loadFeedbackList();
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback({ ...selectedFeedback, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification(
        error.response?.data?.detail || 'Failed to update status',
        'error'
      );
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) {
      showNotification('Please enter a response', 'error');
      return;
    }

    try {
      setIsSubmittingResponse(true);
      await respondToFeedback(selectedFeedback.id, {
        response_content: responseText
      });
      
      showNotification('Response submitted successfully', 'success');
      setResponseText('');
      
      // Refresh details
      const response = await getFeedbackDetails(selectedFeedback.id);
      setSelectedFeedback(response.data);
      loadFeedbackList();
      
    } catch (error) {
      console.error('Error submitting response:', error);
      showNotification(
        error.response?.data?.detail || 'Failed to submit response',
        'error'
      );
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleDownloadAttachment = async (feedbackId, filename) => {
    try {
      const response = await downloadFeedbackAttachment(feedbackId);
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading attachment:', error);
      showNotification('Failed to download attachment', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading feedback...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Manage Feedback</h2>
        <p className="text-gray-600 text-sm">View and respond to user feedback</p>
      </div>

      {/* Feedback List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbackList.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No feedback submitted yet
                </td>
              </tr>
            ) : (
              feedbackList.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {feedback.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {feedback.is_anonymous ? (
                        <span className="italic text-gray-500">Anonymous</span>
                      ) : (
                        feedback.sender_name || 'Unknown'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {feedback.responses_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(feedback.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetails(feedback.id)}
                      disabled={isLoadingDetails}
                      className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                    >
                      View
                    </button>
                    {feedback.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(feedback.id, 'responded')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark Responded
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(feedback.id, 'closed')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Close
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Feedback Details Modal */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Feedback Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Feedback Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedFeedback.subject}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(selectedFeedback.status)}`}>
                    {selectedFeedback.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">From</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedFeedback.is_anonymous ? (
                      <span className="italic text-gray-500">Anonymous User</span>
                    ) : (
                      `${selectedFeedback.sender_name} (${selectedFeedback.sender_position})`
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedFeedback.created_at)}</p>
                </div>
              </div>

              {/* Feedback Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Content</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedFeedback.content}</p>
                </div>
              </div>

              {/* Attachment */}
              {selectedFeedback.attachment_filename && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachment</label>
                  <button
                    onClick={() => handleDownloadAttachment(selectedFeedback.id, selectedFeedback.attachment_filename)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {selectedFeedback.attachment_filename}
                  </button>
                </div>
              )}

              {/* Previous Responses */}
              {selectedFeedback.responses && selectedFeedback.responses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Responses</label>
                  <div className="space-y-3">
                    {selectedFeedback.responses.map((response, index) => (
                      <div key={response.id} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-blue-900">
                            {response.responder_name}
                          </span>
                          <span className="text-xs text-blue-600">
                            {formatDate(response.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{response.response_content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Response */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Response</label>
                <form onSubmit={handleSubmitResponse}>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="mt-3 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingResponse || !responseText.trim()}
                      className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isSubmittingResponse || !responseText.trim()
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSubmittingResponse ? 'Submitting...' : 'Send Response'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}