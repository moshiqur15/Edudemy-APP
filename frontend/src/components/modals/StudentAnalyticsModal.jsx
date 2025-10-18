import React from 'react';
import { X, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Award, Target } from 'lucide-react';

const StudentAnalyticsModal = ({ student, analytics, onClose }) => {
  if (!analytics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const getRiskLevelColor = (risk) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getPerformanceIcon = (rating) => {
    if (rating >= 80) return <CheckCircle size={20} className="text-green-500" />;
    if (rating >= 60) return <Target size={20} className="text-yellow-500" />;
    return <AlertTriangle size={20} className="text-red-500" />;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0.1) return <TrendingUp size={16} className="text-green-500" />;
    if (trend < -0.1) return <TrendingDown size={16} className="text-red-500" />;
    return <div className="w-4 h-4 rounded-full bg-gray-400"></div>;
  };

  const getRecommendations = (analytics) => {
    const recommendations = [];
    
    if (analytics.fifa_rating < 40) {
      recommendations.push({
        type: 'critical',
        text: 'Immediate intervention required - Overall performance critically low',
        action: 'Schedule parent meeting and provide intensive support'
      });
    }
    
    if (analytics.attendance_rating < 70) {
      recommendations.push({
        type: 'warning',
        text: 'Poor attendance affecting overall performance',
        action: 'Contact parents and discuss attendance improvement strategies'
      });
    }
    
    if (analytics.exam_rating < 50) {
      recommendations.push({
        type: 'warning',
        text: 'Exam performance needs improvement',
        action: 'Provide additional exam preparation and practice materials'
      });
    }
    
    if (analytics.homework_rating < 60) {
      recommendations.push({
        type: 'info',
        text: 'Homework completion could be better',
        action: 'Implement homework tracking and support system'
      });
    }
    
    if (analytics.improvement_trend < -0.2) {
      recommendations.push({
        type: 'warning',
        text: 'Performance trending downward',
        action: 'Review teaching approach and provide additional support'
      });
    }
    
    if (analytics.fifa_rating > 85) {
      recommendations.push({
        type: 'success',
        text: 'Excellent performance - consider advanced opportunities',
        action: 'Provide enrichment activities and leadership opportunities'
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations(analytics);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {student.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {student.full_name || 'Student'} - Analytics
              </h3>
              <p className="text-sm text-gray-500">
                {student.class_name} | {student.student_reg_number || 'No ID'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Overall Performance */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Award size={20} className="text-yellow-500" />
                FIFA Rating
              </h4>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {analytics.fifa_rating?.toFixed(1) || '0.0'}
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(analytics.risk_level)}`}>
                  {analytics.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
                </div>
              </div>
            </div>
            
            {/* FIFA Rating Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  analytics.fifa_rating >= 80 ? 'bg-green-500' :
                  analytics.fifa_rating >= 60 ? 'bg-yellow-500' :
                  analytics.fifa_rating >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(analytics.fifa_rating || 0, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Attendance</span>
                {getPerformanceIcon(analytics.attendance_rating)}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.attendance_rating?.toFixed(1) || '0.0'}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(analytics.attendance_rating || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Homework</span>
                {getPerformanceIcon(analytics.homework_rating)}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.homework_rating?.toFixed(1) || '0.0'}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${Math.min(analytics.homework_rating || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Exams</span>
                {getPerformanceIcon(analytics.exam_rating)}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.exam_rating?.toFixed(1) || '0.0'}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(analytics.exam_rating || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Skills</span>
                {getPerformanceIcon(analytics.skill_rating)}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.skill_rating?.toFixed(1) || '0.0'}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(analytics.skill_rating || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Predictions & Trends */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Predicted Rating</span>
              </div>
              <div className="text-xl font-bold text-blue-900">
                {analytics.predicted_rating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs text-blue-600">
                Confidence: {((analytics.confidence || 0) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon(analytics.improvement_trend)}
                <span className="text-sm font-medium text-green-800">Trend</span>
              </div>
              <div className="text-xl font-bold text-green-900">
                {analytics.improvement_trend > 0 ? '+' : ''}{(analytics.improvement_trend * 100)?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-xs text-green-600">
                {analytics.improvement_trend > 0.1 ? 'Improving' : 
                 analytics.improvement_trend < -0.1 ? 'Declining' : 'Stable'}
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Consistency</span>
              </div>
              <div className="text-xl font-bold text-yellow-900">
                {((analytics.consistency_score || 0) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-yellow-600">
                Performance stability
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Recommendations & Action Items
              </h4>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'critical' ? 'bg-red-50 border-red-400' :
                    rec.type === 'warning' ? 'bg-orange-50 border-orange-400' :
                    rec.type === 'success' ? 'bg-green-50 border-green-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {rec.type === 'critical' ? <AlertTriangle size={16} className="text-red-500" /> :
                         rec.type === 'warning' ? <AlertTriangle size={16} className="text-orange-500" /> :
                         rec.type === 'success' ? <CheckCircle size={16} className="text-green-500" /> :
                         <Target size={16} className="text-blue-500" />}
                      </div>
                      <div>
                        <div className={`font-medium ${
                          rec.type === 'critical' ? 'text-red-800' :
                          rec.type === 'warning' ? 'text-orange-800' :
                          rec.type === 'success' ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {rec.text}
                        </div>
                        <div className={`text-sm mt-1 ${
                          rec.type === 'critical' ? 'text-red-700' :
                          rec.type === 'warning' ? 'text-orange-700' :
                          rec.type === 'success' ? 'text-green-700' :
                          'text-blue-700'
                        }`}>
                          {rec.action}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="mt-6 pt-4 border-t text-sm text-gray-500 text-center">
            Last updated: {analytics.last_updated ? new Date(analytics.last_updated).toLocaleString() : 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsModal;