import React, { useState, useEffect } from 'react';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics/public-dashboard`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError('Failed to fetch analytics data');
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
          onClick={fetchAnalytics}
          className="bg-telecom-primary text-white px-6 py-2 rounded-lg hover:bg-telecom-secondary transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">📈 Live Analytics</h1>
        <p className="text-xl text-white/80 mb-6">Real-time insights into your subscription business</p>
        <button 
          onClick={fetchAnalytics}
          className="btn-glass"
        >
          🔄 Refresh Data
        </button>
      </div>
      
      {analytics && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card-modern p-8 text-center group">
            <div className="text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform">
              {analytics.totalUsers}
            </div>
            <div className="text-gray-600 font-semibold text-lg">👥 Total Users</div>
          </div>
          
          <div className="card-modern p-8 text-center group">
            <div className="text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform">
              {analytics.activeSubscriptions}
            </div>
            <div className="text-gray-600 font-semibold text-lg">✨ Active Subscriptions</div>
          </div>
          
          <div className="card-modern p-8 text-center group">
            <div className="text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform">
              ${analytics.monthlyRevenue}
            </div>
            <div className="text-gray-600 font-semibold text-lg">💰 Monthly Revenue</div>
          </div>
          
          <div className="card-modern p-8 text-center group">
            <div className="text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform">
              {analytics.churnRate}%
            </div>
            <div className="text-gray-600 font-semibold text-lg">📉 Churn Rate</div>
          </div>
          
          <div className="card-modern p-8 text-center group">
            <div className="text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform">
              {analytics.totalPlans}
            </div>
            <div className="text-gray-600 font-semibold text-lg">📋 Available Plans</div>
          </div>
          
          <div className="card-modern p-8 text-center group">
            <div className="text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform">
              ${analytics.averageRevenue}
            </div>
            <div className="text-gray-600 font-semibold text-lg">📊 ARPU</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg col-span-full">
            <div className="text-sm text-gray-500">
              Last Updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;


