import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  createAdmin: async () => {
    const response = await api.post('/auth/create-admin');
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // New registration system with email verification
  registerRequest: async (userData) => {
    const response = await api.post('/auth/register-request', userData);
    return response.data;
  },

  verifyRegistration: async (verificationData) => {
    const response = await api.post('/auth/verify-registration', verificationData);
    return response.data;
  },

  resendVerificationCode: async (tokenData) => {
    const response = await api.post('/auth/resend-verification', tokenData);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.post(`/users/${userId}/toggle-status`);
    return response.data;
  },

  getUserRoles: async () => {
    const response = await api.get('/users/roles/list');
    return response.data;
  },
};

// Students API
export const studentsAPI = {
  // Enhanced student management
  getStudents: async (params = {}) => {
    const response = await api.get('/students/', { params });
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await api.post('/students/', studentData);
    return response.data;
  },

  updateStudent: async (studentId, studentData) => {
    const response = await api.put(`/students/${studentId}`, studentData);
    return response.data;
  },

  deleteStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },

  // ID Generation
  previewStudentID: async (gender, className, admissionDate = null) => {
    const response = await api.post('/students/preview-id', {
      gender,
      class_name: className,
      admission_date: admissionDate
    });
    return response.data;
  },

  // Filtering endpoints
  getStudentsByBatch: async (batchId) => {
    const response = await api.get(`/students/by-batch/${batchId}`);
    return response.data;
  },

  getStudentsByClass: async (className, version = null) => {
    const params = version ? { version } : {};
    const response = await api.get(`/students/by-class/${className}`, { params });
    return response.data;
  },

  // Bulk operations
  bulkAssignBatch: async (studentIds, batchId) => {
    const response = await api.post('/students/bulk-assign-batch', {
      student_ids: studentIds,
      batch_id: batchId
    });
    return response.data;
  },

  unassignFromBatch: async (studentId, batchId) => {
    const response = await api.put(`/students/${studentId}/unassign-batch`, {
      batch_id: batchId
    });
    return response.data;
  },
};

