"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, BookOpen, CreditCard, CheckCircle2, Loader2 } from "lucide-react";

export default function NewSalePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [clientName, setClientName] = useState("");
  const [service, setService] = useState("JAMB CBT Prep");
  const [amount, setAmount] = useState("5000");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showReceipt, setShowReceipt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Logic to save to Supabase 'sales' table
    // 2. Logic to trigger Email/SMS (Placeholder)
    
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form after 2 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Record New Sale</h1>
        <p className="text-slate-500">Enter client details and service information below.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Form Section --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Client Info */}
            <div className="space-y-4">
              <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                <UserPlus className="w-4 h-4 mr-2 text-blue-600" /> Client Information
              </label>
              <input
                type="text"
                placeholder="Full Name of Student/Client"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            {/* Service Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-600" /> Service
                </label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option>JAMB CBT Prep</option>
                  <option>WAEC Mock Exam</option>
                  <option>Education Consulting</option>
                  <option>Post-UTME Screening</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                  ₦ Amount Paid
                </label>
                <input
                  type="number"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 mr-2 text-blue-600" /> Payment Method
              </label>
              <div className="flex gap-4">
                {["Cash", "Bank Transfer", "POS"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${
                      paymentMethod === method 
                      ? "border-blue-600 bg-blue-50 text-blue-600" 
                      : "border-slate-100 bg-slate-50 text-slate-400"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : success ? <CheckCircle2 /> : null}
              {success ? "Transaction Recorded!" : "Complete Sale & Issue Receipt"}
            </button>
          </form>
        </div>

        {/* --- Receipt Preview Section --- */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl h-fit sticky top-8">
          <div className="border-b border-slate-700 pb-6 mb-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-1">Receipt Preview</h3>
            <p className="text-xl font-black italic">OPOLO CBT RESORT</p>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Client:</span>
              <span className="font-bold">{clientName || "---"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Service:</span>
              <span className="font-bold">{service}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-4 mt-4">
              <span className="text-slate-400">Total Amount:</span>
              <span className="text-2xl font-black text-blue-400">₦{Number(amount).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-800 rounded-xl text-[11px] text-slate-400 text-center leading-relaxed">
            A confirmation {paymentMethod === "Cash" ? "receipt" : "SMS"} will be sent to the client upon submission.
          </div>
        </div>
      </div>
    </div>
  );
}

{showReceipt && (
  <ReceiptModal 
    saleData={{ clientName, service, amount, paymentMethod, staff: "Admin User", id: "random-id" }} 
    onClose={() => setShowReceipt(false)} 
  />
)}