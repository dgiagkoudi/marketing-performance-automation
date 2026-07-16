import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Cpu, Play, Loader2, Trash2 } from 'lucide-react';
import RuleForm from '../components/RuleForm';
import LogTable from '../components/LogTable';

export default function Automations() {
  const [logs, setLogs] = useState([]);
  const [rules, setRules] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchData = async () => {
    try {
      setLoadingLogs(true);
      const [logsRes, rulesRes] = await Promise.all([api.get('/api/automations/logs'), api.get('/api/automations/rules')]);
      setLogs(logsRes.data);
      setRules(rulesRes.data);
    } catch (error) {
      console.error("Error fetching automation data:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRule = async (ruleData) => {
    try {
      const response = await api.post('/api/automations/rules', ruleData);
      setRules(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error creating rule:", error);
      alert("Αποτυχία δημιουργίας κανόνα. Ελέγξτε τις τιμές εισαγωγής.");
    }
  };

  const handleRunEngine = async () => {
    try {
      setRunning(true);
      const response = await api.post('/api/automations/run', {});
      const actions = response.data.actions_taken;
      
      if (Array.isArray(actions) && actions.length > 0) {
        alert(`Η μηχανή εκτελέστηκε! Ενέργειες:\n${actions.join('\n')}`);
      } else {
        alert("Η μηχανή εκτελέστηκε! Δεν χρειάστηκε κάποια ενέργεια βελτιστοποίησης.");
      }
      fetchData();
    } catch (error) {
      console.error("Error running engine:", error);
      alert("Προέκυψε σφάλμα κατά την εκτέλεση της μηχανής.");
    } finally {
      setRunning(false);
    }
  };

  const handleToggleRule = async (ruleId, currentStatus) => {
    try {
      const response = await api.patch(`/api/automations/rules/${ruleId}`, {
        is_enabled: !currentStatus
      });
      setRules(rules.map(rule => rule.id === ruleId ? response.data : rule));
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον κανόνα;")) return;
    try {
      await api.delete(`/api/automations/rules/${ruleId}`);
      setRules(rules.filter(rule => rule.id !== ruleId));
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  const activeRulesCount = rules.filter(r => r.is_enabled).length;
  
  return (
    <div className="bg-gray-50 min-h-screen p-6 text-gray-800 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cpu className="text-blue-600" /> Automation Control Center
          </h1>
          <p className="text-gray-500 text-sm">Διαχειριστείτε τους κανόνες βελτιστοποίησης και δείτε τα logs της AI μηχανής</p>
        </div>
        <button 
          onClick={handleRunEngine} disabled={running} 
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-xl transition-all text-sm font-bold shadow-md shadow-green-600/10"
        >
          {running ? (<><Loader2 className="animate-spin" size={16} /> Εκτελείται...</>) : (<><Play size={16} fill="white" /> Τρέξε την Μηχανή Τώρα</>)}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RuleForm onCreateRule={handleCreateRule} />
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ενεργοί Κανόνες ({activeRulesCount})</h2>
          {rules.length === 0 ? (
            <p className="text-gray-400 text-sm italic my-auto text-center">Δεν υπάρχουν καταχωρημένοι κανόνες.</p>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[340px] pr-1">
              {rules.map((rule) => (
                <div key={rule.id} className={`p-4 rounded-lg border transition-all flex items-center justify-between ${ rule.is_enabled ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                  <div>
                    <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded mt-1 font-medium">
                      {rule.rule_type === 'anomaly_detection' ? 'Kill-Switch' : 'Budget Rebalance'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={rule.is_enabled} onChange={() => handleToggleRule(rule.id, rule.is_enabled)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-xs font-medium text-gray-600 hidden sm:inline">
                        {rule.is_enabled ? "Ενεργός" : "Ανενεργός"}
                      </span>
                    </label>
                    <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-gray-100" title="Διαγραφή Κανόνα">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="w-full">
        <LogTable logs={logs} rules={rules} loading={loadingLogs} />
      </div>
    </div>
  );
}