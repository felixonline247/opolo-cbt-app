"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Wallet, Clock, CheckCircle, Search, 
  Loader2, Plus, History, X, CalendarDays, Printer 
} from "lucide-react";

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyStaff, setHistoryStaff] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", role: "", monthly_salary: "" });

  const fetchData = async () => {
    setLoading(true);
    const { data: staffData } = await supabase.from("staff").select("*").order('name');
    const { data: payoutData } = await supabase.from("payouts").select("*").order('created_at', { ascending: false });
    if (staffData) setStaff(staffData);
    if (payoutData) setPayouts(payoutData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- NEW PRINT SLIP FUNCTION ---
  const handlePrintSlip = (payout: any, staff: any) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Salary Slip - ${staff.name}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              .header { text-align: center; border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 28px; letter-spacing: -1px; text-transform: uppercase; italic; }
              .header p { margin: 5px 0 0; color: #64748b; font-weight: bold; }
              .content { background: #f8fafc; padding: 30px; border-radius: 20px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
              .label { font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 800; letter-spacing: 1px; }
              .value { font-weight: 700; color: #0f172a; }
              .amount { font-size: 24px; font-weight: 900; color: #2563eb; }
              .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
              .signature { border-top: 2px solid #0f172a; width: 200px; text-align: center; padding-top: 10px; font-size: 12px; font-weight: bold; }
              .stamp { border: 4px double #10b981; color: #10b981; padding: 10px 20px; font-weight: 900; transform: rotate(-15deg); font-size: 20px; border-radius: 10px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>OPOLO CBT RESORT</h1>
              <p>Salary Payment Voucher</p>
            </div>
            <div class="content">
              <div class="row"><span class="label">Staff Name</span> <span class="value">${staff.name}</span></div>
              <div class="row"><span class="label">Designation</span> <span class="value">${staff.role}</span></div>
              <div class="row"><span class="label">Payment For</span> <span class="value">${payout.month_for}</span></div>
              <div class="row"><span class="label">Date Paid</span> <span class="value">${new Date(payout.created_at).toLocaleDateString()}</span></div>
              <div class="row" style="border:none; margin-top:20px;">
                <span class="label">Net Amount Paid</span> 
                <span class="amount">₦${Number(payout.amount_paid).toLocaleString()}</span>
              </div>
            </div>
            <div class="footer">
              <div class="signature">Staff Signature</div>
              <div class="stamp">PAID</div>
              <div class="signature">Authorized Admin</div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from("staff").insert([{ 
      name: newStaff.name, 
      role: newStaff.role, 
      monthly_salary: parseFloat(newStaff.monthly_salary) 
    }]);
    if (!error) {
      setIsModalOpen(false);
      setNewStaff({ name: "", role: "", monthly_salary: "" });
      fetchData();
    }
    setIsSaving(false);
  };

  const handleRecordPayment = async (member: any) => {
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const confirmPay = confirm(`Confirm ₦${member.monthly_salary} payment for ${member.name} (${month})?`);
    if (confirmPay) {
      await supabase.from("payouts").insert([{
        staff_id: member.id,
        amount_paid: member.monthly_salary,
        month_for: month,
        status: 'Paid'
      }]);
      fetchData();
    }
  };

  const isPaidThisMonth = (staffId: string) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    return payouts.some(p => p.staff_id === staffId && p.month_for === currentMonth);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase">Staff Payroll</h1>
          <p className="text-slate-500 font-medium">Manage employees and monthly payouts.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          <Plus size={20} /> Add New Staff
        </button>
      </header>

      {/* --- Payroll Table --- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
            <tr>
              <th className="px-8 py-5">Staff Member</th>
              <th className="px-8 py-5">Monthly Salary</th>
              <th className="px-8 py-5">Current Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((member) => {
              const paid = isPaidThisMonth(member.id);
              return (
                <tr key={member.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-900">{member.name}</p>
                    <p className="text-[10px] uppercase text-slate-400 font-black">{member.role}</p>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-700">₦{Number(member.monthly_salary).toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase gap-1.5 ${paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {paid ? <CheckCircle size={12}/> : <Clock size={12}/>} {paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right flex justify-end gap-2">
                    <button onClick={() => setHistoryStaff(member)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition" title="View History">
                      <History size={18} />
                    </button>
                    {!paid && (
                      <button onClick={() => handleRecordPayment(member)} className="text-xs font-black text-white bg-slate-900 px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition">
                        Pay Salary
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- HISTORY MODAL WITH PRINT BUTTON --- */}
      {historyStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setHistoryStaff(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <div className="mb-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">{historyStaff.name}</h2>
              <p className="text-slate-500 text-sm font-bold uppercase">Payment History Log</p>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {payouts.filter(p => p.staff_id === historyStaff.id).length > 0 ? (
                payouts.filter(p => p.staff_id === historyStaff.id).map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><CalendarDays size={20} /></div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{payout.month_for}</p>
                        <p className="font-black text-blue-600 text-xs">₦{Number(payout.amount_paid).toLocaleString()}</p>
                      </div>
                    </div>
                    {/* PRINT SLIP BUTTON */}
                    <button 
                      onClick={() => handlePrintSlip(payout, historyStaff)}
                      className="p-2 bg-white text-slate-400 hover:text-blue-600 border border-slate-200 rounded-lg hover:border-blue-200 transition-all flex items-center gap-1 text-[10px] font-black uppercase"
                    >
                      <Printer size={14} /> Slip
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 font-medium">No payment records found for this staff.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ADD STAFF MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-6 italic uppercase">Register Employee</h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <input placeholder="Full Name" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} />
              <input placeholder="Job Role" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" onChange={(e) => setNewStaff({...newStaff, role: e.target.value})} />
              <input type="number" placeholder="Salary (₦)" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-blue-600" onChange={(e) => setNewStaff({...newStaff, monthly_salary: e.target.value})} />
              <button disabled={isSaving} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition">
                {isSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Save Employee"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}