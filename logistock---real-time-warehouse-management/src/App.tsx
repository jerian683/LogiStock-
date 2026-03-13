import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AppLayout from './AppLayout';
import Dashboard from './Dashboard';
import ItemsPage from './ItemsPage';
import TransactionPage from './TransactionPage';
import ActivityLog from './ActivityLog';
import AIAnalysis from './AIAnalysis';
import LoginPage from './LoginPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'items': return <ItemsPage />;
      case 'stock-out': return <TransactionPage type="out" />;
      case 'stock-in': return <TransactionPage type="in" />;
      case 'activity': return <ActivityLog />;
      case 'reports': return <ActivityLog />; // Reusing activity log for reports in this demo
      case 'ai-analysis': return <AIAnalysis />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
