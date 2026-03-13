import React, { useState, useEffect } from 'react';
import { Transaction } from './types';
import { format } from 'date-fns';
import { Search, Filter, Download } from 'lucide-react';
import { cn } from './lib/utils';

export default function ActivityLog() {
  const [logs, setLogs] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');

  useEffect(() => {
    fetch('/api/transactions').then(res => res.json()).then(setLogs);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.item_name?.toLowerCase().includes(search.toLowerCase()) || 
                         log.person_name?.toLowerCase().includes(search.toLowerCase()) ||
                         log.staff_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || log.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Cari item, pengambil, atau staff..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            {(['all', 'in', 'out'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                  filter === f ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {f === 'all' ? 'Semua' : f === 'in' ? 'Masuk' : 'Keluar'}
              </button>
            ))}
          </div>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
          <Download size={18} />
          Export Log
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktivitas</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Oleh</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        log.type === 'in' ? "bg-emerald-500" : "bg-blue-500"
                      )}></span>
                      <span className="font-medium">{log.item_name}</span>
                      <span className="text-xs text-slate-500">
                        ({log.type === 'in' ? 'Stok Masuk' : 'Pengambilan'})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {log.type === 'in' ? '+' : '-'}{log.quantity}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{log.person_name || log.supplier || '-'}</div>
                    <div className="text-[10px] text-slate-500">Input by: {log.staff_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {log.notes || '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada log aktivitas ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
