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
  const [servicePresets, setServicePresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [serviceFilter, setServiceFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    parent_name: "",
    last_service: "",
    payment_status: "Unpaid" // Default to Unpaid for better debt tracking
  });

  const fetchClients = async () => {
    setLoading(true);
    const { data: clientsData } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: presetsData } = await supabase
      .from("service_presets")
      .select("*")
      .order("service_name");

    if (clientsData) setClients(clientsData);
    if (presetsData) {
        setServicePresets(presetsData);
        if (presetsData.length > 0 && !formData.last_service) {
            setFormData(prev => ({ ...prev, last_service: presetsData[0].service_name }));
        }
    }
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([formData])
        .select();

      if (error) throw error;

      // Reset form while keeping the first service preset as default
      setFormData({
        name: "", email: "", phone: "",
        parent_name: "", 
        last_service: servicePresets[0]?.service_name || "", 
        payment_status: "Unpaid" 
      });
      setIsModalOpen(false);
      fetchClients();
      alert("Student added successfully!");
    } catch (err: any) {
      alert("Error saving student: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePayment = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
    const { error } = await supabase
      .from("clients")
      .update({ payment_status: newStatus })
      .eq("id", id);

    if (!error) {
      setClients(clients.map(c => c.id === id ? { ...c, payment_status: newStatus } : c));
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search);
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
    const message = `Hello, this is Opolo CBT Resort: `;
    window.location.href = `sms:${numbers}?body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Client Database</h1>
          <p className="text-slate-500 font-medium">Manage records and payments.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">
          <UserPlus size={20} /> Add New Client
        </button>
      </header>

      {/* SEARCH & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" placeholder="Search students..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="bg-white border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-700 outline-none shadow-sm" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
          <option value="All">All Services</option>
          {servicePresets.map(p => (
            <option key={p.id} value={p.service_name}>{p.service_name}</option>
          ))}
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

      {/* CLIENT CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {loading ? <div className="p-10 text-center animate-pulse font-bold text-slate-400">Loading Clients...</div> : filteredClients.map((client) => (
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

      {/* --- ADD CLIENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Register Student</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Full Name</p>
                <input required type="text" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Phone Number</p>
                  <input required type="tel" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Parent's Name</p>
                  <input type="text" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={formData.parent_name} onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Initial Service</p>
                    <select 
                    className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" 
                    value={formData.last_service} 
                    onChange={(e) => setFormData({...formData, last_service: e.target.value})}
                    >
                    {servicePresets.map(p => (
                        <option key={p.id} value={p.service_name}>{p.service_name}</option>
                    ))}
                    </select>
                </div>

                {/* NEW PAYMENT STATUS DROPDOWN */}
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Initial Payment</p>
                    <select 
                    className={`w-full px-5 py-4 border rounded-2xl font-bold outline-none transition-colors ${formData.payment_status === 'Paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}
                    value={formData.payment_status} 
                    onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                    >
                        <option value="Unpaid">UNPAID (DEBT)</option>
                        <option value="Paid">PAID FULL</option>
                    </select>
                </div>
              </div>

              <button disabled={isSaving} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" /> : <><UserPlus size={20}/> Create Record</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BULK SMS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <div className="bg-slate-900 text-white p-5 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 px-5 py-2 rounded-2xl font-black">{selectedIds.length} Selected</div>
            </div>
            <button onClick={handleBulkSMS} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg">
              <Send size={18} /> Send {paymentFilter === 'Unpaid' ? 'Reminders' : 'SMS'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}