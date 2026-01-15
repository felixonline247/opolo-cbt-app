"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, Users, Receipt, Wallet, 
  Settings, LogOut, ShieldCheck, UserPlus,
  Camera, Loader2 // Added for Avatar upload
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // --- AVATAR & USER STATE ---
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState("Admin User");

  // Fetch user profile on load
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || "Admin User");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    }
    getProfile();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    else {
      router.push("/login");
      router.refresh();
    }
  };

  // --- UPLOAD LOGIC ---
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      // 1. Upload to Supabase Storage (Bucket must be named 'avatars')
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update the User Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      alert("Profile photo updated!");
    } catch (error: any) {
      alert("Error uploading: " + error.message);
    } finally {
      setUploading(false);
    }
  };

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
          <NavItem icon={<ShieldCheck size={20}/>} label="Staff Management" href="/dashboard/staff" />
          <NavItem icon={<Receipt size={20}/>} label="Daily Sales" href="/dashboard/sales" />
          <NavItem icon={<Wallet size={20}/>} label="Staff Payroll" href="/dashboard/payroll" />
          
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</div>
          <NavItem icon={<Settings size={20}/>} label="Settings" href="/dashboard/settings" />
        </nav>

        <div className="p-4 space-y-2 border-t border-slate-100">
          <Link 
            href="/dashboard/staff?action=new"
            className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <UserPlus size={18} />
            <span>New Staff</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut size={20} className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="font-bold text-slate-800 tracking-tight italic uppercase text-sm">Opolo Management System</h2>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">{userName}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Super Administrator</p>
            </div>

            {/* CLICKABLE AVATAR */}
            <div className="relative group">
              <label htmlFor="avatar-input" className="cursor-pointer block">
                <div className="w-12 h-12 bg-blue-100 border-2 border-white ring-2 ring-slate-100 rounded-full flex items-center justify-center overflow-hidden shadow-sm hover:ring-blue-400 transition-all relative">
                  {uploading ? (
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-700 font-bold">{userName.substring(0, 2).toUpperCase()}</span>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={16} className="text-white" />
                  </div>
                </div>
              </label>
              <input 
                type="file" 
                id="avatar-input" 
                className="hidden" 
                accept="image/*" 
                onChange={uploadAvatar} 
                disabled={uploading}
              />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          {children}
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, href }: any) {
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