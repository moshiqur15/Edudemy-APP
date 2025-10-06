import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI } from '../services/api';
import PrintableReportCard from '../components/PrintableReportCard';
import {
  Search,
  Filter,
  Download,
  FileText,
  Calendar,
  User,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Users,
  Eye,
  Printer,
  Mail,
  Share2,
  ArrowLeft,
  Star,
  Target
} from 'lucide-react';

// Subject definitions by class
const CLASS_SUBJECTS = {
  "Class 6": ["Bangla", "English", "I.C.T", "Mathematics", "Science", "B.G.S", "Religion"],
  "Class 7": ["Bangla", "English", "I.C.T", "Mathematics", "Science", "B.G.S", "Religion"],
  "Class 8": ["Bangla", "English", "I.C.T", "Mathematics", "Science", "B.G.S", "Religion"],
  "Class 9": ["Bangla", "English", "I.C.T", "Mathematics", "Higher Mathematics", "Physics", "Chemistry", "Biology"],
  "Class 10": ["Bangla", "English", "I.C.T", "Mathematics", "Higher Mathematics", "Physics", "Chemistry", "Biology"],
  "SSC": ["Bangla", "English", "I.C.T", "Mathematics", "Higher Mathematics", "Physics", "Chemistry", "Biology"],
  "HSC 1st Year": ["Higher Mathematics", "Physics", "Chemistry", "Biology"],
  "HSC 2nd Year": ["Higher Mathematics", "Physics", "Chemistry", "Biology"],
  "Class 11": ["Higher Mathematics", "Physics", "Chemistry", "Biology"],
  "Class 12": ["Higher Mathematics", "Physics", "Chemistry", "Biology"]
};

const Reports = () => {
  const { user, hasRole } = useAuth();
  const printComponentRef = useRef();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Mock data for demonstration (replace with actual API calls)
  const [mockData] = useState({
    attendance: {
      totalDays: 22,
      presentDays: 19,
      absentDays: 2,
      lateDays: 1,
      percentage: 86.4,
      records: [
        { date: '2025-10-01', status: 'present' },
        { date: '2025-10-02', status: 'present' },
        { date: '2025-10-03', status: 'absent' },
        { date: '2025-10-04', status: 'present' },
        { date: '2025-10-05', status: 'late' },
        // Add more records as needed
      ]
    },
    dailyExams: {
      "Mathematics": [
        { date: '2025-10-01', marks: 8, maxMarks: 10, percentage: 80 },
        { date: '2025-10-03', marks: 9, maxMarks: 10, percentage: 90 },
        { date: '2025-10-05', marks: 7, maxMarks: 10, percentage: 70 },
        { date: '2025-10-08', marks: 8.5, maxMarks: 10, percentage: 85 },
        { date: '2025-10-10', marks: 9.5, maxMarks: 10, percentage: 95 },
        { date: '2025-10-12', marks: 8, maxMarks: 10, percentage: 80 },
        { date: '2025-10-15', marks: 9, maxMarks: 10, percentage: 90 },
        { date: '2025-10-17', marks: 8.5, maxMarks: 10, percentage: 85 }
      ],
      "English": [
        { date: '2025-10-02', marks: 7.5, maxMarks: 10, percentage: 75 },
        { date: '2025-10-04', marks: 8, maxMarks: 10, percentage: 80 },
        { date: '2025-10-06', marks: 8.5, maxMarks: 10, percentage: 85 },
        { date: '2025-10-09', marks: 9, maxMarks: 10, percentage: 90 },
        { date: '2025-10-11', marks: 8, maxMarks: 10, percentage: 80 },
        { date: '2025-10-13', marks: 8.5, maxMarks: 10, percentage: 85 },
        { date: '2025-10-16', marks: 9, maxMarks: 10, percentage: 90 },
        { date: '2025-10-18', marks: 7.5, maxMarks: 10, percentage: 75 }
      ]
      // Add more subjects as needed
    },
    monthlyExams: {
      "Mathematics": { marks: 85, maxMarks: 100, grade: 'A', position: 3 },
      "English": { marks: 78, maxMarks: 100, grade: 'A-', position: 5 },
      "Physics": { marks: 90, maxMarks: 100, grade: 'A+', position: 1 },
      "Chemistry": { marks: 82, maxMarks: 100, grade: 'A', position: 4 }
    }
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getStudents();
      const studentData = response?.students || response?.data || response || [];
      setStudents(Array.isArray(studentData) ? studentData : []);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async (studentId) => {
    try {
      setLoadingReport(true);
      // TODO: Replace with actual API calls
      // const reportResponse = await reportsAPI.getStudentReport(studentId, selectedMonth, selectedYear);
      
      // For now, use mock data
      setReportData(mockData);
    } catch (error) {
      console.error('Error loading report data:', error);
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    loadReportData(student.id);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.student_reg_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || student.class_name === classFilter;
    const matchesBatch = batchFilter === 'all' || (student.batch?.name === batchFilter);
    return matchesSearch && matchesClass && matchesBatch;
  });

  const getUniqueClasses = () => {
    const classes = new Set();
    students.forEach(student => {
      if (student.class_name) classes.add(student.class_name);
    });
    return Array.from(classes);
  };

  const getUniqueBatches = () => {
    const batches = new Set();
    students.forEach(student => {
      if (student.batch?.name) batches.add(student.batch.name);
    });
    return Array.from(batches);
  };

  const calculateGPA = (subjects) => {
    if (!subjects || Object.keys(subjects).length === 0) return 0;
    
    const gradePoints = {
      'A+': 5.00, 'A': 4.00, 'A-': 3.50, 'B+': 3.25, 'B': 3.00,
      'B-': 2.75, 'C+': 2.50, 'C': 2.25, 'D': 2.00, 'F': 0.00
    };
    
    let totalPoints = 0;
    let subjectCount = 0;
    
    Object.values(subjects).forEach(subject => {
      if (subject.grade && gradePoints[subject.grade] !== undefined) {
        totalPoints += gradePoints[subject.grade];
        subjectCount++;
      }
    });
    
    return subjectCount > 0 ? (totalPoints / subjectCount).toFixed(2) : 0;
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'A-': 'text-blue-600 bg-blue-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-yellow-600 bg-yellow-100',
      'B-': 'text-yellow-600 bg-yellow-100',
      'C+': 'text-orange-600 bg-orange-100',
      'C': 'text-orange-600 bg-orange-100',
      'D': 'text-red-600 bg-red-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  const handleDownloadReport = () => {
    if (!selectedStudent || !reportData || !printComponentRef.current) return;
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        alert('Please allow popups to download the report card');
        return;
      }
      
      // Get the printable component HTML
      const printContent = printComponentRef.current.innerHTML;
      
      // Write the HTML content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Report Card - ${selectedStudent.full_name}</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
                size: A4;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .text-center { text-align: center; }
            .text-left { text-left: left; }
            .text-right { text-right: right; }
            .font-bold { font-weight: bold; }
            .text-blue-600 { color: #2563eb; }
            .text-green-600 { color: #16a34a; }
            .text-red-600 { color: #dc2626; }
            .text-yellow-600 { color: #ca8a04; }
            .text-orange-600 { color: #ea580c; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-800 { color: #1f2937; }
            .border { border: 1px solid #d1d5db; }
            .border-b { border-bottom: 1px solid #d1d5db; }
            .border-t { border-top: 1px solid #d1d5db; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-400 { border-color: #9ca3af; }
            .border-blue-600 { border-color: #2563eb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-green-600 { background-color: #16a34a; }
            .rounded { border-radius: 0.25rem; }
            .rounded-full { border-radius: 9999px; }
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-8 { padding: 2rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .pt-2 { padding-top: 0.5rem; }
            .pt-4 { padding-top: 1rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .pb-6 { padding-bottom: 1.5rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mr-3 { margin-right: 0.75rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mt-8 { margin-top: 2rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
            .gap-2 { gap: 0.5rem; }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
            .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .w-full { width: 100%; }
            .h-3 { height: 0.75rem; }
            .max-w-4xl { max-width: 56rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .uppercase { text-transform: uppercase; }
            table { border-collapse: collapse; width: 100%; }
            th, td { text-align: left; padding: 8px; }
            th { background-color: #f3f4f6; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSelectedStudent(null)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Card</h1>
              <p className="text-gray-600">
                {selectedStudent.full_name} - {months[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
            <button
              onClick={handleDownloadReport}
              className="btn-primary inline-flex items-center px-4 py-2"
            >
              <Download size={20} className="mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        {loadingReport ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading report card...</p>
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Student Information Card */}
            <div className="card p-6">
              <div className="flex items-start justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Student Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedStudent.full_name}</div>
                      <div><span className="font-medium">Registration No:</span> {selectedStudent.student_reg_number}</div>
                      <div><span className="font-medium">Class:</span> {selectedStudent.class_name}</div>
                      <div><span className="font-medium">Batch:</span> {selectedStudent.batch?.name}</div>
                      <div><span className="font-medium">Joining Date:</span> {selectedStudent.admission_date ? new Date(selectedStudent.admission_date).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Student:</span> {selectedStudent.student_contact || 'N/A'}</div>
                      <div><span className="font-medium">Father:</span> {selectedStudent.father_contact || 'N/A'}</div>
                      <div><span className="font-medium">Mother:</span> {selectedStudent.mother_contact || 'N/A'}</div>
                      <div><span className="font-medium">Address:</span> {selectedStudent.address || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Family Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Father's Name:</span> {selectedStudent.father_name}</div>
                      <div><span className="font-medium">Mother's Name:</span> {selectedStudent.mother_name}</div>
                      <div><span className="font-medium">Gender:</span> {selectedStudent.gender}</div>
                      <div><span className="font-medium">Version:</span> {selectedStudent.version}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Summary</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Present</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
                  <span className="text-sm text-gray-600">Absent</span>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full ml-4"></div>
                  <span className="text-sm text-gray-600">Late</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{reportData.attendance.totalDays}</div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reportData.attendance.presentDays}</div>
                  <div className="text-sm text-gray-600">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{reportData.attendance.absentDays}</div>
                  <div className="text-sm text-gray-600">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{reportData.attendance.lateDays}</div>
                  <div className="text-sm text-gray-600">Late</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${reportData.attendance.percentage}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-600">
                Attendance: {reportData.attendance.percentage}%
              </div>
            </div>

            {/* Monthly Exam Results */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Exam Results</h3>
                <div className="text-lg font-bold text-blue-600">
                  GPA: {calculateGPA(reportData.monthlyExams)}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Marks</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Percentage</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Grade</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.monthlyExams).map(([subject, result]) => (
                      <tr key={subject} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{subject}</td>
                        <td className="py-3 px-4 text-center">{result.marks}/{result.maxMarks}</td>
                        <td className="py-3 px-4 text-center">{result.marks}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                            {result.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="flex items-center justify-center">
                            <Award size={16} className="mr-1 text-yellow-500" />
                            {result.position}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Exam Performance */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Exam Performance</h3>
              
              <div className="space-y-6">
                {Object.entries(reportData.dailyExams).map(([subject, exams]) => (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{subject}</h4>
                      <div className="text-sm text-gray-600">
                        Average: {(exams.reduce((sum, exam) => sum + exam.percentage, 0) / exams.length).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {exams.map((exam, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-center text-xs ${
                            exam.percentage >= 90 ? 'bg-green-100 text-green-800' :
                            exam.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                            exam.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                          title={`Date: ${exam.date}, Marks: ${exam.marks}/${exam.maxMarks}`}
                        >
                          <div className="font-bold">{exam.marks}</div>
                          <div className="text-xs opacity-75">{exam.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Overall Performance</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {calculateGPA(reportData.monthlyExams)} GPA
                    </p>
                    <p className="text-sm text-gray-600">Monthly Average</p>
                  </div>
                  <TrendingUp size={32} className="text-blue-600" />
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Attendance</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {reportData.attendance.percentage}%
                    </p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Class Rank</h3>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                      {Math.min(...Object.values(reportData.monthlyExams).map(r => r.position))}
                    </p>
                    <p className="text-sm text-gray-600">Best Position</p>
                  </div>
                  <Award size={32} className="text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Data</h3>
            <p className="text-gray-500">Unable to load report data for this student and month.</p>
          </div>
        )}
        
        {/* Hidden component for PDF generation */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <PrintableReportCard
            ref={printComponentRef}
            student={selectedStudent}
            reportData={reportData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Reports</h1>
          <p className="text-gray-600">Select a student to view their detailed report card</p>
        </div>
        <div className="flex items-center space-x-2">
          <FileText size={20} className="text-blue-600" />
          <span className="text-sm text-gray-600">
            {filteredStudents.length} students found
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Classes</option>
            {getUniqueClasses().map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Batches</option>
            {getUniqueBatches().map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleStudentSelect(student)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {student.full_name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Reg: {student.student_reg_number || 'N/A'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <GraduationCap size={14} className="mr-1" />
                    {student.class_name}
                  </div>
                  <div className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {student.batch?.name || 'No Batch'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <User size={14} className="mr-2" />
                <span>Father: {student.father_name}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone size={14} className="mr-2" />
                <span>{student.father_contact || 'No contact'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={14} className="mr-2" />
                <span>
                  Joined: {student.admission_date ? 
                    new Date(student.admission_date).toLocaleDateString() : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors py-2 px-4 rounded-lg text-sm font-medium inline-flex items-center justify-center">
                <Eye size={16} className="mr-2" />
                View Report Card
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 
              'Try adjusting your search criteria.' : 
              'No students are available in the system.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;