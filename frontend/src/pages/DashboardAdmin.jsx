import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { studentsAPI, teachersAPI, academicsAPI, dashboardAPI } from '../services/api';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Total Students', value: '0', icon: Users, color: 'blue', trend: 'up', trendValue: '+0%' },
    { title: 'Active Teachers', value: '0', icon: UserCheck, color: 'green', trend: 'up', trendValue: '+0%' },
    { title: 'Total Batches', value: '0', icon: BookOpen, color: 'purple', trend: 'up', trendValue: '+0%' },
    { title: 'Monthly Revenue', value: '$0', icon: TrendingUp, color: 'orange', trend: 'up', trendValue: '+0%' },
  ]);

  const [enrollmentData, setEnrollmentData] = useState([]);
  const [batchDistribution, setBatchDistribution] = useState([]);

  const recentActivityData = [
    { id: 1, type: 'student', action: 'New student enrolled', user: 'John Doe', time: '2 minutes ago', color: 'text-green-600' },
    { id: 2, type: 'teacher', action: 'Teacher profile updated', user: 'Sarah Wilson', time: '15 minutes ago', color: 'text-blue-600' },
    { id: 3, type: 'batch', action: 'New batch created', user: 'Physics Advanced', time: '1 hour ago', color: 'text-purple-600' },
    { id: 4, type: 'payment', action: 'Payment received', user: 'Emma Johnson', time: '2 hours ago', color: 'text-orange-600' },
    { id: 5, type: 'alert', action: 'System maintenance scheduled', user: 'System', time: '3 hours ago', color: 'text-red-600' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from APIs
      const [studentsResponse, teachersResponse, batchesResponse] = await Promise.all([
        studentsAPI.getStudents().catch(() => ({ data: [] })),
        teachersAPI.getTeachers().catch(() => []),
        academicsAPI.getBatches().catch(() => ({ results: [] }))
      ]);
      
      // Process students data
      const students = Array.isArray(studentsResponse) ? studentsResponse : (studentsResponse.data || []);
      const totalStudents = students.length;
      
      // Process teachers data  
      const teachers = Array.isArray(teachersResponse) ? teachersResponse : (teachersResponse.data || []);
      const totalTeachers = teachers.length;
      const activeTeachers = teachers.filter(t => t.is_active !== false).length;
      
      // Process batches data
      const batches = Array.isArray(batchesResponse) ? batchesResponse : (batchesResponse.results || []);
      const totalBatches = batches.length;
      
      // Calculate monthly revenue (mock for now)
      const monthlyRevenue = totalStudents * 1200; // Assuming $1200 per student per month
      
      // Update stats
      setStats([
        { title: 'Total Students', value: totalStudents.toString(), icon: Users, color: 'blue', trend: 'up', trendValue: `+${Math.floor(totalStudents * 0.1)}` },
        { title: 'Active Teachers', value: activeTeachers.toString(), icon: UserCheck, color: 'green', trend: 'up', trendValue: `+${Math.floor(activeTeachers * 0.05)}` },
        { title: 'Total Batches', value: totalBatches.toString(), icon: BookOpen, color: 'purple', trend: 'up', trendValue: `+${Math.floor(totalBatches * 0.08)}` },
        { title: 'Monthly Revenue', value: `$${monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: 'orange', trend: 'up', trendValue: '+15%' },
      ]);
      
      // Generate batch distribution based on class_name
      const classDistribution = batches.reduce((acc, batch) => {
        const className = batch.class_name || 'Unknown';
        acc[className] = (acc[className] || 0) + (batch.current_students || 0);
        return acc;
      }, {});
      
      const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#8B5A2B'];
      const distributionData = Object.entries(classDistribution).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));
      
      setBatchDistribution(distributionData);
      
      // Generate enrollment trend data (mock based on current data)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const enrollmentTrend = months.map((month, index) => {
        const factor = (index + 1) / 6;
        return {
          month,
          students: Math.floor(totalStudents * factor * 0.8),
          teachers: Math.floor(totalTeachers * factor * 0.9)
        };
      });
      
      setEnrollmentData(enrollmentTrend);
      
      // Set recent activities
      setRecentActivities(recentActivityData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'student': return Users;
      case 'teacher': return UserCheck;
      case 'batch': return BookOpen;
      case 'payment': return TrendingUp;
      case 'alert': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
              <p className="text-blue-100">Here's what's happening with your educational platform today.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BarChart3 size={32} className="text-white" />
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Trends */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trends</h3>
            {enrollmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#3B82F6" name="Students" />
                  <Bar dataKey="teachers" fill="#10B981" name="Teachers" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No enrollment data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Batch Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Distribution</h3>
            {batchDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={batchDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {batchDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No class data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                ))
              ) : (
                recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10`}>
                        <IconComponent size={16} className={activity.color} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/students')}
                className="w-full btn-primary text-left py-3 px-4 flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <Users size={20} className="mr-3" />
                  Add Student
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button 
                onClick={() => navigate('/admin/teachers')}
                className="w-full btn-success text-left py-3 px-4 flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <UserCheck size={20} className="mr-3" />
                  Add Teacher
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button 
                onClick={() => navigate('/admin/batches')}
                className="w-full btn-secondary text-left py-3 px-4 flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <BookOpen size={20} className="mr-3" />
                  Create Batch
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button 
                onClick={() => navigate('/admin/permissions')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-left py-3 px-4 rounded-md transition-colors duration-200 font-medium flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <BarChart3 size={20} className="mr-3" />
                  View Reports
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <Calendar size={24} className="text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Parent-Teacher Meeting</p>
                <p className="text-sm text-gray-600">Tomorrow at 10:00 AM</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <Award size={24} className="text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Academic Awards Ceremony</p>
                <p className="text-sm text-gray-600">Friday at 2:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-orange-50 rounded-lg">
              <BookOpen size={24} className="text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">New Batch Orientation</p>
                <p className="text-sm text-gray-600">Next Monday at 9:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
