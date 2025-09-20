import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accessRequestAPI } from '../services/api';
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Shield,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  MoreHorizontal,
  UserPlus,
  Calendar,
  Tag,
  Loader
} from 'lucide-react';

export default function AccessRequestManagement() {
  const { user, hasRole } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Define hierarchy levels for permission checking
  const roleHierarchy = {
    'superadmin': 6,
    'admin': 5,
    'management': 4,
    'academics': 3,
    'teacher': 2,
    'student': 1
  };

  const getRoleLabel = (role) => {
    const labels = {
      'superadmin': 'Super Admin',
      'admin': 'Admin',
      'management': 'Management',
      'academics': 'Academics',
      'teacher': 'Teacher',
      'student': 'Student'
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'superadmin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800',
      'management': 'bg-blue-100 text-blue-800',
      'academics': 'bg-green-100 text-green-800',
      'teacher': 'bg-yellow-100 text-yellow-800',
      'student': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canManageRequest = (requestedRole) => {
    const currentUserLevel = roleHierarchy[user.role] || 0;
    const requestedLevel = roleHierarchy[requestedRole] || 0;
    
    // Superadmin can manage everything
    if (user.role === 'superadmin') return true;
    
    // Users can only manage requests for roles below their level
    return currentUserLevel > requestedLevel;
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await accessRequestAPI.getAccessRequests();
      
      // Filter requests based on hierarchy permissions
      const filteredRequests = response.filter(request => canManageRequest(request.requested_role));
      setRequests(filteredRequests);
    } catch (error) {
      console.error('Error loading access requests:', error);
      setError('Failed to load access requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId, reason = '') => {
    setActionLoading(requestId);
    try {
      await accessRequestAPI.approveRequest(requestId, { 
        reason: reason || 'Access request approved by administrator.' 
      });
      setSuccess('Access request approved successfully!');
      await loadRequests();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving request:', error);
      setError(error.response?.data?.detail || 'Failed to approve request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId, reason) => {
    if (!reason?.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    
    setActionLoading(requestId);
    try {
      await accessRequestAPI.rejectRequest(requestId, { reason });
      setSuccess('Access request rejected.');
      await loadRequests();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError(error.response?.data?.detail || 'Failed to reject request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesRole = roleFilter === 'all' || request.requested_role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!hasRole(['superadmin', 'admin', 'management'])) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to view access requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Requests</h2>
          <p className="text-gray-600 mt-1">
            Review and manage account access requests from new users
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="academics">Academics</option>
              {hasRole(['superadmin', 'admin']) && <option value="management">Management</option>}
              {hasRole('superadmin') && <option value="admin">Admin</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading access requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Access Requests</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'No requests match your current filters.'
                : 'No access requests found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {request.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.full_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {request.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(request.requested_role)}`}>
                        {getRoleLabel(request.requested_role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(request.status)}`}>
                        {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {request.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {request.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(request.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {request.status === 'pending' && canManageRequest(request.requested_role) && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded disabled:opacity-50"
                            >
                              {actionLoading === request.id ? (
                                <Loader className="animate-spin w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailModal(true);
                              }}
                              disabled={actionLoading === request.id}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
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
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          canManage={canManageRequest(selectedRequest.requested_role)}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

// Request Detail Modal Component
function RequestDetailModal({ request, onClose, onApprove, onReject, canManage, actionLoading }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Access Request Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Information */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {request.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h4 className="text-xl font-medium text-gray-900">{request.full_name}</h4>
              <p className="text-gray-600 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {request.email}
              </p>
              <p className="text-gray-600 flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                Requested on {formatDate(request.created_at)}
              </p>
            </div>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested Role
              </label>
              <span className={`inline-flex px-3 py-2 text-sm font-medium rounded-full ${
                request.requested_role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                request.requested_role === 'admin' ? 'bg-red-100 text-red-800' :
                request.requested_role === 'management' ? 'bg-blue-100 text-blue-800' :
                request.requested_role === 'academics' ? 'bg-green-100 text-green-800' :
                request.requested_role === 'teacher' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.requested_role?.charAt(0).toUpperCase() + request.requested_role?.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <span className={`inline-flex px-3 py-2 text-sm font-medium rounded-full ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                {request.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
                {request.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Additional Information */}
          {request.reason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{request.reason}</p>
            </div>
          )}

          {/* Approval/Rejection Details */}
          {request.status !== 'pending' && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {request.status === 'approved' ? 'Approved By' : 'Rejected By'}
                  </label>
                  <p className="text-gray-900">{request.reviewed_by_name || 'System'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {request.status === 'approved' ? 'Approved At' : 'Rejected At'}
                  </label>
                  <p className="text-gray-900">
                    {formatDate(request.reviewed_at || request.updated_at)}
                  </p>
                </div>
              </div>
              {request.admin_reason && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Note
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{request.admin_reason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {request.status === 'pending' && canManage && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            {!showRejectForm ? (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(request.id)}
                  disabled={actionLoading === request.id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center"
                >
                  {actionLoading === request.id ? (
                    <>
                      <Loader className="animate-spin w-4 h-4 mr-2" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide a reason for rejecting this request..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onReject(request.id, rejectionReason)}
                    disabled={!rejectionReason.trim() || actionLoading === request.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center"
                  >
                    {actionLoading === request.id ? (
                      <>
                        <Loader className="animate-spin w-4 h-4 mr-2" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Reject Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}