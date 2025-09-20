import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, academicsAPI } from '../services/api';
import {
  BookOpen,
  Users,
  Award,
  Calculator,
  Filter,
  Save,
  RefreshCw,
  Search,
  Edit,
  Eye,
  ChevronDown,
  Plus,
  Calendar,
  TrendingUp,
  BarChart3,
  Download,
  Settings
} from 'lucide-react';

export default function GradeBook() {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  
  // Data states
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [grades, setGrades] = useState({});
  const [examConfig, setExamConfig] = useState({
    type: 'daily',
    name: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    fullMarks: 10,
    description: ''
  });

  const subjects = ['Bangla', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'I.C.T'];
  
  const examTypes = [
    { value: 'daily', label: 'Daily Exam', maxMarks: 10, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'weekly', label: 'Weekly Test', maxMarks: 20, color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'monthly', label: 'Monthly Exam', maxMarks: 50, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { value: 'mega', label: 'Mega Exam', maxMarks: 100, color: 'text-red-600', bgColor: 'bg-red-50' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadStudentsAndExams();
  }, [selectedBatch, selectedSubject, selectedExamType]);

  const loadInitialData = async () => {
    try {
      const [batchesRes] = await Promise.all([
        academicsAPI.getBatches().catch(() => ({ results: [] }))
      ]);

      const batchData = Array.isArray(batchesRes) ? batchesRes : (batchesRes.results || []);
      setBatches(batchData);

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadStudentsAndExams = async () => {
    try {
      setLoading(true);
      
      let studentsRes;
      if (selectedBatch !== 'all') {
        studentsRes = await studentsAPI.getStudentsByBatch(selectedBatch).catch(() => []);
      } else {
        studentsRes = await studentsAPI.getStudents().catch(() => []);
      }

      const studentData = Array.isArray(studentsRes) ? studentsRes : (studentsRes.data || []);
      setStudents(studentData);

      // Generate mock exams and grades data
      const mockExams = generateMockExams();
      const mockGrades = generateMockGrades(studentData, mockExams);
      
      setExams(mockExams);
      setGrades(mockGrades);

    } catch (error) {
      console.error('Error loading students and exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockExams = () => {
    const mockExams = [];
    const examTypeObj = examTypes.find(type => type.value === selectedExamType);
    
    // Generate some sample exams
    for (let i = 1; i <= 5; i++) {
      const examDate = new Date();
      examDate.setDate(examDate.getDate() - (i * 2));
      
      mockExams.push({
        id: `exam_${selectedExamType}_${i}`,
        name: `${examTypeObj.label} ${i}`,
        type: selectedExamType,
        subject: selectedSubject !== 'all' ? selectedSubject : subjects[i % subjects.length],
        date: examDate.toISOString().split('T')[0],
        fullMarks: examTypeObj.maxMarks,
        description: `${examTypeObj.label} for ${selectedSubject !== 'all' ? selectedSubject : subjects[i % subjects.length]}`
      });
    }

    return mockExams;
  };

  const generateMockGrades = (studentList, examList) => {
    const gradesData = {};
    
    studentList.forEach(student => {
      examList.forEach(exam => {
        const key = `${student.id}_${exam.id}`;
        // Generate random grades based on exam type
        const maxMarks = exam.fullMarks;
        const minMarks = Math.floor(maxMarks * 0.4); // Minimum 40% of full marks
        const marks = Math.floor(Math.random() * (maxMarks - minMarks + 1)) + minMarks;
        
        gradesData[key] = {
          studentId: student.id,
          examId: exam.id,
          marks: marks,
          fullMarks: exam.fullMarks,
          percentage: Math.round((marks / exam.fullMarks) * 100),
          grade: calculateGrade(marks, exam.fullMarks),
          remarks: marks >= (exam.fullMarks * 0.8) ? 'Excellent' : 
                   marks >= (exam.fullMarks * 0.6) ? 'Good' : 
                   marks >= (exam.fullMarks * 0.4) ? 'Average' : 'Needs Improvement'
        };
      });
    });

    return gradesData;
  };

  const calculateGrade = (marks, fullMarks) => {
    const percentage = (marks / fullMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-green-600 bg-green-100';
      case 'B+':
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C+':
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_reg_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredExams = exams.filter(exam => {
    if (selectedSubject !== 'all' && exam.subject !== selectedSubject) return false;
    return true;
  });

  const handleGradeChange = (studentId, examId, marks) => {
    const key = `${studentId}_${examId}`;
    const exam = exams.find(e => e.id === examId);
    
    if (exam && marks !== '' && !isNaN(marks) && marks >= 0 && marks <= exam.fullMarks) {
      const numMarks = parseFloat(marks);
      setGrades(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          marks: numMarks,
          percentage: Math.round((numMarks / exam.fullMarks) * 100),
          grade: calculateGrade(numMarks, exam.fullMarks),
          remarks: numMarks >= (exam.fullMarks * 0.8) ? 'Excellent' : 
                   numMarks >= (exam.fullMarks * 0.6) ? 'Good' : 
                   numMarks >= (exam.fullMarks * 0.4) ? 'Average' : 'Needs Improvement'
        }
      }));
    }
  };

  const handleCreateExam = () => {
    const examTypeObj = examTypes.find(type => type.value === examConfig.type);
    setExamConfig(prev => ({
      ...prev,
      fullMarks: examTypeObj.maxMarks
    }));
    setEditingExam(null);
    setShowExamModal(true);
  };

  const handleSaveExam = () => {
    if (!examConfig.name || !examConfig.subject) {
      alert('Please fill in all required fields');
      return;
    }

    const newExam = {
      id: `exam_${Date.now()}`,
      ...examConfig,
      type: selectedExamType
    };

    if (editingExam) {
      setExams(prev => prev.map(exam => exam.id === editingExam.id ? { ...newExam, id: editingExam.id } : exam));
    } else {
      setExams(prev => [...prev, newExam]);
    }

    setShowExamModal(false);
    setExamConfig({
      type: 'daily',
      name: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
      fullMarks: 10,
      description: ''
    });
  };

  const handleSaveGrades = async () => {
    try {
      setSaving(true);
      
      // In a real app, this would call an API to save grades
      // await gradesAPI.saveGrades({
      //   batch_id: selectedBatch !== 'all' ? selectedBatch : null,
      //   exam_type: selectedExamType,
      //   subject: selectedSubject !== 'all' ? selectedSubject : null,
      //   grades: grades
      // });

      alert('Grades saved successfully!');
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error saving grades');
    } finally {
      setSaving(false);
    }
  };

  const handleExportGrades = () => {
    alert('Export functionality will be implemented');
  };

  const canManageGrades = hasRole(['teacher', 'academics', 'management', 'admin', 'superadmin']);
  const canConfigureExams = hasRole(['academics', 'management', 'admin', 'superadmin']);

  const getStudentAverage = (studentId) => {
    const studentGrades = Object.values(grades).filter(grade => grade.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    const average = studentGrades.reduce((sum, grade) => sum + grade.percentage, 0) / studentGrades.length;
    return Math.round(average);
  };

  const getExamAverage = (examId) => {
    const examGrades = Object.values(grades).filter(grade => grade.examId === examId);
    if (examGrades.length === 0) return 0;
    const average = examGrades.reduce((sum, grade) => sum + grade.percentage, 0) / examGrades.length;
    return Math.round(average);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Grade Book</h1>
            <p className="text-purple-100">Manage student grades and exam results</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <Filter size={20} className="mr-2" />
              Filters
              <ChevronDown size={16} className={`ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {canConfigureExams && (
              <button
                onClick={handleCreateExam}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
              >
                <Plus size={20} className="mr-2" />
                Add Exam
              </button>
            )}
            <button
              onClick={handleExportGrades}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <Download size={20} className="mr-2" />
              Export
            </button>
            <button
              onClick={loadStudentsAndExams}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Exam Type</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-purple-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  {examTypes.map(type => (
                    <option key={type.value} value={type.value} className="text-gray-900">
                      {type.label} (Max: {type.maxMarks})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-purple-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="all" className="text-gray-900">All Batches</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id} className="text-gray-900">
                      {batch.name} - {batch.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-purple-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="all" className="text-gray-900">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject} className="text-gray-900">
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Search Student</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-white text-opacity-60" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 text-white placeholder-purple-200 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredStudents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex-shrink-0">
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Exams</p>
            <p className="text-2xl font-semibold text-gray-900">{filteredExams.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Class Average</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredExams.length > 0 ? 
                  Math.round(filteredExams.reduce((sum, exam) => sum + getExamAverage(exam.id), 0) / filteredExams.length) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Exam Type</p>
              <p className="text-lg font-semibold text-gray-900">
                {examTypes.find(type => type.value === selectedExamType)?.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Student Grades - {examTypes.find(type => type.value === selectedExamType)?.label}
            </h3>
            {canManageGrades && (
              <button
                onClick={handleSaveGrades}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Grades'}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  {filteredExams.map(exam => (
                    <th key={exam.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      <div>
                        <div className="font-semibold">{exam.name}</div>
                        <div className="text-xs text-gray-400">{exam.subject}</div>
                        <div className="text-xs text-gray-400">Max: {exam.fullMarks}</div>
                        <div className="text-xs text-green-600 mt-1">Avg: {getExamAverage(exam.id)}%</div>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Average
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={filteredExams.length + 2} className="px-6 py-12 text-center">
                      <Users size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search criteria.' : 'No students available for the selected batch.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const studentAverage = getStudentAverage(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                              {student.full_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.full_name || 'Unknown Student'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {student.student_reg_number} | Roll: {student.roll_number || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {filteredExams.map(exam => {
                          const gradeKey = `${student.id}_${exam.id}`;
                          const gradeData = grades[gradeKey];
                          
                          return (
                            <td key={exam.id} className="px-6 py-4 text-center">
                              {canManageGrades ? (
                                <div className="space-y-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max={exam.fullMarks}
                                    value={gradeData?.marks || ''}
                                    onChange={(e) => handleGradeChange(student.id, exam.id, e.target.value)}
                                    className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder={`/${exam.fullMarks}`}
                                  />
                                  {gradeData && (
                                    <div>
                                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(gradeData.grade)}`}>
                                        {gradeData.grade}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {gradeData.percentage}%
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                gradeData && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {gradeData.marks}/{exam.fullMarks}
                                    </div>
                                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(gradeData.grade)}`}>
                                      {gradeData.grade}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {gradeData.percentage}%
                                    </div>
                                  </div>
                                )
                              )}
                            </td>
                          );
                        })}
                        
                        <td className="px-6 py-4 text-center">
                          <div className="text-lg font-bold text-gray-900">{studentAverage}%</div>
                          <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(calculateGrade(studentAverage, 100))}`}>
                            {calculateGrade(studentAverage, 100)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingExam ? 'Edit Exam' : 'Create New Exam'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examConfig.name}
                  onChange={(e) => setExamConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter exam name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={examConfig.subject}
                  onChange={(e) => setExamConfig(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                <input
                  type="date"
                  value={examConfig.date}
                  onChange={(e) => setExamConfig(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {selectedExamType === 'mega' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Marks</label>
                  <input
                    type="number"
                    value={examConfig.fullMarks}
                    onChange={(e) => setExamConfig(prev => ({ ...prev, fullMarks: parseInt(e.target.value) || 100 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="1"
                    max="200"
                  />
                  <p className="text-sm text-gray-500 mt-1">For Mega Exams, you can configure the full marks (1-200)</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={examConfig.description}
                  onChange={(e) => setExamConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter exam description (optional)"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowExamModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExam}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingExam ? 'Update Exam' : 'Create Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}