import React, { useState } from 'react';
import { X, Users, CheckCircle, AlertTriangle } from 'lucide-react';

const BatchAssignmentModal = ({ students, availableBatches, onAssign, onClose, loading = false }) => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch) {
      alert('Please select a batch to assign students to.');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmAssignment = () => {
    onAssign(parseInt(selectedBatch));
    setShowConfirmation(false);
  };

  const selectedBatchInfo = availableBatches.find(batch => batch.id === parseInt(selectedBatch));

  // Group students by class to show compatibility
  const studentsByClass = students.reduce((acc, student) => {
    const className = student.class_name || 'Unknown';
    if (!acc[className]) acc[className] = [];
    acc[className].push(student);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Assign Students to Batch
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {!showConfirmation ? (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Selected Students */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Selected Students ({students.length})
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                {Object.entries(studentsByClass).map(([className, classStudents]) => (
                  <div key={className} className="mb-4 last:mb-0">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {className} ({classStudents.length} students)
                    </div>
                    <div className="space-y-1">
                      {classStudents.map(student => (
                        <div key={student.id} className="flex items-center text-sm text-gray-600">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium mr-2">
                            {student.full_name?.charAt(0) || 'S'}
                          </div>
                          <span>{student.full_name || 'Unknown'}</span>
                          <span className="text-gray-400 ml-2">
                            ({student.student_reg_number || 'No ID'})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Batch Selection */}
            <div className="mb-6">
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-2">
                Select Target Batch
              </label>
              <select
                id="batch"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a batch...</option>
                {availableBatches.map(batch => {
                  const isCompatible = Object.keys(studentsByClass).every(className => 
                    className === batch.class_name || className === 'Unknown'
                  );
                  
                  return (
                    <option 
                      key={batch.id} 
                      value={batch.id}
                      disabled={!isCompatible}
                    >
                      {batch.name} ({batch.class_name}) - 
                      {batch.current_students}/{batch.max_students || '∞'} students
                      {!isCompatible && ' - Incompatible Class'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Batch Info */}
            {selectedBatchInfo && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">
                  Target Batch Information
                </h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>Name: {selectedBatchInfo.name}</div>
                  <div>Class: {selectedBatchInfo.class_name}</div>
                  <div>Version: {selectedBatchInfo.version || 'Standard'}</div>
                  <div>
                    Current Capacity: {selectedBatchInfo.current_students}/{selectedBatchInfo.max_students || '∞'}
                    {selectedBatchInfo.available_spots !== null && (
                      <span className="ml-2 text-blue-600">
                        ({selectedBatchInfo.available_spots} spots available)
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Compatibility warnings */}
                {Object.keys(studentsByClass).some(className => 
                  className !== selectedBatchInfo.class_name && className !== 'Unknown'
                ) && (
                  <div className="mt-3 flex items-start gap-2 text-amber-700 text-sm">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Class Mismatch Warning:</strong> Some students are from different classes
                      than the target batch. This assignment may not be appropriate.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedBatch}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign to Batch
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            {/* Confirmation */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Batch Assignment
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                You are about to assign <strong>{students.length} student(s)</strong> to{' '}
                <strong>{selectedBatchInfo?.name}</strong> ({selectedBatchInfo?.class_name}).
              </p>
              
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">Assigning students...</span>
                </div>
              ) : (
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={confirmAssignment}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Confirm Assignment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchAssignmentModal;