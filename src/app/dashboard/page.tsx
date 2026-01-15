"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, TrendingUp, CreditCard, Wallet, Landmark, 
  ArrowRight, Loader2, AlertCircle, BarChart3, UserCheck,
  PieChart, Banknote, Smartphone, Briefcase // Added Briefcase for Staff
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    netProfit: 0,
    totalStudents: 0,
    totalStaff: 0, // New Stat
    unpaidDebt: 0,
    paymentBreakdown: { Cash: 0, Transfer: 0, POS: 0 },
    recentSales: [] as any[],
    chartData: [] as { month: string; amount: number }[]
  });

  useEffect(() => {
    async function getInitialData() {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch Sales and Clients
      const { data: sales } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
      const { data: clients } = await supabase.from("clients").select("*");
      
      // Fetch Staff Count Logic
      // Note: If you don't have a specific 'staff' table yet, we calculate 
      // unique staff names from the sales table as a fallback.
      const uniqueStaff = new Set(sales?.map(s => s.staff_name).filter(Boolean));

      if (sales && clients) {
        const revenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
        const costs = sales.reduce((sum, s) => sum + (s.institution_cost || 0), 0);
        const debtors = clients.filter(c => c.payment_status === "Unpaid").length;

        const breakdown = sales.reduce((acc: any, sale: any) => {
          const method = sale.payment_method || "Cash";
          acc[method] = (acc[method] || 0) + (sale.amount || 0);
          return acc;
        }, { Cash: 0, Transfer: 0, POS: 0 });

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6 = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return { name: months[d.getMonth()], monthIdx: d.getMonth(), year: d.getFullYear() };
        }).reverse();

        const growthData = last6.map(m => {
          const monthlyTotal = sales
            .filter(s => {
              const sDate = new Date(s.created_at);
              return sDate.getMonth() === m.monthIdx && sDate.getFullYear() === m.year;
            })
            .reduce((sum, s) => sum + s.amount, 0);
          return { month: m.name, amount: monthlyTotal };
        });

        setStats({
          totalRevenue: revenue,
          netProfit: revenue - costs,
          totalStudents: clients.length,
          totalStaff: uniqueStaff.size || 0, // Updated with count
          unpaidDebt: debtors,
          paymentBreakdown: breakdown,
          recentSales: sales.slice(0, 5),
          chartData: growthData
        });
      }
      setLoading(false);
    }
    getInitialData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  const maxAmount = Math.max(...stats.chartData.map(d => d.amount), 1);
  const totalForPie = stats.totalRevenue || 1;

  return (
    <div className="space-y-8 pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Opolo CBT Resort</h1>
          <p className="text-slate-500 font-medium mt-2">Welcome back, <span className="text-blue-600 font-bold">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Staff'}</span></p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2 text-blue-700 font-bold text-sm border border-blue-100">
          <UserCheck size={16} /> Staff Account Active
        </div>
      </header>

      {/* --- Stats Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Collections" value={`₦${stats.totalRevenue.toLocaleString()}`} icon={<CreditCard size={24}/>} color="bg-blue-600" />
        <StatCard title="Net Profit" value={`₦${stats.netProfit.toLocaleString()}`} icon={<Wallet size={24}/>} color="bg-emerald-600" subtitle="After Splits" />
        
        {/* NEW TOTAL STAFF CARD */}
        <StatCard title="Total Staff" value={stats.totalStaff.toString()} icon={<Briefcase size={24}/>} color="bg-orange-500" subtitle="Active Team" />
        
        <StatCard title="Unpaid Students" value={stats.unpaidDebt.toString()} icon={<AlertCircle size={24}/>} color="bg-red-500" subtitle="Action Needed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- PAYMENT BREAKDOWN --- */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
          <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2 mb-8">
            <PieChart size={14} className="text-blue-500" /> Collection Channels
          </h3>
          <div className="space-y-6">
            <PaymentProgress label="Cash" amount={stats.paymentBreakdown.Cash} total={totalForPie} color="bg-amber-400" icon={<Banknote size={14}/>} />
            <PaymentProgress label="Transfer" amount={stats.paymentBreakdown.Transfer} total={totalForPie} color="bg-blue-500" icon={<Landmark size={14}/>} />
            <PaymentProgress label="POS" amount={stats.paymentBreakdown.POS} total={totalForPie} color="bg-purple-500" icon={<Smartphone size={14}/>} />
          </div>
        </div>

        {/* --- MONTHLY GROWTH CHART --- */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2">
               <BarChart3 size={14} className="text-emerald-500" /> Revenue Trend
             </h3>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {stats.chartData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex flex-col items-center justify-end h-full">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 font-bold">
                    ₦{data.amount.toLocaleString()}
                  </div>
                  <div 
                    className="w-full bg-slate-100 group-hover:bg-blue-600 rounded-t-lg transition-all duration-500" 
                    style={{ height: `${(data.amount / maxAmount) * 100}%`, minHeight: '4px' }}
                  />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Recent Sales Table --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center text-xs font-black uppercase tracking-widest">
            <h3 className="italic text-slate-900">Recent Transactions</h3>
            <Link href="/dashboard/sales" className="text-blue-600 hover:underline flex items-center gap-1">Ledger <ArrowRight size={14}/></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition text-sm">
                    <td className="px-6 py-4 font-bold text-slate-800 leading-tight">
                      {sale.client_name}
                      <p className="text-[9px] text-slate-400 uppercase font-black">{sale.staff_name || 'Admin'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        sale.payment_method === 'Cash' ? 'bg-amber-50 text-amber-600' : 
                        sale.payment_method === 'POS' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {sale.payment_method || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600 text-right">₦{(sale.amount - sale.institution_cost).toLocaleString()}</td>
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

// Helper Components
function StatCard({ title, value, icon, color, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`${color} text-white p-3 rounded-2xl shadow-lg`}>{icon}</div>
        {subtitle && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtitle}</span>}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

function PaymentProgress({ label, amount, total, color, icon }: any) {
  const percentage = (amount / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className={`${color.replace('bg-', 'text-')} opacity-80`}>{icon}</span>
          <p className="text-[10px] font-black uppercase text-slate-500">{label}</p>
        </div>
        <p className="text-sm font-black text-slate-900">₦{amount.toLocaleString()}</p>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}