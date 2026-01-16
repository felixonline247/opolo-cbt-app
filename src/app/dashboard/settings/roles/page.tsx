"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Plus, Trash2, Check, ShieldCheck, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const AVAILABLE_PERMISSIONS = [
  "view_sales", "create_sales", "edit_sales", "delete_sales",
  "view_payroll", "process_payouts", "manage_staff", "view_reports",
  "manage_settings"
];

function RoleManagementContent() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });

  useEffect(() => { fetchRoles(); }, []);

  async function fetchRoles() {
    const { data } = await supabase.from("roles").select("*").order("created_at", { ascending: false });
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

  const selectAll = () => {
    if (newRole.permissions.length === AVAILABLE_PERMISSIONS.length) {
      setNewRole({ ...newRole, permissions: [] });
    } else {
      setNewRole({ ...newRole, permissions: [...AVAILABLE_PERMISSIONS] });
    }
  };

  async function handleCreateRole() {
    if (!newRole.name) return alert("Please enter a role name");
    if (newRole.permissions.length === 0) return alert("Select at least one permission");
    
    setLoading(true);
    const { error } = await supabase.from("roles").insert([newRole]);
    
    if (!error) {
      setNewRole({ name: "", permissions: [] });
      fetchRoles();
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  async function deleteRole(id: string) {
    if (confirm("Are you sure? This may affect staff assigned to this role.")) {
      await supabase.from("roles").delete().eq("id", id);
      fetchRoles();
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Access Control</h1>
          <p className="text-slate-500 font-medium mt-2">Create custom roles and assign granular privileges.</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-600" />
          <span className="text-[10px] font-black text-blue-600 uppercase">System Security Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ROLE CREATOR (Left Side) */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm h-fit sticky top-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black uppercase text-xs flex items-center gap-2">
              <Plus size={16} className="text-blue-600"/> Create New Role
            </h2>
            <button 
              onClick={selectAll}
              className="text-[9px] font-black uppercase text-blue-600 hover:underline"
            >
              {newRole.permissions.length === AVAILABLE_PERMISSIONS.length ? "Deselect All" : "Select All (Admin)"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Role Label</p>
              <input 
                placeholder="e.g. Front Desk" 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                value={newRole.name}
                onChange={e => setNewRole({...newRole, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Assign Privileges</p>
              <div className="grid grid-cols-1 gap-2">
                {AVAILABLE_PERMISSIONS.map(perm => {
                  const isActive = newRole.permissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      onClick={() => togglePermission(perm)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isActive 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" 
                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">{perm.replace(/_/g, " ")}</span>
                      {isActive ? <Check size={14} /> : <div className="w-3.5 h-3.5 border-2 border-slate-200 rounded-full" />}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button 
              onClick={handleCreateRole} 
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase italic tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Save Role Configuration"}
            </button>
          </div>
        </div>

        {/* EXISTING ROLES (Right Side) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-black uppercase text-xs text-slate-400 mb-4 ml-4">Current Department Roles</h2>
          {roles.length === 0 && (
             <div className="p-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <Shield className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold">No roles created yet.</p>
             </div>
          )}
          {roles.map(role => (
            <div key={role.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex justify-between items-start group hover:shadow-xl hover:shadow-slate-100 transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    <Shield size={20} />
                  </div>
                  <h3 className="font-black text-xl text-slate-900 uppercase italic tracking-tight">{role.name}</h3>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((p: string) => (
                    <span key={p} className="text-[8px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-lg uppercase">
                      {p.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => deleteRole(role.id)}
                className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoleManagement() {
  return (
    <ProtectedRoute requiredPermission="manage_settings">
      <RoleManagementContent />
    </ProtectedRoute>
  );
}