import React from 'react';
import { X, Printer, Download } from 'lucide-react';

const PrintableReceipt = ({ receiptData, onClose }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React functionality
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      'cash': 'Cash',
      'card': 'Card Payment',
      'bank_transfer': 'Bank Transfer',
      'mobile_banking': 'Mobile Banking',
      'online': 'Online Payment'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
          <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="p-6">
          {/* Institution Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">EduDemy Learning Institute</h1>
            <p className="text-sm text-gray-600 mt-1">Excellence in Education</p>
            <p className="text-xs text-gray-500">
              Address: 123 Education Street, Dhaka, Bangladesh | Phone: +880-1234-567890
            </p>
          </div>

          {/* Receipt Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">PAYMENT RECEIPT</h2>
              <div className="space-y-1 text-sm">
                <div><strong>Receipt No:</strong> {receiptData.receipt_number}</div>
                <div><strong>Date:</strong> {formatDate(receiptData.payment_date)}</div>
                <div><strong>Time:</strong> {formatTime(receiptData.payment_date)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-green-100 border border-green-300 rounded px-3 py-1 inline-block">
                <span className="text-green-800 font-semibold text-sm">PAID</span>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="mb-2">
                  <strong>Student Name:</strong><br />
                  {receiptData.student_name}
                </div>
                <div className="mb-2">
                  <strong>Registration No:</strong><br />
                  {receiptData.student_reg_number}
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <strong>Class:</strong><br />
                  {receiptData.class_name}
                </div>
                <div className="mb-2">
                  <strong>Student ID:</strong><br />
                  {receiptData.student_id}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="text-md font-semibold text-gray-900">Payment Details</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span><strong>Payment For:</strong></span>
                  <span>
                    {receiptData.fee_month && receiptData.fee_year ? 
                      `Monthly Fee - ${getMonthName(receiptData.fee_month)} ${receiptData.fee_year}` :
                      'Fee Payment'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Payment Method:</strong></span>
                  <span>{getPaymentMethodDisplay(receiptData.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Payment Date:</strong></span>
                  <span>{formatDate(receiptData.payment_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Payment Time:</strong></span>
                  <span>{formatTime(receiptData.payment_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Details */}
          <div className="border-2 border-gray-800 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-800 text-white px-4 py-2">
              <h3 className="text-md font-semibold">Amount Details</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Amount Received:</span>
                  <span className="font-semibold">৳{receiptData.amount.toLocaleString()}</span>
                </div>
                {receiptData.previous_due > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>Previous Due:</span>
                    <span className="text-red-600">৳{receiptData.previous_due.toLocaleString()}</span>
                  </div>
                )}
                {receiptData.current_due > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>Remaining Due:</span>
                    <span className="text-orange-600">৳{receiptData.current_due.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-800">
                  <span>Total Paid:</span>
                  <span className="text-green-600">৳{receiptData.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <strong>Amount in Words:</strong><br />
              <span className="capitalize">
                {/* In a real implementation, you would use a number-to-words library */}
                {receiptData.amount === 1000 ? 'One Thousand' :
                 receiptData.amount === 2000 ? 'Two Thousand' :
                 receiptData.amount === 3000 ? 'Three Thousand' :
                 receiptData.amount === 5000 ? 'Five Thousand' :
                 `${receiptData.amount}`} Taka Only
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-800 pt-4 mt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-sm text-gray-600 mb-8">
                  <strong>Received by:</strong>
                </div>
                <div className="border-b border-gray-400 pb-1 mb-1">
                  <span className="text-sm text-gray-600">Signature & Stamp</span>
                </div>
                <div className="text-xs text-gray-500">Finance Department</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-8">
                  <strong>Student/Parent Signature:</strong>
                </div>
                <div className="border-b border-gray-400 pb-1 mb-1">
                  <span className="text-sm text-gray-600">Signature</span>
                </div>
                <div className="text-xs text-gray-500">Date: {formatDate(receiptData.payment_date)}</div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6 text-xs text-gray-500 border-t border-gray-200 pt-3">
              <strong>Terms & Conditions:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>This receipt is valid only with official stamp and signature.</li>
                <li>Keep this receipt safe for future reference.</li>
                <li>No refund will be made without this original receipt.</li>
                <li>Payment confirmation is subject to realization of cheques/drafts.</li>
              </ul>
            </div>

            {/* System Info */}
            <div className="mt-4 text-center text-xs text-gray-400 border-t border-gray-200 pt-2">
              Generated by EduDemy Finance System on {formatDate(new Date())} at {formatTime(new Date())}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            font-size: 12px;
            line-height: 1.4;
          }
          
          #receipt-content {
            padding: 0;
            box-shadow: none;
            border: none;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableReceipt;