import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Eye, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Calendar,
  DollarSign,
  Receipt,
  Users,
  Filter
} from 'lucide-react';
import PrintableReceipt from './PrintableReceipt';

const AdmissionProcessing = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [admissionFeeAmount, setAdmissionFeeAmount] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptData, setReceiptData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, new, pending, completed

  useEffect(() => {
    loadPendingAdmissions();
  }, []);

  const loadPendingAdmissions = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the finance API
      // const response = await financeAPI.getPendingAdmissions();
      // setStudents(response.data);

      // Mock data for demonstration
      const mockStudents = [
        {
          student_id: 1,
          full_name: 'Ahmed Hassan',
          student_reg_number: 'STU003',
          class_name: 'Class 11',
          admission_date: '2024-12-01',
          admission_fee: null,
          is_new: true
        },
        {
          student_id: 2,
          full_name: 'Fatima Ahmed',
          student_reg_number: 'STU004',
          class_name: 'HSC 1st Year',
          admission_date: '2024-11-30',
          admission_fee: {
            id: 1,
            admission_fee_amount: 8000,
            registration_fee: 2000,
            security_deposit: 3000,
            total_amount: 13000,
            amount_paid: 5000,
            balance_due: 8000,
            status: 'partial',
            due_date: '2024-12-15'
          },
          is_new: false
        },
        {
          student_id: 3,
          full_name: 'Mohammad Rahman',
          student_reg_number: 'STU005',
          class_name: 'Class 9',
          admission_date: '2024-12-02',
          admission_fee: null,
          is_new: true
        }
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error('Failed to load pending admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmissionFee = async () => {
    if (!selectedStudent || !admissionFeeAmount) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const totalAmount = 
        parseFloat(admissionFeeAmount || 0) + 
        parseFloat(registrationFee || 0) + 
        parseFloat(securityDeposit || 0);

      // In a real implementation, this would call the finance API
      // const response = await financeAPI.createAdmissionFee({
      //   student_id: selectedStudent.student_id,
      //   admission_fee_amount: parseFloat(admissionFeeAmount),
      //   registration_fee: parseFloat(registrationFee || 0),
      //   security_deposit: parseFloat(securityDeposit || 0),
      //   total_amount: totalAmount
      // });

      // Mock admission fee creation
      const mockAdmissionFee = {
        id: Date.now(),
        admission_fee_amount: parseFloat(admissionFeeAmount),
        registration_fee: parseFloat(registrationFee || 0),
        security_deposit: parseFloat(securityDeposit || 0),
        total_amount: totalAmount,
        amount_paid: 0,
        balance_due: totalAmount,
        status: 'pending',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      };

      // Update student with admission fee
      const updatedStudents = students.map(student => {
        if (student.student_id === selectedStudent.student_id) {
          return {
            ...student,
            admission_fee: mockAdmissionFee,
            is_new: false
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setShowAdmissionModal(false);
      setSelectedStudent(null);
      
      // Reset form
      setAdmissionFeeAmount('');
      setRegistrationFee('');
      setSecurityDeposit('');

      alert('Admission fee structure created successfully!');

    } catch (error) {
      console.error('Failed to create admission fee:', error);
      alert('Failed to create admission fee');
    }
  };

  const handlePayment = async () => {
    if (!selectedStudent || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const admissionFee = selectedStudent.admission_fee;
    if (!admissionFee) {
      alert('No admission fee record found');
      return;
    }

    if (parseFloat(paymentAmount) > admissionFee.balance_due) {
      alert('Payment amount cannot exceed balance due');
      return;
    }

    try {
      // In a real implementation, this would call the finance API
      // const response = await financeAPI.payAdmissionFee(admissionFee.id, {
      //   amount: parseFloat(paymentAmount),
      //   payment_method: paymentMethod
      // });

      // Mock payment processing
      const mockPayment = {
        id: Date.now(),
        student_id: selectedStudent.student_id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        payment_date: new Date(),
        receipt_number: `ADM-${Date.now()}`,
        student_name: selectedStudent.full_name,
        class_name: selectedStudent.class_name,
        student_reg_number: selectedStudent.student_reg_number,
        payment_type: 'admission_fee'
      };

      // Update admission fee status
      const newAmountPaid = admissionFee.amount_paid + parseFloat(paymentAmount);
      const newBalanceDue = admissionFee.balance_due - parseFloat(paymentAmount);
      const newStatus = newBalanceDue <= 0 ? 'paid' : newAmountPaid > 0 ? 'partial' : 'pending';

      const updatedStudents = students.map(student => {
        if (student.student_id === selectedStudent.student_id) {
          return {
            ...student,
            admission_fee: {
              ...admissionFee,
              amount_paid: newAmountPaid,
              balance_due: newBalanceDue,
              status: newStatus,
              completion_date: newBalanceDue <= 0 ? new Date() : null
            }
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setReceiptData(mockPayment);
      setShowPaymentModal(false);
      setShowReceiptModal(true);
      
      // Reset form
      setPaymentAmount('');
      setSelectedStudent(null);

    } catch (error) {
      console.error('Payment processing failed:', error);
      alert('Failed to process payment');
    }
  };

  const getStatusBadge = (student) => {
    if (student.is_new) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <UserPlus className="w-3 h-3 mr-1" />
          New
        </span>
      );
    }

    if (!student.admission_fee) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending Setup
        </span>
      );
    }

    switch (student.admission_fee.status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Partial
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'new' && student.is_new) ||
      (filterStatus === 'pending' && !student.is_new && (!student.admission_fee || student.admission_fee.status === 'pending')) ||
      (filterStatus === 'completed' && student.admission_fee?.status === 'paid');

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: students.length,
    new: students.filter(s => s.is_new).length,
    pending: students.filter(s => !s.is_new && (!s.admission_fee || s.admission_fee.status !== 'paid')).length,
    completed: students.filter(s => s.admission_fee?.status === 'paid').length
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Students</p>
              <p className="text-xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <UserPlus className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600 font-medium">New Students</p>
              <p className="text-xl font-bold text-green-900">{stats.new}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Pending</p>
              <p className="text-xl font-bold text-orange-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-xl font-bold text-green-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Name, reg number, or class"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Students</option>
              <option value="new">New Students</option>
              <option value="pending">Pending Admission</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                    <p className="mt-2 text-gray-500">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No students found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                        <div className="text-sm text-gray-500">{student.student_reg_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.class_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.admission_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.admission_fee ? (
                        <div>
                          <div className="font-medium">৳{student.admission_fee.total_amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            Paid: ৳{student.admission_fee.amount_paid.toLocaleString()} | 
                            Due: ৳{student.admission_fee.balance_due.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {student.is_new ? (
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowAdmissionModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Set Admission Fee"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        ) : student.admission_fee && student.admission_fee.balance_due > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setPaymentAmount('');
                              setShowPaymentModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Collect Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        ) : null}
                        
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            // Show student details
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Fee Setup Modal */}
      {showAdmissionModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Set Admission Fee</h3>
              <p className="text-sm text-gray-600">Student: {selectedStudent.full_name}</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Fee (৳) *</label>
                <input
                  type="number"
                  value={admissionFeeAmount}
                  onChange={(e) => setAdmissionFeeAmount(e.target.value)}
                  placeholder="Enter admission fee"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Fee (৳)</label>
                <input
                  type="number"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                  placeholder="Enter registration fee (optional)"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (৳)</label>
                <input
                  type="number"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  placeholder="Enter security deposit (optional)"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="text-sm">
                  <strong>Total Amount: ৳{(
                    parseFloat(admissionFeeAmount || 0) + 
                    parseFloat(registrationFee || 0) + 
                    parseFloat(securityDeposit || 0)
                  ).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAdmissionModal(false);
                  setSelectedStudent(null);
                  setAdmissionFeeAmount('');
                  setRegistrationFee('');
                  setSecurityDeposit('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmissionFee}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Admission Fee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Collect Admission Payment</h3>
              <p className="text-sm text-gray-600">Student: {selectedStudent.full_name}</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="bg-gray-50 rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>৳{selectedStudent.admission_fee?.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Already Paid:</span>
                  <span>৳{selectedStudent.admission_fee?.amount_paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Balance Due:</span>
                  <span>৳{selectedStudent.admission_fee?.balance_due.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (৳)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  max={selectedStudent.admission_fee?.balance_due}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_banking">Mobile Banking</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedStudent(null);
                  setPaymentAmount('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptData && (
        <PrintableReceipt
          receiptData={receiptData}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};

export default AdmissionProcessing;