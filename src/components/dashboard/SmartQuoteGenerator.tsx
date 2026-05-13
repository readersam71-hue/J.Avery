"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Send, 
  FileText, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface SmartQuoteProps {
  lead: any;
  onSuccess?: () => void;
}

export function SmartQuoteGenerator({ lead, onSuccess }: SmartQuoteProps) {
  const [jobType, setJobType] = useState<'boiler' | 'bathroom' | 'emergency' | 'maintenance'>('emergency');
  const [loading, setLoading] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<any>(null);

  const generateQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          customerId: lead.customerId,
          jobType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedQuote(data);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Failed to generate smart quote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-blue-900 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-300" />
          <h3 className="text-xl font-bold font-display">Smart Quote Engine</h3>
        </div>
        <p className="text-blue-100/70 text-sm">Select job category to generate automated 3-tier pricing.</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Job Category</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'emergency', label: 'Emergency', icon: Zap },
              { id: 'boiler', label: 'Boiler', icon: FileText },
              { id: 'bathroom', label: 'Bathroom', icon: Sparkles },
              { id: 'maintenance', label: 'Maintenance', icon: CheckCircle2 },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setJobType(type.id as any)}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl border-2 transition-all font-bold text-sm",
                  jobType === type.id 
                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                    : "border-slate-100 hover:border-slate-200 text-slate-600"
                )}
              >
                <type.icon className={clsx("w-5 h-5", jobType === type.id ? "text-blue-600" : "text-slate-400")} />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {!generatedQuote ? (
          <button
            onClick={generateQuote}
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Generate 3-Tier Quote
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-green-900 text-lg">Quote Sent Successfully</h4>
              <p className="text-green-700 text-sm">3-tier pricing has been sent to the customer via SMS/WhatsApp.</p>
            </div>
            <button 
              onClick={() => setGeneratedQuote(null)}
              className="text-green-600 font-bold text-sm hover:underline"
            >
              Generate Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
