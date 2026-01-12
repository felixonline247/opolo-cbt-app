"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Set New Password</h1>
          <p className="text-slate-500 text-sm">Enter your new secure password below.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : null}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}