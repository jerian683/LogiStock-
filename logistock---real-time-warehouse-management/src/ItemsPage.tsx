import React, { useState, useEffect } from 'react';
import { Item, Category } from './types';
import { Plus, Search, Edit2, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: '',
    stock: 0,
    min_stock: 5,
    location: ''
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = () => {
    fetch('/api/items').then(res => res.json()).then(setItems);
  };

  const fetchCategories = () => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      fetchItems();
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ code: '', name: '', category_id: '', stock: 0, min_stock: 5, location: '' });
    });
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category_id: item.category_id.toString(),
      stock: item.stock,
      min_stock: item.min_stock,
      location: item.location
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Hapus barang ini?')) {
      fetch(`/api/items/${id}`, { method: 'DELETE' }).then(fetchItems);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau kode barang..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({ code: '', name: '', category_id: '', stock: 0, min_stock: 5, location: '' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Tambah Barang
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded-md">{item.category_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold",
                        item.stock <= item.min_stock ? "text-amber-500" : "text-white"
                      )}>{item.stock}</span>
                      {item.stock <= item.min_stock && (
                        <AlertCircle size={14} className="text-amber-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">Min: {item.min_stock}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {item.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Kode Barang</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Kategori</label>
                  <select
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Nama Barang</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Stok Awal</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Min. Stok</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.min_stock}
                    onChange={e => setFormData({...formData, min_stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Lokasi Rak</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Rak A-1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-800 text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
