import React, { useState } from 'react';
import { BarChart3, RefreshCw, Play } from 'lucide-react';
import api from '../services/api';

export default function Header({ onRefresh, loading }) {
  const [simulating, setSimulating] = useState(false);

  const handleSimulateTraffic = async () => {
    try {
      setSimulating(true);
      await api.post('/api/campaigns/simulate-traffic');
      alert('Το Live Traffic προσομοιώθηκε! Τα metrics των καμπανιών άλλαξαν.');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error simulating traffic:", error);
      alert("Αποτυχία προσομοίωσης κίνησης.");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="text-blue-600" /> Marketing Performance Dashboard</h1>
        <p className="text-gray-500 text-sm">Παρακολούθηση καμπανιών Google & Meta σε πραγματικό χρόνο</p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button onClick={handleSimulateTraffic} disabled={simulating || loading} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
          <Play size={14} fill="white" className={simulating ? "animate-pulse" : ""} />{simulating ? "Προσομοίωση..." : "Προσομοίωση Traffic"}
        </button>
        <button onClick={onRefresh} disabled={loading} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-semibold shadow-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Ανανέωση
        </button>
      </div>
    </div>
  );
}