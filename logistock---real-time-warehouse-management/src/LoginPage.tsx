import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { LogIn, ShieldCheck, Truck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      login(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-900/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">LogiStock</h1>
          <p className="text-slate-400 mt-2">Warehouse Management System</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Selamat Datang Kembali</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Username</label>
              <input
                required
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="Masukkan username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Password</label>
              <input
                required
                type="password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : (
                <>
                  <LogIn size={20} />
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs text-center text-slate-500 mb-4 uppercase tracking-widest font-semibold">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                <ShieldCheck size={14} className="text-blue-400" />
                Admin Demo
              </button>
              <button 
                onClick={() => { setUsername('kurir'); setPassword('kurir123'); }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                <Truck size={14} className="text-emerald-400" />
                Kurir Demo
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8">
          &copy; 2026 LogiStock Logistics. All rights reserved.
        </p>
      </div>
    </div>
  );
}
