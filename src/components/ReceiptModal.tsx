"use client";

interface ReceiptModalProps {
  saleData: {
    clientName: string;
    service: string;
    amount: string;
    paymentMethod: string;
    staff: string;
    id: string;
  };
  onClose: () => void;
}

export default function ReceiptModal({ saleData, onClose }: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Sale Receipt</h2>
        <div className="space-y-2 border-t pt-4">
          <p><strong>Client:</strong> {saleData.clientName}</p>
          <p><strong>Service:</strong> {saleData.service}</p>
          <p><strong>Amount:</strong> {saleData.amount}</p>
          <p><strong>Staff:</strong> {saleData.staff}</p>
        </div>
        <button 
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}