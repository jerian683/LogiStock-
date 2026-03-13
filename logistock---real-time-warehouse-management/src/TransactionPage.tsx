import React, { useState, useEffect } from 'react';
import { Item } from './types';
import { useAuth } from './AuthContext';
import { ArrowDownCircle, ArrowUpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TransactionPage({ type }: { type: 'in' | 'out' }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    item_id: '',
    quantity: 1,
    person_name: '',
    supplier: '',
    notes: ''
  });

  useEffect(() => {
    fetch('/api/items').then(res => res.json()).then(setItems);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type,
          user_id: user?.id,
          item_id: parseInt(formData.item_id)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setFormData({ item_id: '', quantity: 1, person_name: '', supplier: '', notes: '' });
      // Refresh items list
      fetch('/api/items').then(res => res.json()).then(setItems);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-3 rounded-xl ${type === 'in' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
            {type === 'in' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold">{type === 'in' ? 'Stok Masuk' : 'Pengambilan Barang'}</h2>
            <p className="text-sm text-slate-400">
              {type === 'in' ? 'Catat barang yang datang dari supplier' : 'Catat pengambilan barang operasional'}
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500">
            <CheckCircle2 size={20} />
            <span className="text-sm font-medium">Transaksi berhasil dicatat!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Pilih Barang</label>
            <select
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={formData.item_id}
              onChange={e => setFormData({...formData, item_id: e.target.value})}
            >
              <option value="">Pilih Barang...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code}) - Stok: {item.stock}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Jumlah</label>
              <input
                required
                type="number"
                min="1"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">
                {type === 'in' ? 'Nama Supplier' : 'Nama Pengambil'}
              </label>
              <input
                required
                type="text"
                placeholder={type === 'in' ? 'Contoh: PT. Logistik Jaya' : 'Contoh: Wawan'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={type === 'in' ? formData.supplier : formData.person_name}
                onChange={e => setFormData({
                  ...formData, 
                  [type === 'in' ? 'supplier' : 'person_name']: e.target.value
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Keterangan / Catatan</label>
            <textarea
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Tambahkan catatan jika perlu..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              type === 'in' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
            } shadow-lg disabled:opacity-50`}
          >
            {loading ? 'Memproses...' : (type === 'in' ? 'Simpan Stok Masuk' : 'Konfirmasi Pengambilan')}
          </button>
        </form>
      </div>
    </div>
  );
}
