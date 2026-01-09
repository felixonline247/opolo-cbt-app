"use client";
import { useState } from "react";
import { Wallet, ArrowUpRight, Clock, CheckCircle, Search } from "lucide-react";

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for reconciliation
  const staffPayments = [
    { id: 1, name: "Michael B.", role: "CBT Supervisor", salesGenerated: 120000, commission: 12000, status: "Pending" },
    { id: 2, name: "Sarah K.", role: "Consultant", salesGenerated: 85000, commission: 8500, status: "Paid" },
    { id: 3, name: "David O.", role: "Admin Staff", salesGenerated: 45000, commission: 4500, status: "Pending" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Staff Payroll</h1>
          <p className="text-slate-500 font-medium">Reconcile services rendered with daily records.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Generate Payroll Report
          </button>
        </div>
      </header>

      {/* --- Search & Filter --- */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search staff by name..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- Payroll Table --- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th className="px-8 py-5">Staff Member</th>
              <th className="px-8 py-5">Sales Generated</th>
              <th className="px-8 py-5">Comm. Owed (10%)</th>
              <th className="px-8 py-5">Payment Status</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffPayments.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-50/50 transition">
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-900">{staff.name}</p>
                  <p className="text-xs text-slate-500">{staff.role}</p>
                </td>
                <td className="px-8 py-6 font-medium text-slate-700">
                  ₦{staff.salesGenerated.toLocaleString()}
                </td>
                <td className="px-8 py-6 font-black text-blue-600">
                  ₦{staff.commission.toLocaleString()}
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase gap-1.5 ${
                    staff.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {staff.status === 'Paid' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                    {staff.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-sm font-bold text-slate-900 hover:text-blue-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-white transition">
                    Record Payment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Total Summary Card --- */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Monthly Payroll Owed</p>
            <h3 className="text-3xl font-black">₦25,000.00</h3>
          </div>
        </div>
        <button className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition shadow-xl">
          Complete All Pending Payments
        </button>
      </div>
    </div>
  );
}