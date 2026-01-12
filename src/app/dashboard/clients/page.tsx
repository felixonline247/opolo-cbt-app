"use client";
import { useState, useEffect } from "react";
import { 
  Search, UserPlus, X, Loader2, Trash2, 
  MessageSquare, History, UserCircle2 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Client Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    parent_name: "",
    last_service: "New Registration",
  });

  // 1. FETCH CLIENTS
  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // 2. ADD CLIENT FUNCTION
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from("clients").insert([formData]);

    if (error) {
      alert("Error saving client: " + error.message);
    } else {
      setIsModalOpen(false);
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        parent_name: "", 
        last_service: "New Registration" 
      });
      fetchClients(); // Refresh list
    }
    setIsSaving(false);
  };

  // 3. DELETE CLIENT FUNCTION
  const handleDeleteClient = async (id: string, name: string) => {
    const confirmDelete = confirm(`Are you sure you want to delete ${name}? This cannot be undone.`);
    
    if (confirmDelete) {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Error deleting client: " + error.message);
      } else {
        // Optimistic UI update: remove from list immediately
        setClients(clients.filter(client => client.id !== id));
      }
    }
  };

  // 4. FILTER SEARCH LOGIC
  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search) ||
    c.parent_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Client Database</h1>
          <p className="text-slate-500 font-medium">Manage student records and parent contacts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus size={20} /> Add New Client
        </button>
      </header>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search by student, parent, or phone..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CLIENT GRID / LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="font-bold animate-pulse">Loading database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div key={client.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {client.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Parent: {client.parent_name || 'Not Provided'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteClient(client.id, client.name)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Phone</p>
                    <p className="text-sm font-bold text-slate-700">{client.phone || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Last Service</p>
                    <p className="text-sm font-bold text-slate-700">{client.last_service}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                   <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 transition">
                    <MessageSquare size={18} />
                  </button>
                  <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all">
                    <History size={16} /> History
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
               <UserCircle2 className="mx-auto mb-4 text-slate-300" size={48} />
               <p className="text-slate-500 font-bold">No clients found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* ADD CLIENT MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={28} />
            </button>
            
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase">New Client</h2>
            <p className="text-slate-500 text-sm mb-6 font-medium">Add a new student to your database.</p>
            
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Student Full Name</label>
                <input 
                  placeholder="e.g. John Doe" required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Parent/Guardian Name</label>
                <input 
                  placeholder="e.g. Mrs. Smith"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Contact Phone</label>
                <input 
                  placeholder="e.g. 08012345678"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <button 
                disabled={isSaving}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 mt-4"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : "Register Client"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}