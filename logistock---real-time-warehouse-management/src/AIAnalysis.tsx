import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, Clock, ShoppingCart, RefreshCw } from 'lucide-react';
import { analyzeStock } from './services/geminiService';
import { Item, Transaction } from './types';

export default function AIAnalysis() {
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/items').then(res => res.json()),
      fetch('/api/transactions').then(res => res.json())
    ]).then(([itemsData, transactionsData]) => {
      setItems(itemsData);
      setTransactions(transactionsData);
    });
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeStock(items, transactions);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <BrainCircuit size={28} />
            </div>
            <h2 className="text-2xl font-bold">AI Stock Analysis</h2>
          </div>
          <p className="text-blue-100 max-w-xl mb-6">
            Gunakan kecerdasan buatan untuk menganalisis pola penggunaan barang dan dapatkan rekomendasi restock yang akurat berdasarkan data historis.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Sparkles size={20} />
            )}
            {loading ? 'Menganalisis...' : 'Mulai Analisis Sekarang'}
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      </div>

      {analysis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis.map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{item.itemName}</h3>
                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Recommendation</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-semibold uppercase">Usage</span>
                  </div>
                  <p className="text-sm font-bold">{item.avgUsage}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={14} />
                    <span className="text-[10px] font-semibold uppercase">Prediction</span>
                  </div>
                  <p className="text-sm font-bold text-amber-400">{item.prediction}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <ShoppingCart size={14} />
                    <span className="text-[10px] font-semibold uppercase">Order</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-400">{item.recommendation}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "Berdasarkan tren penggunaan 30 hari terakhir, stok barang ini diprediksi akan habis dalam waktu dekat. Disarankan untuk melakukan pemesanan ulang segera."
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
          <BrainCircuit size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500">Klik tombol di atas untuk memulai analisis data stok Anda.</p>
        </div>
      )}
    </div>
  );
}
