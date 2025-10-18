import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './StudentAnalyticsDashboard.css';

const StudentAnalyticsDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState('S001');
  const [studentData, setStudentData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample student list
  const students = [
    { id: 'S001', name: 'Alex Johnson', class: '10th Grade' },
    { id: 'S002', name: 'Emma Smith', class: '10th Grade' },
    { id: 'S003', name: 'Michael Chen', class: '10th Grade' }
  ];

  useEffect(() => {
    fetchStudentData(selectedStudent);
    fetchDashboardData();
  }, [selectedStudent]);

  const fetchStudentData = async (studentId) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/analytics/student/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentData(data.data);
      } else {
        // Fallback to sample data
        setStudentData(getSampleStudentData(studentId));
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setStudentData(getSampleStudentData(studentId));
    }
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      } else {
        setDashboardData(getSampleDashboardData());
      }
    } catch (error) {
      setDashboardData(getSampleDashboardData());
    }
  };

  // Sample data functions (for demo purposes)
  const getSampleStudentData = (studentId) => ({
    student_id: studentId,
    name: students.find(s => s.id === studentId)?.name || 'Unknown',
    class: '10th Grade',
    ratings: {
      attendance_rating: 85.2,
      homework_classwork_rating: 78.5,
      exam_rating: 82.3,
      skill_rating: 75.8,
      fifa_rating: 80.4,
      breakdown: {
        attendance: {
          regular_attendance: 88.0,
          holiday_attendance: 82.0,
          sick_days: 85.0,
          presence_ratio: 87.0,
          punctuality: 85.0
        },
        homework_classwork: {
          hw_submission: 85.0,
          hw_quality: 72.0,
          cw_submission: 78.0,
          cw_quality: 79.0
        },
        exams: {
          average_marks: 82.0,
          answer_quality: 85.0,
          completion: 80.0,
          relevance: 82.0
        },
        skills: {
          communication: 78.0,
          critical_thinking: 75.0,
          discipline: 76.0,
          study_management: 75.0
        }
      }
    },
    recommendations: [
      '📚 Strengthen homework completion and class participation',
      '🧠 Work on communication and study management skills',
      '💭 Engage in more analytical discussions and problem-solving exercises'
    ],
    progress_history: [
      { month: 'Sep', rating: 75.2 },
      { month: 'Oct', rating: 77.8 },
      { month: 'Nov', rating: 79.1 },
      { month: 'Dec', rating: 80.4 }
    ]
  });

  const getSampleDashboardData = () => ({
    total_students: 150,
    average_class_rating: 78.5,
    students_improving: 92,
    students_at_risk: 12,
    recent_insights: [
      '📈 Overall class performance improved by 3.2% this month',
      '🎯 85% of students are meeting homework submission targets',
      '⚠️ 12 students need additional support in exam preparation'
    ]
  });

  const getRatingColor = (rating) => {
    if (rating >= 90) return '#22c55e'; // Green
    if (rating >= 80) return '#3b82f6'; // Blue
    if (rating >= 70) return '#f59e0b'; // Orange
    if (rating >= 60) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const getRatingGrade = (rating) => {
    if (rating >= 90) return 'A+';
    if (rating >= 85) return 'A';
    if (rating >= 80) return 'B+';
    if (rating >= 75) return 'B';
    if (rating >= 70) return 'C+';
    if (rating >= 65) return 'C';
    if (rating >= 60) return 'D';
    return 'F';
  };

  const RadarChartData = studentData ? [
    { subject: 'Attendance', A: studentData.ratings.attendance_rating, fullMark: 100 },
    { subject: 'Homework', A: studentData.ratings.homework_classwork_rating, fullMark: 100 },
    { subject: 'Exams', A: studentData.ratings.exam_rating, fullMark: 100 },
    { subject: 'Skills', A: studentData.ratings.skill_rating, fullMark: 100 }
  ] : [];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading student analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🎓 Student Analytics Dashboard</h1>
        <div className="student-selector">
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="student-select"
          >
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.class})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'detailed' ? 'active' : ''}`}
          onClick={() => setActiveTab('detailed')}
        >
          🔍 Detailed Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💡 Recommendations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && studentData && (
        <div className="tab-content">
          {/* FIFA Rating Card */}
          <div className="fifa-rating-card">
            <div className="fifa-header">
              <h2>🏆 FIFA-Style Rating</h2>
              <div className="student-info">
                <h3>{studentData.name}</h3>
                <p>{studentData.class}</p>
              </div>
            </div>
            
            <div className="main-rating">
              <div 
                className="rating-circle"
                style={{ borderColor: getRatingColor(studentData.ratings.fifa_rating) }}
              >
                <span className="rating-number">{studentData.ratings.fifa_rating}</span>
                <span className="rating-grade">{getRatingGrade(studentData.ratings.fifa_rating)}</span>
              </div>
            </div>

            {/* Category Ratings */}
            <div className="category-ratings">
              <div className="rating-item">
                <span className="category">📅 Attendance</span>
                <div className="rating-bar">
                  <div 
                    className="rating-fill" 
                    style={{ 
                      width: `${studentData.ratings.attendance_rating}%`,
                      backgroundColor: getRatingColor(studentData.ratings.attendance_rating)
                    }}
                  ></div>
                  <span className="rating-value">{studentData.ratings.attendance_rating}</span>
                </div>
              </div>

              <div className="rating-item">
                <span className="category">📚 Homework</span>
                <div className="rating-bar">
                  <div 
                    className="rating-fill" 
                    style={{ 
                      width: `${studentData.ratings.homework_classwork_rating}%`,
                      backgroundColor: getRatingColor(studentData.ratings.homework_classwork_rating)
                    }}
                  ></div>
                  <span className="rating-value">{studentData.ratings.homework_classwork_rating}</span>
                </div>
              </div>

              <div className="rating-item">
                <span className="category">📝 Exams</span>
                <div className="rating-bar">
                  <div 
                    className="rating-fill" 
                    style={{ 
                      width: `${studentData.ratings.exam_rating}%`,
                      backgroundColor: getRatingColor(studentData.ratings.exam_rating)
                    }}
                  ></div>
                  <span className="rating-value">{studentData.ratings.exam_rating}</span>
                </div>
              </div>

              <div className="rating-item">
                <span className="category">🧠 Skills</span>
                <div className="rating-bar">
                  <div 
                    className="rating-fill" 
                    style={{ 
                      width: `${studentData.ratings.skill_rating}%`,
                      backgroundColor: getRatingColor(studentData.ratings.skill_rating)
                    }}
                  ></div>
                  <span className="rating-value">{studentData.ratings.skill_rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Progress Chart */}
            <div className="chart-container">
              <h3>📈 Performance Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={studentData.progress_history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="chart-container">
              <h3>🎯 Skills Radar</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={RadarChartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Rating"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="insights-card">
            <h3>💡 Quick Insights</h3>
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-icon">🎯</span>
                <div>
                  <h4>Strongest Area</h4>
                  <p>Attendance & Punctuality</p>
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon">📈</span>
                <div>
                  <h4>Improvement</h4>
                  <p>+5.2 points this semester</p>
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon">⚠️</span>
                <div>
                  <h4>Needs Focus</h4>
                  <p>Study Management Skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis Tab */}
      {activeTab === 'detailed' && studentData && (
        <div className="tab-content">
          <div className="detailed-breakdown">
            <h3>🔍 Detailed Performance Breakdown</h3>
            
            {/* Attendance Breakdown */}
            <div className="breakdown-section">
              <h4>📅 Attendance Analysis</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <span>Regular Attendance</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.attendance.regular_attendance}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.attendance.regular_attendance)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.attendance.regular_attendance}</span>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Holiday Attendance</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.attendance.holiday_attendance}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.attendance.holiday_attendance)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.attendance.holiday_attendance}</span>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Punctuality</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.attendance.punctuality}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.attendance.punctuality)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.attendance.punctuality}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Homework Breakdown */}
            <div className="breakdown-section">
              <h4>📚 Homework & Classwork Analysis</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <span>Homework Submission</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.homework_classwork.hw_submission}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.homework_classwork.hw_submission)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.homework_classwork.hw_submission}</span>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Homework Quality</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.homework_classwork.hw_quality}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.homework_classwork.hw_quality)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.homework_classwork.hw_quality}</span>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Classwork Quality</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.homework_classwork.cw_quality}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.homework_classwork.cw_quality)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.homework_classwork.cw_quality}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="breakdown-section">
              <h4>🧠 Skills Analysis</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <span>Communication</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.skills.communication}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.skills.communication)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.skills.communication}</span>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Critical Thinking</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.skills.critical_thinking}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.skills.critical_thinking)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.skills.critical_thinking}</span>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Study Management</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${studentData.ratings.breakdown.skills.study_management}%`,
                        backgroundColor: getRatingColor(studentData.ratings.breakdown.skills.study_management)
                      }}
                    ></div>
                    <span>{studentData.ratings.breakdown.skills.study_management}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && studentData && (
        <div className="tab-content">
          <div className="recommendations-section">
            <h3>💡 Personalized Recommendations</h3>
            
            <div className="recommendations-grid">
              {studentData.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-priority">High Priority</span>
                  </div>
                  <p className="rec-text">{rec}</p>
                  <div className="rec-footer">
                    <span className="rec-timeline">Timeline: 1-2 weeks</span>
                    <span className="rec-impact">Expected Impact: +3-5 points</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Plan */}
            <div className="action-plan">
              <h4>📋 30-Day Action Plan</h4>
              <div className="action-timeline">
                <div className="action-item">
                  <div className="action-week">Week 1</div>
                  <div className="action-content">
                    <h5>🎯 Focus on Homework Organization</h5>
                    <ul>
                      <li>Create daily homework tracking sheet</li>
                      <li>Set up study reminders</li>
                      <li>Meet with study group twice weekly</li>
                    </ul>
                  </div>
                </div>
                
                <div className="action-item">
                  <div className="action-week">Week 2</div>
                  <div className="action-content">
                    <h5>🧠 Enhance Critical Thinking</h5>
                    <ul>
                      <li>Practice analytical problem-solving</li>
                      <li>Join debate or discussion groups</li>
                      <li>Complete additional logic puzzles</li>
                    </ul>
                  </div>
                </div>

                <div className="action-item">
                  <div className="action-week">Week 3-4</div>
                  <div className="action-content">
                    <h5>📈 Monitor and Adjust</h5>
                    <ul>
                      <li>Weekly progress check-ins</li>
                      <li>Adjust strategies based on results</li>
                      <li>Celebrate improvements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalyticsDashboard;