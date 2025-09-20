import React, { useState, useEffect } from 'react';
import { academicsAPI, studentsAPI } from '../../services/api';

const BatchStudentAssignment = ({ batchId, onClose, onUpdate }) => {
  const [batchDetails, setBatchDetails] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterVersion, setFilterVersion] = useState('');

  const classOptions = [
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'HSC 1st Year', 'HSC 2nd Year', 'SSC'
  ];

  useEffect(() => {
    fetchData();
  }, [batchId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch batch details
      const batchResponse = await academicsAPI.getBatch(batchId);
      setBatchDetails(batchResponse.data);
      setAssignedStudents(batchResponse.data.students || []);

      // Fetch all students
      const studentsResponse = await studentsAPI.getStudents();
      const allStudents = studentsResponse.data.students || studentsResponse.data || [];

      // Filter out already assigned students
      const assignedIds = (batchResponse.data.students || []).map(s => s.id);
      const available = allStudents.filter(student => !assignedIds.includes(student.id));
      setAvailableStudents(available);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading batch and student data');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to assign');
      return;
    }

    // Check capacity
    const totalAfterAssignment = assignedStudents.length + selectedStudents.length;
    if (totalAfterAssignment > batchDetails.batch.max_students) {
      alert(`Cannot assign students. This would exceed the batch capacity of ${batchDetails.batch.max_students} students.`);
      return;
    }

    setAssignLoading(true);
    try {
      await studentsAPI.bulkAssignBatch(selectedStudents, batchId);
      
      // Refresh data
      await fetchData();
      setSelectedStudents([]);
      
      if (onUpdate) {
        onUpdate();
      }
      
      alert(`Successfully assigned ${selectedStudents.length} student(s) to the batch`);
    } catch (error) {
      console.error('Error assigning students:', error);
      alert('Error assigning students to batch');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassignStudent = async (studentId) => {
    // Check minimum capacity
    if (assignedStudents.length <= batchDetails.batch.min_students) {
      alert(`Cannot unassign student. This would go below the minimum capacity of ${batchDetails.batch.min_students} students.`);
      return;
    }

    if (window.confirm('Are you sure you want to unassign this student from the batch?')) {
      try {
        await studentsAPI.unassignFromBatch(studentId, batchId);
        
        // Refresh data
        await fetchData();
        
        if (onUpdate) {
          onUpdate();
        }
        
        alert('Student unassigned successfully');
      } catch (error) {
        console.error('Error unassigning student:', error);
        alert('Error unassigning student from batch');
      }
    }
  };

  const filteredAvailableStudents = availableStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || student.class_name === filterClass;
    const matchesVersion = !filterVersion || student.version === filterVersion;
    
    return matchesSearch && matchesClass && matchesVersion;
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Batch Students</h2>
              <p className="text-gray-600 mt-1">
                {batchDetails?.batch.name} ({batchDetails?.batch.code})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Batch capacity info */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-semibold text-blue-700">Current Students</div>
              <div className="text-blue-600">{assignedStudents.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-semibold text-green-700">Available Spots</div>
              <div className="text-green-600">
                {batchDetails?.batch.max_students - assignedStudents.length}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-semibold text-gray-700">Capacity</div>
              <div className="text-gray-600">
                {batchDetails?.batch.min_students} - {batchDetails?.batch.max_students}
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Available Students Panel */}
          <div className="w-1/2 border-r">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Available Students</h3>
              
              {/* Search and Filters */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classOptions.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterVersion}
                    onChange={(e) => setFilterVersion(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Versions</option>
                    <option value="BV">BV</option>
                    <option value="EV">EV</option>
                  </select>
                </div>
              </div>

              {/* Selection Info */}
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {selectedStudents.length} selected
                </span>
                <button
                  onClick={handleAssignStudents}
                  disabled={selectedStudents.length === 0 || assignLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {assignLoading ? 'Assigning...' : `Assign (${selectedStudents.length})`}
                </button>
              </div>
            </div>

            <div className="overflow-y-auto h-full p-4">
              {filteredAvailableStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {searchTerm || filterClass || filterVersion 
                    ? 'No students match the current filters' 
                    : 'No available students'
                  }
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableStudents.map(student => {
                    const isSelected = selectedStudents.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleStudentToggle(student.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by parent onClick
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: {student.student_id} | {student.class_name} ({student.version})
                            </div>
                            <div className="text-xs text-gray-500">
                              Contact: {student.contact_number_1}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Students Panel */}
          <div className="w-1/2">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Assigned Students ({assignedStudents.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Students currently enrolled in this batch
              </p>
            </div>

            <div className="overflow-y-auto h-full p-4">
              {assignedStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No students assigned to this batch yet
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedStudents.map(student => (
                    <div
                      key={student.id}
                      className="p-3 border border-gray-200 rounded-lg bg-green-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {student.student_id} | {student.class_name} ({student.version})
                          </div>
                          <div className="text-xs text-gray-500">
                            Contact: {student.contact_number_1}
                          </div>
                          {student.roll_number && (
                            <div className="text-xs text-gray-500">
                              Roll: {student.roll_number}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleUnassignStudent(student.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          title="Unassign student"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Capacity: {assignedStudents.length}/{batchDetails?.batch.max_students} students
              <span className="ml-4">
                {assignedStudents.length < batchDetails?.batch.min_students && (
                  <span className="text-amber-600">
                    ⚠️ Below minimum capacity ({batchDetails?.batch.min_students})
                  </span>
                )}
                {assignedStudents.length >= batchDetails?.batch.max_students && (
                  <span className="text-red-600">
                    🚫 At maximum capacity
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchStudentAssignment;
