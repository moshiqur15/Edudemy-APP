import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Star,
  TrendingUp,
  TrendingDown,
  Calendar,
  BookOpen,
  Brain,
  Award,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Clock,
  Trophy,
  Zap,
  CheckCircle,
  XCircle,
  Info,
  RefreshCcw,
  Download,
  Mail,
  Phone,
  MapPin,
  GraduationCap
} from 'lucide-react';

const StudentDetailedAnalytics = ({ student, onBack }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (student) {
      loadDetailedAnalytics();
    }
  }, [student]);

  const loadDetailedAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/analytics/${student.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading detailed analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    await loadDetailedAnalytics();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Not Available</h3>
          <p className="text-gray-500">Unable to load analytics data for this student.</p>
        </div>
      </div>
    );
  }

  const fifaRating = analytics.fifa_rating || 0;
  const riskLevel = analytics.risk_level || 'low';

  const getCardStyle = () => {
    if (riskLevel === 'high' || fifaRating < 40) {
      return {
        borderColor: 'border-red-400',
        bgGradient: 'from-red-50 to-red-100',
        headerBg: 'bg-red-500'
      };
    } else if (riskLevel === 'medium' || fifaRating < 60) {
      return {
        borderColor: 'border-orange-400',
        bgGradient: 'from-orange-50 to-orange-100',
        headerBg: 'bg-orange-500'
      };
    } else if (fifaRating >= 85) {
      return {
        borderColor: 'border-yellow-400',
        bgGradient: 'from-yellow-50 to-yellow-100',
        headerBg: 'bg-gradient-to-r from-yellow-400 to-yellow-500'
      };
    } else if (fifaRating >= 75) {
      return {
        borderColor: 'border-green-400',
        bgGradient: 'from-green-50 to-green-100',
        headerBg: 'bg-green-500'
      };
    } else {
      return {
        borderColor: 'border-blue-400',
        bgGradient: 'from-blue-50 to-blue-100',
        headerBg: 'bg-blue-500'
      };
    }
  };

  const cardStyle = getCardStyle();

  const getRatingColor = (rating) => {
    if (rating >= 85) return 'text-yellow-600';
    if (rating >= 75) return 'text-green-600';
    if (rating >= 60) return 'text-blue-600';
    if (rating >= 45) return 'text-orange-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'breakdown', label: 'Detailed Breakdown', icon: BarChart3 },
    { id: 'trends', label: 'Performance Trends', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: Target }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main FIFA Card */}
      <div className={`bg-white rounded-xl shadow-lg border-2 ${cardStyle.borderColor} bg-gradient-to-br ${cardStyle.bgGradient} overflow-hidden`}>
        {/* Header */}
        <div className={`${cardStyle.headerBg} px-6 py-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy size={24} />
              <div>
                <h2 className="text-xl font-bold">{student.full_name}</h2>
                <p className="text-sm opacity-90">{student.class_name} • Student ID: {student.student_reg_number || student.id}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{Math.round(fifaRating)}</div>
              <div className="text-sm opacity-90">FIFA Rating</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Performance</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">Attendance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getRatingColor(analytics.attendance_rating)}`}>
                      {Math.round(analytics.attendance_rating || 0)}
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(analytics.attendance_rating || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} className="text-purple-600" />
                    <span className="text-sm font-medium">Homework</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getRatingColor(analytics.homework_rating)}`}>
                      {Math.round(analytics.homework_rating || 0)}
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(analytics.homework_rating || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 size={16} className="text-green-600" />
                    <span className="text-sm font-medium">Exams</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getRatingColor(analytics.exam_rating)}`}>
                      {Math.round(analytics.exam_rating || 0)}
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(analytics.exam_rating || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium">Skills</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getRatingColor(analytics.skill_rating)}`}>
                      {Math.round(analytics.skill_rating || 0)}
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(analytics.skill_rating || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
              
              <div className={`p-4 rounded-lg border-2 ${
                riskLevel === 'high' ? 'bg-red-50 border-red-200' :
                riskLevel === 'medium' ? 'bg-orange-50 border-orange-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {riskLevel === 'high' ? (
                    <AlertTriangle size={20} className="text-red-600" />
                  ) : riskLevel === 'medium' ? (
                    <Info size={20} className="text-orange-600" />
                  ) : (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                  <span className={`font-bold ${
                    riskLevel === 'high' ? 'text-red-700' :
                    riskLevel === 'medium' ? 'text-orange-700' :
                    'text-green-700'
                  }`}>
                    {riskLevel === 'high' ? 'High Risk' :
                     riskLevel === 'medium' ? 'Medium Risk' :
                     'Low Risk'}
                  </span>
                </div>
                <p className={`text-sm ${
                  riskLevel === 'high' ? 'text-red-600' :
                  riskLevel === 'medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {riskLevel === 'high' ? 'Student requires immediate attention and intervention.' :
                   riskLevel === 'medium' ? 'Student shows some areas that need improvement.' :
                   'Student is performing well with no major concerns.'}
                </p>
              </div>

              {analytics.improvement_trend !== undefined && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Performance Trend:</span>
                  <div className="flex items-center space-x-1">
                    {analytics.improvement_trend > 0 ? (
                      <>
                        <TrendingUp size={16} className="text-green-500" />
                        <span className="text-green-600 font-medium">
                          +{analytics.improvement_trend.toFixed(1)}
                        </span>
                      </>
                    ) : analytics.improvement_trend < 0 ? (
                      <>
                        <TrendingDown size={16} className="text-red-500" />
                        <span className="text-red-600 font-medium">
                          {analytics.improvement_trend.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Activity size={16} className="text-gray-500" />
                        <span className="text-gray-600 font-medium">Stable</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {analytics.predicted_rating && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Predicted Rating:</span>
                  <span className="font-bold text-purple-600">
                    {Math.round(analytics.predicted_rating)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar size={20} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Attendance Rate</p>
              <p className="text-xs text-gray-500">
                {analytics.attendance_stats?.presence_ratio ? 
                  `${(analytics.attendance_stats.presence_ratio * 100).toFixed(1)}%` : 
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <GraduationCap size={20} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Subject Average</p>
              <p className="text-xs text-gray-500">
                {analytics.subject_marks ? 
                  `${Math.round((analytics.subject_marks.math + analytics.subject_marks.english + analytics.subject_marks.science) / 3)}%` :
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Target size={20} className="text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Recommendations</p>
              <p className="text-xs text-gray-500">
                {analytics.recommendations?.length || 0} active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBreakdown = () => (
    <div className="space-y-6">
      {/* Detailed Category Breakdown */}
      {analytics.rating_breakdown && Object.entries(analytics.rating_breakdown).map(([category, details]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center">
            {category === 'attendance' && <Calendar size={20} className="mr-2 text-blue-600" />}
            {category === 'homework_classwork' && <BookOpen size={20} className="mr-2 text-purple-600" />}
            {category === 'exams' && <BarChart3 size={20} className="mr-2 text-green-600" />}
            {category === 'skills' && <Brain size={20} className="mr-2 text-indigo-600" />}
            {category.replace('_', ' & ')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(details).map(([metric, value]) => (
              <div key={metric} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {metric.replace('_', ' ')}
                  </span>
                  <span className={`font-bold ${getRatingColor(value)}`}>
                    {Math.round(value)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      category === 'attendance' ? 'bg-blue-500' :
                      category === 'homework_classwork' ? 'bg-purple-500' :
                      category === 'exams' ? 'bg-green-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      {analytics.recommendations && analytics.recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics.recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  rec.priority === 'high' ? 'bg-red-100' :
                  rec.priority === 'medium' ? 'bg-orange-100' :
                  'bg-blue-100'
                }`}>
                  <Target size={16} className={
                    rec.priority === 'high' ? 'text-red-600' :
                    rec.priority === 'medium' ? 'text-orange-600' :
                    'text-blue-600'
                  } />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  
                  {rec.action_items && rec.action_items.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">Action Items:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {rec.action_items.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start space-x-1">
                            <span>•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {rec.expected_improvement && (
                    <div className="mt-3 flex items-center space-x-2 text-xs">
                      <TrendingUp size={12} className="text-green-500" />
                      <span className="text-green-600">
                        Expected improvement: +{rec.expected_improvement} points
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Needed</h3>
          <p className="text-gray-500">This student is performing well across all areas!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
            <p className="text-gray-600">Detailed FIFA-style performance analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshAnalytics}
            className="flex items-center px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'breakdown' && renderBreakdown()}
        {activeTab === 'trends' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trends Coming Soon</h3>
            <p className="text-gray-500">Performance trends visualization will be available in the next update.</p>
          </div>
        )}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default StudentDetailedAnalytics;