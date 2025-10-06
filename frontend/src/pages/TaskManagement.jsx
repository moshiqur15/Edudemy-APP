import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MessageCircle,
  Upload,
  Send,
  HelpCircle,
  Calendar,
  FileText,
  Image,
  Mic,
  X,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  Users,
  BookOpen,
  Building,
  GraduationCap,
  Settings,
  MoreVertical,
  Download,
  Paperclip
} from 'lucide-react';

const TaskManagement = ({ activeTab = 'assignment' }) => {
  const { user, hasRole } = useAuth();
  
  // States
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subject: 'Academic',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    attachments: []
  });
  
  const [taskMessage, setTaskMessage] = useState('');
  const [taskFiles, setTaskFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Mock data for tasks
  const [tasks, setTasks] = useState([
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
    },
    {
      id: 2,
      title: "Prepare Monthly Attendance Summary",
      description: "Compile attendance data for all classes and prepare monthly summary report.",
      subject: "Management",
      priority: "medium",
      status: "completed",
      assignedBy: "Mike Manager",
      assignedTo: "Sarah Admin",
      assignedToId: "admin1",
      dueDate: "2024-01-20",
      createdDate: "2024-01-05",
      lastUpdate: "2024-01-18",
      messages: [
        { id: 1, user: "Mike Manager", message: "Please prepare the monthly attendance summary as discussed.", timestamp: "2024-01-05 10:00", isAssigner: true },
        { id: 2, user: "Sarah Admin", message: "Completed the summary. Please find attached.", timestamp: "2024-01-18 16:00", isAssigner: false }
      ],
      attachments: [
        { id: 1, name: "Monthly_Attendance_Summary.xlsx", type: "excel", size: "1.2 MB", url: "/files/attendance.xlsx" },
        { id: 2, name: "Attendance_Analysis.pdf", type: "pdf", size: "800 KB", url: "/files/analysis.pdf" }
      ]
    },
    {
      id: 3,
      title: "Update School Website Content",
      description: "Update the school website with latest events, news, and announcements.",
      subject: "Office Works",
      priority: "low",
      status: "need_help",
      assignedBy: "Lisa Director",
      assignedTo: "Tom IT",
      assignedToId: "it1",
      dueDate: "2024-01-25",
      createdDate: "2024-01-08",
      lastUpdate: "2024-01-14",
      messages: [
        { id: 1, user: "Lisa Director", message: "Please update the website with the new content I shared.", timestamp: "2024-01-08 11:00", isAssigner: true },
        { id: 2, user: "Tom IT", message: "I need clarification on the event dates. The content seems to have conflicting information.", timestamp: "2024-01-14 09:30", isAssigner: false }
      ],
      attachments: [
        { id: 1, name: "Website_Content_Draft.docx", type: "document", size: "450 KB", url: "/files/content.docx" }
      ]
    }
  ]);
  
  // Mock data for users (for assignment dropdown)
  const [users, setUsers] = useState([
    { id: "teacher1", name: "Jane Teacher", role: "teacher", email: "jane@school.com" },
    { id: "admin1", name: "Sarah Admin", role: "admin", email: "sarah@school.com" },
    { id: "it1", name: "Tom IT", role: "staff", email: "tom@school.com" },
    { id: "manager1", name: "Mike Manager", role: "management", email: "mike@school.com" }
  ]);

  const subjects = [
    { value: 'Academic', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
    { value: 'Management', icon: Users, color: 'bg-purple-100 text-purple-800' },
    { value: 'Office Works', icon: Building, color: 'bg-green-100 text-green-800' },
    { value: 'Student Improvement', icon: GraduationCap, color: 'bg-orange-100 text-orange-800' },
    { value: 'Others', icon: Settings, color: 'bg-gray-100 text-gray-800' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'need_help': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'need_help': return <HelpCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || task.subject === filterSubject;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    // For task assignment tab, show tasks assigned by current user
    // For task handling tab, show tasks assigned to current user
    const matchesUser = currentTab === 'assignment' 
      ? task.assignedBy === user?.full_name
      : task.assignedToId === user?.id;
    
    return matchesSearch && matchesSubject && matchesStatus && matchesUser;
  });

  const handleCreateTask = () => {
    const task = {
      id: tasks.length + 1,
      ...newTask,
      assignedBy: user?.full_name,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      messages: [
        {
          id: 1,
          user: user?.full_name,
          message: `Task created: ${newTask.description}`,
          timestamp: new Date().toLocaleString(),
          isAssigner: true
        }
      ],
      attachments: newTask.attachments
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      subject: 'Academic',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
      attachments: []
    });
    setShowNewTaskModal(false);
  };

  const handleSendMessage = (taskId) => {
    if (!taskMessage.trim()) return;

    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newMessage = {
          id: task.messages.length + 1,
          user: user?.full_name,
          message: taskMessage,
          timestamp: new Date().toLocaleString(),
          isAssigner: currentTab === 'assignment'
        };
        
        return {
          ...task,
          messages: [...task.messages, newMessage],
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    setTaskMessage('');
  };

  const handleSubmitTask = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'completed',
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setIsSubmitted(true);
  };

  const handleUnsubmitTask = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'pending',
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setIsSubmitted(false);
  };

  const handleNeedHelp = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'need_help',
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const handleCloseTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const handleReassignTask = (taskId, newAssigneeId) => {
    const newAssignee = users.find(u => u.id === newAssigneeId);
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignedTo: newAssignee.name,
          assignedToId: newAssigneeId,
          status: 'pending',
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const renderTaskAssignment = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Assignment</h2>
          <p className="text-gray-600">Assign and manage tasks for your team</p>
        </div>
        
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.value} value={subject.value}>{subject.value}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="need_help">Need Help</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task.id} className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-shadow cursor-pointer ${getStatusColor(task.status)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {subjects.find(s => s.value === task.subject) && (
                  <div className={`p-2 rounded-lg ${subjects.find(s => s.value === task.subject).color} mr-3`}>
                    {React.createElement(subjects.find(s => s.value === task.subject).icon, { size: 16 })}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
                  <p className="text-xs text-gray-600">{task.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <User size={14} className="mr-2" />
                {task.assignedTo}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-2" />
                Due: {task.dueDate}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorities.find(p => p.value === task.priority)?.color}`}>
                {priorities.find(p => p.value === task.priority)?.label}
              </span>
              
              <button
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskDetailModal(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Create your first task to get started.</p>
        </div>
      )}
    </div>
  );

  const renderTaskHandling = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Handling</h2>
          <p className="text-gray-600">View and complete tasks assigned to you</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.value} value={subject.value}>{subject.value}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="need_help">Need Help</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <div key={task.id} className={`bg-white rounded-lg border-2 p-6 ${getStatusColor(task.status)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center flex-1">
                {subjects.find(s => s.value === task.subject) && (
                  <div className={`p-2 rounded-lg ${subjects.find(s => s.value === task.subject).color} mr-4`}>
                    {React.createElement(subjects.find(s => s.value === task.subject).icon, { size: 20 })}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                  <p className="text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      From: {task.assignedBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Due: {task.dueDate}
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorities.find(p => p.value === task.priority)?.color}`}>
                      {priorities.find(p => p.value === task.priority)?.label}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <span className="text-sm font-medium capitalize">{task.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {task.status === 'completed' ? (
                <button
                  onClick={() => handleUnsubmitTask(task.id)}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <X size={16} className="mr-2" />
                  Unsubmit
                </button>
              ) : (
                <button
                  onClick={() => handleSubmitTask(task.id)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Submit
                </button>
              )}
              
              <button
                onClick={() => handleNeedHelp(task.id)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={task.status === 'need_help'}
              >
                <HelpCircle size={16} className="mr-2" />
                Need Help
              </button>
              
              <button
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskDetailModal(true);
                }}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MessageCircle size={16} className="mr-2" />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
          <p className="text-gray-600">You don't have any tasks assigned to you at the moment.</p>
        </div>
      )}
    </div>
  );

  const renderNewTaskModal = () => {
    if (!showNewTaskModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
            <button
              onClick={() => setShowNewTaskModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleCreateTask(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {subjects.map(subject => (
                      <option key={subject.value} value={subject.value}>{subject.value}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value, assignedToId: users.find(u => u.name === e.target.value)?.id})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.name}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderTaskDetailModal = () => {
    if (!showTaskDetailModal || !selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              {subjects.find(s => s.value === selectedTask.subject) && (
                <div className={`p-2 rounded-lg ${subjects.find(s => s.value === selectedTask.subject).color} mr-3`}>
                  {React.createElement(subjects.find(s => s.value === selectedTask.subject).icon, { size: 20 })}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h3>
                <p className="text-sm text-gray-600">{selectedTask.subject}</p>
              </div>
            </div>
            <button
              onClick={() => setShowTaskDetailModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Details */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned By</label>
                    <p className="text-gray-900">{selectedTask.assignedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned To</label>
                    <p className="text-gray-900">{selectedTask.assignedTo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${priorities.find(p => p.value === selectedTask.priority)?.color}`}>
                      {priorities.find(p => p.value === selectedTask.priority)?.label}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center">
                      {getStatusIcon(selectedTask.status)}
                      <span className="ml-2 capitalize">{selectedTask.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <p className="text-gray-900">{selectedTask.dueDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Update</label>
                    <p className="text-gray-900">{selectedTask.lastUpdate}</p>
                  </div>
                </div>

                {/* Attachments */}
                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedTask.attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Paperclip size={16} className="text-gray-500 mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                            <p className="text-xs text-gray-600">{attachment.size}</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700">
                            <Download size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Messages</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTask.messages.map(message => (
                      <div key={message.id} className={`p-3 rounded-lg ${message.isAssigner ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-300'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-gray-900">{message.user}</span>
                          <span className="text-xs text-gray-600">{message.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700">{message.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="mt-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={taskMessage}
                        onChange={(e) => setTaskMessage(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(selectedTask.id)}
                      />
                      <button
                        onClick={() => handleSendMessage(selectedTask.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        disabled={!taskMessage.trim()}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Actions</h4>
                  
                  {currentTab === 'assignment' ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleCloseTask(selectedTask.id)}
                        className="w-full flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Close Task
                      </button>
                      
                      <select
                        onChange={(e) => e.target.value && handleReassignTask(selectedTask.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="">Reassign to...</option>
                        {users.filter(u => u.id !== selectedTask.assignedToId).map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTask.status === 'completed' ? (
                        <button
                          onClick={() => handleUnsubmitTask(selectedTask.id)}
                          className="w-full flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                          <X size={16} className="mr-2" />
                          Unsubmit
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubmitTask(selectedTask.id)}
                          className="w-full flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Submit Task
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleNeedHelp(selectedTask.id)}
                        className="w-full flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        disabled={selectedTask.status === 'need_help'}
                      >
                        <HelpCircle size={16} className="mr-2" />
                        Need Help
                      </button>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.wav"
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-600">Manage and track tasks efficiently</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentTab('assignment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentTab === 'assignment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Task Assignment
            </button>
            <button
              onClick={() => setCurrentTab('handling')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentTab === 'handling'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Task Handling
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {currentTab === 'assignment' && renderTaskAssignment()}
        {currentTab === 'handling' && renderTaskHandling()}
      </div>

      {/* Modals */}
      {renderNewTaskModal()}
      {renderTaskDetailModal()}
    </div>
  );
};

export default TaskManagement;