import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function RuleForm({ onCreateRule }) {
  const [name, setName] = useState('');
  const [ruleType, setRuleType] = useState('anomaly_detection');
  const [operator, setOperator] = useState('AND');
  const [loading, setLoading] = useState(false);

  // States για τα Metrics των Trigger Conditions
  const [spendThreshold, setSpendThreshold] = useState('');
  const [roasThreshold, setRoasThreshold] = useState('');
  const [ctrThreshold, setCtrThreshold] = useState('');
  const [conversionsThreshold, setConversionsThreshold] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    
    // Χτίσιμο του trigger_conditions αντικειμένου
    const trigger_conditions = {
      operator: operator,
      spend_threshold: spendThreshold !== '' ? parseFloat(spendThreshold) : null,
      roas_threshold: roasThreshold !== '' ? parseFloat(roasThreshold) : null,
      ctr_threshold: ctrThreshold !== '' ? parseFloat(ctrThreshold) : null,
      conversions_threshold: conversionsThreshold !== '' ? parseInt(conversionsThreshold) : null,
    };

    await onCreateRule({
      name,
      rule_type: ruleType,
      trigger_conditions
    });

    // Reset Form fields
    setName('');
    setSpendThreshold('');
    setRoasThreshold('');
    setCtrThreshold('');
    setConversionsThreshold('');
    setOperator('AND');
    setLoading(false);
  };

  const getRulePreviewText = () => {
    const conditions = [];
    if (spendThreshold !== '') conditions.push(`Spend ≥ €${spendThreshold}`);
    if (roasThreshold !== '') conditions.push(`ROAS < ${roasThreshold}x`);
    if (ctrThreshold !== '') conditions.push(`CTR < ${ctrThreshold}%`);
    if (conversionsThreshold !== '') conditions.push(`Conversions < ${conversionsThreshold}`);

    const condString = conditions.length > 0 ? conditions.join(` ${operator} `) : '[Συμπληρώστε τουλάχιστον ένα κριτήριο παραπάνω]';

    if (ruleType === 'anomaly_detection') {
      return `Kill-Switch: Αν μια καμπάνια ικανοποιεί τη συνθήκη (${condString}), θα γίνει αυτόματα Paused.`;
    }
    if (ruleType === 'budget_rebalance') {
      return `Budget Rebalance: Αν η χειρότερη καμπάνια ικανοποιεί τη συνθήκη (${condString}), το 20% του budget της θα μεταφερθεί στην καλύτερη καμπάνια.`;
    }
    return 'Επιλέξτε τύπο στρατηγικής.';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5 flex flex-col h-full justify-between">
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><PlusCircle className="text-blue-600" size={18} /> Δημιουργία Νέου Κανόνα</h3>
        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider">ΟΝΟΜΑ ΚΑΝΟΝΑ</label>
            <input type="text" required placeholder="e.g., Low ROAS Protection" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wider">ΤΥΠΟΣ ΚΑΝΟΝΑ</label>
            <select value={ruleType} onChange={(e) => setRuleType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:border-blue-500"
            >
              <option value="anomaly_detection">Anomaly Detection (Kill-Switch)</option>
              <option value="budget_rebalance">Cross-Channel Budget Rebalance</option>
            </select>
          </div>
        </div>
        {/* Metrics Grid Section */}
        <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 space-y-3">
          <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Κριτήρια & Όρια</span>
            <select value={operator} onChange={(e) => setOperator(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white font-semibold text-gray-700 focus:outline-none"
            >
              <option value="AND">Πρέπει να ισχύουν ΟΛΑ (AND)</option>
              <option value="OR">Αρκεί να ισχύει ΚΑΠΟΙΟ (OR)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Spend είναι ≥ (€)</label>
              <input type="number" min="0" placeholder="π.χ. 50" value={spendThreshold} onChange={(e) => setSpendThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">ROAS είναι &lt;</label>
              <input type="number" step="0.1" min="0" placeholder="π.χ. 1.5" value={roasThreshold} onChange={(e) => setRoasThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">CTR είναι &lt; (%)</label>
              <input type="number" step="0.01" min="0" placeholder="π.χ. 0.9" value={ctrThreshold} onChange={(e) => setCtrThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Conversions είναι &lt;</label>
              <input type="number" min="0" placeholder="π.χ. 5" value={conversionsThreshold} onChange={(e) => setConversionsThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>
        </div>
        {/* Live Preview Box */}
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/70">
          <span className="text-[10px] font-bold text-blue-500 tracking-widest block mb-1">ΠΡΟΕΠΙΣΚΟΠΗΣΗ:</span>
          <p className="text-xs text-blue-900 leading-relaxed font-medium">{getRulePreviewText()}</p>
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4">
        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Προσθήκη Κανόνα'}
      </button>
    </form>
  );
}