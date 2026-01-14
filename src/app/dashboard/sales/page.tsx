"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Added for the settings shortcut
import { supabase } from "@/lib/supabase";
import { 
  Plus, X, Loader2, Printer, 
  Banknote, Settings, Search,
  Smartphone, Landmark 
} from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function SalesPage() {
  const router = useRouter();
  // --- AUTH & USER STATE ---
  const [currentStaff, setCurrentStaff] = useState<string>("System");

  // --- UI STATES ---
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  // --- DATA STATES ---
  const [clients, setClients] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [servicePresets, setServicePresets] = useState<any[]>([]);
  
  // --- SEARCH STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- FORM STATES ---
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [parentName, setParentName] = useState(""); 
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("0");
  const [institutionCost, setInstitutionCost] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const fetchData = async () => {
    setFetching(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0];
      setCurrentStaff(name);
    }
    
    const { data: clientsData } = await supabase.from("clients").select("id, name, phone, parent_name").order("name");
    const { data: salesData } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
    const { data: presetsData } = await supabase.from("service_presets").select("*").order("service_name");

    if (clientsData) setClients(clientsData);
    if (salesData) setSales(salesData);
    if (presetsData) setServicePresets(presetsData);
    
    setFetching(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Filter clients based on Name or Phone search
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleClientChange = (clientId: string) => {
    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setSelectedClientId(clientId);
      setClientName(selected.name);
      setParentName(selected.parent_name || "N/A");
    }
  };

  const handleServiceChange = (serviceName: string) => {
    const preset = servicePresets.find(p => p.service_name === serviceName);
    if (preset) {
      setService(serviceName);
      setAmount(preset.total_amount.toString());
      setInstitutionCost(preset.institution_split.toString());
    } else {
      setService(serviceName);
      setAmount("0");
      setInstitutionCost("0");
    }
  };

  const handleSaveSale = async () => {
    if (!clientName) return alert("Please select a student");
    if (!service) return alert("Please select a service");
    setLoading(true);

    if (service === "JAMB CBT Prep") {
      const { data: invItem } = await supabase.from("inventory").select("id, stock_quantity").eq("item_name", "JAMB Profile Code").single();
      if (invItem && invItem.stock_quantity <= 0) {
        setLoading(false);
        return alert("🚫 STOP: Out of JAMB Profile Codes!");
      }
      if (invItem) await supabase.from("inventory").update({ stock_quantity: invItem.stock_quantity - 1 }).eq("id", invItem.id);
    }

    const salePayload = {
      client_name: clientName,
      parent_name: parentName,
      service: service,
      amount: parseFloat(amount),
      institution_cost: parseFloat(institutionCost || "0"),
      payment_method: paymentMethod,
      staff_name: currentStaff,
    };

    const { data, error } = await supabase.from("sales").insert([salePayload]).select();

    if (!error) {
      await supabase.from("clients").update({ payment_status: "Paid", last_service: service }).eq("id", selectedClientId);
      setActiveReceipt({ ...salePayload, id: data[0].id });
      setShowReceipt(true);
      setIsModalOpen(false);
      fetchData();
      resetForm();
    } else {
      alert("Error saving sale: " + error.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSelectedClientId("");
    setClientName("");
    setService("");
    setAmount("0");
    setInstitutionCost("0");
    setPaymentMethod("Cash");
    setSearchTerm("");
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalPartnerCost = sales.reduce((sum, s) => sum + s.institution_cost, 0);
  const netProfit = totalRevenue - totalPartnerCost;

  return (
    <div className="space-y-6 pb-20 p-4 lg:p-8">
      {/* HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Sales Ledger</h1>
          <p className="text-slate-500 font-medium italic">Opolo CBT Resort Management</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button 
            onClick={() => router.push('/dashboard/settings/services')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            <Settings size={20} /> Services
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={20} /> Record Sale
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Collections</p>
            <p className="text-2xl font-black text-slate-900">₦{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase text-orange-500 mb-1">Institution Share</p>
            <p className="text-2xl font-black text-orange-600">₦{totalPartnerCost.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl">
            <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Net Profit</p>
            <p className="text-2xl font-black text-white">₦{netProfit.toLocaleString()}</p>
          </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 z-10 text-slate-400 hover:text-slate-900"><X size={28} /></button>
            <div className="p-10 flex-1 space-y-6">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">New Transaction</h2>
              
              <div className="space-y-4">
                {/* SEARCHABLE STUDENT SELECT */}
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Find Student (Name or Phone)</p>
                    <div className="relative mb-2">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Type to filter..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select 
                      value={selectedClientId}
                      onChange={(e) => handleClientChange(e.target.value)} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">-- {filteredClients.length} students found --</option>
                      {filteredClients.map(c => (
                        <option key={c.id} value={c.id}>{c.name.toUpperCase()} — {c.phone || "No Phone"}</option>
                      ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Select Service</p>
                    <select 
                      value={service}
                      onChange={(e) => handleServiceChange(e.target.value)} 
                      className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-blue-900"
                    >
                      <option value="">-- Choose Preset --</option>
                      {servicePresets.map(p => (
                        <option key={p.id} value={p.service_name}>{p.service_name.toUpperCase()}</option>
                      ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Amount (₦)</p>
                    <input type="number" value={amount} readOnly className="w-full px-5 py-4 bg-slate-100 border rounded-2xl font-black text-slate-600 outline-none cursor-not-allowed" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Inst. Split (₦)</p>
                    <input type="number" value={institutionCost} readOnly className="w-full px-5 py-4 bg-slate-100 border rounded-2xl font-black text-slate-600 outline-none cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Payment Channel</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Cash', 'POS', 'Transfer'].map((m) => (
                      <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === m ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-50 text-slate-400"}`}>
                        {m === 'Cash' && <Banknote size={20} />}
                        {m === 'POS' && <Smartphone size={20} />}
                        {m === 'Transfer' && <Landmark size={20} />}
                        <span className="text-[10px] font-black uppercase mt-1">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleSaveSale} disabled={loading} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 flex items-center justify-center gap-2 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : "Complete & Issue Receipt"}
              </button>
            </div>

            <div className="bg-slate-900 p-10 text-white w-full md:w-80 flex flex-col justify-center border-l border-slate-800">
                <p className="text-[10px] uppercase font-black text-blue-500 mb-2 italic">Net Profit Preview</p>
                <h3 className="text-4xl font-black text-emerald-400 mb-6 tracking-tighter">₦{(Number(amount) - Number(institutionCost)).toLocaleString()}</h3>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                  <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Staff In Charge</p>
                  <p className="font-bold text-white uppercase text-xs">{currentStaff}</p>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
            <tr>
              <th className="p-6">Date</th>
              <th className="p-6">Student</th>
              <th className="p-6">Method</th>
              <th className="p-6 text-right">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/50">
                <td className="p-6 text-xs text-slate-400">{new Date(sale.created_at).toLocaleDateString()}</td>
                <td className="p-6">
                    <p className="font-bold text-slate-900 uppercase">{sale.client_name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{sale.service}</p>
                </td>
                <td className="p-6">
                    <span className="text-[9px] font-black px-2 py-1 bg-slate-100 rounded uppercase">{sale.payment_method}</span>
                </td>
                <td className="p-6 text-right font-black text-emerald-600">₦{(sale.amount - sale.institution_cost).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showReceipt && activeReceipt && (
        <ReceiptModal saleData={activeReceipt} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}