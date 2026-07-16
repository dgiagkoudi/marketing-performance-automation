import React, { useState } from 'react';
import { ShieldAlert, ListFilter, Clock, Info } from 'lucide-react';

export default function LogTable({ logs, rules, loading }) {
  const [activeTab, setActiveTab] = useState('logs');

  // Δυναμική παραγωγή της επεξήγησης του κανόνα βάσει των πραγματικών trigger_conditions
  const getRuleExplanation = (type, conditions) => {
    if (!conditions) return "Δεν έχουν οριστεί συνθήκες.";

    const operator = conditions.operator || "AND";
    const activeConditions = [];

    if (conditions.spend_threshold !== null && conditions.spend_threshold !== undefined) {
      activeConditions.push(`Spend >= €${conditions.spend_threshold}`);
    }
    if (conditions.roas_threshold !== null && conditions.roas_threshold !== undefined) {
      activeConditions.push(`ROAS < ${conditions.roas_threshold}x`);
    }
    if (conditions.ctr_threshold !== null && conditions.ctr_threshold !== undefined) {
      activeConditions.push(`CTR < ${conditions.ctr_threshold}%`);
    }
    if (conditions.conversions_threshold !== null && conditions.conversions_threshold !== undefined) {
      activeConditions.push(`Conversions < ${conditions.conversions_threshold}`);
    }

    const conditionsText = activeConditions.join(` ${operator} `);

    if (type === 'anomaly_detection') {
      return `Kill-Switch: Απενεργοποίηση καμπάνιας αν ισχύει: [ ${conditionsText || 'N/A'} ]`;
    }
    
    return `Budget Rebalance: Μεταφορά 20% budget από τη χειρότερη στην καλύτερη καμπάνια αν για τη χειρότερη ισχύει: [ ${conditionsText || 'N/A'} ]`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full min-h-[500px]">
      <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`text-sm font-bold flex items-center gap-2 pb-1 transition-all ${ activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600' }`}
          >
            <Clock size={16} /> Ιστορικό Ενεργειών ({logs.length})
          </button>
          <button 
            onClick={() => setActiveTab('rules')} 
            className={`text-sm font-bold flex items-center gap-2 pb-1 transition-all ${ activeTab === 'rules' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600' }`}
          >
            <ListFilter size={16} /> Επισκόπηση Κανόνων ({rules.length})
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Φόρτωση δεδομένων...</div>
      ) : activeTab === 'logs' ? (
        /* AUDIT LOGS TAB */
        logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm py-12">
            <ShieldAlert size={32} className="text-gray-300 mb-2" /> Δεν έχουν καταγραφεί ενέργειες ακόμα.
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100/70 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Ημερομηνία</th>
                  <th className="px-6 py-3.5">Ενέργεια (Action Taken)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString('el-GR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 leading-relaxed">
                      {log.action_taken}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* ACTIVE RULES TAB */
        rules.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm py-12">
            <ListFilter size={32} className="text-gray-300 mb-2" /> Δεν υπάρχουν καταχωρημένοι κανόνες.
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto flex-1">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/60 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <Info size={15} className="text-gray-400" /> {rule.name}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${ rule.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600' }`}>
                      {rule.is_enabled ? 'Live' : 'Off'}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {getRuleExplanation(rule.rule_type, rule.trigger_conditions)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ rule.rule_type === 'anomaly_detection' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800' }`}>
                    {rule.rule_type === 'anomaly_detection' ? 'Kill-Switch' : 'Rebalance'}
                  </span>
                  {rule.last_run && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Τελευταίος Έλεγχος: {new Date(rule.last_run).toLocaleTimeString('el-GR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}