import React from 'react';
import { User, TrendingUp, Briefcase } from 'lucide-react';

interface TechROI {
  name: string;
  revenue: number;
  jobCount: number;
}

interface TechROITableProps {
  data: TechROI[];
}

export function TechROITable({ data }: TechROITableProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Technician Performance (30 Days)</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="pb-4 font-bold">Technician</th>
              <th className="pb-4 font-bold text-center">Jobs</th>
              <th className="pb-4 font-bold text-right">Revenue</th>
              <th className="pb-4 font-bold text-right">Efficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((tech) => (
              <tr key={tech.name} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-700">{tech.name}</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">
                    <Briefcase className="w-3.5 h-3.5" />
                    {tech.jobCount}
                  </div>
                </td>
                <td className="py-4 text-right font-bold text-slate-900">
                  £{tech.revenue.toLocaleString()}
                </td>
                <td className="py-4 text-right">
                  <div className="inline-flex items-center gap-1 text-green-600 font-bold text-sm">
                    <TrendingUp className="w-4 h-4" />
                    {Math.round((tech.revenue / (tech.jobCount || 1)) / 10)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
