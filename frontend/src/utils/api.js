// Mock API functions for Task Management and Activity Logs
// In a real application, these would be actual API calls to your backend

// Task Management API functions
export const taskAPI = {
  // Get all tasks for a user (assigned by or assigned to)
  getTasks: async (userId, role = 'all') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock task data - in real app, this would come from database
    const mockTasks = [
      {
        id: 1,
        title: "Review Student Performance Reports",
        description: "Analyze quarterly performance reports for Class 10 students and provide feedback recommendations.",
        subject: "Academic",
        priority: "high",
        status: "pending",
        assignedBy: "John Admin",
        assignedTo: "Jane Teacher",
        assignedToId: "teacher1",
        dueDate: "2024-01-15",
        createdDate: "2024-01-10",
        lastUpdate: "2024-01-12",
        messages: [
          { id: 1, user: "John Admin", message: "Please review the attached reports and provide your analysis.", timestamp: "2024-01-10 09:00", isAssigner: true },
          { id: 2, user: "Jane Teacher", message: "I've reviewed half of the reports. Will complete by tomorrow.", timestamp: "2024-01-12 14:30", isAssigner: false }
        ],
        attachments: [
          { id: 1, name: "Q4_Performance_Report.pdf", type: "pdf", size: "2.5 MB", url: "/files/report.pdf" }
        ]
      }
    ];
    
    return { success: true, data: mockTasks };
  },

  // Create a new task
  createTask: async (taskData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newTask = {
      id: Date.now(), // Mock ID generation
      ...taskData,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      messages: [
        {
          id: 1,
          user: taskData.assignedBy,
          message: `Task created: ${taskData.description}`,
          timestamp: new Date().toLocaleString(),
          isAssigner: true
        }
      ],
      attachments: taskData.attachments || []
    };
    
    return { success: true, data: newTask };
  },

  // Update task status
  updateTaskStatus: async (taskId, status) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { 
      success: true, 
      data: { 
        id: taskId, 
        status, 
        lastUpdate: new Date().toISOString().split('T')[0] 
      } 
    };
  },

  // Add message to task
  addTaskMessage: async (taskId, messageData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newMessage = {
      id: Date.now(),
      ...messageData,
      timestamp: new Date().toLocaleString()
    };
    
    return { success: true, data: newMessage };
  },

  // Upload file to task
  uploadTaskFile: async (taskId, file) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const uploadedFile = {
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      url: `/uploads/${Date.now()}_${file.name}`,
      uploadedAt: new Date().toISOString()
    };
    
    return { success: true, data: uploadedFile };
  },

  // Reassign task to another user
  reassignTask: async (taskId, newAssigneeId, newAssigneeName) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      success: true, 
      data: { 
        id: taskId, 
        assignedToId: newAssigneeId,
        assignedTo: newAssigneeName,
        status: 'pending',
        lastUpdate: new Date().toISOString().split('T')[0] 
      } 
    };
  },

  // Delete/Close task
  deleteTask: async (taskId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return { success: true, message: 'Task closed successfully' };
  }
};

