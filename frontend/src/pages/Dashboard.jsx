import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AlertCircle, Radio } from 'lucide-react';
import Header from '../components/Header';
import CampaignCard from '../components/CampaignCard';
import CampaignsChart from '../components/CampaignsChart';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/campaigns/');
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Αποτυχία φόρτωσης καμπανιών. Παρακαλώ δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-6 text-gray-800">
      <Header onRefresh={fetchCampaigns} loading={loading} />
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center py-10 font-medium text-gray-500">Φόρτωση δεδομένων...</div>
      ) : (
        <>
          <CampaignsChart campaigns={campaigns} />
          <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
            <Radio size={18} className="text-green-500" /> Ενεργές & Παυμένες Καμπάνιες ({campaigns.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}