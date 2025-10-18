import React, { useState } from 'react';
import {
  User,
  Star,
  TrendingUp,
  TrendingDown,
  Calendar,
  BookOpen,
  Brain,
  Award,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  BarChart3,
  Clock,
  Trophy,
  Zap,
  Eye,
  ChevronRight
} from 'lucide-react';

const FIFAStudentCard = ({ student, analytics, onClick, isSelected = false }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!analytics || !analytics.ratings) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const { ratings } = analytics;
  const fifaRating = ratings.fifa_rating || 0;
  const riskLevel = analytics.risk_level || 'low';
  
  // Determine card style based on FIFA rating and risk level
  const getCardStyle = () => {
    if (riskLevel === 'high' || fifaRating < 40) {
      return {
        borderColor: 'border-red-400',
        bgGradient: 'from-red-50 to-red-100',
        ratingBg: 'bg-red-500',
        ratingColor: 'text-white',
        headerBg: 'bg-red-500'
      };
    } else if (riskLevel === 'medium' || fifaRating < 60) {
      return {
        borderColor: 'border-orange-400',
        bgGradient: 'from-orange-50 to-orange-100',
        ratingBg: 'bg-orange-500',
        ratingColor: 'text-white',
        headerBg: 'bg-orange-500'
      };
    } else if (fifaRating >= 85) {
      return {
        borderColor: 'border-yellow-400',
        bgGradient: 'from-yellow-50 to-yellow-100',
        ratingBg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
        ratingColor: 'text-black font-bold',
        headerBg: 'bg-gradient-to-r from-yellow-400 to-yellow-500'
      };
    } else if (fifaRating >= 75) {
      return {
        borderColor: 'border-green-400',
        bgGradient: 'from-green-50 to-green-100',
        ratingBg: 'bg-green-500',
        ratingColor: 'text-white',
        headerBg: 'bg-green-500'
      };
    } else {
      return {
        borderColor: 'border-blue-400',
        bgGradient: 'from-blue-50 to-blue-100',
        ratingBg: 'bg-blue-500',
        ratingColor: 'text-white',
        headerBg: 'bg-blue-500'
      };
    }
  };

  const cardStyle = getCardStyle();

  // Get student position/role based on strengths
  const getStudentPosition = () => {
    const breakdown = ratings.breakdown || {};
    const scores = {
      attendance: breakdown.attendance?.presence_ratio || 0,
      academic: (breakdown.homework_classwork?.hw_quality + breakdown.exams?.average_marks) / 2 || 0,
      skills: breakdown.skills?.communication || 0
    };
    
    const maxScore = Math.max(...Object.values(scores));
    const strongestArea = Object.keys(scores).find(key => scores[key] === maxScore);
    
    switch (strongestArea) {
      case 'attendance': return 'Consistent';
      case 'academic': return 'Academic';
      case 'skills': return 'All-Rounder';
      default: return 'Developing';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 85) return 'text-yellow-600 font-bold';
    if (rating >= 75) return 'text-green-600';
    if (rating >= 60) return 'text-blue-600';
    if (rating >= 45) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-lg border-2 ${cardStyle.borderColor} bg-gradient-to-br ${cardStyle.bgGradient} transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer overflow-hidden ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}
      onClick={() => onClick?.(student, analytics)}
    >
      {/* Header with FIFA Rating */}
      <div className={`${cardStyle.headerBg} px-4 py-2 text-white flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <Trophy size={16} />
          <span className="font-bold text-sm">{getStudentPosition()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star size={12} />
          <span className="text-xs opacity-90">FIFA</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Student Info and Rating */}
        <div className="flex items-center space-x-4 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {!imageError && student.photo ? (
                <img 
                  src={student.photo} 
                  alt={student.full_name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-2xl font-bold text-gray-500">
                  {student.full_name?.charAt(0) || 'S'}
                </span>
              )}
            </div>
            {/* Risk indicator */}
            {riskLevel !== 'low' && (
              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                riskLevel === 'high' ? 'bg-red-500' : 'bg-orange-500'
              }`}>
                <AlertTriangle size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Student Details */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
              {student.full_name}
            </h3>
            <p className="text-xs text-gray-600 mb-1">
              {student.class_name} • Roll: {student.student_roll_number || student.admission_serial || 'N/A'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar size={12} />
              <span>Student ID: {student.student_reg_number || student.id}</span>
            </div>
          </div>

          {/* FIFA Rating Circle */}
          <div className={`w-16 h-16 rounded-full ${cardStyle.ratingBg} flex flex-col items-center justify-center shadow-lg`}>
            <span className={`text-xl font-bold ${cardStyle.ratingColor}`}>
              {Math.round(fifaRating)}
            </span>
            <span className={`text-xs ${cardStyle.ratingColor} opacity-80`}>
              OVR
            </span>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white bg-opacity-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Calendar size={12} className="text-blue-600" />
                <span className="text-xs font-medium">ATT</span>
              </div>
              <span className={`text-sm font-bold ${getRatingColor(ratings.attendance_rating)}`}>
                {Math.round(ratings.attendance_rating || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min((ratings.attendance_rating || 0), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white bg-opacity-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <BookOpen size={12} className="text-purple-600" />
                <span className="text-xs font-medium">HW</span>
              </div>
              <span className={`text-sm font-bold ${getRatingColor(ratings.homework_classwork_rating)}`}>
                {Math.round(ratings.homework_classwork_rating || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-purple-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min((ratings.homework_classwork_rating || 0), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white bg-opacity-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <BarChart3 size={12} className="text-green-600" />
                <span className="text-xs font-medium">EX</span>
              </div>
              <span className={`text-sm font-bold ${getRatingColor(ratings.exam_rating)}`}>
                {Math.round(ratings.exam_rating || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min((ratings.exam_rating || 0), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white bg-opacity-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Brain size={12} className="text-indigo-600" />
                <span className="text-xs font-medium">SK</span>
              </div>
              <span className={`text-sm font-bold ${getRatingColor(ratings.skill_rating)}`}>
                {Math.round(ratings.skill_rating || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min((ratings.skill_rating || 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Improvement Trend */}
        {analytics.improvement_trend !== undefined && (
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-gray-600">Trend:</span>
            <div className="flex items-center space-x-1">
              {analytics.improvement_trend > 0 ? (
                <>
                  <TrendingUp size={12} className="text-green-500" />
                  <span className="text-green-600 font-medium">
                    +{analytics.improvement_trend.toFixed(1)}
                  </span>
                </>
              ) : analytics.improvement_trend < 0 ? (
                <>
                  <TrendingDown size={12} className="text-red-500" />
                  <span className="text-red-600 font-medium">
                    {analytics.improvement_trend.toFixed(1)}
                  </span>
                </>
              ) : (
                <>
                  <Activity size={12} className="text-gray-500" />
                  <span className="text-gray-600 font-medium">Stable</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {analytics.recommendations && analytics.recommendations.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-orange-600">
                <Target size={10} />
                <span>{analytics.recommendations.length} tips</span>
              </div>
            )}
          </div>
          
          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
            <Eye size={12} />
            <span>View Details</span>
            <ChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* Shine effect for high performers */}
      {fifaRating >= 85 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-30 transform -skew-x-12 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default FIFAStudentCard;