"use client";
import { useState, useEffect } from "react";
import { 
  Search, UserPlus, X, Loader2, Trash2, 
  MessageSquare, History, UserCircle2, CheckSquare, 
  Filter, Send, CheckCircle2, MinusCircle, AlertCircle, CreditCard
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- BULK & FILTER STATE ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<"parent" | "student">("student");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All"); // New Filter

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    parent_name: "",
    last_service: "New Registration",
    payment_status: "Paid"
  });

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setClients(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  // --- TOGGLE PAYMENT STATUS ---
  const togglePayment = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation(); // Prevents selecting the card when clicking status
    const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
    
    const { error } = await supabase
      .from("clients")
      .update({ payment_status: newStatus })
      .eq("id", id);

    if (!error) {
      setClients(clients.map(c => c.id === id ? { ...c, payment_status: newStatus } : c));
    }
  };

  // --- FILTER LOGIC ---
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                          c.phone?.includes(search);
    const matchesService = serviceFilter === "All" || c.last_service === serviceFilter;
    const matchesPayment = paymentFilter === "All" || c.payment_status === paymentFilter;
    return matchesSearch && matchesService && matchesPayment;
  });

  const handleSelectAll = () => {
    const filteredIds = filteredClients.map(c => c.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    setSelectedIds(allSelected ? prev => prev.filter(id => !filteredIds.includes(id)) : prev => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleBulkSMS = () => {
    const selectedClients = clients.filter(c => selectedIds.includes(c.id));
    const numbers = selectedClients.map(c => c.phone?.replace(/\D/g, '')).filter(n => n).join(',');
    const message = paymentFilter === "Unpaid" 
      ? `Hello ${targetType === 'parent' ? 'Parent' : 'Student'}, this is a friendly payment reminder from Opolo CBT Resort regarding ${serviceFilter === 'All' ? 'our services' : serviceFilter}.`
      : `Hello ${targetType === 'parent' ? 'Parent' : 'Student'}, this is Opolo CBT Resort: `;
    window.location.href = `sms:${numbers}?body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Client Database</h1>
          <p className="text-slate-500 font-medium">Manage records, payments, and announcements.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">
          <UserPlus size={20} /> Add New Client
        </button>
      </header>

      {/* MULTI-FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" placeholder="Search..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="bg-white border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-700 outline-none shadow-sm" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
          <option value="All">All Services</option>
          <option value="JAMB CBT Prep">JAMB CBT Prep</option>
          <option value="JAMB Form Purchase">JAMB Form Purchase</option>
        </select>

        <select className="bg-white border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-700 outline-none shadow-sm" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="All">All Payments</option>
          <option value="Paid">Paid Only</option>
          <option value="Unpaid">Unpaid (Debtors)</option>
        </select>

        <button onClick={handleSelectAll} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
          <CheckCircle2 size={18} /> Select Visible
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredClients.map((client) => (
          <div 
            key={client.id} onClick={() => setSelectedIds(prev => prev.includes(client.id) ? prev.filter(i => i !== client.id) : [...prev, client.id])}
            className={`bg-white p-6 rounded-3xl border cursor-pointer transition-all relative ${selectedIds.includes(client.id) ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-200 shadow-sm'}`}
          >
            <div className={`absolute top-6 left-6 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(client.id) ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-200'}`}>
              {selectedIds.includes(client.id) && <CheckSquare size={14} className="text-white" />}
            </div>

            <div className="ml-10 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${selectedIds.includes(client.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{client.name?.charAt(0)}</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => togglePayment(e, client.id, client.payment_status)}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter transition-all ${client.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600 ring-2 ring-red-50 animate-pulse'}`}
                    >
                      {client.payment_status || 'Paid'}
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Parent: {client.parent_name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50 mt-4 ml-10">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400">Phone</p>
                <p className="text-sm font-bold text-slate-700">{client.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400">Service</p>
                <p className="text-xs font-bold text-blue-600">{client.last_service}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BULK SMS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <div className="bg-slate-900 text-white p-5 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 px-5 py-2 rounded-2xl font-black">{selectedIds.length} Selected</div>
              <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                <button onClick={() => setTargetType("student")} className={`px-4 py-2 text-xs font-bold rounded-xl ${targetType === 'student' ? 'bg-slate-600 text-white' : 'text-slate-500'}`}>Students</button>
                <button onClick={() => setTargetType("parent")} className={`px-4 py-2 text-xs font-bold rounded-xl ${targetType === 'parent' ? 'bg-slate-600 text-white' : 'text-slate-500'}`}>Parents</button>
              </div>
            </div>
            <button onClick={handleBulkSMS} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-900/20">
              <Send size={18} /> Send {paymentFilter === 'Unpaid' ? 'Reminders' : 'SMS'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}