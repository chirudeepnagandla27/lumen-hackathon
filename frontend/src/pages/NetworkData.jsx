import React, { useState, useEffect } from 'react';

const PlanBrowser = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/plans`);
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data);
      } else {
        setError('Failed to fetch subscription plans');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    alert(`You've selected ${plan.name} for $${plan.pricing.monthly}/month! In a real app, this would proceed to checkout or subscription creation.`);
    // Here you would typically:
    // 1. Navigate to checkout/signup
    // 2. Create subscription via API
    // 3. Handle payment processing
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
          onClick={fetchPlans}
          className="bg-telecom-primary text-white px-6 py-2 rounded-lg hover:bg-telecom-secondary transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-xl text-white/80 mb-8">Flexible pricing that scales with your business needs</p>
        <button 
          onClick={fetchPlans}
          className="btn-glass"
        >
          🔄 Refresh Plans
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div key={plan._id} className={`card-modern p-8 group relative overflow-hidden ${
            index === 1 ? 'transform scale-105 ring-2 ring-white/30' : ''
          }`}>
            {index === 1 && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                ⭐ POPULAR
              </div>
            )}
            <div className="text-center">
              <div className="text-4xl mb-4">
                {plan.type === 'Fibernet' ? '🚀' : '🌐'}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <div className="text-5xl font-bold text-gradient mb-2">
                  ${plan.pricing.monthly}
                </div>
                <div className="text-gray-500">/month</div>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">{plan.description}</p>
              
              <div className="space-y-3 mb-8">
                {plan.features.additionalFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-start">
                    <span className="text-green-500 mr-3 text-lg">✓</span>
                    <span className="text-gray-700 font-medium">{feature.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-8 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Quota:</span>
                  <span className="font-semibold">{plan.features.dataQuota.amount} {plan.features.dataQuota.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-semibold">{plan.features.speed.download}/{plan.features.speed.upload} {plan.features.speed.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connection:</span>
                  <span className="font-semibold">{plan.type}</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 group-hover:scale-105 ${
                  index === 1 
                    ? 'btn-gradient shadow-xl' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {index === 1 ? '✨ Choose Popular' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {plans.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          No subscription plans available
        </div>
      )}
    </div>
  );
};

export default PlanBrowser;


