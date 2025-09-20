import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Award,
  BarChart3,
  User
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MyClasses() {
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  // Mock data - replace with real API calls
  const mockClasses = [
    {
      id: 1,
      name: 'Mathematics Advanced',
      subject: 'Mathematics',
      batchCode: 'MATH-101',
      totalStudents: 24,
      schedule: 'Mon, Wed, Fri - 09:00 AM',
      room: 'Room 101',
      duration: '2 hours',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      progress: 75,
      attendance: 92,
      nextClass: 'Tomorrow at 09:00 AM',
      students: [
        { id: 1, name: 'John Doe', attendance: 95, lastScore: 85, status: 'Active' },
        { id: 2, name: 'Jane Smith', attendance: 88, lastScore: 92, status: 'Active' },
        { id: 3, name: 'Mike Johnson', attendance: 76, lastScore: 78, status: 'Active' },
        { id: 4, name: 'Sarah Wilson', attendance: 94, lastScore: 88, status: 'Active' },
      ],
      recentAssignments: [
        { id: 1, title: 'Calculus Problem Set 3', dueDate: '2024-08-20', submitted: 22, total: 24 },
        { id: 2, title: 'Algebra Quiz', dueDate: '2024-08-18', submitted: 24, total: 24 },
      ]
    },
    {
      id: 2,
      name: 'Physics Lab',
      subject: 'Physics',
      batchCode: 'PHY-205',
      totalStudents: 18,
      schedule: 'Tue, Thu - 02:00 PM',
      room: 'Lab 205',
      duration: '3 hours',
      startDate: '2024-02-01',
      endDate: '2024-07-01',
      progress: 60,
      attendance: 85,
      nextClass: 'Today at 02:00 PM',
      students: [
        { id: 5, name: 'Alex Brown', attendance: 89, lastScore: 91, status: 'Active' },
        { id: 6, name: 'Emma Davis', attendance: 92, lastScore: 87, status: 'Active' },
        { id: 7, name: 'Tom Wilson', attendance: 67, lastScore: 74, status: 'Active' },
      ],
      recentAssignments: [
        { id: 3, title: 'Lab Report - Optics', dueDate: '2024-08-22', submitted: 15, total: 18 },
        { id: 4, title: 'Wave Physics Assignment', dueDate: '2024-08-19', submitted: 18, total: 18 },
      ]
    },
    {
      id: 3,
      name: 'Chemistry Theory',
      subject: 'Chemistry',
      batchCode: 'CHEM-301',
      totalStudents: 22,
      schedule: 'Mon, Wed - 04:30 PM',
      room: 'Room 203',
      duration: '1.5 hours',
      startDate: '2024-01-20',
      endDate: '2024-06-20',
      progress: 80,
      attendance: 88,
      nextClass: 'Monday at 04:30 PM',
      students: [
        { id: 8, name: 'Lisa Johnson', attendance: 91, lastScore: 89, status: 'Active' },
        { id: 9, name: 'David Lee', attendance: 84, lastScore: 86, status: 'Active' },
        { id: 10, name: 'Anna White', attendance: 96, lastScore: 94, status: 'Active' },
      ],
      recentAssignments: [
        { id: 5, title: 'Organic Chemistry Test', dueDate: '2024-08-21', submitted: 20, total: 22 },
      ]
    }
  ];

  const attendanceData = [
    { week: 'Week 1', 'Math Advanced': 95, 'Physics Lab': 88, 'Chemistry Theory': 92 },
    { week: 'Week 2', 'Math Advanced': 92, 'Physics Lab': 85, 'Chemistry Theory': 89 },
    { week: 'Week 3', 'Math Advanced': 94, 'Physics Lab': 82, 'Chemistry Theory': 91 },
    { week: 'Week 4', 'Math Advanced': 91, 'Physics Lab': 87, 'Chemistry Theory': 88 },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setMyClasses(mockClasses);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{myClasses.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                <BookOpen size={24} />
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myClasses.reduce((sum, cls) => sum + cls.totalStudents, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(myClasses.reduce((sum, cls) => sum + cls.attendance, 0) / myClasses.length)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            myClasses.map((classItem) => (
              <div key={classItem.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{classItem.name}</h3>
                    <p className="text-sm text-gray-600">{classItem.batchCode} • {classItem.subject}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {classItem.totalStudents} students
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    {classItem.schedule} ({classItem.duration})
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    Next: {classItem.nextClass}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen size={16} className="mr-2" />
                    {classItem.room}
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Course Progress</span>
                      <span className="font-medium">{classItem.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(classItem.progress)}`}
                        style={{ width: `${classItem.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Attendance:</span>
                    <span className={`font-medium ${getAttendanceColor(classItem.attendance)}`}>
                      {classItem.attendance}%
                    </span>
                  </div>
                </div>

                {/* Recent assignments */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recent Assignments</p>
                  <div className="space-y-1">
                    {classItem.recentAssignments.slice(0, 2).map((assignment) => (
                      <div key={assignment.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 truncate">{assignment.title}</span>
                        <span className="text-gray-500 ml-2">
                          {assignment.submitted}/{assignment.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedClass(classItem)}
                    className="btn-primary text-sm flex-1 py-2"
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded">
                    <FileText size={16} />
                  </button>
                  <button className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded">
                    <Award size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Attendance Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance Trends</h3>
            <BarChart3 size={20} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Math Advanced" fill="#3B82F6" />
              <Bar dataKey="Physics Lab" fill="#10B981" />
              <Bar dataKey="Chemistry Theory" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Class Detail Modal */}
        {selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">{selectedClass.name} - Details</h3>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Class Info */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Class Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Subject:</span>
                        <p className="text-sm font-medium">{selectedClass.subject}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Batch Code:</span>
                        <p className="text-sm font-medium">{selectedClass.batchCode}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Schedule:</span>
                        <p className="text-sm font-medium">{selectedClass.schedule}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Duration:</span>
                        <p className="text-sm font-medium">{selectedClass.duration}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Room:</span>
                        <p className="text-sm font-medium">{selectedClass.room}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Period:</span>
                        <p className="text-sm font-medium">
                          {new Date(selectedClass.startDate).toLocaleDateString()} - {new Date(selectedClass.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Students List */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Students ({selectedClass.students.length})
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedClass.students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">
                                Attendance: {student.attendance}% • Last Score: {student.lastScore}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {student.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assignments */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Recent Assignments</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assignment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedClass.recentAssignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assignment.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.submitted}/{assignment.total}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                assignment.submitted === assignment.total 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {assignment.submitted === assignment.total ? 'Complete' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
