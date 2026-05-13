"use client";

import React, { useEffect, useState } from 'react';
import { 
  Filter, 
  Search, 
  Plus, 
  ArrowDownWideNarrow,
  RefreshCw
} from 'lucide-react';
import { LeadsKanban } from '@/components/dashboard/LeadsKanban';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      setLeads(json);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Lead Conversion Pipeline</h1>
          <p className="text-slate-500 mt-1">Manage inbound inquiries and track them through to quoted jobs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLeads}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={loading ? "animate-spin w-5 h-5" : "w-5 h-5"} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Plus className="w-5 h-5" />
            Add New Lead
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, phone or address..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5 text-slate-400" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors">
            <ArrowDownWideNarrow className="w-5 h-5 text-slate-400" />
            Sort
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading your pipeline...</p>
        </div>
      ) : (
        <LeadsKanban initialLeads={leads} />
      )}
    </div>
  );
}
