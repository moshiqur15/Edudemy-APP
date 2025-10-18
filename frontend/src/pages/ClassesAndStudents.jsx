import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, batchesAPI } from '../services/api';
import logger from '../utils/logger';
import AttendanceSystemEnhanced from '../components/AttendanceSystemEnhanced';
import AttendanceRecord from '../components/AttendanceRecord';
import AttendanceRecordCalendar from '../components/AttendanceRecordCalendar';
import GradeBookEnhanced from '../components/GradeBookEnhanced';
import BehaviorRecordsSystem from '../components/BehaviorRecordsSystem';
import BatchAnalysisView from '../components/BatchAnalysisView';
import {
  Calendar,
  Users,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Target,
  User,
  Clock,
  MapPin,
  UserCheck,
  Filter,
  Search,
  Eye,
  Edit,
  BarChart3,
  FileText,
  Download,
  Printer,
  AlertTriangle,
  TrendingUp,
  Award,
  RefreshCcw,
  Activity
} from 'lucide-react';

// Sub-tabs for the Classes and Students section
const SUB_TABS = [
  {
    id: 'attendance',
    label: 'Attendance',
    icon: CheckCircle,
    color: 'text-blue-600',
    description: 'Take and manage student attendance'
  },
  {
    id: 'attendance-record',
    label: 'Attendance Record',
    icon: BarChart3,
    color: 'text-green-600',
    description: 'View historical attendance data'
  },
  {
    id: 'gradebook',
    label: 'Grade Book',
    icon: BookOpen,
    color: 'text-purple-600',
    description: 'Manage student grades and assessments'
  },
  {
    id: 'behavior',
    label: 'Behavior Records',
    icon: Target,
    color: 'text-orange-600',
    description: 'Track student behavior and conduct'
  },
  {
    id: 'analytics',
    label: 'FIFA Analytics',
    icon: BarChart3,
    color: 'text-purple-600',
    description: 'View FIFA-style student performance analytics'
  }
];

