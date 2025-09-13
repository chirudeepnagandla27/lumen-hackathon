import React, { useState, useEffect } from 'react';

const NetworkStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/network/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Failed to fetch network stats');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telecom-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-500 text-xl mb-4">❌ {error}</div>
        <button 
          onClick={fetchStats}
          className="bg-telecom-primary text-white px-6 py-2 rounded-lg hover:bg-telecom-secondary transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-telecom-primary">Network Statistics</h1>
        <button 
          onClick={fetchStats}
          className="bg-telecom-primary text-white px-4 py-2 rounded-lg hover:bg-telecom-secondary transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-telecom-primary mb-2">
              {stats.totalTowers}
            </div>
            <div className="text-gray-600">Total Towers</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.activeTowers}
            </div>
            <div className="text-gray-600">Active Towers</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.averageSignal}%
            </div>
            <div className="text-gray-600">Avg Signal</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.averageLatency}ms
            </div>
            <div className="text-gray-600">Avg Latency</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.uptime}
            </div>
            <div className="text-gray-600">Uptime</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg col-span-full">
            <div className="text-sm text-gray-500">
              Last Updated: {new Date(stats.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkStats;


