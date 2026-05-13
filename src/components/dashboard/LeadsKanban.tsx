"use client";

import React, { useState } from 'react';
import { 
  MoreVertical, 
  Plus, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  MapPin,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { LeadDetailPanel } from './LeadDetailPanel';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  inquiryDetails: string;
  createdAt: string;
  customer?: any;
}

const columns = [
  { id: 'new', title: 'New Inquiries', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Attempted Contact', color: 'bg-yellow-500' },
  { id: 'quoted', title: 'Quoted', color: 'bg-purple-500' },
  { id: 'converted', title: 'Converted', color: 'bg-green-500' },
];

export function LeadsKanban({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const getLeadsByStatus = (status: string) => leads.filter(l => l.status === status);

  return (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[70vh]">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={clsx("w-2 h-2 rounded-full", column.color)}></div>
                <h3 className="font-bold text-slate-700">{column.title}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {getLeadsByStatus(column.id).length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 bg-slate-100/50 rounded-2xl p-3 space-y-4 border border-slate-200/50">
              {getLeadsByStatus(column.id).map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onClick={() => setSelectedLead(lead)} 
                />
              ))}
              
              <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold text-sm hover:border-slate-400 hover:text-slate-500 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedLead && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            onClick={() => setSelectedLead(null)}
          ></div>
          <LeadDetailPanel 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)} 
          />
        </>
      )}
    </div>
  );
}

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const isEmergency = lead.priority === 'emergency';

  return (
    <div 
      onClick={onClick}
      className={clsx(
      "bg-white p-4 rounded-xl shadow-sm border-2 transition-all hover:shadow-md cursor-pointer group",
      isEmergency ? "border-red-500 animate-pulse" : "border-transparent hover:border-blue-200"
    )}>
      <div className="flex justify-between items-start mb-3">
        <div className={clsx(
          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
          isEmergency ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
        )}>
          {lead.priority}
        </div>
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(lead.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
        {lead.firstName} {lead.lastName}
      </h4>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
        {lead.inquiryDetails}
      </p>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-blue-600" />
          </div>
          <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-green-700">
            £
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 flex items-center gap-1">
          Details <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
