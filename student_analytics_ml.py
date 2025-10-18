import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import pickle
import json
from datetime import datetime, timedelta

class StudentAnalytics:
    def __init__(self):
        self.model = None
        self.features = [
            'presence_ratio', 'hw_submission', 'hw_quality',
            'cw_submission', 'cw_quality',
            'marks_math', 'marks_english', 'marks_science',
            'communication', 'critical_thinking',
            'discipline', 'study_mgmt'
        ]
        
    def normalize(self, val, vmin, vmax):
        """Normalize to 1–100 range"""
        return np.clip(1 + 99 * (val - vmin) / (vmax - vmin + 1e-6), 1, 100)
    
    def calculate_ratings(self, student_data):
        """Calculate FIFA-style ratings for a student"""
        # Attendance Sub-sectors
        r_att_regular = self.normalize(10 - student_data.get('absence_regular', 0), 0, 10)
        r_att_holiday = self.normalize(5 - (student_data.get('absence_before_holiday', 0) + 
                                           student_data.get('absence_after_holiday', 0)), 0, 5)
        r_att_sick = self.normalize(4 - student_data.get('absence_sick', 0), 0, 4)
        r_presence_ratio = self.normalize(student_data.get('presence_ratio', 0.8), 0.7, 1.0)
        r_late = self.normalize(1 - student_data.get('late_ratio', 0.1), 0, 1)
        
        attendance_rating = np.mean([r_att_regular, r_att_holiday, r_att_sick, r_presence_ratio, r_late])

        # Homework/Classwork Sub-sectors
        r_hw_sub = self.normalize(student_data.get('hw_submission', 0.8), 0.5, 1.0)
        r_hw_qual = self.normalize(student_data.get('hw_quality', 0.7), 0.5, 1.0)
        r_cw_sub = self.normalize(student_data.get('cw_submission', 0.8), 0.5, 1.0)
        r_cw_qual = self.normalize(student_data.get('cw_quality', 0.7), 0.5, 1.0)
        hw_cw_rating = np.mean([r_hw_sub, r_hw_qual, r_cw_sub, r_cw_qual])

        # Exam Sub-sectors
        avg_marks = np.mean([
            student_data.get('marks_math', 70),
            student_data.get('marks_english', 70),
            student_data.get('marks_science', 70)
        ])
        r_marks = self.normalize(avg_marks, 40, 100)
        r_sensibility = self.normalize(student_data.get('answer_sensibility', 0.8), 0.5, 1.0)
        r_completion = self.normalize(student_data.get('completion_rate', 0.8), 0.6, 1.0)
        r_unrelated = self.normalize(1 - student_data.get('unrelated_answer', 0.1), 0, 1)
        exam_rating = np.mean([r_marks, r_sensibility, r_completion, r_unrelated])

        # Skill Sub-sectors
        r_comm = self.normalize(student_data.get('communication', 0.7), 0.5, 1.0)
        r_ct = self.normalize(student_data.get('critical_thinking', 0.7), 0.5, 1.0)
        r_discipline = self.normalize(student_data.get('discipline', 0.8), 0.5, 1.0)
        r_study = self.normalize(student_data.get('study_mgmt', 0.7), 0.5, 1.0)
        skill_rating = np.mean([r_comm, r_ct, r_discipline, r_study])

        # Final FIFA-like Rating (weighted average)
        final_rating = (
            0.3 * attendance_rating +
            0.3 * hw_cw_rating +
            0.3 * exam_rating +
            0.1 * skill_rating
        )

        return {
            'attendance_rating': round(attendance_rating, 2),
            'homework_classwork_rating': round(hw_cw_rating, 2),
            'exam_rating': round(exam_rating, 2),
            'skill_rating': round(skill_rating, 2),
            'fifa_rating': round(final_rating, 2),
            'breakdown': {
                'attendance': {
                    'regular_attendance': round(r_att_regular, 2),
                    'holiday_attendance': round(r_att_holiday, 2),
                    'sick_days': round(r_att_sick, 2),
                    'presence_ratio': round(r_presence_ratio, 2),
                    'punctuality': round(r_late, 2)
                },
                'homework_classwork': {
                    'hw_submission': round(r_hw_sub, 2),
                    'hw_quality': round(r_hw_qual, 2),
                    'cw_submission': round(r_cw_sub, 2),
                    'cw_quality': round(r_cw_qual, 2)
                },
                'exams': {
                    'average_marks': round(r_marks, 2),
                    'answer_quality': round(r_sensibility, 2),
                    'completion': round(r_completion, 2),
                    'relevance': round(r_unrelated, 2)
                },
                'skills': {
                    'communication': round(r_comm, 2),
                    'critical_thinking': round(r_ct, 2),
                    'discipline': round(r_discipline, 2),
                    'study_management': round(r_study, 2)
                }
            }
        }
    
    def generate_recommendations(self, ratings):
        """Generate personalized recommendations based on ratings"""
        recommendations = []
        
        if ratings['attendance_rating'] < 60:
            recommendations.append("🎯 Focus on improving attendance habits and punctuality")
        if ratings['homework_classwork_rating'] < 60:
            recommendations.append("📚 Strengthen homework completion and class participation")
        if ratings['exam_rating'] < 60:
            recommendations.append("📝 Practice more exam techniques and time management")
        if ratings['skill_rating'] < 60:
            recommendations.append("🧠 Work on communication and study management skills")
            
        # Specific recommendations based on breakdown
        breakdown = ratings['breakdown']
        
        if breakdown['attendance']['punctuality'] < 50:
            recommendations.append("⏰ Set multiple alarms and plan to arrive 10 minutes early")
        
        if breakdown['homework_classwork']['hw_submission'] < 50:
            recommendations.append("📅 Create a homework tracking system and set daily reminders")
            
        if breakdown['exams']['completion'] < 50:
            recommendations.append("⏱️ Practice time management during mock exams")
            
        if breakdown['skills']['critical_thinking'] < 50:
            recommendations.append("💭 Engage in more analytical discussions and problem-solving exercises")
            
        return recommendations
    
    def train_model(self, training_data):
        """Train the Random Forest model with student data"""
        df = pd.DataFrame(training_data)
        
        # Calculate ratings for all students
        ratings_list = []
        for _, student in df.iterrows():
            ratings = self.calculate_ratings(student.to_dict())
            ratings_list.append(ratings)
            
        ratings_df = pd.DataFrame(ratings_list)
        df = pd.concat([df, ratings_df[['fifa_rating']]], axis=1)
        
        # Prepare features and target
        X = df[self.features]
        y = df['fifa_rating']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train Random Forest model
        self.model = RandomForestRegressor(
            n_estimators=200,
            random_state=42,
            max_depth=8,
            min_samples_split=4
        )
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        return {
            'mse': round(mse, 3),
            'r2_score': round(r2, 3),
            'feature_importance': dict(zip(self.features, self.model.feature_importances_))
        }
    
    def predict_performance(self, student_features):
        """Predict student performance using trained model"""
        if self.model is None:
            return None
            
        # Prepare features
        feature_array = np.array([[student_features.get(feature, 0.5) for feature in self.features]])
        prediction = self.model.predict(feature_array)[0]
        
        return round(prediction, 2)
    
    def get_student_profile(self, student_data):
        """Generate complete student profile with ratings, predictions, and recommendations"""
        ratings = self.calculate_ratings(student_data)
        recommendations = self.generate_recommendations(ratings)
        
        # Get prediction if model is trained
        predicted_rating = None
        if self.model is not None:
            predicted_rating = self.predict_performance(student_data)
        
        return {
            'student_id': student_data.get('student_id', 'Unknown'),
            'timestamp': datetime.now().isoformat(),
            'ratings': ratings,
            'predicted_rating': predicted_rating,
            'recommendations': recommendations,
            'subject_marks': {
                'math': student_data.get('marks_math', 0),
                'english': student_data.get('marks_english', 0),
                'science': student_data.get('marks_science', 0)
            },
            'attendance_stats': {
                'presence_ratio': student_data.get('presence_ratio', 0),
                'total_absences': student_data.get('total_absence', 0),
                'late_count': student_data.get('late_count', 0)
            }
        }
    
    def save_model(self, filepath):
        """Save trained model to file"""
        if self.model is not None:
            with open(filepath, 'wb') as f:
                pickle.dump(self.model, f)
    
    def load_model(self, filepath):
        """Load trained model from file"""
        with open(filepath, 'rb') as f:
            self.model = pickle.load(f)

