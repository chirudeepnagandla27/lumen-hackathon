from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Mock ML model for subscription management
class SubscriptionRecommendationEngine:
    def __init__(self):
        self.model_loaded = True
        # Mock plan data for recommendations
        self.plans = {
            'fibernet-basic': {'type': 'Fibernet', 'category': 'Basic', 'price': 29.99, 'data': 100, 'speed': 50},
            'fibernet-standard': {'type': 'Fibernet', 'category': 'Standard', 'price': 49.99, 'data': 500, 'speed': 100},
            'fibernet-premium': {'type': 'Fibernet', 'category': 'Premium', 'price': 79.99, 'data': 1000, 'speed': 200},
            'copper-basic': {'type': 'Broadband Copper', 'category': 'Basic', 'price': 19.99, 'data': 50, 'speed': 25},
            'copper-standard': {'type': 'Broadband Copper', 'category': 'Standard', 'price': 34.99, 'data': 250, 'speed': 50},
        }
    
    def recommend_plans(self, user_data):
        """Recommend subscription plans based on user usage and preferences"""
        current_usage = user_data.get('monthly_usage_gb', 100)
        budget_max = user_data.get('budget_max', 50)
        current_plan = user_data.get('current_plan', None)
        service_type_pref = user_data.get('service_type_preference', None)
        
        recommendations = []
        
        # Calculate usage-based recommendations
        for plan_id, plan in self.plans.items():
            if plan['price'] <= budget_max:
                # Calculate suitability score
                usage_fit = self._calculate_usage_fit(current_usage, plan['data'])
                price_value = self._calculate_price_value(plan['price'], budget_max)
                type_match = 1.0 if not service_type_pref or plan['type'] == service_type_pref else 0.7
                
                overall_score = (usage_fit * 0.4 + price_value * 0.3 + type_match * 0.3)
                
                recommendations.append({
                    'plan_id': plan_id,
                    'plan_name': f"{plan['type']} {plan['category']}",
                    'price': plan['price'],
                    'data_quota': plan['data'],
                    'speed': plan['speed'],
                    'suitability_score': round(overall_score, 2),
                    'reasons': self._get_recommendation_reasons(current_usage, plan, current_plan),
                    'savings_potential': self._calculate_savings(current_plan, plan) if current_plan else 0
                })
        
        # Sort by suitability score
        recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)
        
        return recommendations[:5]  # Top 5 recommendations
    
    def predict_churn(self, subscription_data):
        """Predict if a user is likely to cancel their subscription"""
        usage_ratio = subscription_data.get('usage_ratio', 0.5)  # current_usage / quota
        price = subscription_data.get('price', 50)
        months_subscribed = subscription_data.get('months_subscribed', 1)
        support_tickets = subscription_data.get('support_tickets', 0)
        payment_delays = subscription_data.get('payment_delays', 0)
        
        # Simple heuristic model for churn prediction
        churn_factors = {
            'low_usage': 1.0 if usage_ratio < 0.2 else 0.0,
            'high_price': 1.0 if price > 70 else 0.0,
            'new_customer': 1.0 if months_subscribed < 3 else 0.0,
            'support_issues': min(support_tickets * 0.2, 1.0),
            'payment_issues': min(payment_delays * 0.3, 1.0)
        }
        
        churn_score = sum(churn_factors.values()) / len(churn_factors)
        churn_probability = min(churn_score * 0.8 + random.uniform(0.1, 0.3), 1.0)
        
        risk_level = 'high' if churn_probability > 0.7 else 'medium' if churn_probability > 0.4 else 'low'
        
        return {
            'churn_probability': round(churn_probability, 2),
            'risk_level': risk_level,
            'factors': churn_factors,
            'retention_strategies': self._get_retention_strategies(churn_factors, subscription_data)
        }
    
    def optimize_pricing(self, plan_data):
        """Suggest pricing optimizations for plans"""
        current_price = plan_data.get('current_price', 50)
        subscriber_count = plan_data.get('subscriber_count', 100)
        churn_rate = plan_data.get('churn_rate', 0.05)
        competitor_prices = plan_data.get('competitor_prices', [45, 55, 60])
        
        avg_competitor_price = sum(competitor_prices) / len(competitor_prices)
        
        # Simple pricing optimization logic
        if churn_rate > 0.1:  # High churn
            suggested_price = max(current_price * 0.9, avg_competitor_price * 0.95)
            strategy = 'price_reduction'
        elif churn_rate < 0.03 and subscriber_count > 500:  # Low churn, popular plan
            suggested_price = min(current_price * 1.1, avg_competitor_price * 1.05)
            strategy = 'price_increase'
        else:
            suggested_price = current_price
            strategy = 'maintain_price'
        
        return {
            'current_price': current_price,
            'suggested_price': round(suggested_price, 2),
            'strategy': strategy,
            'expected_impact': self._calculate_pricing_impact(current_price, suggested_price, subscriber_count, churn_rate)
        }
    
    def _calculate_usage_fit(self, current_usage, plan_quota):
        """Calculate how well the plan quota fits user's usage"""
        if plan_quota >= current_usage * 1.2:  # Good buffer
            return 0.9
        elif plan_quota >= current_usage:  # Just enough
            return 0.7
        else:  # Not enough
            return 0.3
    
    def _calculate_price_value(self, price, budget_max):
        """Calculate price value score"""
        if price <= budget_max * 0.8:
            return 1.0
        elif price <= budget_max:
            return 0.8
        else:
            return 0.4
    
    def _get_recommendation_reasons(self, usage, plan, current_plan):
        """Generate reasons for plan recommendation"""
        reasons = []
        
        if plan['data'] >= usage * 1.2:
            reasons.append(f"Provides {plan['data']}GB quota, suitable for your {usage}GB usage")
        
        if plan['price'] < 40:
            reasons.append("Cost-effective option")
        
        if plan['type'] == 'Fibernet':
            reasons.append("High-speed fiber connection for better performance")
        
        if current_plan and plan['price'] < current_plan.get('price', 0):
            reasons.append(f"Save ${current_plan.get('price', 0) - plan['price']:.2f} per month")
        
        return reasons[:3]  # Top 3 reasons
    
    def _calculate_savings(self, current_plan, recommended_plan):
        """Calculate potential savings"""
        if not current_plan:
            return 0
        return max(0, current_plan.get('price', 0) - recommended_plan['price'])
    
    def _get_retention_strategies(self, factors, subscription_data):
        """Get retention strategies based on churn factors"""
        strategies = []
        
        if factors.get('low_usage', 0) > 0:
            strategies.append("Offer usage tutorials or downgrade to cheaper plan")
        
        if factors.get('high_price', 0) > 0:
            strategies.append("Provide discount or loyalty pricing")
        
        if factors.get('new_customer', 0) > 0:
            strategies.append("Implement onboarding program and early engagement")
        
        if factors.get('support_issues', 0) > 0:
            strategies.append("Priority customer support and proactive assistance")
        
        if factors.get('payment_issues', 0) > 0:
            strategies.append("Flexible payment options and automatic billing")
        
        return strategies
    
    def _calculate_pricing_impact(self, current_price, new_price, subscriber_count, churn_rate):
        """Calculate expected impact of pricing changes"""
        price_change_pct = (new_price - current_price) / current_price
        
        # Simple elasticity model
        subscriber_change_pct = -price_change_pct * 0.5  # Assume elasticity of -0.5
        new_subscriber_count = int(subscriber_count * (1 + subscriber_change_pct))
        
        current_revenue = current_price * subscriber_count
        new_revenue = new_price * new_subscriber_count
        
        return {
            'revenue_change': new_revenue - current_revenue,
            'subscriber_change': new_subscriber_count - subscriber_count,
            'revenue_change_pct': (new_revenue - current_revenue) / current_revenue * 100
        }

