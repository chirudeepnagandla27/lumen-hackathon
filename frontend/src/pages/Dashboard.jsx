import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlanChangeModal from '../components/PlanChangeModal';

const Dashboard = () => {
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ subscription: null, changeType: null });

  // Mock user data for now - will be replaced with actual auth
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    memberSince: '2024-01-01',
    totalSpent: 299.95
  };

  // Mock subscription data
  const mockSubscriptions = [
    {
      id: '1',
      planName: 'Fibernet Standard',
      status: 'active',
      price: 49.99,
      billingCycle: 'monthly',
      startDate: '2024-01-01',
      nextBillingDate: '2024-02-01',
      dataUsed: 350,
      dataLimit: 500,
      features: ['Priority Support', 'Free Router', 'Security Suite']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser(mockUser);
      setUserSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleUpgradePlan = (subscriptionId) => {
    const subscription = userSubscriptions.find(sub => sub.id === subscriptionId);
    setModalData({ subscription, changeType: 'upgrade' });
    setModalOpen(true);
  };

  const handleDowngradePlan = (subscriptionId) => {
    const subscription = userSubscriptions.find(sub => sub.id === subscriptionId);
    setModalData({ subscription, changeType: 'downgrade' });
    setModalOpen(true);
  };

  const handlePlanChangeConfirm = (newPlan) => {
    console.log('Changing to plan:', newPlan);
    // Here you would make an API call to change the subscription
    alert(`Plan change confirmed! You will be switched to ${newPlan.name} on your next billing cycle.`);
  };

  const handleCancelSubscription = (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      console.log('Cancelling subscription:', subscriptionId);
      // Will implement actual cancellation logic
    }
  };

  const handlePauseSubscription = (subscriptionId) => {
    console.log('Pausing subscription:', subscriptionId);
    // Will implement actual pause logic
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
      </div>
    );
  }

  return (
    <div>
      {/* User Info Header */}
      <div className="glass-card p-8 mb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-white/80 text-lg">Member since {new Date(user?.memberSince).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-green-300">${user?.totalSpent}</div>
            <div className="text-white/80">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Link to="/plans" className="card-modern p-6 group text-center">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
          <h3 className="font-bold text-gray-800 mb-2">Browse Plans</h3>
          <p className="text-sm text-gray-600">Discover new options</p>
        </Link>
        
        <button className="card-modern p-6 group text-center">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💳</div>
          <h3 className="font-bold text-gray-800 mb-2">Billing Center</h3>
          <p className="text-sm text-gray-600">Manage payments</p>
        </button>
        
        <button className="card-modern p-6 group text-center">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📞</div>
          <h3 className="font-bold text-gray-800 mb-2">Support Hub</h3>
          <p className="text-sm text-gray-600">Get assistance</p>
        </button>
        
        <button className="card-modern p-6 group text-center">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
          <h3 className="font-bold text-gray-800 mb-2">Settings</h3>
          <p className="text-sm text-gray-600">Preferences</p>
        </button>
      </div>

      {/* Current Subscriptions */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-8">Your Active Subscriptions</h2>
        
        {userSubscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">No Active Subscriptions</h3>
            <p className="text-gray-600 mb-4">Start by choosing a plan that fits your needs</p>
            <Link 
              to="/plans" 
              className="inline-block bg-telecom-primary text-white px-6 py-2 rounded-lg hover:bg-telecom-secondary transition-colors"
            >
              Browse Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {userSubscriptions.map((subscription) => (
              <div key={subscription.id} className="card-modern p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-telecom-primary">{subscription.planName}</h3>
                    <div className="flex items-center mt-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status.toUpperCase()}
                      </span>
                      <span className="ml-3 text-2xl font-bold text-green-600">
                        ${subscription.price}/{subscription.billingCycle}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => handleUpgradePlan(subscription.id)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition-transform shadow-lg"
                    >
                      ⬆️ Upgrade
                    </button>
                    <button 
                      onClick={() => handleDowngradePlan(subscription.id)}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition-transform shadow-lg"
                    >
                      ⬇️ Downgrade
                    </button>
                    <button 
                      onClick={() => handlePauseSubscription(subscription.id)}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition-transform shadow-lg"
                    >
                      ⏸️ Pause
                    </button>
                    <button 
                      onClick={() => handleCancelSubscription(subscription.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition-transform shadow-lg"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>

                {/* Usage Meter */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Data Usage</span>
                    <span>{subscription.dataUsed} GB / {subscription.dataLimit} GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (subscription.dataUsed / subscription.dataLimit) > 0.8 ? 'bg-red-500' :
                        (subscription.dataUsed / subscription.dataLimit) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((subscription.dataUsed / subscription.dataLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Included Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {subscription.features.map((feature, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Billing Info */}
                <div className="text-sm text-gray-600 border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <strong>Start Date:</strong> {new Date(subscription.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Next Billing:</strong> {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Change Modal */}
      <PlanChangeModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentPlan={modalData.subscription}
        changeType={modalData.changeType}
        onConfirm={handlePlanChangeConfirm}
      />
    </div>
  );
};

export default Dashboard;