// Activity Logs API functions
export const logsAPI = {
  // Get activity logs with filters
  getActivityLogs: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock log data
    const mockLogs = [
      {
        id: 1,
        userId: 'user1',
        userName: 'Current User',
        userRole: 'admin',
        action: 'Report Card Updated',
        details: 'Updated report card for Student John Doe - Class 10A',
        timestamp: '2024-01-15 14:30:25',
        category: 'academic'
      },
      {
        id: 2,
        userId: 'teacher1',
        userName: 'Jane Teacher',
        userRole: 'teacher',
        action: 'Attendance Taken',
        details: 'Marked attendance for Class 10A - Mathematics',
        timestamp: '2024-01-15 09:15:10',
        category: 'attendance'
      },
      {
        id: 3,
        userId: 'user1',
        userName: 'Current User',
        userRole: 'admin',
        action: 'Student Created',
        details: 'Added new student: Sarah Smith to Class 9B',
        timestamp: '2024-01-14 16:45:30',
        category: 'user_management'
      },
      {
        id: 4,
        userId: 'admin1',
        userName: 'Sarah Admin',
        userRole: 'admin',
        action: 'Teacher Created',
        details: 'Added new teacher: Michael Brown - Science Department',
        timestamp: '2024-01-14 11:20:45',
        category: 'user_management'
      },
      {
        id: 5,
        userId: 'teacher2',
        userName: 'Mike Teacher',
        userRole: 'teacher',
        action: 'Report Card Viewed',
        details: 'Viewed report card for Student Emma Wilson - Class 8A',
        timestamp: '2024-01-13 13:25:15',
        category: 'academic'
      },
      {
        id: 6,
        userId: 'user1',
        userName: 'Current User',
        userRole: 'admin',
        action: 'Batch Created',
        details: 'Created new batch: Advanced Mathematics - Grade 11',
        timestamp: '2024-01-12 10:15:30',
        category: 'batch_management'
      },
      {
        id: 7,
        userId: 'teacher1',
        userName: 'Jane Teacher',
        userRole: 'teacher',
        action: 'Grade Book Updated',
        details: 'Updated grades for Physics Quiz - Class 10A',
        timestamp: '2024-01-11 15:40:20',
        category: 'academic'
      },
      {
        id: 8,
        userId: 'admin1',
        userName: 'Sarah Admin',
        userRole: 'admin',
        action: 'System Settings Changed',
        details: 'Modified notification settings for all users',
        timestamp: '2024-01-10 12:30:00',
        category: 'system'
      }
    ];
    
    // Apply filters (simplified version)
    let filteredLogs = mockLogs;
    
    if (filters.category && filters.category !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }
    
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower)
      );
    }
    
    return { success: true, data: filteredLogs };
  },

  // Create new activity log
  createLog: async (logData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ...logData
    };
    
    return { success: true, data: newLog };
  },

  // Get hierarchical users (users under current user's management)
  getHierarchicalUsers: async (currentUserId, currentUserRole) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock hierarchical data - in real app, this would be based on org structure
    const mockUsers = [
      { id: currentUserId, name: 'Current User', role: currentUserRole },
      { id: 'teacher1', name: 'Jane Teacher', role: 'teacher' },
      { id: 'teacher2', name: 'Mike Teacher', role: 'teacher' },
      { id: 'admin1', name: 'Sarah Admin', role: 'admin' },
      { id: 'staff1', name: 'Tom Staff', role: 'staff' }
    ];
    
    return { success: true, data: mockUsers };
  }
};

// User Management API functions
export const usersAPI = {
  // Get users for task assignment
  getAssignableUsers: async (currentUserRole) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockUsers = [
      { id: "teacher1", name: "Jane Teacher", role: "teacher", email: "jane@school.com" },
      { id: "admin1", name: "Sarah Admin", role: "admin", email: "sarah@school.com" },
      { id: "it1", name: "Tom IT", role: "staff", email: "tom@school.com" },
      { id: "manager1", name: "Mike Manager", role: "management", email: "mike@school.com" }
    ];
    
    return { success: true, data: mockUsers };
  }
};

// File upload utility
export const fileAPI = {
  // Upload multiple files
  uploadFiles: async (files, taskId = null) => {
    const uploadPromises = files.map(async (file) => {
      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: `/uploads/${Date.now()}_${file.name}`,
        uploadedAt: new Date().toISOString(),
        taskId: taskId
      };
    });
    
    const uploadedFiles = await Promise.all(uploadPromises);
    return { success: true, data: uploadedFiles };
  }
};

// Notification API functions
export const notificationAPI = {
  // Send notification to user
  sendNotification: async (userId, notificationData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const notification = {
      id: Date.now(),
      userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      createdAt: new Date().toISOString(),
      read: false
    };
    
    return { success: true, data: notification };
  }
};

// Combined export for easy importing
export default {
  tasks: taskAPI,
  logs: logsAPI,
  users: usersAPI,
  files: fileAPI,
  notifications: notificationAPI
};