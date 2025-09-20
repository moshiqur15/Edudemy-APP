import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { 
  Users, 
  BookOpen, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  FileText,
  TrendingUp,
  Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DashboardTeacher() {
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  const stats = [
    { title: 'My Classes', value: '6', icon: BookOpen, color: 'blue', trend: 'up', trendValue: '+1' },
    { title: 'Total Students', value: '142', icon: Users, color: 'green', trend: 'up', trendValue: '+8' },
    { title: 'Avg Attendance', value: '87%', icon: CheckCircle, color: 'purple', trend: 'up', trendValue: '+3%' },
    { title: 'Monthly Rating', value: '4.8', icon: Star, color: 'orange', trend: 'up', trendValue: '+0.2' },
  ];

  const attendanceData = [
    { week: 'Week 1', attendance: 85, assignments: 92 },
    { week: 'Week 2', attendance: 88, assignments: 87 },
    { week: 'Week 3', attendance: 92, assignments: 95 },
    { week: 'Week 4', attendance: 87, assignments: 89 },
    { week: 'Week 5', attendance: 90, assignments: 94 },
  ];

  const upcomingClassesData = [
    {
      id: 1,
      subject: 'Mathematics Advanced',
      time: '09:00 AM',
      duration: '2 hours',
      students: 24,
      room: 'Room 101',
      type: 'Lecture',
      color: 'blue'
    },
    {
      id: 2,
      subject: 'Physics Lab',
      time: '02:00 PM',
      duration: '3 hours',
      students: 18,
      room: 'Lab 205',
      type: 'Practical',
      color: 'green'
    },
    {
      id: 3,
      subject: 'Chemistry Theory',
      time: '04:30 PM',
      duration: '1.5 hours',
      students: 22,
      room: 'Room 203',
      type: 'Lecture',
      color: 'purple'
    },
  ];

  const recentActivitiesData = [
    {
      id: 1,
      type: 'assignment',
      action: 'Assignment submitted',
      details: 'John Doe submitted Calculus Assignment #3',
      time: '10 minutes ago',
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'grade',
      action: 'Grades published',
      details: 'Physics Quiz #2 grades are now available',
      time: '1 hour ago',
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'message',
      action: 'New message received',
      details: 'Sarah Wilson asked about tomorrow\'s class',
      time: '2 hours ago',
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'attendance',
      action: 'Attendance marked',
      details: 'Mathematics Advanced - 23/24 present',
      time: '3 hours ago',
      color: 'text-orange-600'
    },
  ];

  const myClasses = [
    {
      id: 1,
      name: 'Mathematics Advanced',
      students: 24,
      schedule: 'Mon, Wed, Fri - 09:00 AM',
      progress: 75,
      nextClass: 'Tomorrow 09:00 AM',
      color: 'blue'
    },
    {
      id: 2,
      name: 'Physics Lab',
      students: 18,
      schedule: 'Tue, Thu - 02:00 PM',
      progress: 60,
      nextClass: 'Today 02:00 PM',
      color: 'green'
    },
    {
      id: 3,
      name: 'Chemistry Theory',
      students: 22,
      schedule: 'Mon, Wed - 04:30 PM',
      progress: 80,
      nextClass: 'Today 04:30 PM',
      color: 'purple'
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setUpcomingClasses(upcomingClassesData);
      setRecentActivities(recentActivitiesData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment': return FileText;
      case 'grade': return Award;
      case 'message': return AlertCircle;
      case 'attendance': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Good morning, Teacher!</h2>
              <p className="text-green-100">You have 3 classes scheduled for today. Keep up the great work!</p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BookOpen size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {/* Today's Schedule & Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Classes */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <Calendar size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))
              ) : (
                upcomingClasses.map((classItem) => (
                  <div key={classItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{classItem.subject}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        classItem.type === 'Lecture' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {classItem.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <Clock size={14} className="mr-2" />
                        {classItem.time} ({classItem.duration})
                      </p>
                      <p className="flex items-center">
                        <Users size={14} className="mr-2" />
                        {classItem.students} students • {classItem.room}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Trends</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} name="Attendance %" />
                <Line type="monotone" dataKey="assignments" stroke="#3B82F6" strokeWidth={2} name="Assignment Completion %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* My Classes & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Classes */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClasses.map((classItem) => (
                <div key={classItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                    <span className="text-sm font-medium text-gray-500">{classItem.students} students</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{classItem.schedule}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Course Progress</span>
                      <span className="font-medium">{classItem.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          classItem.color === 'blue' ? 'bg-blue-500' :
                          classItem.color === 'green' ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${classItem.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Next: {classItem.nextClass}</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10 flex-shrink-0`}>
                        <IconComponent size={16} className={activity.color} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
              <CheckCircle size={24} className="text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Mark Attendance</p>
                <p className="text-sm text-blue-600">Today's classes</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
              <FileText size={24} className="text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-green-900">Grade Assignments</p>
                <p className="text-sm text-green-600">12 pending</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
              <Calendar size={24} className="text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-purple-900">Schedule Class</p>
                <p className="text-sm text-purple-600">Create new session</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
              <TrendingUp size={24} className="text-orange-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-orange-900">View Reports</p>
                <p className="text-sm text-orange-600">Class analytics</p>
              </div>
            </button>
          </div>
        </div>
      </div>
  );
}
