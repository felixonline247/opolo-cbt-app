"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  UserPlus, UserX, Trash2, 
  Loader2, CheckCircle2, AlertCircle,
  Mail, Lock, Phone, CreditCard, X,
  Percent, CircleDollarSign, Info, Edit3, Save
} from "lucide-react";

function StaffManagementContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  // --- EDIT MODE STATE ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const [employeeData, setEmployeeData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    payment_type: "Monthly Salary",
    monthly_salary: "",
    commission_type: "percentage", 
    custom_rate: ""
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new" && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchStaffData();
  }, []);

  async function fetchStaffData() {
    setLoading(true);
    const { data: staffFromDb } = await supabase.from("staff").select("*").order("name");
    const { data: sales } = await supabase.from("sales").select("staff_name");
    
    const stats = sales?.reduce((acc: any, sale: any) => {
      const name = sale.staff_name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    if (staffFromDb) {
      const formattedStaff = staffFromDb.map(s => ({
        ...s,
        salesCount: stats?.[s.name] || 0
      }));
      setStaffList(formattedStaff);
    }
    setLoading(false);
  }

  // --- UPDATE LOGIC ---
  const handleUpdateStaff = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("staff")
      .update({
        monthly_salary: parseFloat(editData.monthly_salary) || 0,
        commission_type: editData.commission_type,
        custom_rate: parseFloat(editData.custom_rate) || 0
      })
      .eq("id", id);

    if (!error) {
      setMessage({ text: "Staff updated successfully", type: "success" });
      setEditingId(null);
      fetchStaffData();
    } else {
      setMessage({ text: error.message, type: "error" });
    }
    setLoading(false);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error: authError } = await supabase.auth.signUp({
      email: employeeData.email,
      password: employeeData.password,
      options: { data: { full_name: employeeData.full_name } }
    });

    if (authError) {
      setMessage({ text: authError.message, type: "error" });
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("staff").insert([{
      name: employeeData.full_name,
      email: employeeData.email,
      role: "Staff",
      monthly_salary: parseFloat(employeeData.monthly_salary) || 0,
      commission_type: employeeData.commission_type,
      custom_rate: parseFloat(employeeData.custom_rate) || 0,
    }]);

    if (dbError) {
      setMessage({ text: dbError.message, type: "error" });
    } else {
      setMessage({ text: "Staff account created successfully!", type: "success" });
      setEmployeeData({
        full_name: "", email: "", password: "", phone: "", 
        payment_type: "Monthly Salary", monthly_salary: "", 
        commission_type: "percentage", custom_rate: ""
      });
      fetchStaffData();
    }
    setLoading(false);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (confirm(`Permanentely remove ${name} from system?`)) {
      await supabase.from("staff").delete().eq("id", id);
      fetchStaffData();
    }
  };

  const isHighlighted = searchParams.get("action") === "new";

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Staff Management</h1>
        <p className="text-slate-500 font-medium mt-2">Control access and monitor performance.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CREATE ACCOUNT FORM */}
        <div ref={formRef} className={`bg-white p-8 rounded-[2.5rem] border transition-all duration-500 h-fit ${isHighlighted ? "border-blue-500 ring-4 ring-blue-500/20 shadow-2xl scale-[1.02]" : "border-slate-200 shadow-sm"}`}>
          <h2 className="font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <UserPlus size={16} className="text-blue-600"/> Create Account
          </h2>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Full Name</p>
              <input required type="text" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={employeeData.full_name} onChange={(e) => setEmployeeData({...employeeData, full_name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 ml-2 uppercase text-[9px]">Email</p>
                 <input required type="email" className="w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold outline-none text-sm" value={employeeData.email} onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 ml-2 uppercase text-[9px]">Password</p>
                 <input required type="password" title="Min 6 chars" className="w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold outline-none text-sm" value={employeeData.password} onChange={(e) => setEmployeeData({...employeeData, password: e.target.value})} />
               </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Monthly Base Salary (₦)</p>
              <input type="number" required value={employeeData.monthly_salary} onChange={e => setEmployeeData({...employeeData, monthly_salary: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" placeholder="0.00" />
            </div>

            <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-3">
              <div className="flex items-center gap-2 text-blue-700">
                <CircleDollarSign size={16} />
                <h4 className="font-black uppercase italic text-[10px] tracking-wider">Commission Settings</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={employeeData.commission_type} onChange={e => setEmployeeData({...employeeData, commission_type: e.target.value})} className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-xs outline-none">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₦)</option>
                </select>
                <input type="number" value={employeeData.custom_rate} onChange={e => setEmployeeData({...employeeData, custom_rate: e.target.value})} className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-xs outline-none" placeholder="0 = Global" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Register Staff"}
              </button>
              {isHighlighted && (
                <button type="button" onClick={() => router.push('/dashboard/staff')} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
              )}
            </div>

            {message.text && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {message.type === 'success' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                {message.text}
              </div>
            )}
          </form>
        </div>

        {/* STAFF LIST TABLE WITH INLINE EDITING */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="p-6">Staff Member</th>
                <th className="p-6">Earnings Detail</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((staff, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <p className="font-bold text-slate-900 uppercase leading-none">{staff.name}</p>
                    <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">{staff.role}</span>
                  </td>
                  
                  <td className="p-6">
                    {editingId === staff.id ? (
                      <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border">
                          <span className="text-[10px] font-black px-2">₦</span>
                          <input type="number" value={editData.monthly_salary} onChange={e => setEditData({...editData, monthly_salary: e.target.value})} className="bg-transparent outline-none font-bold text-xs w-24" />
                        </div>
                        <div className="flex gap-2">
                          <select value={editData.commission_type} onChange={e => setEditData({...editData, commission_type: e.target.value})} className="p-1 border rounded-lg text-[10px] font-bold bg-white">
                            <option value="percentage">%</option>
                            <option value="fixed">₦</option>
                          </select>
                          <input type="number" value={editData.custom_rate} onChange={e => setEditData({...editData, custom_rate: e.target.value})} className="p-1 border rounded-lg text-[10px] font-bold w-16 bg-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-slate-600">₦{Number(staff.monthly_salary).toLocaleString()} Base</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase italic">
                          {staff.custom_rate > 0 ? `${staff.custom_rate}${staff.commission_type === 'percentage' ? '%' : ' Fixed'}` : "Global Rate"}
                        </p>
                      </div>
                    )}
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {editingId === staff.id ? (
                        <>
                          <button onClick={() => handleUpdateStaff(staff.id)} className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95">
                            <Save size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(staff.id); setEditData({ ...staff }); }} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleDeleteStaff(staff.id, staff.name)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
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

export default function StaffManagement() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-blue-600" /></div>}>
      <StaffManagementContent />
    </Suspense>
  );
}