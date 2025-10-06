import React from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';

const AdmissionReceiptPrint = ({ receiptData, onClose }) => {
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

  if (!receiptData) return null;

  const { student, payment, admission_fee } = receiptData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with action buttons */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 print:hidden">
          <h3 className="text-lg font-semibold text-gray-900">Admission Fee Receipt</h3>
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
            <h2 className="text-2xl font-bold text-green-700 mb-2">ADMISSION FEE RECEIPT</h2>
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
                <div>
                  <span className="text-sm font-medium text-gray-600">Batch:</span>
                  <p className="font-semibold">{student.batch_name}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Father's Name:</span>
                  <p className="font-semibold">{student.father_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Mother's Name:</span>
                  <p className="font-semibold">{student.mother_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Phone:</span>
                  <p className="font-semibold">{student.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Admission Date:</span>
                  <p className="font-semibold">{formatDate(student.admission_date)}</p>
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
              <h3 className="text-lg font-semibold text-gray-900">Fee Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Admission Fee:</span>
                  <span className="font-semibold">৳{admission_fee.admission_fee_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Registration Fee:</span>
                  <span className="font-semibold">৳{admission_fee.registration_fee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-semibold">৳{admission_fee.security_deposit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 bg-gray-50 -mx-6 px-6">
                  <span className="font-bold text-lg">Total Admission Fee:</span>
                  <span className="font-bold text-lg">৳{admission_fee.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700">Previous Payment:</span>
                <span className="font-semibold text-blue-900">
                  ৳{(admission_fee.amount_paid - payment.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Current Payment:</span>
                <span className="font-semibold text-blue-900">৳{payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2">
                <span className="font-bold text-blue-900">Total Paid:</span>
                <span className="font-bold text-blue-900">৳{admission_fee.amount_paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Balance Due:</span>
                <span className="font-semibold text-red-600">৳{admission_fee.balance_due.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          {admission_fee.balance_due <= 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-900 mb-2">Admission Fee Payment Complete!</h3>
                <p className="text-green-800">
                  Congratulations! Your admission fee has been paid in full. 
                  You are now officially enrolled at Edudemy Institute.
                </p>
                <p className="text-green-700 mt-2 font-medium">
                  Welcome to our academic community!
                </p>
              </div>
            </div>
          )}

          {admission_fee.balance_due > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <div className="text-center">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Partial Payment Received</h3>
                <p className="text-orange-800">
                  Thank you for your payment. Please complete the remaining balance of{' '}
                  <span className="font-bold">৳{admission_fee.balance_due.toLocaleString()}</span>{' '}
                  to complete your admission process.
                </p>
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="text-xs text-gray-500 space-y-1 mb-6">
            <p><strong>Terms and Conditions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>This receipt is valid proof of payment and should be retained for records.</li>
              <li>Security deposit is refundable upon completion of course/leaving the institute.</li>
              <li>All fees are non-transferable and subject to institute policies.</li>
              <li>For any queries, please contact the finance department.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-300">
            <p className="text-sm text-gray-600 mb-2">
              Thank you for choosing Edudemy Institute for your educational journey!
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
                <p className="text-sm text-gray-700">Student Signature</p>
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

export default AdmissionReceiptPrint;