export default function ClassesAndStudents({ activeTab = null }) {
  const { hasRole } = useAuth();
  const [currentStep, setCurrentStep] = useState('classes'); // classes, batches, students, feature
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigationStarted, setNavigationStarted] = useState(false);
  
  // Handle direct routing to specific tabs
  useEffect(() => {
    if (activeTab) {
      // If activeTab is provided, skip selection flow and go directly to feature
      setCurrentStep('feature');
      const featureMap = {
        'attendance': SUB_TABS.find(tab => tab.id === 'attendance'),
        'attendance-record': SUB_TABS.find(tab => tab.id === 'attendance-record'),
        'gradebook': SUB_TABS.find(tab => tab.id === 'gradebook'),
        'behavior': SUB_TABS.find(tab => tab.id === 'behavior')
      };
      const feature = featureMap[activeTab];
      if (feature) {
        setSelectedFeature(feature);
        // Set mock data for direct access
        if (!selectedClass) {
          setSelectedClass({ id: 1, name: 'Class 1', serial: 1 });
        }
        if (!selectedBatch) {
          setSelectedBatch({ id: 1, name: 'Class 1 - Batch A', class_name: 'Class 1', studentCount: 25 });
        }
        if (selectedStudents.length === 0) {
          setSelectedStudents([
            { id: 1, full_name: 'John Doe', student_id: 'STU001', class_name: 'Class 1' },
            { id: 2, full_name: 'Jane Smith', student_id: 'STU002', class_name: 'Class 1' },
            { id: 3, full_name: 'Mike Johnson', student_id: 'STU003', class_name: 'Class 1' }
          ]);
        }
      }
    }
  }, [activeTab]);
  
  // Data states
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Analytics states
  const [classAnalytics, setClassAnalytics] = useState({});
  const [batchAnalytics, setBatchAnalytics] = useState({});
  const [priorityAlerts, setPriorityAlerts] = useState({ critical: [], high_priority: [], medium_priority: [] });
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadClasses();
    loadAnalyticsData();
  }, []);
  
  const loadAnalyticsData = async () => {
    try {
      // Load priority alerts
      const alertsResponse = await fetch('/api/students/analytics/priority-alerts');
      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json();
        setPriorityAlerts(alerts);
      }
      
      // Load dashboard data
      const dashboardResponse = await fetch('/api/students/analytics/dashboard-summary');
      if (dashboardResponse.ok) {
        const dashboard = await dashboardResponse.json();
        setDashboardData(dashboard);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };
  
  const getClassAnalytics = (className) => {
    if (!dashboardData?.class_performance) return null;
    return dashboardData.class_performance.find(cp => cp.class_name === className);
  };
  
  const getBatchPriorityStudents = (batchStudents) => {
    const allPriorityStudents = [
      ...priorityAlerts.critical || [],
      ...priorityAlerts.high_priority || [],
      ...priorityAlerts.medium_priority || []
    ];
    
    return batchStudents.filter(student => 
      allPriorityStudents.some(alert => alert.student_id === student.id)
    );
  };
  
  const getStudentPriorityLevel = (studentId) => {
    if (priorityAlerts.critical?.some(alert => alert.student_id === studentId)) {
      return 'critical';
    }
    if (priorityAlerts.high_priority?.some(alert => alert.student_id === studentId)) {
      return 'high';
    }
    if (priorityAlerts.medium_priority?.some(alert => alert.student_id === studentId)) {
      return 'medium';
    }
    return null;
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      // Get unique classes from batches or students
      const response = await batchesAPI.getBatches();
      let batchData = [];
      
      if (Array.isArray(response)) {
        batchData = response;
      } else if (response?.data?.data) {
        batchData = response.data.data;
      } else if (response?.data) {
        batchData = Array.isArray(response.data) ? response.data : [];
      }

      // Extract unique classes
      const uniqueClasses = [...new Set(batchData.map(batch => batch.class_name).filter(Boolean))]
        .map((className, index) => ({
          id: index + 1,
          name: className,
          serial: index + 1,
          totalBatches: batchData.filter(b => b.class_name === className).length,
          totalStudents: batchData.filter(b => b.class_name === className).reduce((sum, b) => sum + (b.current_students_count || 0), 0)
        }))
        .sort((a, b) => {
          // Sort by class number if numeric, otherwise alphabetically
          const aNum = parseInt(a.name.replace(/[^0-9]/g, ''));
          const bNum = parseInt(b.name.replace(/[^0-9]/g, ''));
          if (aNum && bNum) return aNum - bNum;
          return a.name.localeCompare(b.name);
        });

      setClasses(uniqueClasses.length > 0 ? uniqueClasses : [
        // Fallback classes if no data
        { id: 1, name: 'Class 1', serial: 1, totalBatches: 1, totalStudents: 25 },
        { id: 2, name: 'Class 2', serial: 2, totalBatches: 1, totalStudents: 30 },
        { id: 3, name: 'Class 3', serial: 3, totalBatches: 1, totalStudents: 28 }
      ]);
    } catch (error) {
      logger.error('Error loading classes:', error);
      // Fallback classes
      setClasses([
        { id: 1, name: 'Class 1', serial: 1, totalBatches: 1, totalStudents: 25 },
        { id: 2, name: 'Class 2', serial: 2, totalBatches: 1, totalStudents: 30 },
        { id: 3, name: 'Class 3', serial: 3, totalBatches: 1, totalStudents: 28 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async (className) => {
    try {
      setLoading(true);
      const response = await batchesAPI.getBatches();
      let batchData = [];
      
      if (Array.isArray(response)) {
        batchData = response;
      } else if (response?.data?.data) {
        batchData = response.data.data;
      } else if (response?.data) {
        batchData = Array.isArray(response.data) ? response.data : [];
      }

      const classBatches = batchData
        .filter(batch => batch.class_name === className)
        .map(batch => ({
          ...batch,
          studentCount: batch.current_students_count || 0
        }));

      setBatches(classBatches.length > 0 ? classBatches : [
        // Fallback batches
        { id: 1, name: `${className} - Batch A`, class_name: className, studentCount: 25 }
      ]);
    } catch (error) {
      logger.error('Error loading batches:', error);
      setBatches([
        { id: 1, name: `${className} - Batch A`, class_name: className, studentCount: 25 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (batchId) => {
    try {
      setLoading(true);
      const response = await studentsAPI.getStudentsByBatch(batchId);
      let studentData = [];
      
      if (Array.isArray(response)) {
        studentData = response;
      } else if (response?.data?.data) {
        studentData = response.data.data;
      } else if (response?.data) {
        studentData = Array.isArray(response.data) ? response.data : [];
      } else if (response?.students) {
        studentData = response.students;
      }

      setStudents(studentData.length > 0 ? studentData : [
        // Fallback students
        { id: 1, full_name: 'John Doe', student_id: 'STU001', class_name: 'Demo' },
        { id: 2, full_name: 'Jane Smith', student_id: 'STU002', class_name: 'Demo' },
        { id: 3, full_name: 'Mike Johnson', student_id: 'STU003', class_name: 'Demo' }
      ]);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([
        { id: 1, full_name: 'John Doe', student_id: 'STU001', class_name: 'Demo' },
        { id: 2, full_name: 'Jane Smith', student_id: 'STU002', class_name: 'Demo' },
        { id: 3, full_name: 'Mike Johnson', student_id: 'STU003', class_name: 'Demo' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = async (classItem) => {
    setSelectedClass(classItem);
    setCurrentStep('batches');
    await loadBatches(classItem.name);
  };

  const handleBatchSelect = async (batch) => {
    setSelectedBatch(batch);
    setCurrentStep('students');
    await loadStudents(batch.id);
  };

  const handleStudentsConfirm = () => {
    setCurrentStep('feature');
  };

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    // This will render the specific feature component
  };

  const goBack = () => {
    if (currentStep === 'batches') {
      setCurrentStep('classes');
      setSelectedClass(null);
      setBatches([]);
    } else if (currentStep === 'students') {
      setCurrentStep('batches');
      setSelectedBatch(null);
      setStudents([]);
    } else if (currentStep === 'feature') {
      if (selectedFeature) {
        setSelectedFeature(null);
      } else {
        setCurrentStep('students');
      }
    } else if (currentStep === 'classes') {
      // Go back to initial view
      setNavigationStarted(false);
      setSelectedClass(null);
      setSelectedBatch(null);
      setSelectedFeature(null);
      setStudents([]);
      setBatches([]);
    }
  };

  const renderBreadcrumb = () => {
    const items = [
      { label: 'Classes', active: currentStep === 'classes' }
    ];
    
    if (selectedClass) {
      items.push({ 
        label: selectedClass.name, 
        active: currentStep === 'batches' 
      });
    }
    
    if (selectedBatch) {
      items.push({ 
        label: selectedBatch.name, 
        active: currentStep === 'students' 
      });
    }
    
    if (selectedFeature) {
      items.push({ 
        label: selectedFeature.label, 
        active: currentStep === 'feature' 
      });
    }

    return (
      <nav className="flex items-center space-x-2 text-sm mb-6">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
            <span className={`${item.active ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
              {item.label}
            </span>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  const renderClassSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Class</h2>
        <p className="text-gray-600">Choose the class to manage students and activities</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classes.map((classItem) => {
            const analytics = getClassAnalytics(classItem.name);
            const hasHighRisk = analytics && (analytics.critical_students > 0 || analytics.high_risk_students > 0);
            
            return (
            <div
              key={classItem.id}
              onClick={() => handleClassSelect(classItem)}
              className={`bg-white rounded-lg border-2 hover:shadow-lg transition-all duration-200 cursor-pointer p-6 relative ${
                hasHighRisk ? 'border-orange-300 hover:border-orange-400' : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              {hasHighRisk && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1">
                  <AlertTriangle size={16} />
                </div>
              )}
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  hasHighRisk ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  <span className={`text-2xl font-bold ${
                    hasHighRisk ? 'text-orange-600' : 'text-blue-600'
                  }`}>
                    {classItem.serial}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {classItem.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center justify-center">
                    <BookOpen size={16} className="mr-1" />
                    {classItem.totalBatches} Batches
                  </div>
                  <div className="flex items-center justify-center">
                    <Users size={16} className="mr-1" />
                    {classItem.totalStudents} Students
                  </div>
                </div>
                
                {analytics && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-center text-xs">
                      <Award size={12} className="mr-1 text-yellow-500" />
                      <span className="text-gray-600">Avg FIFA: {analytics.avg_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    {(analytics.critical_students > 0 || analytics.high_risk_students > 0) && (
                      <div className="flex items-center justify-center gap-2 text-xs">
                        {analytics.critical_students > 0 && (
                          <span className="flex items-center text-red-600">
                            <AlertTriangle size={10} className="mr-1" />
                            {analytics.critical_students} Critical
                          </span>
                        )}
                        {analytics.high_risk_students > 0 && (
                          <span className="flex items-center text-orange-600">
                            <TrendingUp size={10} className="mr-1" />
                            {analytics.high_risk_students} High Risk
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderBatchSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to Classes
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select a Batch from {selectedClass?.name}
        </h2>
        <p className="text-gray-600">Choose the batch to work with</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => {
            // Calculate priority students for this batch
            const priorityCount = {
              critical: priorityAlerts.critical?.filter(alert => 
                students.some(s => s.id === alert.student_id && s.batch_id === batch.id)
              ).length || 0,
              high: priorityAlerts.high_priority?.filter(alert => 
                students.some(s => s.id === alert.student_id && s.batch_id === batch.id)
              ).length || 0,
              medium: priorityAlerts.medium_priority?.filter(alert => 
                students.some(s => s.id === alert.student_id && s.batch_id === batch.id)
              ).length || 0
            };
            
            const hasPriorityStudents = priorityCount.critical > 0 || priorityCount.high > 0;
            
            return (
            <div
              key={batch.id}
              onClick={() => handleBatchSelect(batch)}
              className={`bg-white rounded-lg border-2 hover:shadow-lg transition-all duration-200 cursor-pointer p-6 relative ${
                hasPriorityStudents ? 'border-orange-300 hover:border-orange-400' : 'border-gray-200 hover:border-green-400'
              }`}
            >
              {hasPriorityStudents && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1">
                  <AlertTriangle size={14} />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {batch.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    hasPriorityStudents ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {batch.status || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users size={16} className="mr-2" />
                      {batch.studentCount} Students
                    </div>
                    {hasPriorityStudents && (
                      <div className="flex items-center gap-1">
                        <Activity size={12} className="text-orange-500" />
                        <span className="text-xs text-orange-600">
                          {priorityCount.critical + priorityCount.high} Need Attention
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    {batch.time_slot || 'Not set'}
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    {batch.course || 'General'}
                  </div>
                </div>

                {/* Priority Students Summary */}
                {(priorityCount.critical > 0 || priorityCount.high > 0 || priorityCount.medium > 0) && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs">
                      {priorityCount.critical > 0 && (
                        <span className="flex items-center text-red-600">
                          <AlertTriangle size={10} className="mr-1" />
                          {priorityCount.critical} Critical
                        </span>
                      )}
                      {priorityCount.high > 0 && (
                        <span className="flex items-center text-orange-600">
                          <TrendingUp size={10} className="mr-1" />
                          {priorityCount.high} High Risk
                        </span>
                      )}
                      {priorityCount.medium > 0 && (
                        <span className="flex items-center text-yellow-600">
                          <Target size={10} className="mr-1" />
                          {priorityCount.medium} Medium
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {batch.schedule_days && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Schedule: {Array.isArray(batch.schedule_days) 
                        ? batch.schedule_days.join(', ') 
                        : batch.schedule_days}
                    </p>
                  </div>
                )}
              </div>
            </div>
            );
          })
        </div>
      )}
    </div>
  );

  const renderStudentsList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to Batches
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Students in {selectedBatch?.name}
        </h2>
        <p className="text-gray-600">
          {students.length} students found. Click "Continue" to select the feature you want to use.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Priority Students Alert */}
          {getBatchPriorityStudents(students).length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={20} className="text-orange-600" />
                <h4 className="font-medium text-orange-800">
                  Priority Students Alert
                </h4>
              </div>
              <p className="text-sm text-orange-700">
                {getBatchPriorityStudents(students).length} students in this batch need immediate attention.
                They will be highlighted below.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.slice(0, 20).map((student) => {
              const priorityLevel = getStudentPriorityLevel(student.id);
              
              return (
              <div 
                key={student.id} 
                className={`bg-white rounded-lg border p-4 relative ${
                  priorityLevel ? 'border-orange-300 shadow-md' : 'border-gray-200'
                }`}
              >
                {priorityLevel && (
                  <div className={`absolute -top-2 -right-2 rounded-full p-1 text-white ${
                    priorityLevel === 'critical' ? 'bg-red-500' :
                    priorityLevel === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    {priorityLevel === 'critical' ? 
                      <AlertTriangle size={12} /> : 
                      <TrendingUp size={12} />
                    }
                  </div>
                )}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    priorityLevel === 'critical' ? 'bg-red-100' :
                    priorityLevel === 'high' ? 'bg-orange-100' :
                    priorityLevel === 'medium' ? 'bg-yellow-100' : 'bg-gray-200'
                  }`}>
                    <span className={`text-sm font-semibold ${
                      priorityLevel === 'critical' ? 'text-red-600' :
                      priorityLevel === 'high' ? 'text-orange-600' :
                      priorityLevel === 'medium' ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {student.full_name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {student.full_name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Roll: {student.student_roll_number || student.admission_serial || 'N/A'}
                  </p>
                  {priorityLevel && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      priorityLevel === 'critical' ? 'bg-red-100 text-red-700' :
                      priorityLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {priorityLevel === 'critical' ? 'Critical' :
                       priorityLevel === 'high' ? 'High Priority' : 'Needs Attention'}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>

          {students.length > 20 && (
            <div className="text-center text-sm text-gray-500">
              Showing 20 of {students.length} students
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Priority Action Button */}
            {getBatchPriorityStudents(students).length > 0 && (
              <button
                onClick={() => {
                  // This could open a priority students modal or navigate to analytics
                  alert(`${getBatchPriorityStudents(students).length} students need attention. This will be handled in the Analytics tab.`);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                View Priority Students ({getBatchPriorityStudents(students).length})
              </button>
            )}
            
            {/* Continue Button */}
            <button
              onClick={handleStudentsConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              Continue to Feature Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFeatureSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to Students
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose a Feature
        </h2>
        <p className="text-gray-600">
          Select what you want to do with {selectedBatch?.name} students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUB_TABS.map((feature) => (
          <div
            key={feature.id}
            onClick={() => handleFeatureSelect(feature)}
            className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer p-6"
          >
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto`}
                   style={{backgroundColor: feature.color.replace('text-', 'bg-').replace('600', '100')}}>
                <feature.icon size={32} className={feature.color} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSelectedFeature = () => {
    // Render specific feature components based on selection
    if (selectedFeature.id === 'attendance') {
      return (
        <AttendanceSystemEnhanced
          selectedClass={selectedClass}
          selectedBatch={selectedBatch}
          students={students}
          onBack={activeTab ? () => window.history.back() : goBack}
        />
      );
    }
    
    if (selectedFeature.id === 'attendance-record') {
      return (
        <AttendanceRecordCalendar
          selectedClass={selectedClass}
          selectedBatch={selectedBatch}
          students={students}
          onBack={activeTab ? () => window.history.back() : goBack}
        />
      );
    }
    
    if (selectedFeature.id === 'gradebook') {
      return (
        <GradeBookEnhanced
          selectedClass={selectedClass}
          selectedBatch={selectedBatch}
          students={students}
          onBack={activeTab ? () => window.history.back() : goBack}
        />
      );
    }
    
    if (selectedFeature.id === 'behavior') {
      return (
        <BehaviorRecordsSystem
          batch={selectedBatch}
          students={students}
          onBack={activeTab ? () => window.history.back() : goBack}
        />
      );
    }
    
    if (selectedFeature.id === 'analytics') {
      return (
        <BatchAnalysisView
          batch={selectedBatch}
          onBack={activeTab ? () => window.history.back() : goBack}
        />
      );
    }

    // Placeholder for other features
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Features
          </button>
        </div>

        <div className="text-center py-12">
          <selectedFeature.icon size={48} className={`${selectedFeature.color} mx-auto mb-4`} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedFeature.label}
          </h2>
          <p className="text-gray-600 mb-4">
            Feature for {selectedBatch?.name} - {students.length} students
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-800 text-sm">
              This feature will be implemented in the next update.
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!hasRole(['superadmin', 'admin', 'academics', 'teacher'])) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access classes and students.</p>
      </div>
    );
  }

  // Show initial view or feature flow based on direct access
  const showInitialView = !activeTab && !navigationStarted;
  const showFeatureFlow = activeTab || navigationStarted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes and Students</h1>
          <p className="text-gray-600 mt-2">
            {showInitialView ? 'Browse classes and access student management features' : 'Manage classes, batches, and student activities'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Priority Alerts Summary */}
          {(priorityAlerts.critical?.length > 0 || priorityAlerts.high_priority?.length > 0 || priorityAlerts.medium_priority?.length > 0) && (
            <div className="flex items-center gap-3 text-sm bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
              <AlertTriangle size={16} className="text-orange-600" />
              <div className="flex items-center gap-3">
                {priorityAlerts.critical?.length > 0 && (
                  <span className="flex items-center text-red-600 font-medium">
                    {priorityAlerts.critical.length} Critical
                  </span>
                )}
                {priorityAlerts.high_priority?.length > 0 && (
                  <span className="flex items-center text-orange-600 font-medium">
                    {priorityAlerts.high_priority.length} High Priority
                  </span>
                )}
                {priorityAlerts.medium_priority?.length > 0 && (
                  <span className="flex items-center text-yellow-600 font-medium">
                    {priorityAlerts.medium_priority.length} Needs Attention
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Refresh Button */}
          <button
            onClick={() => {
              loadClasses();
              loadAnalyticsData();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      {showFeatureFlow && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {renderBreadcrumb()}
          </div>
          <button
            onClick={() => {
              setNavigationStarted(false);
              setCurrentStep('classes');
              setSelectedClass(null);
              setSelectedBatch(null);
              setSelectedFeature(null);
              setStudents([]);
              setBatches([]);
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      )}
      
      {/* Quick Access Section - show when not in feature flow */}
      {showInitialView && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {SUB_TABS.map((feature) => (
            <div
              key={feature.id}
              onClick={() => {
                setNavigationStarted(true);
                setCurrentStep('feature');
                setSelectedFeature(feature);
                // Set default selections for quick access
                if (!selectedClass) {
                  setSelectedClass({ id: 1, name: 'All Classes', serial: 'all' });
                }
                if (!selectedBatch) {
                  setSelectedBatch({ id: 1, name: 'All Batches', class_name: 'All Classes', studentCount: 0 });
                }
              }}
              className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer p-6 group"
            >
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}
                     style={{backgroundColor: feature.color.replace('text-', 'bg-').replace('600', '100')}}>
                  <feature.icon size={32} className={feature.color} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step-by-Step Navigation Section */}
      {showInitialView && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Or Browse by Class Structure</h2>
            <p className="text-gray-600">Follow the step-by-step process to navigate through classes, batches, and students</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => {
                setNavigationStarted(true);
                setCurrentStep('classes');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <Users size={20} />
              Start with Class Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Content - show when in feature flow */}
      {showFeatureFlow && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {currentStep === 'classes' && renderClassSelection()}
          {currentStep === 'batches' && renderBatchSelection()}
          {currentStep === 'students' && renderStudentsList()}
          {currentStep === 'feature' && selectedFeature === null && renderFeatureSelection()}
          {currentStep === 'feature' && selectedFeature !== null && renderSelectedFeature()}
        </div>
      )}
    </div>
  );
}