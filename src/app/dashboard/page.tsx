import { Users, TrendingUp, ShieldCheck, CreditCard } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* --- Stats Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Daily Revenue" value="₦145,000" icon={<CreditCard size={24}/>} color="bg-blue-500" />
        <StatCard title="New Clients" value="12" icon={<Users size={24}/>} color="bg-teal-500" />
        <StatCard title="Services Rendered" value="28" icon={<TrendingUp size={24}/>} color="bg-purple-500" />
        <StatCard title="Staff on Duty" value="5" icon={<ShieldCheck size={24}/>} color="bg-orange-500" />
      </div>

      {/* --- Recent Sales Table (Reconciliation) --- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900">Recent Transactions</h3>
          <button className="text-blue-600 text-sm font-bold hover:underline">View All Records</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Staff</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <TableRow client="Adeola John" service="JAMB CBT Prep" amount="₦5,000" staff="Michael B." status="Paid" />
            <TableRow client="Chidi Okafor" service="Consulting Session" amount="₦15,000" staff="Sarah K." status="Paid" />
            <TableRow client="Fatima Musa" service="WAEC Mock Exam" amount="₦3,500" staff="Michael B." status="Pending" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{title}</p>
        <h4 className="text-3xl font-black text-slate-900 mt-1">{value}</h4>
      </div>
      <div className={`${color} text-white p-3 rounded-2xl shadow-lg`}>
        {icon}
      </div>
    </div>
  );
}

function TableRow({ client, service, amount, staff, status }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition">
      <td className="px-6 py-4 font-bold text-slate-800">{client}</td>
      <td className="px-6 py-4 text-slate-600 text-sm">{service}</td>
      <td className="px-6 py-4 font-black text-blue-600">{amount}</td>
      <td className="px-6 py-4 text-slate-600 text-sm font-medium">{staff}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
          status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {status}
        </span>
      </td>
    </tr>
  );
}