import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BinAuditCockpit from './pages/BinAuditCockpit';
import AuditLogLedger from './pages/AuditLogLedger';

export default function App() {
  const [activeTab, setActiveTab] = useState('bins');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'bins' && <BinAuditCockpit />}
          {activeTab === 'audits' && <AuditLogLedger />}
        </main>
      </div>
    </div>
  );
}
