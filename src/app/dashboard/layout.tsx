import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Wallet, 
  Settings, 
  LogOut, 
  ShieldCheck,
  UserPlus // Added for the New Staff button
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <div className="text-xl font-black tracking-tighter text-blue-600">
            OPOLO<span className="text-slate-900">CBT</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" href="/dashboard" />
          <NavItem icon={<Users size={20}/>} label="Clients/Students" href="/dashboard/clients" />
          {/* New: Link to the Staff Management page */}
          <NavItem icon={<ShieldCheck size={20}/>} label="Staff Management" href="/dashboard/staff" />
          <NavItem icon={<Receipt size={20}/>} label="Daily Sales" href="/dashboard/sales" />
          <NavItem icon={<Wallet size={20}/>} label="Staff Payroll" href="/dashboard/payroll" />
          
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</div>
          <NavItem icon={<Settings size={20}/>} label="Settings" href="/dashboard/settings" />
        </nav>

        {/* --- ACTION BUTTON AREA --- */}
        <div className="p-4 space-y-2 border-t border-slate-100">
          {/* THE NEW STAFF QUICK-ACTION BUTTON */}
          <Link 
            href="/dashboard/staff?action=new"
            className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <UserPlus size={18} />
            <span>New Staff</span>
          </Link>

          <button className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition font-medium">
            <LogOut size={20} className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="font-bold text-slate-800 tracking-tight italic uppercase text-sm">Opolo Management System</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">Admin User</p>
              <p className="text-xs text-slate-500">Super Administrator</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 overflow-y-auto p-8">
          {children}
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, href }: any) {
  // Note: For 'active' state logic, you can use usePathname() from next/navigation
  return (
    <Link 
      href={href} 
      className="flex items-center px-4 py-3 rounded-xl font-semibold transition text-slate-500 hover:bg-slate-50 hover:text-blue-600 group"
    >
      <span className="mr-3 text-slate-400 group-hover:text-blue-600 transition-colors">{icon}</span>
      {label}
    </Link>
  );
}