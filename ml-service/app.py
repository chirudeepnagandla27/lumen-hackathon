from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
from datetime import datetime, date
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)

# ML model for subscription management
class SubscriptionRecommendationEngine:
    def __init__(self):
        self.model_loaded = True
        # Mock plan data for recommendations (kept for other functions)
        self.plans = {
            'fibernet-basic': {'type': 'Fibernet', 'category': 'Basic', 'price': 29.99, 'data': 100, 'speed': 50},
            'fibernet-standard': {'type': 'Fibernet', 'category': 'Standard', 'price': 49.99, 'data': 500, 'speed': 100},
            'fibernet-premium': {'type': 'Fibernet', 'category': 'Premium', 'price': 79.99, 'data': 1000, 'speed': 200},
            'copper-basic': {'type': 'Broadband Copper', 'category': 'Basic', 'price': 19.99, 'data': 50, 'speed': 25},
            'copper-standard': {'type': 'Broadband Copper', 'category': 'Standard', 'price': 34.99, 'data': 250, 'speed': 50},
        }
        
        # Load the dataset with error handling
        dataset_path = "C:\\hackathon-app\\SubscriptionUseCase_Dataset.xlsx"
        try:
            self.user_data = pd.read_excel(dataset_path, sheet_name="User_Data")
            self.subscriptions = pd.read_excel(dataset_path, sheet_name="Subscriptions")
            self.subscription_plans = pd.read_excel(dataset_path, sheet_name="Subscription_Plans")
            self.subscription_logs = pd.read_excel(dataset_path, sheet_name="Subscription_Logs")
            self.billing_info = pd.read_excel(dataset_path, sheet_name="Billing_Information")
        except FileNotFoundError:
            print(f"Warning: Dataset file not found at {dataset_path}. Using mock data for demo.")
            # Use mock data if file doesn't exist
            self.user_data = pd.DataFrame()
            self.subscriptions = pd.DataFrame()
            self.subscription_plans = pd.DataFrame()
            self.subscription_logs = pd.DataFrame()
            self.billing_info = pd.DataFrame()
        except Exception as e:
            print(f"Warning: Error loading dataset: {str(e)}. Using mock data for demo.")
            self.user_data = pd.DataFrame()
            self.subscriptions = pd.DataFrame()
            self.subscription_plans = pd.DataFrame()
            self.subscription_logs = pd.DataFrame()
            self.billing_info = pd.DataFrame()
        
        # Preprocess and train the churn model
        self.churn_model, self.label_encoders = self._train_churn_model()

    def _train_churn_model(self):
        # Check if we have data to train with
        if self.subscriptions.empty or self.subscription_plans.empty or self.user_data.empty:
            print("Warning: No data available for training. Using mock model.")
            # Return a mock model and encoders
            from sklearn.dummy import DummyClassifier
            mock_model = DummyClassifier(strategy='constant', constant=0)
            # Create mock training data
            X_mock = pd.DataFrame({'feature': [1, 2, 3]})
            y_mock = pd.Series([0, 0, 1])
            mock_model.fit(X_mock, y_mock)
            return mock_model, {}
        
        try:
            # Merge relevant data
            df = self.subscriptions.merge(self.subscription_plans, left_on='Product Id', right_on='Product Id', how='left')
            df = df.merge(self.user_data, left_on='User Id', right_on='User Id', how='left')
        
            # Engineer features
            current_date = date(2025, 9, 13)  # Use the provided current date
            
            # Subscription duration in days
            df['Start Date'] = pd.to_datetime(df['Start Date'])
            df['subscription_duration_days'] = (current_date - df['Start Date'].dt.date).dt.days
            
            # Last renewed duration
            df['Last Renewed Date'] = pd.to_datetime(df['Last Renewed Date'])
            df['days_since_last_renewed'] = (current_date - df['Last Renewed Date'].dt.date).dt.days
            
            # Count payment failures per subscription
            payment_failures = self.billing_info[self.billing_info['payment_status'] == 'failed'].groupby('subscription_id').size().reset_index(name='payment_failures')
            df = df.merge(payment_failures, left_on='Subscription Id', right_on='subscription_id', how='left')
            df['payment_failures'] = df['payment_failures'].fillna(0)
            
            # Count renew failures from logs
            renew_failures = self.subscription_logs[self.subscription_logs['action'] == 'renew_failed'].groupby('Subscription id').size().reset_index(name='renew_failures')
            df = df.merge(renew_failures, left_on='Subscription Id', right_on='Subscription id', how='left')
            df['renew_failures'] = df['renew_failures'].fillna(0)
            
            # Label encode categorical features
            label_encoders = {}
            categorical_cols = ['Subscription Type', 'Auto Renewal Allowed', 'Status_x']  # Status_x is user status
            for col in categorical_cols:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                label_encoders[col] = le
            
            # Features and target
            features = ['Price', 'subscription_duration_days', 'days_since_last_renewed', 'payment_failures', 'renew_failures'] + categorical_cols
            df['churn'] = (df['Status'] == 'PAUSED').astype(int)  # Target: 1 if PAUSED, else 0
            
            X = df[features]
            y = df['churn']
            
            # Handle missing values (simple imputation)
            X = X.fillna(0)
            
            # Train-test split
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train RandomForestClassifier
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Optional: Evaluate
            predictions = model.predict_proba(X_test)[:, 1]
            auc = roc_auc_score(y_test, predictions)
            print(f"Churn Model AUC: {auc}")
            
            return model, label_encoders
        
        except Exception as e:
            print(f"Warning: Error training churn model: {str(e)}. Using fallback model.")
            # Return a mock model as fallback
            from sklearn.dummy import DummyClassifier
            mock_model = DummyClassifier(strategy='constant', constant=0)
            X_mock = pd.DataFrame({'feature': [1, 2, 3]})
            y_mock = pd.Series([0, 0, 1])
            mock_model.fit(X_mock, y_mock)
            return mock_model, {}
    
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
        """Predict if a user is likely to cancel their subscription using the trained ML model"""
        try:
            # Extract or compute features similar to training
            subscription_id = subscription_data.get('subscription_id')
            price = subscription_data.get('price', 50)
            months_subscribed = subscription_data.get('months_subscribed', 1)
        
            # For demo, compute features (in real use, fetch from dataset or input)
            current_date = date(2025, 9, 13)
            start_date = datetime.strptime(subscription_data.get('start_date', '2024-01-01'), '%Y-%m-%d').date()
            last_renewed_date = datetime.strptime(subscription_data.get('last_renewed_date', '2024-01-01'), '%Y-%m-%d').date()
            
            subscription_duration_days = (current_date - start_date).days
            days_since_last_renewed = (current_date - last_renewed_date).days
            
            # Payment failures (mock or fetch)
            payment_failures = subscription_data.get('payment_failures', 0)
            renew_failures = subscription_data.get('renew_failures', 0)
            
            # Categorical (assume inputs or defaults)
            subscription_type = subscription_data.get('subscription_type', 'monthly')
            auto_renewal_allowed = subscription_data.get('auto_renewal_allowed', 'Yes')
            user_status = subscription_data.get('user_status', 'active')
        
            # Encode categoricals
            encoded = []
            for col, val in zip(['Subscription Type', 'Auto Renewal Allowed', 'Status_x'], [subscription_type, auto_renewal_allowed, user_status]):
                le = self.label_encoders.get(col)
                if le:
                    try:
                        encoded.append(le.transform([str(val)])[0])
                    except ValueError:
                        encoded.append(0)  # Default if value not seen during training
                else:
                    encoded.append(0)  # Default if encoder not found
            
            # If we have a trained model, use it
            if hasattr(self.churn_model, 'predict_proba') and len(encoded) > 0:
                # Prepare input
                input_features = [price, subscription_duration_days, days_since_last_renewed, payment_failures, renew_failures] + encoded
                input_df = pd.DataFrame([input_features], columns=['Price', 'subscription_duration_days', 'days_since_last_renewed', 'payment_failures', 'renew_failures', 'Subscription Type', 'Auto Renewal Allowed', 'Status_x'])
                
                # Predict
                churn_probability = self.churn_model.predict_proba(input_df)[0][1]
            else:
                # Use rule-based fallback if model not available
                churn_probability = self._rule_based_churn_prediction(price, months_subscribed, payment_failures, renew_failures)
            
            risk_level = 'high' if churn_probability > 0.7 else 'medium' if churn_probability > 0.4 else 'low'
            
            # Mock factors for now (can use feature importance later)
            churn_factors = {
                'low_usage': random.uniform(0, 1),
                'high_price': 1.0 if price > 70 else 0.0,
                'new_customer': 1.0 if months_subscribed < 3 else 0.0,
                'support_issues': random.uniform(0, 1),
                'payment_issues': min(payment_failures * 0.3, 1.0)
            }
            
            return {
                'churn_probability': round(churn_probability, 2),
                'risk_level': risk_level,
                'factors': churn_factors,
                'retention_strategies': self._get_retention_strategies(churn_factors, subscription_data)
            }
        
        except Exception as e:
            print(f"Warning: Error in churn prediction: {str(e)}. Using fallback.")
            # Return fallback prediction
            return {
                'churn_probability': 0.3,
                'risk_level': 'medium',
                'factors': {
                    'low_usage': 0.3,
                    'high_price': 0.2,
                    'new_customer': 0.1,
                    'support_issues': 0.2,
                    'payment_issues': 0.2
                },
                'retention_strategies': ['Provide personalized support', 'Offer loyalty rewards']
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
    
    def _rule_based_churn_prediction(self, price, months_subscribed, payment_failures, renew_failures):
        """Rule-based churn prediction fallback when ML model is not available"""
        churn_score = 0.0
        
        # High price increases churn risk
        if price > 70:
            churn_score += 0.3
        elif price > 50:
            churn_score += 0.1
        
        # New customers more likely to churn
        if months_subscribed < 3:
            churn_score += 0.2
        elif months_subscribed < 6:
            churn_score += 0.1
        
        # Payment issues increase churn
        churn_score += min(payment_failures * 0.15, 0.3)
        churn_score += min(renew_failures * 0.1, 0.2)
        
        # Add some randomness for demo
        churn_score += random.uniform(0, 0.1)
        
        return min(churn_score, 0.95)  # Cap at 95%
    
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
        
        # Get churn prediction using ML model
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