import React, { useState, useEffect } from 'react';
import { 
  Search,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  UserPlus,
  Eye,
  Receipt,
  Printer
} from 'lucide-react';
import AdmissionReceiptPrint from './AdmissionReceiptPrint';

const AdmissionFeeCollection = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    loadStudentsWithAdmissionDues();
  }, []);

  useEffect(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.class_name === classFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, classFilter]);

  const loadStudentsWithAdmissionDues = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the finance API
      // const response = await financeAPI.getStudentsWithAdmissionDues();
      // setStudents(response.data);

      // Mock data for students with admission fee dues
      const mockStudents = [
        {
          student_id: 1,
          full_name: 'Ahmed Hassan',
          student_reg_number: 'STU001',
          student_roll_number: 'R001',
          class_name: 'Class 10',
          batch_name: 'Morning Batch A',
          father_name: 'Mohammad Hassan',
          mother_name: 'Rashida Hassan',
          phone: '+880171234567',
          address: '123 Main Street, Dhaka',
          admission_date: '2024-12-01',
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
          }
        },
        {
          student_id: 2,
          full_name: 'Fatima Ahmed',
          student_reg_number: 'STU002',
          student_roll_number: 'R002',
          class_name: 'HSC 1st Year',
          batch_name: 'Evening Batch B',
          father_name: 'Ahmed Ali',
          mother_name: 'Nasreen Ahmed',
          phone: '+880181234567',
          address: '456 Park Road, Chittagong',
          admission_date: '2024-11-30',
          admission_fee: {
            id: 2,
            admission_fee_amount: 12000,
            registration_fee: 3000,
            security_deposit: 5000,
            total_amount: 20000,
            amount_paid: 0,
            balance_due: 20000,
            status: 'pending',
            due_date: '2024-12-20'
          }
        },
        {
          student_id: 3,
          full_name: 'Mohammad Rahman',
          student_reg_number: 'STU003',
          student_roll_number: 'R003',
          class_name: 'Class 9',
          batch_name: 'Morning Batch C',
          father_name: 'Abdul Rahman',
          mother_name: 'Salma Rahman',
          phone: '+880191234567',
          address: '789 New Market, Sylhet',
          admission_date: '2024-12-02',
          admission_fee: {
            id: 3,
            admission_fee_amount: 6000,
            registration_fee: 1500,
            security_deposit: 2500,
            total_amount: 10000,
            amount_paid: 3000,
            balance_due: 7000,
            status: 'partial',
            due_date: '2024-12-18'
          }
        }
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error('Failed to load students with admission dues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedStudent || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const admissionFee = selectedStudent.admission_fee;
    if (parseFloat(paymentAmount) > admissionFee.balance_due) {
      alert('Payment amount cannot exceed balance due');
      return;
    }

    try {
      // Mock payment processing
      const newAmountPaid = admissionFee.amount_paid + parseFloat(paymentAmount);
      const newBalanceDue = admissionFee.balance_due - parseFloat(paymentAmount);
      const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

      // Create receipt data
      const receiptData = {
        student: selectedStudent,
        payment: {
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          payment_date: new Date(),
          receipt_number: `ADM-${Date.now()}`,
          type: 'admission_fee'
        },
        admission_fee: {
          ...admissionFee,
          amount_paid: newAmountPaid,
          balance_due: newBalanceDue,
          status: newStatus
        }
      };

      // Update students list
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
      setReceiptData(receiptData);
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
    const status = student.admission_fee?.status;
    switch (status) {
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

  const classes = [...new Set(students.map(s => s.class_name))];

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Students</p>
              <p className="text-xl font-bold text-blue-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600 font-medium">Total Outstanding</p>
              <p className="text-xl font-bold text-red-900">
                ৳{students.reduce((sum, s) => sum + (s.admission_fee?.balance_due || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-xl font-bold text-green-900">
                {students.filter(s => s.admission_fee?.status === 'paid').length}
              </p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              {classes.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
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
                  Total Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                    <p className="mt-2 text-gray-500">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No students with admission fee dues found</p>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ৳{student.admission_fee?.total_amount.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      ৳{student.admission_fee?.amount_paid.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      ৳{student.admission_fee?.balance_due.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {student.admission_fee?.balance_due > 0 && (
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
                        )}
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            // Show student details
                          }}
                          className="text-blue-600 hover:text-blue-900"
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

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Collect Admission Fee</h3>
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

      {/* Admission Receipt Modal */}
      {showReceiptModal && receiptData && (
        <AdmissionReceiptPrint
          receiptData={receiptData}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};

export default AdmissionFeeCollection;