# Initialize ML model
ml_model = SubscriptionRecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'subscription-recommendation-engine',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': ml_model.model_loaded
    })

@app.route('/recommend', methods=['POST'])
def recommend_plans():
    """Plan recommendation endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No user data provided'
            }), 400
        
        # Get plan recommendations
        recommendations = ml_model.recommend_plans(data)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'user_data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Recommendation failed: {str(e)}'
        }), 500

@app.route('/churn/predict', methods=['POST'])
def predict_churn():
    """Churn prediction endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No subscription data provided'
            }), 400
        
        # Get churn prediction
        churn_prediction = ml_model.predict_churn(data)
        
        return jsonify({
            'success': True,
            'churn_prediction': churn_prediction,
            'subscription_data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Churn prediction failed: {str(e)}'
        }), 500

@app.route('/pricing/optimize', methods=['POST'])
def optimize_pricing():
    """Pricing optimization endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No plan data provided'
            }), 400
        
        # Get pricing optimization
        optimization = ml_model.optimize_pricing(data)
        
        return jsonify({
            'success': True,
            'optimization': optimization,
            'plan_data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Pricing optimization failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🤖 Starting Subscription Recommendation Engine...")
    print("📡 ML Service running on http://localhost:5000")
    print("🔍 Health check: http://localhost:5000/health")
    print("🎯 Endpoints:")
    print("   • Plan Recommendations: http://localhost:5000/recommend")
    print("   • Churn Prediction: http://localhost:5000/churn/predict")
    print("   • Pricing Optimization: http://localhost:5000/pricing/optimize")
    app.run(host='0.0.0.0', port=5000, debug=True)


