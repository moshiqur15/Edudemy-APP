import React from 'react';
import { GraduationCap, Award, CheckCircle } from 'lucide-react';

const PrintableReportCard = React.forwardRef(({ student, reportData, selectedMonth, selectedYear }, ref) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
      'A+': 'text-green-600',
      'A': 'text-green-600',
      'A-': 'text-blue-600',
      'B+': 'text-blue-600',
      'B': 'text-yellow-600',
      'B-': 'text-yellow-600',
      'C+': 'text-orange-600',
      'C': 'text-orange-600',
      'D': 'text-red-600',
      'F': 'text-red-600'
    };
    return colors[grade] || 'text-gray-600';
  };

  if (!student || !reportData) return null;

  return (
    <div 
      ref={ref} 
      className="bg-white p-8 max-w-4xl mx-auto text-black"
      style={{ 
        fontFamily: 'Times New Roman, serif', // Change font family
        fontSize: '11px',  // Adjust base font size
        lineHeight: '1.5', // Adjust line height
        color: '#000',
        backgroundColor: '#fff'
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
        {/* You can replace this with your school logo */}
        <div className="mb-4">
          {/* Option 1: Replace with image */}
          {/* <img src="/path/to/your/school-logo.png" alt="School Logo" className="mx-auto h-16 w-auto mb-2" /> */}
          
          {/* Option 2: Keep icon with custom school name */}
          <div className="flex items-center justify-center mb-2">
            <GraduationCap size={40} className="text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-blue-600">YOUR SCHOOL NAME</h1>
          </div>
          
          {/* Add school address/contact */}
          <p className="text-xs text-gray-600 mb-1">Your School Address, City, Country</p>
          <p className="text-xs text-gray-600 mb-1">Phone: +123 456 7890 | Email: info@yourschool.com</p>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">STUDENT REPORT CARD</h2>
        <p className="text-gray-600 font-medium">
          Academic Year: {selectedYear} | Month: {months[selectedMonth - 1]}
        </p>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Student & Academic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-800 text-sm uppercase border-b border-gray-300 pb-1">
              Student Information
            </h3>
            <div className="space-y-1 text-xs">
              <div><strong>Name:</strong> {student.full_name}</div>
              <div><strong>Reg. No:</strong> {student.student_reg_number}</div>
              <div><strong>Class:</strong> {student.class_name}</div>
              <div><strong>Batch:</strong> {student.batch?.name}</div>
              <div><strong>Joining Date:</strong> {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-gray-800 text-sm uppercase border-b border-gray-300 pb-1">
              Contact Information
            </h3>
            <div className="space-y-1 text-xs">
              <div><strong>Student Contact:</strong> {student.student_contact || 'N/A'}</div>
              <div><strong>Address:</strong> {student.address || 'N/A'}</div>
              <div><strong>Version:</strong> {student.version}</div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Family Info */}
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800 text-sm uppercase border-b border-gray-300 pb-1">
            Family Information
          </h3>
          <div className="space-y-1 text-xs">
            <div><strong>Father's Name:</strong> {student.father_name}</div>
            <div><strong>Mother's Name:</strong> {student.mother_name}</div>
            <div><strong>Father's Contact:</strong> {student.father_contact || 'N/A'}</div>
            <div><strong>Mother's Contact:</strong> {student.mother_contact || 'N/A'}</div>
            <div><strong>Gender:</strong> {student.gender}</div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center border border-gray-300 p-3 rounded">
          <div className="text-2xl font-bold text-blue-600">{calculateGPA(reportData.monthlyExams)}</div>
          <div className="text-xs text-gray-600">Overall GPA</div>
        </div>
        <div className="text-center border border-gray-300 p-3 rounded">
          <div className="text-2xl font-bold text-green-600">{reportData.attendance.percentage}%</div>
          <div className="text-xs text-gray-600">Attendance</div>
        </div>
        <div className="text-center border border-gray-300 p-3 rounded">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.min(...Object.values(reportData.monthlyExams).map(r => r.position))}
          </div>
          <div className="text-xs text-gray-600">Best Position</div>
        </div>
      </div>

      {/* Monthly Exam Results */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 text-sm uppercase border-b border-gray-300 pb-1 mb-3">
          Monthly Exam Results
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-2 text-left">Subject</th>
              <th className="border border-gray-300 px-2 py-2 text-center">Marks</th>
              <th className="border border-gray-300 px-2 py-2 text-center">Percentage</th>
              <th className="border border-gray-300 px-2 py-2 text-center">Grade</th>
              <th className="border border-gray-300 px-2 py-2 text-center">Position</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(reportData.monthlyExams).map(([subject, result]) => (
              <tr key={subject}>
                <td className="border border-gray-300 px-2 py-2 font-medium">{subject}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{result.marks}/{result.maxMarks}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{result.marks}%</td>
                <td className={`border border-gray-300 px-2 py-2 text-center font-bold ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center">{result.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attendance Summary */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 text-sm uppercase border-b border-gray-300 pb-1 mb-3">
          Attendance Summary
        </h3>
        <div className="grid grid-cols-4 gap-4 mb-3">
          <div className="text-center border border-gray-300 p-2 rounded">
            <div className="text-lg font-bold text-blue-600">{reportData.attendance.totalDays}</div>
            <div className="text-xs text-gray-600">Total Days</div>
          </div>
          <div className="text-center border border-gray-300 p-2 rounded">
            <div className="text-lg font-bold text-green-600">{reportData.attendance.presentDays}</div>
            <div className="text-xs text-gray-600">Present</div>
          </div>
          <div className="text-center border border-gray-300 p-2 rounded">
            <div className="text-lg font-bold text-red-600">{reportData.attendance.absentDays}</div>
            <div className="text-xs text-gray-600">Absent</div>
          </div>
          <div className="text-center border border-gray-300 p-2 rounded">
            <div className="text-lg font-bold text-yellow-600">{reportData.attendance.lateDays}</div>
            <div className="text-xs text-gray-600">Late</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full"
            style={{ width: `${reportData.attendance.percentage}%` }}
          ></div>
        </div>
        <div className="text-center text-xs text-gray-600 mt-1">
          Attendance Percentage: {reportData.attendance.percentage}%
        </div>
      </div>

      {/* Daily Exam Performance Summary */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 text-sm uppercase border-b border-gray-300 pb-1 mb-3">
          Daily Exam Performance Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(reportData.dailyExams).map(([subject, exams]) => (
            <div key={subject} className="border border-gray-300 p-3 rounded">
              <div className="font-medium text-xs mb-2">{subject}</div>
              <div className="text-xs">
                <div>Total Exams: {exams.length}</div>
                <div>Average: {(exams.reduce((sum, exam) => sum + exam.percentage, 0) / exams.length).toFixed(1)}%</div>
                <div>Best Score: {Math.max(...exams.map(e => e.percentage))}%</div>
                <div>Lowest Score: {Math.min(...exams.map(e => e.percentage))}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher/Principal Remarks - NEW SECTION */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 text-sm uppercase border-b border-gray-300 pb-1 mb-3">
          Remarks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-300 p-3">
            <h4 className="font-bold text-xs mb-2">Class Teacher's Remarks:</h4>
            <div className="text-xs min-h-16 border border-gray-200 p-2 bg-gray-50">
              {/* This could come from reportData.teacherRemarks or be editable */}
              Excellent performance in Mathematics and Science. Needs improvement in English writing skills.
            </div>
          </div>
          <div className="border border-gray-300 p-3">
            <h4 className="font-bold text-xs mb-2">Principal's Remarks:</h4>
            <div className="text-xs min-h-16 border border-gray-200 p-2 bg-gray-50">
              {/* This could come from reportData.principalRemarks */}
              Overall good academic performance. Keep up the good work!
            </div>
          </div>
        </div>
      </div>

      {/* Grading Scale */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 text-sm uppercase border-b border-gray-300 pb-1 mb-3">
          Grading Scale
        </h3>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="text-center border border-gray-300 p-2">
            <div className="font-bold text-green-600">A+</div>
            <div>90-100%</div>
          </div>
          <div className="text-center border border-gray-300 p-2">
            <div className="font-bold text-blue-600">A</div>
            <div>80-89%</div>
          </div>
          <div className="text-center border border-gray-300 p-2">
            <div className="font-bold text-yellow-600">B</div>
            <div>70-79%</div>
          </div>
          <div className="text-center border border-gray-300 p-2">
            <div className="font-bold text-orange-600">C</div>
            <div>60-69%</div>
          </div>
          <div className="text-center border border-gray-300 p-2">
            <div className="font-bold text-red-600">F</div>
            <div>Below 60%</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 mt-8">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-8">
              <strong>Class Teacher</strong>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-8">
              <strong>Principal</strong>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-8">
              <strong>Parent's Signature</strong>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6 text-xs text-gray-500">
          Generated on: {new Date().toLocaleDateString()} | EduDemy Educational Management System
        </div>
      </div>
    </div>
  );
});

PrintableReportCard.displayName = 'PrintableReportCard';

export default PrintableReportCard;