// Teachers API
export const teachersAPI = {
  // Teacher management
  getTeachers: async (params = {}) => {
    const response = await api.get('/teachers/', { params });
    return response.data;
  },

  createTeacher: async (teacherData) => {
    const response = await api.post('/teachers/', teacherData);
    return response.data;
  },

  createTeacherWithUser: async (teacherData) => {
    const response = await api.post('/teachers/with-user', teacherData);
    return response.data;
  },

  getTeacher: async (teacherId) => {
    const response = await api.get(`/teachers/${teacherId}`);
    return response.data;
  },

  updateTeacher: async (teacherId, teacherData) => {
    const response = await api.put(`/teachers/${teacherId}`, teacherData);
    return response.data;
  },

  deleteTeacher: async (teacherId) => {
    const response = await api.delete(`/teachers/${teacherId}`);
    return response.data;
  },

  // Teacher assignments
  getTeacherAssignments: async (teacherId, params = {}) => {
    const response = await api.get(`/teachers/${teacherId}/assignments`, { params });
    return response.data;
  },

  assignTeacherToClass: async (teacherId, assignmentData) => {
    const response = await api.post(`/teachers/${teacherId}/assignments`, assignmentData);
    return response.data;
  },

  getTeacherStudents: async (teacherId) => {
    const response = await api.get(`/teachers/${teacherId}/students`);
    return response.data;
  },

  getTeacherWorkload: async (teacherId, params = {}) => {
    const response = await api.get(`/teachers/${teacherId}/workload`, { params });
    return response.data;
  },

  // Subject-based operations
  getTeachersBySubject: async (subject) => {
    const response = await api.get(`/teachers/by-subject/${subject}`);
    return response.data;
  },

  bulkAssignSubject: async (teacherIds, subject) => {
    const response = await api.post('/teachers/bulk-assign-subject', {
      teacher_ids: teacherIds,
      subject
    });
    return response.data;
  },

  // Current teacher profile
  getMyProfile: async () => {
    const response = await api.get('/teachers/my-profile');
    return response.data;
  },

  updateMyProfile: async (profileData) => {
    const response = await api.put('/teachers/my-profile', profileData);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getAdminStats: async () => {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },

  getTeacherStats: async () => {
    const response = await api.get('/academics/dashboard/stats');
    return response.data;
  },

  getStudentStats: async () => {
    const response = await api.get('/academics/dashboard/stats');
    return response.data;
  },
};

// Enhanced Academics API
export const academicsAPI = {
  // Enhanced Batch Management
  getBatches: async (params = {}) => {
    const response = await api.get('/academics/batches/', { params });
    return response.data;
  },

  createBatch: async (batchData) => {
    const response = await api.post('/academics/batches/', batchData);
    return response.data;
  },

  getBatch: async (batchId) => {
    const response = await api.get(`/academics/batches/${batchId}`);
    return response.data;
  },

  updateBatch: async (batchId, batchData) => {
    const response = await api.put(`/academics/batches/${batchId}`, batchData);
    return response.data;
  },

  deleteBatch: async (batchId) => {
    const response = await api.delete(`/academics/batches/${batchId}`);
    return response.data;
  },

  // Class Assignments
  getClassAssignments: async (params = {}) => {
    const response = await api.get('/academics/class-assignments/', { params });
    return response.data;
  },

  createClassAssignment: async (classData) => {
    const response = await api.post('/academics/class-assignments/', classData);
    return response.data;
  },

  getUpcomingClasses: async (days = 7) => {
    const response = await api.get(`/academics/class-assignments/upcoming?days=${days}`);
    return response.data;
  },

  // Exams
  getExams: async (params = {}) => {
    const response = await api.get('/academics/exams/', { params });
    return response.data;
  },

  createExam: async (examData) => {
    const response = await api.post('/academics/exams/', examData);
    return response.data;
  },

  // Exam Results
  getExamResults: async (params = {}) => {
    const response = await api.get('/academics/exam-results/', { params });
    return response.data;
  },

  createExamResult: async (resultData) => {
    const response = await api.post('/academics/exam-results/', resultData);
    return response.data;
  },

  // Attendance
  getAttendance: async (params = {}) => {
    const response = await api.get('/academics/attendance/', { params });
    return response.data;
  },

  markAttendance: async (attendanceData) => {
    const response = await api.post('/academics/attendance/', attendanceData);
    return response.data;
  },

  markBulkAttendance: async (attendanceList) => {
    const response = await api.post('/academics/attendance/bulk', attendanceList);
    return response.data;
  },

  getAttendanceSummary: async (studentId, params = {}) => {
    const response = await api.get(`/academics/attendance/summary/${studentId}`, { params });
    return response.data;
  },

  // Behavior Records
  getBehaviorRecords: async (params = {}) => {
    const response = await api.get('/academics/behavior-records/', { params });
    return response.data;
  },

  createBehaviorRecord: async (recordData) => {
    const response = await api.post('/academics/behavior-records/', recordData);
    return response.data;
  },

  // Report Cards
  getReportCards: async (params = {}) => {
    const response = await api.get('/academics/report-cards/', { params });
    return response.data;
  },

  generateReportCard: async (reportData) => {
    const response = await api.post('/academics/report-cards/', reportData);
    return response.data;
  },

  // Tasks
  getTasks: async (params = {}) => {
    const response = await api.get('/academics/tasks/', { params });
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/academics/tasks/', taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/academics/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Payments
  getPayments: async (params = {}) => {
    const response = await api.get('/academics/payments/', { params });
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await api.post('/academics/payments/', paymentData);
    return response.data;
  },
};

// Messaging API
export const messagingAPI = {
  // Direct Messages
  sendMessage: async (messageData) => {
    const response = await api.post('/messaging/messages/', messageData);
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/messaging/messages/conversations');
    return response.data;
  },

  getMessagesWithUser: async (userId, params = {}) => {
    const response = await api.get(`/messaging/messages/${userId}`, { params });
    return response.data;
  },

  // Group Chat
  createGroup: async (groupData) => {
    const response = await api.post('/messaging/groups/', groupData);
    return response.data;
  },

  getMyGroups: async () => {
    const response = await api.get('/messaging/groups/');
    return response.data;
  },

  addGroupMembers: async (groupId, memberData) => {
    const response = await api.post(`/messaging/groups/${groupId}/members`, memberData);
    return response.data;
  },

  sendGroupMessage: async (groupId, messageData) => {
    const response = await api.post(`/messaging/groups/${groupId}/messages`, messageData);
    return response.data;
  },

  getGroupMessages: async (groupId, params = {}) => {
    const response = await api.get(`/messaging/groups/${groupId}/messages`, { params });
    return response.data;
  },

  getGroupMembers: async (groupId) => {
    const response = await api.get(`/messaging/groups/${groupId}/members`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications/', { params });
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  sendBulkNotification: async (notificationData) => {
    const response = await api.post('/notifications/send-bulk', notificationData);
    return response.data;
  },

  sendRoleBasedNotification: async (notificationData) => {
    const response = await api.post('/notifications/send-role-based', notificationData);
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  submitFeedback: async (feedbackData) => {
    const response = await api.post('/feedback/', feedbackData);
    return response.data;
  },

  getMyFeedback: async (params = {}) => {
    const response = await api.get('/feedback/my-feedback', { params });
    return response.data;
  },

  getAllFeedback: async (params = {}) => {
    const response = await api.get('/feedback/', { params });
    return response.data;
  },

  getPendingFeedback: async (params = {}) => {
    const response = await api.get('/feedback/pending', { params });
    return response.data;
  },

  getFeedbackStats: async () => {
    const response = await api.get('/feedback/stats');
    return response.data;
  },

  getFeedbackDetail: async (feedbackId) => {
    const response = await api.get(`/feedback/${feedbackId}`);
    return response.data;
  },

  respondToFeedback: async (feedbackId, responseData) => {
    const response = await api.put(`/feedback/${feedbackId}/respond`, responseData);
    return response.data;
  },

  updateFeedbackStatus: async (feedbackId, status) => {
    const response = await api.put(`/feedback/${feedbackId}/status`, { status });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // User Management
  createUser: async (userData) => {
    const response = await api.post('/admin/users/', userData);
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Student Management
  createStudentWithUser: async (studentData) => {
    const response = await api.post('/admin/students/', studentData);
    return response.data;
  },

  getAllStudents: async (params = {}) => {
    const response = await api.get('/admin/students/', { params });
    return response.data;
  },

  // Teacher Management
  createTeacherWithUser: async (teacherData) => {
    const response = await api.post('/admin/teachers/', teacherData);
    return response.data;
  },

  getAllTeachers: async (params = {}) => {
    const response = await api.get('/admin/teachers/', { params });
    return response.data;
  },

  // Analytics
  getSystemOverview: async () => {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },

  getAttendanceAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/attendance', { params });
    return response.data;
  },

  getPerformanceAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/performance', { params });
    return response.data;
  },

  // Bulk Operations
  bulkActivateUsers: async (userIds) => {
    const response = await api.post('/admin/bulk/activate-users', { user_ids: userIds });
    return response.data;
  },

  bulkDeactivateUsers: async (userIds) => {
    const response = await api.post('/admin/bulk/deactivate-users', { user_ids: userIds });
    return response.data;
  },

  bulkAssignBatch: async (studentIds, batchId) => {
    const response = await api.post('/admin/bulk/assign-batch', { student_ids: studentIds, batch_id: batchId });
    return response.data;
  },

  // Maintenance
  cleanupNotifications: async (daysOld = 30) => {
    const response = await api.post('/admin/maintenance/cleanup-notifications', { days_old: daysOld });
    return response.data;
  },

  // Export
  exportUsersData: async (role = null) => {
    const params = role ? { role } : {};
    const response = await api.get('/admin/export/users', { params });
    return response.data;
  },
};

// Permissions API
export const permissionsAPI = {
  createPermission: async (permissionData) => {
    const response = await api.post('/permissions/', permissionData);
    return response.data;
  },

  getPermissions: async () => {
    const response = await api.get('/permissions/');
    return response.data;
  },

  assignRolePermission: async (rolePermissionData) => {
    const response = await api.post('/permissions/role-permissions/', rolePermissionData);
    return response.data;
  },

  assignUserPermission: async (userPermissionData) => {
    const response = await api.post('/permissions/user-permissions/', userPermissionData);
    return response.data;
  },

  getRolePermissions: async (role) => {
    const response = await api.get(`/permissions/role/${role}/permissions`);
    return response.data;
  },

  getUserPermissions: async (userId) => {
    const response = await api.get(`/permissions/user/${userId}/permissions`);
    return response.data;
  },

  getMyPermissions: async () => {
    const response = await api.get('/permissions/my-permissions');
    return response.data;
  },
};

// Access Request API
export const accessRequestAPI = {
  getAccessRequests: async (params = {}) => {
    const response = await api.get('/auth/access-requests', { params });
    return response.data;
  },

  approveRequest: async (requestId, data = {}) => {
    const response = await api.post(`/auth/access-requests/${requestId}/approve`, data);
    return response.data;
  },

  rejectRequest: async (requestId, data) => {
    const response = await api.post(`/auth/access-requests/${requestId}/reject`, data);
    return response.data;
  },

  getRequestDetails: async (requestId) => {
    const response = await api.get(`/auth/access-requests/${requestId}`);
    return response.data;
  },
};

export default api;
