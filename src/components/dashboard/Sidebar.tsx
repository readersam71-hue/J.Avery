import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  UserCircle, 
  Star, 
  Settings, 
  TrendingUp,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Leads', href: '/dashboard/leads' },
  { icon: Briefcase, label: 'Jobs', href: '/dashboard/jobs' },
  { icon: FileText, label: 'Quotes', href: '/dashboard/quotes' },
  { icon: UserCircle, label: 'Customers', href: '/dashboard/customers' },
  { icon: Star, label: 'Reviews', href: '/dashboard/reviews' },
  { icon: TrendingUp, label: 'Team Efficiency', href: '/dashboard/team' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-400">J.Avery CRM</h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Revenue Engine</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-bold text-sm">
          <PlusCircle className="w-5 h-5" />
          Quick Action
        </button>
      </div>
    </aside>
  );
}
