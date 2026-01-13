"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  UserPlus, ShieldCheck, Trash2, UserX, 
  Loader2, Trophy, CheckCircle2, AlertCircle 
} from "lucide-react";

export default function StaffManagement() {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchStaffData();
  }, []);

  async function fetchStaffData() {
    setLoading(true);
    // Note: This fetches sales to see who is active. 
    // In a full setup, you would fetch from a 'staff_profiles' table.
    const { data: sales } = await supabase.from("sales").select("staff_name");
    
    // Create a unique list of staff names from sales for the leaderboard
    const stats = sales?.reduce((acc: any, sale: any) => {
      const name = sale.staff_name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const formattedStaff = Object.keys(stats || {}).map(name => ({
      name,
      salesCount: stats[name],
      status: "active" // Default for this demo
    }));

    setStaffList(formattedStaff);
    setLoading(false);
  }

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: "OpoloStaff123", // Default password
      options: { data: { full_name: fullName } }
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Staff account created successfully!", type: "success" });
      setEmail(""); setFullName("");
      fetchStaffData();
    }
    setLoading(false);
  };

  // --- DELETE / DEACTIVATE LOGIC ---
  const handleDeactivate = async (staffName: string) => {
    const confirm = window.confirm(`Are you sure you want to deactivate ${staffName}? They will no longer be able to record sales.`);
    if (confirm) {
      // Logic: In a real app, you'd update a 'status' column in your staff table
      alert(`${staffName} has been deactivated. (Note: To fully block login, disable them in Supabase Auth Dashboard)`);
      fetchStaffData();
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Staff Management</h1>
        <p className="text-slate-500 font-medium">Control access and monitor performance.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ADD STAFF FORM */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
          <h2 className="font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <UserPlus size={16} className="text-blue-600"/> Create Account
          </h2>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <input required type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input required type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Register Staff"}
            </button>
            {message.text && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {message.type === 'success' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                {message.text}
              </div>
            )}
          </form>
        </div>

        {/* STAFF LIST & ACTIONS */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="p-6">Staff Member</th>
                <th className="p-6">Performance</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffList.map((staff, i) => (
                <tr key={i} className="group">
                  <td className="p-6">
                    <p className="font-bold text-slate-900">{staff.name}</p>
                    <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-500">{staff.salesCount} Sales recorded</td>
                  <td className="p-6 text-right space-x-2">
                    <button 
                      onClick={() => handleDeactivate(staff.name)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Deactivate Account"
                    >
                      <UserX size={18} />
                    </button>
                    <button 
                      className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                      title="Delete History"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}