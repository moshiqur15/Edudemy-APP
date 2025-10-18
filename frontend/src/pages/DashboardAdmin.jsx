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
  BarChart3,
  AlertTriangle,
  Target,
  Activity,
  RefreshCcw,
  Eye
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
  
  // Analytics states
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null);
  const [priorityAlerts, setPriorityAlerts] = useState({ critical: [], high_priority: [], medium_priority: [] });
  const [classPerformance, setClassPerformance] = useState([]);
  const [recentAnalyticsUpdates, setRecentAnalyticsUpdates] = useState([]);

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

  const loadAnalyticsData = async () => {
    try {
      // Load dashboard analytics summary
      const dashboardResponse = await fetch('/api/students/analytics/dashboard-summary');
      if (dashboardResponse.ok) {
        const dashboard = await dashboardResponse.json();
        setDashboardAnalytics(dashboard);
        setClassPerformance(dashboard.class_performance || []);
        setRecentAnalyticsUpdates(dashboard.recent_updates || []);
      }
      
      // Load priority alerts
      const alertsResponse = await fetch('/api/students/analytics/priority-alerts');
      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json();
        setPriorityAlerts(alerts);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data first
      await loadAnalyticsData();
      
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
      
      // Get analytics data for additional stats
      const avgFifaRating = dashboardAnalytics?.system_stats?.avg_fifa_rating || 0;
      const highRiskStudents = dashboardAnalytics?.system_stats?.high_risk_students || 0;
      
      // Update stats with analytics integration
      setStats([
        { title: 'Total Students', value: totalStudents.toString(), icon: Users, color: 'blue', trend: 'up', trendValue: `+${Math.floor(totalStudents * 0.1)}` },
        { title: 'Active Teachers', value: activeTeachers.toString(), icon: UserCheck, color: 'green', trend: 'up', trendValue: `+${Math.floor(activeTeachers * 0.05)}` },
        { title: 'Average FIFA Rating', value: avgFifaRating.toFixed(1), icon: Award, color: 'yellow', trend: avgFifaRating > 70 ? 'up' : 'down', trendValue: avgFifaRating > 70 ? '+5%' : '-3%' },
        { title: 'Students at Risk', value: highRiskStudents.toString(), icon: AlertTriangle, color: 'red', trend: 'down', trendValue: highRiskStudents > 0 ? `${highRiskStudents} need attention` : 'All good!' },
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

        {/* Priority Alerts and Analytics Section */}
        {(priorityAlerts.critical?.length > 0 || priorityAlerts.high_priority?.length > 0) && (
          <div className="card p-6 border-l-4 border-orange-500 bg-orange-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-800">Priority Student Alerts</h3>
              </div>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Eye size={16} />
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {priorityAlerts.critical?.length > 0 && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-red-600" />
                    <span className="font-medium text-red-800">Critical</span>
                  </div>
                  <div className="text-2xl font-bold text-red-900">{priorityAlerts.critical.length}</div>
                  <div className="text-sm text-red-700">Students need immediate attention</div>
                </div>
              )}
              
              {priorityAlerts.high_priority?.length > 0 && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-orange-600" />
                    <span className="font-medium text-orange-800">High Priority</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">{priorityAlerts.high_priority.length}</div>
                  <div className="text-sm text-orange-700">Students at risk</div>
                </div>
              )}
              
              {priorityAlerts.medium_priority?.length > 0 && (
                <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-yellow-600" />
                    <span className="font-medium text-yellow-800">Needs Attention</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">{priorityAlerts.medium_priority.length}</div>
                  <div className="text-sm text-yellow-700">Students to monitor</div>
                </div>
              )}
            </div>
            
            {/* Show top priority students */}
            <div className="space-y-2">
              {[...priorityAlerts.critical || [], ...priorityAlerts.high_priority || []]
                .slice(0, 3).map((student, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      student.risk_level === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                    }`}>
                      {student.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.class} | FIFA: {student.fifa_rating?.toFixed(1) || '0.0'}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    student.risk_level === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {student.risk_level?.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Analytics and Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Performance */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Class Performance</h3>
              <button
                onClick={loadAnalyticsData}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCcw size={14} />
                Refresh
              </button>
            </div>
            
            {classPerformance.length > 0 ? (
              <div className="space-y-3">
                {classPerformance.map((classData, index) => {
                  const performanceColor = classData.avg_rating >= 80 ? 'green' :
                                         classData.avg_rating >= 60 ? 'yellow' :
                                         classData.avg_rating >= 40 ? 'orange' : 'red';
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{classData.class_name}</div>
                        <div className={`text-sm font-medium ${
                          performanceColor === 'green' ? 'text-green-600' :
                          performanceColor === 'yellow' ? 'text-yellow-600' :
                          performanceColor === 'orange' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          FIFA: {classData.avg_rating?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{classData.student_count} students</span>
                        <div className="flex items-center gap-3">
                          {classData.critical_students > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle size={12} />
                              {classData.critical_students}
                            </span>
                          )}
                          {classData.high_risk_students > 0 && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <TrendingUp size={12} />
                              {classData.high_risk_students}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Performance bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              performanceColor === 'green' ? 'bg-green-500' :
                              performanceColor === 'yellow' ? 'bg-yellow-500' :
                              performanceColor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(classData.avg_rating || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No class performance data available</p>
                  <button
                    onClick={loadAnalyticsData}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Load Analytics Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Analytics Updates */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analytics Updates</h3>
            {recentAnalyticsUpdates.length > 0 ? (
              <div className="space-y-3">
                {recentAnalyticsUpdates.slice(0, 6).map((update, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      update.risk_level === 'critical' ? 'bg-red-500' :
                      update.risk_level === 'high' ? 'bg-orange-500' :
                      update.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {update.student_name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{update.student_name}</div>
                      <div className="text-xs text-gray-500">
                        {update.class_name} | FIFA: {update.fifa_rating?.toFixed(1) || '0.0'}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      update.risk_level === 'critical' ? 'bg-red-100 text-red-700' :
                      update.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                      update.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {update.risk_level || 'low'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No recent analytics updates</p>
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
