"use client";
import { Printer, X, Download, Share2 } from "lucide-react";

interface ReceiptProps {
  saleData: {
    id: string;
    clientName?: string; // Standard camelCase
    client_name?: string; // Database style underscore
    service: string;
    amount: string | number;
    date: string;
    staff: string;
    paymentMethod: string;
  };
  onClose: () => void;
}

export default function ReceiptModal({ saleData, onClose }: ReceiptProps) {
  const handlePrint = () => {
    window.print(); // Triggers the browser print dialog
  };

  // Logic to ensure we get the client name regardless of variable naming style
  const displayName = saleData.clientName || saleData.client_name || "Valued Client";
  const displayAmount = Number(saleData.amount) || 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center print:hidden">
          <h3 className="font-bold text-slate-800">Success! Receipt Ready</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* --- PRINTABLE AREA START --- */}
        <div id="receipt-content" className="p-8 font-mono text-sm text-slate-800 print:p-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black tracking-tighter text-blue-600 uppercase">OPOLO CBT RESORT</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Education Consulting Firm</p>
            <p className="text-[10px] text-slate-400 font-sans">Lagos, Nigeria | +234 000 000 0000</p>
          </div>

          <div className="border-y border-dashed border-slate-200 py-4 my-4 space-y-2">
            <div className="flex justify-between">
              <span>Receipt No:</span>
              <span className="font-bold">#OCT-{saleData.id?.slice(0, 8).toUpperCase() || 'TEMP'}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Staff:</span>
              <span>{saleData.staff || 'Admin'}</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-start">
              <div className="max-w-[200px]">
                <p className="font-bold uppercase">{saleData.service}</p>
                <p className="text-[11px] text-blue-600 font-black mt-1 uppercase italic">
                  Client: {displayName}
                </p>
              </div>
              <span className="font-bold">₦{displayAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center">
            <span className="font-black text-lg">TOTAL PAID</span>
            <span className="font-black text-xl text-blue-600">₦{displayAmount.toLocaleString()}</span>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
            Payment Method: {saleData.paymentMethod || 'Cash'} <br />
            Thank you for choosing Opolo CBT! <br />
            *** No Refund After Service ***
          </div>
        </div>
        {/* --- PRINTABLE AREA END --- */}

        {/* Modal Footer (Hidden on Print) */}
        <div className="p-6 bg-slate-50 flex gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <Printer size={18} /> Print Receipt
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition">
            Close
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content { 
            position: absoluteg; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}