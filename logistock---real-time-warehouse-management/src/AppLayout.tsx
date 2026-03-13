import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { LayoutDashboard, Box, ArrowUpCircle, ArrowDownCircle, ClipboardList, BarChart3, BrainCircuit, LogOut, Menu, X, Bell } from 'lucide-react';
import { cn } from './lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  key?: string | number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
      active 
        ? "bg-blue-600 text-white" 
        : "text-slate-400 hover:text-white hover:bg-slate-800"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

export default function AppLayout({ children, activeTab, setActiveTab }: { children: React.ReactNode, activeTab: string, setActiveTab: (tab: string) => void }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { id: 'items', label: 'Data Barang', icon: Box, roles: ['admin'] },
    { id: 'stock-out', label: 'Pengambilan', icon: ArrowDownCircle, roles: ['admin', 'staff'] },
    { id: 'stock-in', label: 'Stok Masuk', icon: ArrowUpCircle, roles: ['admin'] },
    { id: 'activity', label: 'Aktivitas', icon: ClipboardList, roles: ['admin', 'staff'] },
    { id: 'reports', label: 'Laporan', icon: BarChart3, roles: ['admin'] },
    { id: 'ai-analysis', label: 'AI Analisis', icon: BrainCircuit, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">L</div>
          <span className="text-xl font-bold tracking-tight">LogiStock</span>
        </div>

        <nav className="flex-1 space-y-1">
          {filteredItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="pt-4 mt-4 border-t border-slate-800">
          <div className="px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User</p>
            <p className="text-sm font-medium mt-1">{user?.username}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 bg-[#0F172A]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold capitalize">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user?.username?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute inset-y-0 left-0 w-64 bg-[#0F172A] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">L</div>
                <span className="text-xl font-bold tracking-tight">LogiStock</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {filteredItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                />
              ))}
            </nav>
            <button
              onClick={logout}
              className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-auto"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
