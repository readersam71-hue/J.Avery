"use client";

import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Target, 
  BarChart3, 
  ArrowUpRight, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TechROITable } from '@/components/dashboard/TechROITable';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/dashboard/analytics');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Revenue Optimization Center</h1>
        <p className="text-slate-500 mt-1">Real-time performance metrics for J.Avery Plumbing & Heating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Today's Revenue" 
          value={`£${data?.todayRevenue || 0}`} 
          icon={DollarSign}
          trend={{ value: '12%', isPositive: true }}
          description="Target: £1,500/day"
        />
        <MetricCard 
          title="Conversion Rate" 
          value={`${data?.conversionRate?.toFixed(1) || 0}%`} 
          icon={Target}
          trend={{ value: '5%', isPositive: true }}
          description="Target: 70%"
        />
        <MetricCard 
          title="Avg Job Value" 
          value={`£${data?.avgJobValue?.toFixed(0) || 0}`} 
          icon={BarChart3}
          trend={{ value: '8%', isPositive: true }}
          description="Last 30 days"
        />
        <MetricCard 
          title="Emergency Response" 
          value="42 min" 
          icon={Clock}
          trend={{ value: '4m', isPositive: true }}
          description="Avg response time"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <TechROITable data={data?.techROI || []} />
        </div>
      </div>

      {/* Quick Alerts */}
      <div className="bg-blue-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h4 className="text-lg font-bold">Revenue Optimization Tip</h4>
            <p className="text-blue-100 text-sm opacity-90">You have 5 follow-ups due today. Converting these could add £3,200 to this week&apos;s revenue.</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors">
          View Follow-ups
        </button>
      </div>
    </div>
  );
}
