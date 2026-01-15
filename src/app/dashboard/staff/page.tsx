"use client";
import { useState, useEffect, useRef, Suspense } from "react"; // Added useRef
import { useSearchParams } from "next/navigation"; // Added hook
import { supabase } from "@/lib/supabase";
import { 
  UserPlus, UserX, Trash2, 
  Loader2, CheckCircle2, AlertCircle,
  Mail, Lock, Phone, CreditCard
} from "lucide-react";

// Inner component to handle search params logic
function StaffManagementContent() {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null); // Ref for scrolling/highlighting
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const [employeeData, setEmployeeData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    payment_type: "Monthly Salary"
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  // Check for ?action=new and trigger scroll/highlight
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
    const { data: sales } = await supabase.from("sales").select("staff_name");
    
    const stats = sales?.reduce((acc: any, sale: any) => {
      const name = sale.staff_name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const formattedStaff = Object.keys(stats || {}).map(name => ({
      name,
      salesCount: stats[name],
      status: "active"
    }));

    setStaffList(formattedStaff);
    setLoading(false);
  }

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email: employeeData.email,
      password: employeeData.password,
      options: { 
        data: { 
          full_name: employeeData.full_name,
          phone: employeeData.phone,
          payment_type: employeeData.payment_type
        } 
      }
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Staff account created successfully!", type: "success" });
      setEmployeeData({
        full_name: "", email: "", password: "", phone: "", payment_type: "Monthly Salary"
      });
      fetchStaffData();
    }
    setLoading(false);
  };

  const handleDeactivate = async (staffName: string) => {
    const confirm = window.confirm(`Are you sure you want to deactivate ${staffName}?`);
    if (confirm) {
      alert(`${staffName} deactivated.`);
      fetchStaffData();
    }
  };

  const isHighlighted = searchParams.get("action") === "new";

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Staff Management</h1>
        <p className="text-slate-500 font-medium">Control access and monitor performance.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ADD STAFF FORM WITH HIGHLIGHT LOGIC */}
        <div 
          ref={formRef}
          className={`bg-white p-8 rounded-[2.5rem] border transition-all duration-500 h-fit ${
            isHighlighted 
              ? "border-blue-500 ring-4 ring-blue-500/20 shadow-2xl scale-[1.02]" 
              : "border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <UserPlus size={16} className={isHighlighted ? "text-blue-600 animate-pulse" : "text-blue-600"}/> 
            Create Account
          </h2>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Full Name</p>
              <input required type="text" placeholder="John Doe" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                value={employeeData.full_name} onChange={(e) => setEmployeeData({...employeeData, full_name: e.target.value})} />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Login Email</p>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="email" placeholder="email@opolo.com" className="w-full pl-12 pr-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                  value={employeeData.email} onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Password</p>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="password" placeholder="••••••••" className="w-full pl-12 pr-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                  value={employeeData.password} onChange={(e) => setEmployeeData({...employeeData, password: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Phone Number</p>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="tel" placeholder="08012345678" className="w-full pl-12 pr-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                  value={employeeData.phone} onChange={(e) => setEmployeeData({...employeeData, phone: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 ml-2 uppercase">Payment Structure</p>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={employeeData.payment_type}
                  onChange={(e) => setEmployeeData({...employeeData, payment_type: e.target.value})}
                >
                  <option value="Monthly Salary">Monthly Salary</option>
                  <option value="Commission">Commission per Service</option>
                </select>
              </div>
            </div>

            <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95">
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

        {/* STAFF LIST */}
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
                <tr key={i} className="group hover:bg-slate-50/50">
                  <td className="p-6">
                    <p className="font-bold text-slate-900 uppercase">{staff.name}</p>
                    <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-500">{staff.salesCount} Sales recorded</td>
                  <td className="p-6 text-right space-x-2">
                    <button onClick={() => handleDeactivate(staff.name)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <UserX size={18} />
                    </button>
                    <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
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

// Main component wrapped in Suspense (Required for useSearchParams)
export default function StaffManagement() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-blue-600" /></div>}>
      <StaffManagementContent />
    </Suspense>
  );
}