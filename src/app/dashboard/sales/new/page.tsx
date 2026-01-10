"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, BookOpen, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function NewSalePage() {
  // 1. All State Hooks must be at the top level
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const [clientName, setClientName] = useState("");
  const [service, setService] = useState("JAMB CBT Prep");
  const [amount, setAmount] = useState("5000");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // 2. The Logic Function
  const handleSaveSale = async () => {
    setLoading(true);
    
    // Simulate saving to database
    // In your real code, add your supabase.from('sales').insert(...) logic here
    
    setTimeout(() => {
      setSuccess(true);
      setShowReceipt(true); // This "uses" setShowReceipt to open the modal
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Record New Sale</h1>
        <p className="text-slate-500">Enter client details and service information below.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Form Section --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                <UserPlus className="w-4 h-4 mr-2 text-blue-600" /> Client Information
              </label>
              <input
                type="text"
                placeholder="Full Name of Student/Client"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSaveSale}
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : success ? <CheckCircle2 /> : null}
              {success ? "Transaction Recorded!" : "Complete Sale & Issue Receipt"}
            </button>
          </div>
        </div>

        {/* --- Receipt Preview Section --- */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl h-fit sticky top-8">
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-1">Receipt Preview</h3>
          <p className="text-xl font-black italic mb-6">OPOLO CBT RESORT</p>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Client:</span>
              <span className="font-bold">{clientName || "---"}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-4 mt-4">
              <span className="text-slate-400">Total Amount:</span>
              <span className="text-2xl font-black text-blue-400">₦{Number(amount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Modal (Nested correctly inside the return) */}
      {showReceipt && (
        <ReceiptModal 
          saleData={{ 
            clientName, 
            service, 
            amount, 
            paymentMethod, 
            staff: "Admin User", 
            id: "txn_" + Date.now() 
          }} 
          onClose={() => setShowReceipt(false)} // This "uses" setShowReceipt to close the modal
        />
      )}
    </div>
  );
}