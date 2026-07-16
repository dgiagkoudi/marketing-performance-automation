import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function CampaignCard({ campaign }) {
  const metrics = campaign.current_metrics || {};
  const isPaused = campaign.status === 'paused';

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${isPaused ? 'border-red-500' : 'border-green-500'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-gray-100 text-gray-600">
            {campaign.platform}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-1">{campaign.name}</h3>
        </div>
        
        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          isPaused ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {isPaused ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
          {campaign.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg text-center">
        <div>
          <div className="text-xs text-gray-400 font-medium">Spend</div>
          <div className="text-base font-bold text-gray-800">{metrics.spend} €</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 font-medium">Conversions</div>
          <div className="text-base font-bold text-gray-800">{metrics.conversions}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 font-medium">ROAS</div>
          <div className={`text-base font-bold ${metrics.roas > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {metrics.roas}x
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-xs text-gray-400">
        <span>Daily Budget: €{campaign.daily_budget}</span>
        <span>ID: {campaign.platform_campaign_id}</span>
      </div>
    </div>
  );
}