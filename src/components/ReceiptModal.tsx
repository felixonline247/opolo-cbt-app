"use client";

interface ReceiptModalProps {
  saleData: {
    clientName: string;
    amount: string;
    institutionCost?: string; // 👈 FIX: Added this to the interface
    service?: string;
    paymentMethod?: string;
    staff?: string;
    id?: string;
  };
  onClose: () => void;
}

export default function ReceiptModal({ saleData, onClose }: ReceiptModalProps) {
  
  // Helper to handle printing the receipt
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Note: "print:hidden" classes ensure UI elements don't show on paper, 
          while "print:block" elements only appear when printing.
      */}
      <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl relative animate-in zoom-in duration-200">
        
        <div className="text-center mb-6 print:block">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 print:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 italic uppercase">Opolo CBT Resort</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Official Payment Receipt</p>
        </div>

        <div className="space-y-4 border-t border-b border-dashed border-slate-200 py-6 my-6">
          <div className="flex justify-between">
            <span className="text-slate-400 text-[10px] font-black uppercase">Ref ID</span>
            <span className="text-slate-900 font-mono text-xs uppercase">{saleData.id || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400 text-[10px] font-black uppercase">Client</span>
            <span className="text-slate-900 font-bold">{saleData.clientName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 text-[10px] font-black uppercase">Amount Paid</span>
            <span className="text-blue-600 font-black">₦{Number(saleData.amount).toLocaleString()}</span>
          </div>

          {saleData.service && (
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px] font-black uppercase">Service</span>
              <span className="text-slate-900 font-bold text-xs">{saleData.service}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-slate-400 text-[10px] font-black uppercase">Method</span>
            <span className="text-slate-900 font-bold text-xs">{saleData.paymentMethod || 'Cash'}</span>
          </div>
        </div>

        {/* --- ACTIONS (HIDDEN DURING PRINTING) --- */}
        <div className="space-y-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print Receipt
          </button>
          
          <button 
            onClick={onClose}
            className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors"
          >
            Close & Done
          </button>
        </div>

        {/* FOOTER MESSAGE FOR PRINTING */}
        <p className="hidden print:block text-center text-[10px] text-slate-400 mt-10">
          Thank you for choosing Opolo CBT Resort. <br /> 
          This is an electronically generated receipt.
        </p>
      </div>
    </div>
  );
}