"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Save, Loader2, Settings2 } from "lucide-react";

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState({ name: "", amount: "", split: "" });

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    const { data } = await supabase.from("service_presets").select("*").order("service_name");
    if (data) setServices(data);
  }

  async function handleAddService() {
    if (!newService.name || !newService.amount) return;
    setLoading(true);
    await supabase.from("service_presets").insert([{
      service_name: newService.name,
      total_amount: parseFloat(newService.amount),
      institution_split: parseFloat(newService.split || "0")
    }]);
    setNewService({ name: "", amount: "", split: "" });
    fetchServices();
    setLoading(false);
  }

  async function deleteService(id: string) {
    await supabase.from("service_presets").delete().eq("id", id);
    fetchServices();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Settings2 className="text-blue-600" size={32} />
        <h1 className="text-3xl font-black uppercase italic">Service Configuration</h1>
      </div>

      {/* ADD NEW SERVICE FORM */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Service Name</p>
          <input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold" placeholder="e.g. MOCK Exam" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Total Price</p>
          <input type="number" value={newService.amount} onChange={e => setNewService({...newService, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Inst. Split</p>
          <input type="number" value={newService.split} onChange={e => setNewService({...newService, split: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold" />
        </div>
        <button onClick={handleAddService} className="bg-blue-600 text-white p-4 rounded-xl font-black flex justify-center hover:bg-slate-900 transition-all">
          {loading ? <Loader2 className="animate-spin" /> : <Plus />}
        </button>
      </div>

      {/* SERVICE LIST */}
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
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="p-6 font-bold uppercase">{s.service_name}</td>
                <td className="p-6 font-bold text-blue-600">₦{s.total_amount.toLocaleString()}</td>
                <td className="p-6 font-bold text-orange-600">₦{s.institution_split.toLocaleString()}</td>
                <td className="p-6 text-right">
                  <button onClick={() => deleteService(s.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}