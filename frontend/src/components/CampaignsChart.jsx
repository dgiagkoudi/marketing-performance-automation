import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

const CampaignsChart = ({ campaigns }) => {
  const data = campaigns.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    Budget: parseFloat(c.daily_budget),
    ROAS: parseFloat(c.current_metrics?.roas || 0)
  }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Ανάλυση Απόδοσης & Κατανεμημένου Budget</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fill: '#6b7280' }} unit="€" />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280' }} unit="x" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }} />
            <Legend />
            <Bar yAxisId="left" dataKey="Budget" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Daily Budget (€)" />
            <Line yAxisId="right" type="monotone" dataKey="ROAS" stroke="#10b981" strokeWidth={3} name="ROAS (x)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CampaignsChart;