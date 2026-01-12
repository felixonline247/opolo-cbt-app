"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Landmark, Banknote, CheckCircle2, Loader2, Wallet } from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function NewSalePage() {
  // 1. State Hooks
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Data States
  const [clients, setClients] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [parentName, setParentName] = useState(""); 
  const [service, setService] = useState("JAMB CBT Prep");
  const [amount, setAmount] = useState("5000");
  const [institutionCost, setInstitutionCost] = useState("0"); // NEW FIELD
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // 2. Fetch Clients
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from("clients").select("*").order("name", { ascending: true });
      if (!error && data) setClients(data);
    };
    fetchClients();
  }, []);

  // 3. Handle Client Selection
  const handleClientChange = (clientId: string) => {
    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setClientName(selected.name);
      setParentName(selected.parent_name || "N/A");
    }
  };

  // 4. Save Sale to Supabase
  const handleSaveSale = async () => {
    if (!clientName) {
      alert("Please select a client first");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("sales")
      .insert([
        {
          client_name: clientName,
          parent_name: parentName,
          service: service,
          amount: parseFloat(amount),
          institution_cost: parseFloat(institutionCost || "0"), // SAVE INSTITUTION COST
          payment_method: paymentMethod,
          staff_name: "Admin User",
        }
      ]);

    if (error) {
      alert("Error saving sale: " + error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setShowReceipt(true);
      setLoading(false);
    }
  };

  // Calculate your share for preview
  const yourShare = Number(amount) - Number(institutionCost);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic text-center md:text-left">Record New Sale</h1>
        <p className="text-slate-500 font-medium text-center md:text-left">Split revenue between Opolo Resort and Partners.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Form Section --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="space-y-6">
            
            {/* SEARCHABLE CLIENT DROPDOWN */}
            <div className="space-y-4">
              <label className="flex items-center text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                <UserPlus className="w-4 h-4 mr-2 text-blue-600" /> Select Registered Student
              </label>
              <select
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>-- Choose a student --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.parent_name ? `(${client.parent_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* FINANCIAL INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                  <Banknote size={12} className="text-blue-500"/> Total Amount Paid (₦)
                </label>
                <input
                  type="number"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                  <Landmark size={12} /> Institution Cost (₦)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-5 py-4 bg-orange-50 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-600"
                  value={institutionCost}
                  onChange={(e) => setInstitutionCost(e.target.value)}
                />
              </div>
            </div>

            {/* NET PROFIT PREVIEW BOX */}
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center"><Wallet size={16}/></div>
                   <span className="text-xs font-black uppercase text-emerald-700">Your Share (Profit)</span>
                </div>
                <span className="text-xl font-black text-emerald-600">₦{yourShare.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleSaveSale}
              disabled={loading || success}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : success ? <CheckCircle2 /> : null}
              {success ? "Transaction Recorded!" : "Complete Sale & Issue Receipt"}
            </button>
          </div>
        </div>

        {/* --- Sidebar Preview --- */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl h-fit sticky top-8">
          <div className="text-center border-b border-slate-800 pb-6 mb-6">
             <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-500 mb-2">Split Summary</h3>
             <p className="text-xl font-black italic uppercase">Opolo CBT Resort</p>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Student:</span>
              <span className="font-bold">{clientName || "---"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Paid:</span>
              <span className="font-bold text-blue-400">₦{Number(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Partner Share:</span>
              <span className="font-bold text-orange-400">- ₦{Number(institutionCost).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-4 mt-4">
              <span className="text-slate-400 font-bold">Your Net:</span>
              <span className="text-2xl font-black text-emerald-400">₦{yourShare.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {showReceipt && (
        <ReceiptModal 
          saleData={{ 
            clientName, 
            service, 
            amount, 
            institutionCost, // Passes cost to the receipt
            paymentMethod, 
            staff: "Admin User", 
            id: "txn_" + Date.now() 
          }} 
          onClose={() => {
            setShowReceipt(false);
            setSuccess(false);
            setAmount("5000");
            setInstitutionCost("0");
          }} 
        />
      )}
    </div>
  );
}