# Example usage and sample data generation
def generate_sample_data(n_students=100):
    """Generate sample student data for testing"""
    np.random.seed(42)
    
    students = []
    for i in range(n_students):
        student = {
            'student_id': f'S{i+1:03d}',
            'absence_regular': np.random.randint(0, 10),
            'absence_before_holiday': np.random.randint(0, 3),
            'absence_after_holiday': np.random.randint(0, 3),
            'absence_sick': np.random.randint(0, 4),
            'present_count': np.random.randint(70, 100),
            'late_count': np.random.randint(0, 10),
            'hw_submission': np.random.uniform(0.6, 1.0),
            'hw_quality': np.random.uniform(0.5, 1.0),
            'cw_submission': np.random.uniform(0.6, 1.0),
            'cw_quality': np.random.uniform(0.5, 1.0),
            'marks_math': np.random.randint(50, 100),
            'marks_english': np.random.randint(40, 95),
            'marks_science': np.random.randint(45, 100),
            'answer_sensibility': np.random.uniform(0.5, 1.0),
            'completion_rate': np.random.uniform(0.6, 1.0),
            'unrelated_answer': np.random.uniform(0.0, 0.2),
            'communication': np.random.uniform(0.5, 1.0),
            'critical_thinking': np.random.uniform(0.5, 1.0),
            'discipline': np.random.uniform(0.5, 1.0),
            'study_mgmt': np.random.uniform(0.5, 1.0)
        }
        
        # Calculate derived fields
        student['total_absence'] = (student['absence_regular'] + 
                                   student['absence_before_holiday'] + 
                                   student['absence_after_holiday'] + 
                                   student['absence_sick'])
        student['presence_ratio'] = student['present_count'] / (student['present_count'] + student['total_absence'])
        student['late_ratio'] = student['late_count'] / (student['present_count'] + student['late_count'])
        
        students.append(student)
    
    return students

