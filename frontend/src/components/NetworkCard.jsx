import React from 'react';

const NetworkCard = ({ tower }) => {
  const getSignalColor = (signal) => {
    if (signal >= 90) return 'text-green-600';
    if (signal >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-telecom-primary">
          Tower {tower.tower}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tower.status)}`}>
          {tower.status}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Location:</span>
          <span className="font-medium">{tower.location}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Signal:</span>
          <span className={`font-bold ${getSignalColor(tower.signal)}`}>
            {tower.signal}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Latency:</span>
          <span className="font-medium">{tower.latency}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Last Updated:</span>
          <span className="text-sm text-gray-500">
            {new Date(tower.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${tower.signal >= 90 ? 'bg-green-500' : tower.signal >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${tower.signal}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default NetworkCard;


