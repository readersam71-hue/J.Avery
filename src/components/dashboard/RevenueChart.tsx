"use client";

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 1900 },
  { name: 'Wed', revenue: 1500 },
  { name: 'Thu', revenue: 2400 },
  { name: 'Fri', revenue: 3100 },
  { name: 'Sat', revenue: 1800 },
  { name: 'Sun', revenue: 900 },
];

export function RevenueChart() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">Revenue Over Time</h3>
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-600 font-medium outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 12 Months</option>
        </select>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `£${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              formatter={(value) => [`£${value}`, 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#2563eb" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
