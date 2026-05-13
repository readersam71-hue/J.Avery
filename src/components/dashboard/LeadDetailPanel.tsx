"use client";

import React from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  History,
  MessageSquare,
  Zap
} from 'lucide-react';
import { SmartQuoteGenerator } from './SmartQuoteGenerator';

interface LeadDetailPanelProps {
  lead: any;
  onClose: () => void;
}

export function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
  if (!lead) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-slate-50 shadow-2xl border-l border-slate-200 z-50 overflow-y-auto">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{lead.firstName} {lead.lastName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lead Details</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{lead.status}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
              <p className="font-bold text-slate-700">{lead.customer?.phone || lead.phone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
              <p className="font-bold text-slate-700">{lead.customer?.email || lead.email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Service Location</p>
              <p className="font-bold text-slate-700">
                {lead.customer?.addressLine1}, {lead.customer?.city}, {lead.customer?.postcode}
              </p>
            </div>
          </div>
        </div>

        {/* Inquiry Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Customer Inquiry
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 italic text-slate-600 leading-relaxed">
            &quot;{lead.inquiryDetails}&quot;
          </div>
        </div>

        {/* Smart Quote Generator */}
        {lead.status === 'new' || lead.status === 'contacted' ? (
          <SmartQuoteGenerator lead={lead} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-slate-900">Quote Already Sent</h4>
            <p className="text-slate-500 text-sm mt-1">This lead has already been quoted. Check the Quotes section for history.</p>
            <button className="mt-4 px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors">
              View Existing Quote
            </button>
          </div>
        )}

        {/* Priority Alert */}
        {lead.priority === 'emergency' && (
          <div className="bg-red-900 text-white p-5 rounded-2xl flex items-center gap-4 shadow-lg shadow-red-900/20">
            <div className="w-10 h-10 bg-red-800 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <h4 className="font-bold text-red-100">Emergency Lead</h4>
              <p className="text-red-200/80 text-xs">Customer expects response within 60 minutes. SMS follow-up sent automatically.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
