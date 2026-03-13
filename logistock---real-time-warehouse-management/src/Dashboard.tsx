import React, { useState, useEffect } from 'react';
import { DashboardStats } from './types';
import { Package, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
          +{trend}%
        </span>
      )}
    </div>
    <p className="text-slate-400 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
  </div>
);

import { cn } from './lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>)}
    </div>
    <div className="h-64 bg-slate-800 rounded-2xl"></div>
  </div>;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Jenis Barang" 
          value={stats?.totalItems} 
          icon={Package} 
          color="bg-blue-600"
          trend="12"
        />
        <StatCard 
          title="Total Stok Tersedia" 
          value={stats?.totalStock} 
          icon={TrendingUp} 
          color="bg-emerald-600"
          trend="8"
        />
        <StatCard 
          title="Barang Stok Kritis" 
          value={stats?.criticalItems} 
          icon={AlertTriangle} 
          color="bg-amber-600"
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Grafik Penggunaan Barang (7 Hari Terakhir)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748B" 
                  fontSize={12} 
                  tickFormatter={(str) => format(new Date(str), 'dd MMM')}
                />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px' }}
                  itemStyle={{ color: '#3B82F6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorUsage)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
            <Activity size={20} className="text-slate-500" />
          </div>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start">
                <div className={cn(
                  "mt-1 w-2 h-2 rounded-full shrink-0",
                  activity.type === 'in' ? "bg-emerald-500" : "bg-amber-500"
                )}></div>
                <div>
                  <p className="text-sm font-medium">
                    {activity.person_name || activity.staff_name} {activity.type === 'in' ? 'menambah' : 'mengambil'} {activity.item_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activity.quantity} pcs • {format(new Date(activity.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {stats?.recentActivity.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">Belum ada aktivitas</p>
            )}
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts */}
      {stats && stats.criticalItems > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-4">
          <AlertTriangle className="text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-500">Peringatan Stok Kritis!</p>
            <p className="text-xs text-amber-500/80">Ada {stats.criticalItems} barang yang stoknya sudah di bawah batas minimum. Segera lakukan pengecekan.</p>
          </div>
        </div>
      )}
    </div>
  );
}
