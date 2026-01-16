"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions"; // Import the hook
import ProtectedRoute from "@/components/ProtectedRoute"; // Import the wrapper
import { 
  Wallet, Clock, CheckCircle, Search, 
  Loader2, Plus, History, X, CalendarDays, Printer,
  Banknote, ArrowUpRight, Percent, ChevronLeft, ChevronRight, Calendar,
  UserPlus, Settings
} from "lucide-react";

function PayrollContent() {
  const { hasPermission } = usePermissions(); // Initialize permission check
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [globalCommissionRate, setGlobalCommissionRate] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historyStaff, setHistoryStaff] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: settings } = await supabase.from('settings').select('commission_rate').single();
    const globalRate = settings?.commission_rate || 0;
    setGlobalCommissionRate(globalRate);

    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString();
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data: staffData } = await supabase.from("staff").select("*, roles(name)").order('name');
    const { data: payoutData } = await supabase.from("payouts").select("*").order('created_at', { ascending: false });
    const { data: salesData } = await supabase
      .from("sales")
      .select("staff_name, amount, created_at")
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    if (staffData) {
      const enrichedStaff = staffData.map(member => {
        const staffSales = salesData?.filter(s => s.staff_name === member.name) || [];
        const totalSalesVolume = staffSales.reduce((sum, s) => sum + (s.amount || 0), 0);
        
        let earnedCommission = 0;
        let logicLabel = "";

        if (member.commission_type === 'fixed') {
          const rate = Number(member.custom_rate) || 0;
          earnedCommission = rate * staffSales.length;
          logicLabel = `₦${rate.toLocaleString()} Fixed x ${staffSales.length}`;
        } else if (member.commission_type === 'percentage' && Number(member.custom_rate) > 0) {
          const rate = Number(member.custom_rate);
          earnedCommission = totalSalesVolume * (rate / 100);
          logicLabel = `${rate}% of ₦${totalSalesVolume.toLocaleString()}`;
        } else {
          earnedCommission = totalSalesVolume * (globalRate / 100);
          logicLabel = `${globalRate}% Global Rate`;
        }

        return {
          ...member,
          salesCount: staffSales.length,
          totalSalesVolume,
          earnedCommission,
          logicLabel,
          totalDue: (Number(member.monthly_salary) || 0) + earnedCommission
        };
      });
      setStaff(enrichedStaff);
    }

    if (payoutData) setPayouts(payoutData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  const prevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const nextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

  const handleRecordPayment = async (member: any) => {
    const monthLabel = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const confirmPay = confirm(`Confirm total payment of ₦${member.totalDue.toLocaleString()} for ${member.name}?`);
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

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase leading-none tracking-tight">Payroll Engine</h1>
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

        {/* HIDDEN BUTTON: Only visible if user can manage staff */}
        {hasPermission('manage_staff') && (
          <div className="flex gap-3">
              <a href="/dashboard/staff" className="bg-white border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                  <Settings size={20} /> Configure Staff
              </a>
          </div>
        )}
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Total Month Payout</p>
          <h3 className="text-4xl font-black italic tracking-tighter">₦{staff.reduce((s, a) => s + a.totalDue, 0).toLocaleString()}</h3>
          <Banknote className="absolute -right-4 -bottom-4 text-white/5" size={100} />
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Commissions</p>
          <h3 className="text-4xl font-black text-blue-600 italic tracking-tighter">₦{staff.reduce((s, a) => s + a.earnedCommission, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tickets Generated</p>
          <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{staff.reduce((s, a) => s + a.salesCount, 0)}</h3>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-8">Staff Member</th>
                <th className="p-8">Base Salary</th>
                <th className="p-8">Commission Earned</th>
                <th className="p-8 text-right">Net Total Due</th>
                <th className="p-8 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => {
                const paid = isPaidThisMonth(member.id);
                return (
                  <tr key={member.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                            {member.name[0]}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 uppercase leading-none">{member.name}</p>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{member.roles?.name || "Staff"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 font-bold text-slate-600">
                        ₦{Number(member.monthly_salary || 0).toLocaleString()}
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-blue-600 font-black">₦{member.earnedCommission.toLocaleString()}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 w-fit px-2 py-0.5 rounded mt-1">
                          {member.logicLabel}
                        </span>
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <p className={`text-xl font-black italic tracking-tighter ${paid ? 'text-slate-300' : 'text-slate-900'}`}>
                        ₦{member.totalDue.toLocaleString()}
                      </p>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button onClick={() => setHistoryStaff(member)} className="p-2 text-slate-300 hover:text-blue-600 transition">
                          <History size={20} />
                        </button>
                        
                        {/* HIDDEN ACTION: Only show "PAY NOW" if user has process_payouts permission */}
                        {paid ? (
                          <div className="flex items-center gap-1 text-emerald-500 font-black text-[9px] uppercase bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                            <CheckCircle size={12}/> Disbursed
                          </div>
                        ) : (
                          hasPermission('process_payouts') && (
                            <button 
                              onClick={() => handleRecordPayment(member)} 
                              className="bg-blue-600 text-white text-[10px] font-black px-6 py-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                            >
                              PAY NOW
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// WRAP ENTIRE PAGE IN PROTECTED ROUTE
export default function UnifiedPayrollPage() {
  return (
    <ProtectedRoute requiredPermission="view_payroll">
      <PayrollContent />
    </ProtectedRoute>
  );
}