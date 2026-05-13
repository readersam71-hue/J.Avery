import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, description }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-50 rounded-xl">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        {trend && (
          <div className={clsx(
            "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg",
            trend.isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          )}>
            {trend.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
        {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
      </div>
    </div>
  );
}
