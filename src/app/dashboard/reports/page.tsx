"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  TrendingUp, Calendar, DollarSign, Loader2, Download, 
  Banknote, Landmark, Wallet, PieChart, ChevronLeft, ChevronRight 
} from "lucide-react";

export default function ReportsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [stats, setStats] = useState({
    grossRevenue: 0,
    payrollExpenses: 0,
    institutionCosts: 0,
    netProfit: 0,
    todayRevenue: 0
  });

  const fetchData = async () => {
    setLoading(true);
    
    // Define the month bounds
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString();
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const monthLabel = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // 1. Fetch Sales within the month range
    const { data: salesData } = await supabase
      .from("sales")
      .select("*")
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth)
      .order("created_at", { ascending: false });

    // 2. Fetch Payouts matching this specific month label
    const { data: payoutData } = await supabase
      .from("payouts")
      .select("amount_paid")
      .eq('month_for', monthLabel);

    if (salesData) {
      setSales(salesData);
      
      const gross = salesData.reduce((acc, s) => acc + Number(s.amount), 0);
      const instCosts = salesData.reduce((acc, s) => acc + Number(s.institution_cost || 0), 0);
      
      // Calculate "Today" only if the selected month is the current month
      const isCurrentMonth = new Date().getMonth() === selectedDate.getMonth() && new Date().getFullYear() === selectedDate.getFullYear();
      const nowStr = new Date().toISOString().split('T')[0];
      const today = isCurrentMonth 
        ? salesData.filter(s => s.created_at.startsWith(nowStr)).reduce((acc, s) => acc + Number(s.amount), 0)
        : 0;

      const payroll = payoutData ? payoutData.reduce((acc, p) => acc + Number(p.amount_paid), 0) : 0;

      setStats({
        grossRevenue: gross,
        payrollExpenses: payroll,
        institutionCosts: instCosts,
        netProfit: gross - (payroll + instCosts),
        todayRevenue: today
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const changeMonth = (offset: number) => {
    setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + offset)));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Financial Reports</h1>
          <div className="flex items-center gap-3 mt-4 bg-white border border-slate-200 p-2 rounded-2xl w-fit shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft size={20}/></button>
            <span className="font-black uppercase italic text-sm text-slate-700 min-w-[140px] text-center">
              {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight size={20}/></button>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl"
        >
          <Download size={18} /> Export Report
        </button>
      </header>

      {/* --- MASTER STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Gross Revenue" amount={stats.grossRevenue} icon={<TrendingUp className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Inst. Payouts" amount={stats.institutionCosts} icon={<Landmark className="text-orange-600" />} color="bg-orange-50" isExpense />
        <StatCard title="Payroll Paid" amount={stats.payrollExpenses} icon={<Banknote className="text-red-600" />} color="bg-red-50" isExpense />
        <StatCard title="Net Profit" amount={stats.netProfit} icon={<Wallet className="text-emerald-400" />} color="bg-slate-800" highlight />
      </div>

      {/* --- PROFIT BREAKDOWN VISUAL --- */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
         <h3 className="font-black uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2">
           <PieChart className="text-blue-600" size={20} /> Revenue Distribution
         </h3>
         <div className="w-full bg-slate-100 h-14 rounded-2xl overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${Math.max((stats.netProfit / stats.grossRevenue) * 100, 0)}%` }} 
              className="bg-emerald-500 h-full transition-all duration-700 relative group"
            >
               <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100">Profit</span>
            </div>
            <div 
              style={{ width: `${(stats.institutionCosts / stats.grossRevenue) * 100}%` }} 
              className="bg-orange-400 h-full transition-all duration-700" 
            />
            <div 
              style={{ width: `${(stats.payrollExpenses / stats.grossRevenue) * 100}%` }} 
              className="bg-red-400 h-full transition-all duration-700" 
            />
         </div>
         <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6 text-[10px] font-black uppercase text-slate-400">
            <span className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded-lg" /> Your Net Profit ({stats.grossRevenue > 0 ? ((stats.netProfit/stats.grossRevenue)*100).toFixed(1) : 0}%)</span>
            <span className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-400 rounded-lg" /> Institutional Shares</span>
            <span className="flex items-center gap-2"><div className="w-4 h-4 bg-red-400 rounded-lg" /> Staff Salaries</span>
         </div>
      </div>

      

      {/* --- TRANSACTION AUDIT LOG --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-black text-slate-900 uppercase tracking-tighter">Audit Ledger: {selectedDate.toLocaleString('default', { month: 'long' })}</h2>
          <span className="text-[10px] font-black text-slate-400 px-3 py-1 bg-white rounded-full border border-slate-200">{sales.length} Transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Time</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client Details</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Inst. Split</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center font-bold text-slate-400 uppercase italic">No data for this period</td>
                </tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <p className="text-xs font-bold text-slate-900">{new Date(sale.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-slate-900 uppercase">{sale.client_name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase">{sale.staff_name || 'Counter'}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-orange-600">₦{Number(sale.institution_cost || 0).toLocaleString()}</p>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-sm font-black text-slate-900">₦{Number(sale.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">Net: ₦{(Number(sale.amount) - Number(sale.institution_cost || 0)).toLocaleString()}</p>
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

function StatCard({ title, amount, icon, color, isExpense, highlight }: any) {
  return (
    <div className={`p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] ${highlight ? 'bg-slate-900 text-white' : 'bg-white'}`}>
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>{title}</p>
        <p className={`text-xl font-black italic tracking-tight ${highlight ? 'text-emerald-400' : 'text-slate-900'}`}>
          {isExpense && amount > 0 ? '-' : ''}₦{amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}