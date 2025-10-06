import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  CreditCard, 
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Printer,
  Download
} from 'lucide-react';
import MonthlyFeeReceiptPrint from './MonthlyFeeReceiptPrint';

const FeeCollection = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('all'); // all, with_dues, without_dues
  const [classFilter, setClassFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [feeMonth, setFeeMonth] = useState(new Date().getMonth() + 1);
  const [feeYear, setFeeYear] = useState(new Date().getFullYear());
  const [receiptData, setReceiptData] = useState(null);

  // Load students data
  useEffect(() => {
    loadStudents();
  }, []);

  // Filter and search students
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

    // Apply dues filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(student => {
        if (filterBy === 'with_dues') return student.total_due > 0;
        if (filterBy === 'without_dues') return student.total_due === 0;
        return true;
      });
    }

    // Apply class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.class_name === classFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'class':
          aValue = a.class_name.toLowerCase();
          bValue = b.class_name.toLowerCase();
          break;
        case 'dues':
          aValue = a.total_due;
          bValue = b.total_due;
          break;
        case 'last_payment':
          aValue = a.last_payment_date ? new Date(a.last_payment_date) : new Date(0);
          bValue = b.last_payment_date ? new Date(b.last_payment_date) : new Date(0);
          break;
        default:
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, sortBy, sortOrder, filterBy, classFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the finance API
      // const response = await financeAPI.getStudentsWithDues();
      // setStudents(response.data);

      // Mock data for now
      const mockStudents = [
        {
          student_id: 1,
          full_name: 'Ahmed Hassan',
          student_reg_number: 'STU001',
          student_roll_number: 'R001',
          class_name: 'Class 10',
          batch_name: 'Morning Batch A',
          batch_id: 1,
          father_name: 'Mohammad Hassan',
          mother_name: 'Rashida Hassan',
          phone: '+880171234567',
          address: '123 Main Street, Dhaka',
          total_due: 5000,
          monthly_fee: 3000,
          monthly_fee_due: 3000,
          admission_fee_due: 2000,
          last_payment_date: '2024-11-15',
          months_pending: 1,
          has_overdue: false,
          needs_attention: false
        },
        {
          student_id: 2,
          full_name: 'Fatima Ahmed',
          student_reg_number: 'STU002',
          student_roll_number: 'R002',
          class_name: 'HSC 1st Year',
          batch_name: 'Evening Batch B',
          batch_id: 2,
          father_name: 'Ahmed Ali',
          mother_name: 'Nasreen Ahmed',
          phone: '+880181234567',
          address: '456 Park Road, Chittagong',
          total_due: 4500,
          monthly_fee: 4500,
          monthly_fee_due: 4500,
          admission_fee_due: 0,
          last_payment_date: '2024-10-10',
          months_pending: 2,
          has_overdue: true,
          needs_attention: true
        },
        {
          student_id: 3,
          full_name: 'Mohammad Rahman',
          student_reg_number: 'STU003',
          student_roll_number: 'R003',
          class_name: 'Class 9',
          batch_name: 'Morning Batch C',
          batch_id: 3,
          father_name: 'Abdul Rahman',
          mother_name: 'Salma Rahman',
          phone: '+880191234567',
          address: '789 New Market, Sylhet',
          total_due: 2500,
          monthly_fee: 2500,
          monthly_fee_due: 2500,
          admission_fee_due: 0,
          last_payment_date: '2024-12-05',
          months_pending: 1,
          has_overdue: false,
          needs_attention: false
        }
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedStudent || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      // In a real implementation, this would call the finance API
      // const response = await financeAPI.createPayment({
      //   student_id: selectedStudent.student_id,
      //   amount: parseFloat(paymentAmount),
      //   payment_method: paymentMethod,
      //   fee_month: feeMonth,
      //   fee_year: feeYear,
      //   payment_type: 'monthly_fee'
      // });

      // Create receipt data for MonthlyFeeReceiptPrint
      const receiptData = {
        student: selectedStudent,
        payment: {
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          payment_date: new Date(),
          receipt_number: `FEE-${Date.now()}`
        },
        fee_details: {
          month: `${feeYear}-${String(feeMonth).padStart(2, '0')}-01`,
          monthly_fee: selectedStudent.monthly_fee,
          total_amount: parseFloat(paymentAmount),
          due_date: new Date(feeYear, feeMonth, 10) // 10th of the month
        }
      };

      // Update student dues
      const updatedStudents = students.map(student => {
        if (student.student_id === selectedStudent.student_id) {
          return {
            ...student,
            total_due: Math.max(0, student.total_due - parseFloat(paymentAmount)),
            monthly_fee_due: Math.max(0, student.monthly_fee_due - parseFloat(paymentAmount)),
            last_payment_date: new Date().toISOString()
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

  const handlePrintReceipt = () => {
    window.print();
  };

  const getStatusIcon = (student) => {
    if (student.has_overdue) {
      return <AlertCircle className="w-5 h-5 text-red-500" title="Overdue" />;
    }
    if (student.total_due > 0) {
      return <Clock className="w-5 h-5 text-orange-500" title="Pending" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" title="Up to date" />;
  };

  const classes = [...new Set(students.map(s => s.class_name))];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
              <p className="text-sm text-red-600 font-medium">With Dues</p>
              <p className="text-xl font-bold text-red-900">
                {students.filter(s => s.total_due > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Total Dues</p>
              <p className="text-xl font-bold text-orange-900">
                ৳{students.reduce((sum, s) => sum + s.total_due, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Dues</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Students</option>
              <option value="with_dues">With Dues</option>
              <option value="without_dues">No Dues</option>
            </select>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="class">Class</option>
                <option value="dues">Dues Amount</option>
                <option value="last_payment">Last Payment</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
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
                  Status
                </th>
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
                  Monthly Fee Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Payment
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
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No students found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(student)}
                    </td>
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ৳{student.monthly_fee_due.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.last_payment_date 
                        ? new Date(student.last_payment_date).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
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
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            // Show student details or payment history
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
              <h3 className="text-lg font-semibold text-gray-900">Collect Payment</h3>
              <p className="text-sm text-gray-600">Student: {selectedStudent.full_name}</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total dues: ৳{selectedStudent.total_due.toLocaleString()}
                </p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Month</label>
                  <select
                    value={feeMonth}
                    onChange={(e) => setFeeMonth(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Year</label>
                  <input
                    type="number"
                    value={feeYear}
                    onChange={(e) => setFeeYear(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedStudent(null);
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

      {/* Monthly Fee Receipt Modal */}
      {showReceiptModal && receiptData && (
        <MonthlyFeeReceiptPrint
          receiptData={receiptData}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};

export default FeeCollection;