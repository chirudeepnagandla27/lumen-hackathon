import React, { useState, useEffect } from 'react';
import NetworkCard from '../components/NetworkCard';

const NetworkData = () => {
  const [networkData, setNetworkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      setError(null); // Reset previous errors

      const response = await fetch(`${import.meta.env.VITE_API_URL}/network/data`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setNetworkData(data.data);
      } else {
        setNetworkData([]);
        setError('Failed to fetch network data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      setNetworkData([]);
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
          onClick={fetchNetworkData}
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
        <h1 className="text-3xl font-bold text-telecom-primary">Network Data</h1>
        <button 
          onClick={fetchNetworkData}
          className="bg-telecom-primary text-white px-4 py-2 rounded-lg hover:bg-telecom-secondary transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      
      {networkData.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {networkData.map((tower) => (
            <NetworkCard 
              key={tower.towerId || tower.id} // Use unique ID if available
              tower={tower} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          No network data available
        </div>
      )}
    </div>
  );
};

export default NetworkData;
