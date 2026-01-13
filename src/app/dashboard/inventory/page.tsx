"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Plus, Minus, RefreshCw, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInventory(); }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data } = await supabase.from("inventory").select("*").order("item_name");
    if (data) setItems(data);
    setLoading(false);
  }

  async function updateStock(id: string, currentStock: number, amount: number) {
    const { error } = await supabase
      .from("inventory")
      .update({ stock_quantity: currentStock + amount })
      .eq("id", id);
    
    if (!error) fetchInventory();
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Stock & Inventory</h1>
        <p className="text-slate-500 font-medium">Manage scratch cards and training materials.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className={`p-8 rounded-[2.5rem] border bg-white shadow-sm ${item.stock_quantity < 10 ? 'border-orange-500' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${item.stock_quantity < 10 ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                <Package size={24} />
              </div>
              {item.stock_quantity < 10 && (
                <div className="flex items-center gap-1 text-orange-600 font-bold text-[10px] uppercase">
                  <AlertTriangle size={12}/> Low Stock
                </div>
              )}
            </div>
            
            <h3 className="font-black text-slate-900 uppercase italic tracking-tight">{item.item_name}</h3>
            <p className="text-4xl font-black text-slate-900 my-2">{item.stock_quantity}</p>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">Units remaining</p>

            <div className="flex gap-2">
              <button 
                onClick={() => updateStock(item.id, item.stock_quantity, 10)}
                className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add 10
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}