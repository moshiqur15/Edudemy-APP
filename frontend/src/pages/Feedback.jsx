import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('send');
  const { user } = useAuth();

  // Check if user can access Manage tab (admin/superadmin only)
  const canManageFeedback = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Feedback System</h1>
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('send')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Send Feedback
            </button>
            
            {canManageFeedback && (
              <button
                onClick={() => setActiveTab('manage')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Feedback
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'send' && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Send Feedback</h2>
              <p className="text-gray-600 mb-4">Share your thoughts, suggestions, or report issues.</p>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief summary of your feedback"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide detailed feedback..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input type="checkbox" id="anonymous" className="mr-2" />
                  <label htmlFor="anonymous" className="text-sm text-gray-700">Submit anonymously</label>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Submit Feedback
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'manage' && canManageFeedback && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Manage Feedback</h2>
              <p className="text-gray-600 mb-4">View and respond to user feedback.</p>
              <div className="text-center py-8 text-gray-500">
                No feedback submissions yet.
              </div>
            </div>
          )}
        </div>
        
        {/* Status Info */}
        <div className="mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p>User: {user?.full_name || user?.username} ({user?.role})</p>
          <p>Active Tab: {activeTab}</p>
          <p>Management Access: {canManageFeedback ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}