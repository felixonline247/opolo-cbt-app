"use client"; // Required for interactivity and hooks

import { useState } from "react";
import { supabase } from "@/lib/supabase"; // Path to your Supabase client

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // THIS IS THE CODE YOU PASTE:
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://opolo-cbt-app.vercel.app/dashboard/update-password',
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Check your email for the reset link!");
    }
  };

  return (
    <form onSubmit={handleResetRequest}>
      <input 
        type="email" 
        placeholder="Enter your email" 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <button type="submit">Send Reset Email</button>
    </form>
  );
}