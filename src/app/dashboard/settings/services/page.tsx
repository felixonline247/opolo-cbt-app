"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Trash2, Save, Loader2, Settings2, 
  Building2, Percent, CheckCircle2 
} from "lucide-react";

export default function CombinedSettingsPage() {
  // --- Service States ---
  const [services, setServices] = useState<any[]>([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [newService, setNewService] = useState({ name: "", amount: "", split: "" });

  // --- Global Settings States ---
  const [globalLoading, setGlobalLoading] = useState(false);
  const [fetchingGlobals, setFetchingGlobals] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    business_name: "",
    commission_rate: 0
  });

  useEffect(() => {
    fetchServices();
    fetchGlobalSettings();
  }, []);

  // --- Global Settings Logic ---
  async function fetchGlobalSettings() {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) {
      setGlobalSettings({
        business_name: data.business_name,
        commission_rate: data.commission_rate
      });
    }
    setFetchingGlobals(false);
  }

  async function handleSaveGlobals() {
    setGlobalLoading(true);
    const { error } = await supabase
      .from('settings')
      .update({
        business_name: globalSettings.business_name,
        commission_rate: globalSettings.commission_rate,
        updated_at: new Date()
      })
      .eq('id', 1);

    if (!error) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert(error.message);
    }
    setGlobalLoading(false);
  }

  // --- Service Logic ---
  async function fetchServices() {
    const { data } = await supabase.from("service_presets").select("*").order("service_name");
    if (data) setServices(data);
  }

  async function handleAddService() {
    if (!newService.name || !newService.amount) return;
    setServiceLoading(true);
    await supabase.from("service_presets").insert([{
      service_name: newService.name,
      total_amount: parseFloat(newService.amount),
      institution_split: parseFloat(newService.split || "0")
    }]);
    setNewService({ name: "", amount: "", split: "" });
    fetchServices();
    setServiceLoading(false);
  }

  async function deleteService(id: string) {
    await supabase.from("service_presets").delete().eq("id", id);
    fetchServices();
  }

  if (fetchingGlobals) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">
      
      {/* SECTION 1: GLOBAL BRANDING & RATES */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="text-blue-600" size={28} />
          <h2 className="text-2xl font-black uppercase italic">Global Identity</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</p>
              <input 
                type="text" 
                value={globalSettings.business_name} 
                onChange={e => setGlobalSettings({...globalSettings, business_name: e.target.value})} 
                className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Default Commission (%)</p>
              <div className="relative">
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="number" 
                  value={globalSettings.commission_rate} 
                  onChange={e => setGlobalSettings({...globalSettings, commission_rate: Number(e.target.value)})} 
                  className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSaveGlobals} 
              disabled={globalLoading}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {globalLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Update System Settings
            </button>
            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in fade-in slide-in-from-left-4">
                <CheckCircle2 size={18} /> Settings Applied
              </div>
            )}
          </div>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* SECTION 2: SERVICE CONFIGURATION */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings2 className="text-blue-600" size={28} />
          <h2 className="text-2xl font-black uppercase italic">Service Price Presets</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Service Name</p>
            <input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold outline-none" placeholder="e.g. JAMB" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Total Price</p>
            <input type="number" value={newService.amount} onChange={e => setNewService({...newService, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold outline-none" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Inst. Split</p>
            <input type="number" value={newService.split} onChange={e => setNewService({...newService, split: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold outline-none" />
          </div>
          <button onClick={handleAddService} className="bg-blue-600 text-white p-4 rounded-xl font-black flex justify-center hover:bg-slate-900 transition-all active:scale-95">
            {serviceLoading ? <Loader2 className="animate-spin" /> : <Plus />}
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="p-6">Service Name</th>
                <th className="p-6">Total Cost</th>
                <th className="p-6">Inst. Split</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-bold uppercase">{s.service_name}</td>
                  <td className="p-6 font-bold text-blue-600">₦{s.total_amount.toLocaleString()}</td>
                  <td className="p-6 font-bold text-orange-600">₦{s.institution_split.toLocaleString()}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => deleteService(s.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}