import React from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';

const MonthlyFeeReceiptPrint = ({ receiptData, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-BD', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMonth = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (!receiptData) return null;

  const { student, payment, fee_details } = receiptData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with action buttons */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 print:hidden">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Fee Receipt</h3>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button
              onClick={onClose}
              className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </button>
          </div>
        </div>

        {/* Receipt content */}
        <div className="p-8 print:p-6">
          {/* Institution Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edudemy Institute</h1>
            <p className="text-gray-600">Excellence in Education</p>
            <p className="text-sm text-gray-500 mt-2">
              Phone: +880-123-456789 | Email: info@edudemy.edu.bd
            </p>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">MONTHLY FEE RECEIPT</h2>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <CheckCircle className="w-5 h-5 mr-2" />
              Payment Successful
            </div>
          </div>

          {/* Receipt Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Receipt Number:</span>
                <p className="font-mono text-lg font-bold text-blue-600">{payment.receipt_number}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Payment Date:</span>
                <p className="font-semibold">{formatDate(payment.payment_date)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Payment Time:</span>
                <p className="font-semibold">{formatTime(payment.payment_date)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Fee Period:</span>
                <p className="font-semibold text-lg text-blue-700">{formatMonth(fee_details.month)}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                <p className="font-semibold capitalize">{payment.payment_method.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Amount Paid:</span>
                <p className="text-2xl font-bold text-green-600">৳{payment.amount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </span>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Full Name:</span>
                  <p className="font-semibold text-lg">{student.full_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Registration Number:</span>
                  <p className="font-mono font-semibold">{student.student_reg_number}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Roll Number:</span>
                  <p className="font-mono font-semibold">{student.student_roll_number}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Class:</span>
                  <p className="font-semibold">{student.class_name}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Batch:</span>
                  <p className="font-semibold">{student.batch_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Father's Name:</span>
                  <p className="font-semibold">{student.father_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Phone:</span>
                  <p className="font-semibold">{student.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Address:</span>
                  <p className="font-semibold">{student.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="border border-gray-300 rounded-lg mb-8">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900">Fee Breakdown - {formatMonth(fee_details.month)}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Monthly Tuition Fee:</span>
                  <span className="font-semibold">৳{fee_details.monthly_fee?.toLocaleString()}</span>
                </div>
                {fee_details.transport_fee && fee_details.transport_fee > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Transport Fee:</span>
                    <span className="font-semibold">৳{fee_details.transport_fee.toLocaleString()}</span>
                  </div>
                )}
                {fee_details.meal_fee && fee_details.meal_fee > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Meal Fee:</span>
                    <span className="font-semibold">৳{fee_details.meal_fee.toLocaleString()}</span>
                  </div>
                )}
                {fee_details.library_fee && fee_details.library_fee > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Library Fee:</span>
                    <span className="font-semibold">৳{fee_details.library_fee.toLocaleString()}</span>
                  </div>
                )}
                {fee_details.lab_fee && fee_details.lab_fee > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Laboratory Fee:</span>
                    <span className="font-semibold">৳{fee_details.lab_fee.toLocaleString()}</span>
                  </div>
                )}
                {fee_details.exam_fee && fee_details.exam_fee > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Examination Fee:</span>
                    <span className="font-semibold">৳{fee_details.exam_fee.toLocaleString()}</span>
                  </div>
                )}
                {fee_details.late_fee && fee_details.late_fee > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-red-600">Late Fee:</span>
                    <span className="font-semibold text-red-600">৳{fee_details.late_fee.toLocaleString()}</span>
                  </div>
                )}
                {fee_details.discount && fee_details.discount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-green-600">Discount Applied:</span>
                    <span className="font-semibold text-green-600">-৳{fee_details.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 bg-gray-50 -mx-6 px-6">
                  <span className="font-bold text-lg">Total Amount:</span>
                  <span className="font-bold text-lg">৳{fee_details.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700">Fee Amount:</span>
                <span className="font-semibold text-blue-900">৳{fee_details.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Amount Paid:</span>
                <span className="font-semibold text-blue-900">৳{payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2">
                <span className="font-bold text-blue-900">Payment Status:</span>
                <span className="font-bold text-green-600">Fully Paid</span>
              </div>
              {fee_details.due_date && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Due Date:</span>
                  <span className="font-semibold text-blue-900">{formatDate(fee_details.due_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-green-900 mb-2">Payment Successful!</h3>
              <p className="text-green-800">
                Thank you for your payment. The monthly fee for {formatMonth(fee_details.month)} has been 
                successfully received and processed.
              </p>
              <p className="text-green-700 mt-2 font-medium">
                Your account is now up to date.
              </p>
            </div>
          </div>

          {/* Important Notes */}
          {fee_details.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
              <p className="text-yellow-800 text-sm">{fee_details.notes}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="text-xs text-gray-500 space-y-1 mb-6">
            <p><strong>Terms and Conditions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>This receipt is valid proof of payment and should be retained for records.</li>
              <li>Monthly fees are to be paid by the 10th of each month to avoid late fees.</li>
              <li>All fees are non-transferable and subject to institute policies.</li>
              <li>In case of any discrepancy, please contact the finance department immediately.</li>
              <li>Refund requests must be submitted within 7 days of payment with proper documentation.</li>
            </ul>
          </div>

          {/* Next Payment Due */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Next Payment Due:</h4>
            <p className="text-gray-700">
              Your next monthly fee payment will be due on the 10th of next month. 
              Please ensure timely payment to avoid late fees.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-300">
            <p className="text-sm text-gray-600 mb-2">
              Thank you for being part of the Edudemy Institute community!
            </p>
            <p className="text-xs text-gray-500">
              Generated on {formatDate(new Date())} at {formatTime(new Date())}
            </p>
          </div>

          {/* Print-only signature section */}
          <div className="hidden print:block mt-16">
            <div className="flex justify-between items-end">
              <div className="text-center">
                <div className="border-t border-gray-400 w-32 mb-2"></div>
                <p className="text-sm text-gray-700">Student/Guardian Signature</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-32 mb-2"></div>
                <p className="text-sm text-gray-700">Cashier Signature</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-32 mb-2"></div>
                <p className="text-sm text-gray-700">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyFeeReceiptPrint;