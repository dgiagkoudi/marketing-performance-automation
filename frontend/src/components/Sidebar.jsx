import React from 'react';
import { BarChart3, Cpu, LogOut } from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  return (
    <div className="w-full md:w-64 bg-gray-900 text-white p-6 flex flex-col justify-between shadow-lg md:sticky md:top-0 md:h-screen">
      <div className="flex flex-col gap-2">
        <div className="mb-8">
          <h2 className="text-xl font-black tracking-wider text-blue-400">MARKETER</h2>
          <p className="text-xs text-gray-400">Automation SaaS Engine v1.0</p>
        </div>
        
        <button 
            onClick={() => setCurrentPage('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all 
            ${ currentPage === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }`}
        >
          <BarChart3 size={18} /> Dashboard Καμπανιών
        </button>
        
        <button 
            onClick={() => setCurrentPage('automations')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all 
            ${ currentPage === 'automations' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }`}
        >
          <Cpu size={18} /> Κανόνες & Automations
        </button>
      </div>

      <div className="pt-6 border-t border-gray-800">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
          <LogOut size={18} /> Αποσύνδεση
        </button>
      </div>
    </div>
  );
}