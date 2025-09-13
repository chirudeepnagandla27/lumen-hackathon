import React, { useState, useEffect } from 'react';

const PlanChangeModal = ({ isOpen, onClose, currentPlan, changeType, onConfirm }) => {
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock plans data - will be replaced with API call
  const mockPlans = [
    { id: '1', name: 'Fibernet Basic', price: 29.99, type: 'basic' },
    { id: '2', name: 'Fibernet Standard', price: 49.99, type: 'standard' },
    { id: '3', name: 'Fibernet Premium', price: 79.99, type: 'premium' },
    { id: '4', name: 'Copper Basic', price: 19.99, type: 'basic' },
    { id: '5', name: 'Copper Standard', price: 34.99, type: 'standard' }
  ];

  useEffect(() => {
    if (isOpen) {
      // Filter plans based on upgrade/downgrade
      setTimeout(() => {
        const filtered = changeType === 'upgrade' 
          ? mockPlans.filter(plan => plan.price > (currentPlan?.price || 0))
          : mockPlans.filter(plan => plan.price < (currentPlan?.price || 0));
        
        setAvailablePlans(filtered);
        setLoading(false);
      }, 500);
    }
  }, [isOpen, changeType, currentPlan]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleConfirm = () => {
    if (selectedPlan) {
      onConfirm(selectedPlan);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-telecom-primary">
            {changeType === 'upgrade' ? '⬆️ Upgrade' : '⬇️ Downgrade'} Your Plan
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {currentPlan && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Current Plan:</h3>
            <div className="flex justify-between items-center">
              <span>{currentPlan.planName}</span>
              <span className="font-bold text-green-600">${currentPlan.price}/month</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telecom-primary"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {availablePlans.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No {changeType === 'upgrade' ? 'higher-tier' : 'lower-tier'} plans available
                </div>
              ) : (
                availablePlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedPlan?.id === plan.id 
                        ? 'border-telecom-primary bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{plan.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{plan.type} tier</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${plan.price}/month</div>
                        <div className="text-sm text-gray-600">
                          {changeType === 'upgrade' 
                            ? `+$${(plan.price - currentPlan.price).toFixed(2)} more`
                            : `-$${(currentPlan.price - plan.price).toFixed(2)} less`
                          }
                        </div>
                      </div>
                    </div>
                    
                    {selectedPlan?.id === plan.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <div className="mb-2">
                            <strong>Change takes effect:</strong> Next billing cycle
                          </div>
                          <div>
                            <strong>Billing change:</strong> 
                            {changeType === 'upgrade' ? (
                              <span className="text-green-600 ml-1">
                                You'll be charged ${(plan.price - currentPlan.price).toFixed(2)} more monthly
                              </span>
                            ) : (
                              <span className="text-blue-600 ml-1">
                                You'll save ${(currentPlan.price - plan.price).toFixed(2)} monthly
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                disabled={!selectedPlan}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  selectedPlan
                    ? 'bg-telecom-primary text-white hover:bg-telecom-secondary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm {changeType === 'upgrade' ? 'Upgrade' : 'Downgrade'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlanChangeModal;
