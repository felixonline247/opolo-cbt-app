"use client";
import { LayoutDashboard, Users, Banknote, ShieldCheck, LogOut, Lock, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

const menuItems = [
  { 
    name: "Overview", 
    icon: <LayoutDashboard size={20} />, 
    path: "/dashboard",
    perm: "view_sales" 
  },
  { 
    name: "Students", 
    icon: <Users size={20} />, 
    path: "/dashboard/clients",
    perm: "manage_staff" 
  },
  { 
    name: "Sales Ledger", 
    icon: <Banknote size={20} />, 
    path: "/dashboard/sales",
    perm: "view_sales" 
  },
  { 
    name: "Staff Management", 
    icon: <Users size={20} />, 
    path: "/dashboard/staff",
    perm: "manage_staff" 
  },
  { 
    name: "Staff Payroll", 
    icon: <Wallet size={20} />, 
    path: "/dashboard/payroll", 
    perm: "view_payroll" 
  },
  { 
    name: "Access Control", 
    icon: <Lock size={20} />, 
    path: "/dashboard/settings/roles", 
    perm: "manage_settings" 
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { hasPermission, loading } = usePermissions();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col p-6 fixed left-0 top-0">
      <div className="mb-10 px-4">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
          Opolo <span className="text-blue-600">CBT</span>
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          // If we are still loading, don't hide the menu yet to avoid layout shift
          // but if loading is done and they don't have permission, hide it.
          const canSee = hasPermission(item.perm);

          if (!loading && !canSee) return null;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                pathname === item.path
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all mt-auto">
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
}