"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  TrendingUp, Calendar, DollarSign, 
  Loader2, Download, Banknote, Landmark, Wallet, PieChart 
} from "lucide-react";

export default function ReportsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    grossRevenue: 0,
    payrollExpenses: 0,
    institutionCosts: 0,
    netProfit: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    
    // 1. Fetch Sales (Revenue + Inst. Costs)
    const { data: salesData } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Fetch Payouts (Payroll Expenses)
    const { data: payoutData } = await supabase
      .from("payouts")
      .select("amount_paid");

    if (salesData) {
      setSales(salesData);
      
      const now = new Date().toISOString().split('T')[0];
      
      // Calculate Gross Revenue & Institution Costs
      const gross = salesData.reduce((acc, s) => acc + Number(s.amount), 0);
      const instCosts = salesData.reduce((acc, s) => acc + Number(s.institution_cost || 0), 0);
      const today = salesData
        .filter(s => s.created_at.startsWith(now))
        .reduce((acc, s) => acc + Number(s.amount), 0);

      // Calculate Payroll
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

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Financial Reports</h1>
          <p className="text-slate-500 font-medium">Gross Revenue, Expenses, and Net Profit Tracking.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition"
        >
          <Download size={18} /> Export PDF
        </button>
      </header>

      {/* --- FINANCIAL STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Gross Revenue" 
          amount={stats.grossRevenue} 
          icon={<TrendingUp className="text-blue-600" />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="Inst. Payouts" 
          amount={stats.institutionCosts} 
          icon={<Landmark className="text-orange-600" />} 
          color="bg-orange-50" 
          isExpense 
        />
        <StatCard 
          title="Payroll Paid" 
          amount={stats.payrollExpenses} 
          icon={<Banknote className="text-red-600" />} 
          color="bg-red-50" 
          isExpense 
        />
        <StatCard 
          title="Net Profit" 
          amount={stats.netProfit} 
          icon={<Wallet className="text-emerald-600" />} 
          color="bg-emerald-50" 
          highlight 
        />
      </div>

      {/* --- PROFIT BREAKDOWN VISUAL --- */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
         <h3 className="font-black uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2">
           <PieChart className="text-blue-600" size={20} /> Revenue Distribution
         </h3>
         <div className="w-full bg-slate-100 h-12 rounded-2xl overflow-hidden flex">
            <div 
              style={{ width: `${Math.max((stats.netProfit / stats.grossRevenue) * 100, 0)}%` }} 
              className="bg-emerald-500 h-full transition-all" 
              title="Net Profit"
            />
            <div 
              style={{ width: `${(stats.institutionCosts / stats.grossRevenue) * 100}%` }} 
              className="bg-orange-400 h-full transition-all" 
              title="Institution Costs"
            />
            <div 
              style={{ width: `${(stats.payrollExpenses / stats.grossRevenue) * 100}%` }} 
              className="bg-red-400 h-full transition-all" 
              title="Payroll"
            />
         </div>
         <div className="mt-6 flex flex-wrap gap-6 text-[10px] font-black uppercase text-slate-400">
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full" /> Your Net Profit</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-400 rounded-full" /> Institutional Shares</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-full" /> Staff Salaries</span>
         </div>
      </div>

      {/* --- RECENT TRANSACTIONS TABLE --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-black text-slate-900 uppercase tracking-tighter">Transaction Audit Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Date</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Client</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Total Paid</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Inst. Share</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Your Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td>
                </tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-bold text-slate-900">{sale.client_name}</td>
                  <td className="p-4 text-sm font-black text-slate-900">₦{Number(sale.amount).toLocaleString()}</td>
                  <td className="p-4 text-sm font-bold text-orange-600">₦{Number(sale.institution_cost || 0).toLocaleString()}</td>
                  <td className="p-4 text-sm font-black text-emerald-600">₦{(Number(sale.amount) - Number(sale.institution_cost || 0)).toLocaleString()}</td>
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
    <div className={`p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 ${highlight ? 'bg-slate-900 text-white' : 'bg-white'}`}>
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>{title}</p>
        <p className={`text-xl font-black ${highlight ? 'text-emerald-400' : 'text-slate-900'}`}>
          {isExpense ? '-' : ''}₦{amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}