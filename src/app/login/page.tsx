"use client";
import { useState } from "react";
// 1. Swap the old client for the SSR-compatible browser client
import { createBrowserClient } from "@supabase/ssr"; 
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 2. Initialize the SSR Browser Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // 3. Use router.refresh() before push to ensure the 
      // middleware recognizes the newly set cookies
      router.refresh(); 
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Staff Access</h2>
          <p className="text-slate-500 mt-2 font-medium">Opolo CBT Resort Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900"
                placeholder="staff@opolocbt.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black uppercase italic tracking-widest rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}