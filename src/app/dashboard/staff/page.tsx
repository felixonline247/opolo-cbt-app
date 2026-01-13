"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  UserPlus, ShieldCheck, Mail, Lock, Loader2, 
  Trophy, TrendingUp, User, DollarSign 
} from "lucide-react";

export default function StaffManagement() {
  const [loading, setLoading] = useState(false);
  const [performance, setPerformance] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStaffPerformance();
  }, []);

  async function fetchStaffPerformance() {
    const { data: sales } = await supabase.from("sales").select("*");
    
    if (sales) {
      // Group sales by staff name
      const stats = sales.reduce((acc: any, sale: any) => {
        const name = sale.staff_name || "Unknown";
        if (!acc[name]) acc[name] = { name, totalSales: 0, netProfit: 0, count: 0 };
        
        acc[name].totalSales += sale.amount;
        acc[name].netProfit += (sale.amount - sale.institution_cost);
        acc[name].count += 1;
        return acc;
      }, {});

      // Convert to array and sort by profit
      setPerformance(Object.values(stats).sort((a: any, b: any) => b.netProfit - a.netProfit));
    }
  }

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: "OpoloStaff123",
      options: { data: { full_name: fullName } }
    });

    if (error) setMessage("Error: " + error.message);
    else {
      setMessage("Success! Staff created with default password.");
      setEmail(""); setFullName("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Staff & Performance</h1>
        <p className="text-slate-500 font-medium">Monitor productivity and manage accounts.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* CREATE STAFF FORM */}
        <div className="xl:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="text-blue-600" />
            <h2 className="font-black uppercase text-sm tracking-widest">Add New Staff</h2>
          </div>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <input 
              required type="text" placeholder="Full Name" 
              className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={fullName} onChange={(e) => setFullName(e.target.value)}
            />
            <input 
              required type="email" placeholder="Email Address" 
              className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <div className="p-4 bg-slate-100 rounded-2xl border border-dashed border-slate-300">
               <p className="text-[10px] font-black uppercase text-slate-400">Default Password</p>
               <p className="font-mono font-bold text-slate-600">OpoloStaff123</p>
            </div>
            <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 flex justify-center gap-2 transition-all">
              {loading ? <Loader2 className="animate-spin" /> : "Register Staff"}
            </button>
            {message && <p className="text-xs font-bold text-center text-blue-600">{message}</p>}
          </form>
        </div>

        {/* PERFORMANCE LEADERBOARD */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
             <h2 className="font-black uppercase text-sm tracking-widest flex items-center gap-2">
               <Trophy className="text-orange-500" /> Revenue Leaderboard
             </h2>
             <span className="text-[10px] font-bold text-slate-400 uppercase">All Time</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
                <tr>
                  <th className="p-6">Staff Member</th>
                  <th className="p-6">Sales Count</th>
                  <th className="p-6">Total Collected</th>
                  <th className="p-6 text-right">Net Profit Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {performance.map((staff, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                          {index + 1}
                        </div>
                        <span className="font-bold text-slate-900">{staff.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-slate-500">{staff.count} transactions</td>
                    <td className="p-6 text-sm font-bold text-slate-900">₦{staff.totalSales.toLocaleString()}</td>
                    <td className="p-6 text-right">
                      <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                        ₦{staff.netProfit.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}