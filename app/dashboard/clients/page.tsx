"use client";
import { useState } from "react";
import { Search, UserPlus, Filter, MoreHorizontal, MessageSquare, History } from "lucide-react";

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  // Placeholder data for Opolo CBT clients
  const clients = [
    { id: 1, name: "Chisom Okafor", email: "chisom@example.com", phone: "08012345678", parent: "Mr. Okafor", lastService: "JAMB Prep", totalSpent: "₦15,000" },
    { id: 2, name: "Tunde Bakare", email: "tunde@example.com", phone: "08198765432", parent: "Mrs. Bakare", lastService: "WAEC Mock", totalSpent: "₦5,000" },
    { id: 3, name: "Amina Yusuf", email: "amina@example.com", phone: "09011223344", parent: "Alh. Yusuf", lastService: "Consulting", totalSpent: "₦25,000" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Client Database</h1>
          <p className="text-slate-500 font-medium">Manage student records and parent contact information.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
          <UserPlus size={20} /> Add New Client
        </button>
      </header>

      {/* --- Filter Bar --- */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by student name, parent name, or phone..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition">
          <Filter size={20} />
        </button>
      </div>

      {/* --- Client Grid --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {clients.map((client) => (
          <div key={client.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                  <p className="text-xs text-slate-500 font-medium italic">Parent: {client.parent}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Phone</p>
                <p className="text-sm font-semibold text-slate-700">{client.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Last Service</p>
                <p className="text-sm font-semibold text-slate-700">{client.lastService}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Revenue</p>
                <p className="text-lg font-black text-blue-600">{client.totalSpent}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition">
                  <MessageSquare size={18} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition">
                  <History size={16} /> View History
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}