# Test the system
if __name__ == "__main__":
    # Initialize analytics system
    analytics = StudentAnalytics()
    
    # Generate sample data
    sample_students = generate_sample_data(100)
    
    # Train the model
    print("Training ML model...")
    model_performance = analytics.train_model(sample_students)
    print(f"Model Performance - R² Score: {model_performance['r2_score']}, MSE: {model_performance['mse']}")
    
    # Test with a sample student
    test_student = {
        'student_id': 'S001',
        'presence_ratio': 0.92,
        'hw_submission': 0.9,
        'hw_quality': 0.85,
        'cw_submission': 0.8,
        'cw_quality': 0.9,
        'marks_math': 85,
        'marks_english': 78,
        'marks_science': 88,
        'communication': 0.85,
        'critical_thinking': 0.8,
        'discipline': 0.9,
        'study_mgmt': 0.85,
        'absence_regular': 2,
        'absence_before_holiday': 0,
        'absence_after_holiday': 1,
        'absence_sick': 1,
        'present_count': 85,
        'late_count': 3,
        'answer_sensibility': 0.9,
        'completion_rate': 0.85,
        'unrelated_answer': 0.05
    }
    
    # Generate student profile
    profile = analytics.get_student_profile(test_student)
    print(f"\nStudent Profile Generated:")
    print(f"FIFA Rating: {profile['ratings']['fifa_rating']}/100")
    print(f"Predicted Rating: {profile['predicted_rating']}/100")
    print(f"Recommendations: {len(profile['recommendations'])}")
    
    # Save the model
    analytics.save_model('student_analytics_model.pkl')
    print("\nModel saved successfully!")