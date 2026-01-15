"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Wallet, Clock, CheckCircle, Search, 
  Loader2, Plus, History, X, CalendarDays, Printer,
  Banknote, ArrowUpRight, Percent, ChevronLeft, ChevronRight, Calendar
} from "lucide-react";

export default function UnifiedPayrollPage() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [commissionRate, setCommissionRate] = useState(0);
  
  // --- DATE FILTER STATE ---
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal States
  const [historyStaff, setHistoryStaff] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", role: "", monthly_salary: "", payment_type: "Salary" });

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Global Commission Rate
    const { data: settings } = await supabase.from('settings').select('commission_rate').single();
    const rate = settings?.commission_rate || 0;
    setCommissionRate(rate);

    // 2. Define Date Range for the Selected Month
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString();
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // 3. Fetch Staff, Payouts, and Filtered Sales
    const { data: staffData } = await supabase.from("staff").select("*").order('name');
    const { data: payoutData } = await supabase.from("payouts").select("*").order('created_at', { ascending: false });
    
    // Only fetch sales that happened in the selected month
    const { data: salesData } = await supabase
      .from("sales")
      .select("staff_name, amount, created_at")
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    if (staffData) {
      const enrichedStaff = staffData.map(member => {
        const staffSales = salesData?.filter(s => s.staff_name === member.name) || [];
        const totalSalesVolume = staffSales.reduce((sum, s) => sum + (s.amount || 0), 0);
        const earnedCommission = totalSalesVolume * (rate / 100);

        return {
          ...member,
          salesCount: staffSales.length,
          totalSalesVolume,
          earnedCommission,
          totalDue: (Number(member.monthly_salary) || 0) + earnedCommission
        };
      });
      setStaff(enrichedStaff);
    }

    if (payoutData) setPayouts(payoutData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  // --- DATE NAVIGATION HANDLERS ---
  const prevMonth = () => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)));
  const nextMonth = () => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)));

  const handleRecordPayment = async (member: any) => {
    const monthLabel = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const confirmPay = confirm(`Confirm total payment of ₦${member.totalDue.toLocaleString()} for ${member.name} (${monthLabel})?`);
    if (confirmPay) {
      await supabase.from("payouts").insert([{
        staff_id: member.id,
        amount_paid: member.totalDue,
        month_for: monthLabel,
        status: 'Paid'
      }]);
      fetchData();
    }
  };

  const isPaidThisMonth = (staffId: string) => {
    const monthLabel = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    return payouts.some(p => p.staff_id === staffId && p.month_for === monthLabel);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase leading-none tracking-tight">Payroll Engine</h1>
          
          {/* --- DATE PICKER UI --- */}
          <div className="flex items-center gap-3 mt-4 bg-white border border-slate-200 p-2 rounded-2xl w-fit shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft size={20}/></button>
            <div className="flex items-center gap-2 px-3">
              <Calendar size={16} className="text-blue-600" />
              <span className="font-black uppercase italic text-sm text-slate-700 min-w-[140px] text-center">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight size={20}/></button>
          </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-95">
          <Plus size={20} /> Add Staff
        </button>
      </header>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Projected Payout</p>
          <h3 className="text-4xl font-black italic tracking-tighter">₦{staff.reduce((s, a) => s + a.totalDue, 0).toLocaleString()}</h3>
          <Banknote className="absolute -right-4 -bottom-4 text-white/10" size={100} />
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Commission ({commissionRate}%)</p>
          <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter text-blue-600">₦{staff.reduce((s, a) => s + a.earnedCommission, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Tickets</p>
          <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{staff.reduce((s, a) => s + a.salesCount, 0)}</h3>
        </div>
      </div>

      

      {/* --- Main Table --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="p-8">Staff Member</th>
              <th className="p-8">Base Salary</th>
              <th className="p-8">Commissions</th>
              <th className="p-8 text-right">Net Due</th>
              <th className="p-8 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((member) => {
              const paid = isPaidThisMonth(member.id);
              return (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="p-8">
                    <p className="font-bold text-slate-900 uppercase leading-none">{member.name}</p>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{member.role}</span>
                  </td>
                  <td className="p-8 font-bold text-slate-600">₦{Number(member.monthly_salary).toLocaleString()}</td>
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="text-blue-600 font-black">₦{member.earnedCommission.toLocaleString()}</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase">{member.salesCount} Sales</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <p className={`text-xl font-black italic tracking-tighter ${paid ? 'text-slate-300' : 'text-slate-900'}`}>
                      ₦{member.totalDue.toLocaleString()}
                    </p>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setHistoryStaff(member)} className="p-2 text-slate-300 hover:text-blue-600 transition">
                        <History size={20} />
                      </button>
                      {paid ? (
                        <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px] uppercase bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                          <CheckCircle size={14}/> Paid
                        </div>
                      ) : (
                        <button onClick={() => handleRecordPayment(member)} className="bg-slate-900 text-white text-[10px] font-black px-5 py-3 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-slate-100">
                          PROCESS
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODALS (Assume they stay the same as previous logic) */}
    </div>
  );
}