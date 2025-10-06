import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Download,
  Eye,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';

const PaymentSheet = () => {
  const { user, hasRole } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearReason, setClearReason] = useState('');
  const [editingPayment, setEditingPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [stats, setStats] = useState({
    totalDues: 0,
    monthlyFeeCollectable: 0,
    studentsWithDues: 0,
    overdueStudents: 0
  });

  useEffect(() => {
    loadPaymentSheet();
  }, [monthFilter, yearFilter, classFilter]);

  const loadPaymentSheet = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the finance API
      // const response = await financeAPI.getPaymentSheet({
      //   month: monthFilter,
      //   year: yearFilter,
      //   class_name: classFilter !== 'all' ? classFilter : null
      // });
      // setStudents(response.data);

      // Mock data for demonstration
      const mockStudents = [
        {
          student_id: 1,
          full_name: 'Ahmed Hassan',
          student_reg_number: 'STU001',
          class_name: 'Class 10',
          total_due: 8000,
          monthly_fee_due: 6000,
          months_paid: ['2024-09', '2024-10'],
          last_payment_date: '2024-10-15',
          months_pending: 2,
          needs_attention: true,
          recent_payments: [
            {
              id: 1,
              amount: 3000,
              payment_date: '2024-10-15',
              payment_method: 'cash',
              status: 'paid',
              fee_month: 10,
              fee_year: 2024
            },
            {
              id: 2,
              amount: 3000,
              payment_date: '2024-09-12',
              payment_method: 'cash',
              status: 'paid',
              fee_month: 9,
              fee_year: 2024
            }
          ]
        },
        {
          student_id: 2,
          full_name: 'Fatima Ahmed',
          student_reg_number: 'STU002',
          class_name: 'HSC 1st Year',
          total_due: 15000,
          monthly_fee_due: 12000,
          months_paid: ['2024-08'],
          last_payment_date: '2024-08-20',
          months_pending: 4,
          needs_attention: true,
          recent_payments: [
            {
              id: 3,
              amount: 4000,
              payment_date: '2024-08-20',
              payment_method: 'card',
              status: 'paid',
              fee_month: 8,
              fee_year: 2024
            }
          ]
        },
        {
          student_id: 3,
          full_name: 'Mohammad Rahman',
          student_reg_number: 'STU003',
          class_name: 'Class 9',
          total_due: 0,
          monthly_fee_due: 0,
          months_paid: ['2024-09', '2024-10', '2024-11'],
          last_payment_date: '2024-11-05',
          months_pending: 0,
          needs_attention: false,
          recent_payments: [
            {
              id: 4,
              amount: 2500,
              payment_date: '2024-11-05',
              payment_method: 'mobile_banking',
              status: 'paid',
              fee_month: 11,
              fee_year: 2024
            }
          ]
        }
      ];

      setStudents(mockStudents);
      
      // Calculate stats
      const totalDues = mockStudents.reduce((sum, s) => sum + s.total_due, 0);
      const monthlyFeeCollectable = mockStudents.reduce((sum, s) => sum + s.monthly_fee_due, 0);
      const studentsWithDues = mockStudents.filter(s => s.total_due > 0).length;
      const overdueStudents = mockStudents.filter(s => s.needs_attention).length;
      
      setStats({
        totalDues,
        monthlyFeeCollectable,
        studentsWithDues,
        overdueStudents
      });

    } catch (error) {
      console.error('Failed to load payment sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handleSavePaymentEdit = async (paymentData) => {
    try {
      // In a real implementation, this would call the finance API
      // await financeAPI.updatePayment(editingPayment.id, paymentData);
      
      // Update the payment in the student's recent_payments
      const updatedStudents = students.map(student => {
        if (student.student_id === editingPayment.student_id) {
          const updatedPayments = student.recent_payments.map(payment => 
            payment.id === editingPayment.id ? { ...payment, ...paymentData } : payment
          );
          return { ...student, recent_payments: updatedPayments };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      alert('Payment updated successfully!');
      setShowEditModal(false);
      setEditingPayment(null);
    } catch (error) {
      console.error('Failed to update payment:', error);
      alert('Failed to update payment');
    }
  };

  const handleDeletePayment = async (payment) => {
    setDeletingPayment(payment);
    setShowDeleteModal(true);
  };

  const confirmDeletePayment = async () => {
    if (!deletingPayment) return;

    try {
      // In a real implementation, this would call the finance API
      // await financeAPI.deletePayment(deletingPayment.id);
      
      // Remove payment from student's recent_payments
      const updatedStudents = students.map(student => {
        if (student.student_id === deletingPayment.student_id) {
          const updatedPayments = student.recent_payments.filter(payment => 
            payment.id !== deletingPayment.id
          );
          return { ...student, recent_payments: updatedPayments };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      alert('Payment deleted successfully!');
      setShowDeleteModal(false);
      setDeletingPayment(null);
    } catch (error) {
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment');
    }
  };

  const handleClearDue = async () => {
    if (!selectedStudent || !clearReason.trim()) {
      alert('Please provide a reason for clearing the due');
      return;
    }

    try {
      // In a real implementation, this would call the finance API
      // await financeAPI.clearDue(selectedPayment.id, clearReason);
      
      // Update student in local state
      const updatedStudents = students.map(student => {
        if (student.student_id === selectedStudent.student_id) {
          return {
            ...student,
            total_due: 0,
            monthly_fee_due: 0,
            needs_attention: false
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setShowClearModal(false);
      setSelectedStudent(null);
      setClearReason('');
      
      alert('Due cleared successfully!');
      
    } catch (error) {
      console.error('Failed to clear due:', error);
      alert('Failed to clear due');
    }
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      'cash': 'Cash',
      'card': 'Card',
      'bank_transfer': 'Bank Transfer',
      'mobile_banking': 'Mobile Banking',
      'online': 'Online'
    };
    return methods[method] || method;
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_reg_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === 'all' || student.class_name === classFilter;

    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(students.map(s => s.class_name))];

  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600 font-medium">Total Dues Outstanding</p>
              <p className="text-xl font-bold text-red-900">৳{stats.totalDues.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Monthly Fee to Collect</p>
              <p className="text-xl font-bold text-blue-900">৳{stats.monthlyFeeCollectable.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Students with Dues</p>
              <p className="text-xl font-bold text-orange-900">{stats.studentsWithDues}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-yellow-600 font-medium">Need Attention</p>
              <p className="text-xl font-bold text-yellow-900">{stats.overdueStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Name or reg number"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Payment Sheet Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Sheet - {getMonthName(monthFilter)} {yearFilter}
          </h3>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>

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
                  Total Dues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Months Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Payment
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
                    <p className="mt-2 text-gray-500">Loading payment sheet...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No students found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.student_id} className={`hover:bg-gray-50 ${student.needs_attention ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                        <div className="text-sm text-gray-500">{student.student_reg_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.class_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        student.total_due > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ৳{student.total_due.toLocaleString()}
                      </span>
                      {student.months_pending > 0 && (
                        <div className="text-xs text-red-500">
                          {student.months_pending} months pending
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.months_paid.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.months_paid.slice(-3).map((month, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {month}
                              </span>
                            ))}
                            {student.months_paid.length > 3 && (
                              <span className="text-xs text-gray-500">+{student.months_paid.length - 3} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.last_payment_date 
                        ? new Date(student.last_payment_date).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.total_due === 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Up to date
                        </span>
                      ) : student.needs_attention ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Needs attention
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            // Show detailed view
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Admin-only actions */}
                        {hasRole(['superadmin', 'admin', 'finance']) && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Manage Payments"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {student.total_due > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowClearModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Clear Due"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail View Modal */}
      {selectedStudent && !showEditModal && !showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment History - {selectedStudent.full_name}
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedStudent.full_name}</div>
                    <div><strong>Reg Number:</strong> {selectedStudent.student_reg_number}</div>
                    <div><strong>Class:</strong> {selectedStudent.class_name}</div>
                    <div><strong>Total Due:</strong> ৳{selectedStudent.total_due.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Months Paid:</strong> {selectedStudent.months_paid.length}</div>
                    <div><strong>Months Pending:</strong> {selectedStudent.months_pending}</div>
                    <div><strong>Last Payment:</strong> {selectedStudent.last_payment_date ? new Date(selectedStudent.last_payment_date).toLocaleDateString() : 'Never'}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 ${selectedStudent.needs_attention ? 'text-red-600' : selectedStudent.total_due > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {selectedStudent.needs_attention ? 'Needs Attention' : selectedStudent.total_due > 0 ? 'Pending' : 'Up to date'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-4">Recent Payments</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">For Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      {hasRole(['superadmin', 'admin', 'finance']) && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedStudent.recent_payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ৳{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getPaymentMethodDisplay(payment.payment_method)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.fee_month ? `${getMonthName(payment.fee_month)} ${payment.fee_year}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        {hasRole(['superadmin', 'admin', 'finance']) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditPayment({ ...payment, student_id: selectedStudent.student_id })}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Payment"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment({ ...payment, student_id: selectedStudent.student_id })}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Payment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Due Modal */}
      {showClearModal && selectedStudent && hasRole(['superadmin', 'admin']) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Clear Student Due
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                This action requires admin permission and will clear all dues for {selectedStudent.full_name}
              </p>
            </div>
            
            <div className="px-6 py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="text-sm">
                  <strong>Student:</strong> {selectedStudent.full_name}<br />
                  <strong>Total Due:</strong> ৳{selectedStudent.total_due.toLocaleString()}<br />
                  <strong>Monthly Fee Due:</strong> ৳{selectedStudent.monthly_fee_due.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for clearing due <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={clearReason}
                  onChange={(e) => setClearReason(e.target.value)}
                  placeholder="Please provide a detailed reason for clearing this due..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setSelectedStudent(null);
                  setClearReason('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearDue}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear Due
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Payment</h3>
              <p className="text-sm text-gray-600">Payment ID: {editingPayment.id}</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input
                  type="number"
                  value={editingPayment.amount}
                  onChange={(e) => setEditingPayment(prev => ({ 
                    ...prev, 
                    amount: parseFloat(e.target.value) || 0 
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={editingPayment.payment_method}
                  onChange={(e) => setEditingPayment(prev => ({ 
                    ...prev, 
                    payment_method: e.target.value 
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_banking">Mobile Banking</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={editingPayment.payment_date}
                  onChange={(e) => setEditingPayment(prev => ({ 
                    ...prev, 
                    payment_date: e.target.value 
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Month</label>
                  <select
                    value={editingPayment.fee_month || ''}
                    onChange={(e) => setEditingPayment(prev => ({ 
                      ...prev, 
                      fee_month: parseInt(e.target.value) || null 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Year</label>
                  <input
                    type="number"
                    value={editingPayment.fee_year || ''}
                    onChange={(e) => setEditingPayment(prev => ({ 
                      ...prev, 
                      fee_year: parseInt(e.target.value) || null 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingPayment.status}
                  onChange={(e) => setEditingPayment(prev => ({ 
                    ...prev, 
                    status: e.target.value 
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPayment(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSavePaymentEdit(editingPayment)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {showDeleteModal && deletingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete Payment</h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </p>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p><strong>Payment ID:</strong> {deletingPayment.id}</p>
                <p><strong>Amount:</strong> ৳{deletingPayment.amount.toLocaleString()}</p>
                <p><strong>Date:</strong> {new Date(deletingPayment.payment_date).toLocaleDateString()}</p>
                <p><strong>Method:</strong> {getPaymentMethodDisplay(deletingPayment.payment_method)}</p>
                {deletingPayment.fee_month && (
                  <p><strong>For Month:</strong> {getMonthName(deletingPayment.fee_month)} {deletingPayment.fee_year}</p>
                )}
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 text-sm">
                  <strong>Warning:</strong> Deleting this payment may affect the student's due calculation and payment history.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingPayment(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePayment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSheet;
