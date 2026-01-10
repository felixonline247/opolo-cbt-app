"use client";

interface ReceiptModalProps {
  saleData: {
    clientName: string;
    amount: string;
    service?: string;       // Made optional with ?
    paymentMethod?: string; // Made optional with ?
    staff?: string;         // Made optional with ?
    id?: string;            // Made optional with ?
  };
  onClose: () => void;
}

export default function ReceiptModal({ saleData, onClose }: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Sale Successful</h2>
          <p className="text-slate-500 text-sm">Transaction Receipt</p>
        </div>

        <div className="space-y-4 border-t border-b border-dashed border-slate-200 py-6 my-6">
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm font-medium">Client</span>
            <span className="text-slate-900 font-bold">{saleData.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm font-medium">Amount Paid</span>
            <span className="text-blue-600 font-black">₦{Number(saleData.amount).toLocaleString()}</span>
          </div>
          {saleData.service && (
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm font-medium">Service</span>
              <span className="text-slate-900 font-bold">{saleData.service}</span>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
        >
          Close & Return
        </button>
      </div>
    </div>
  );
}