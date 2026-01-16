"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Lock, CheckCircle2, Plus, Trash2, Save } from "lucide-react";

const AVAILABLE_PERMISSIONS = [
  "view_sales", "create_sales", "edit_sales", "delete_sales",
  "view_payroll", "process_payouts", "manage_staff", "view_reports"
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });

  useEffect(() => { fetchRoles(); }, []);

  async function fetchRoles() {
    const { data } = await supabase.from("roles").select("*");
    if (data) setRoles(data);
  }

  const togglePermission = (perm: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  async function handleCreateRole() {
    if (!newRole.name) return;
    await supabase.from("roles").insert([newRole]);
    setNewRole({ name: "", permissions: [] });
    fetchRoles();
  }

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black uppercase italic italic">Access Control</h1>
        <p className="text-slate-500">Define what each role is allowed to do.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ROLE CREATOR */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h2 className="font-black uppercase text-xs mb-6 flex items-center gap-2">
            <Plus size={16} className="text-blue-600"/> Create New Role
          </h2>
          <div className="space-y-6">
            <input 
              placeholder="Role Name (e.g. Supervisor)" 
              className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none"
              value={newRole.name}
              onChange={e => setNewRole({...newRole, name: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_PERMISSIONS.map(perm => (
                <button
                  key={perm}
                  onClick={() => togglePermission(perm)}
                  className={`p-3 text-[10px] font-black uppercase rounded-xl border transition-all ${
                    newRole.permissions.includes(perm) 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white text-slate-400 border-slate-100"
                  }`}
                >
                  {perm.replace("_", " ")}
                </button>
              ))}
            </div>
            
            <button onClick={handleCreateRole} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl uppercase italic tracking-widest">
              Save Role
            </button>
          </div>
        </div>

        {/* EXISTING ROLES */}
        <div className="space-y-4">
          {roles.map(role => (
            <div key={role.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 uppercase italic">{role.name}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {role.permissions.map((p: string) => (
                    <span key={p} className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <button className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}