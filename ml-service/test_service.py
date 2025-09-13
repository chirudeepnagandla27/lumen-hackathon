#!/usr/bin/env python3
"""
Test script for the ML service to verify it's working correctly
"""

import requests
import json

def test_ml_service():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing ML Service...")
    
    # Test health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
        return False
    
    # Test plan recommendation
    print("\n2. Testing plan recommendation...")
    try:
        recommendation_data = {
            "monthly_usage_gb": 300,
            "budget_max": 60,
            "current_plan": {"price": 45},
            "service_type_preference": "Fibernet"
        }
        response = requests.post(f"{base_url}/recommend", json=recommendation_data)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Recommendations: {len(result.get('recommendations', []))}")
        if result.get('success'):
            print("   ✅ Plan recommendation working!")
        else:
            print(f"   ❌ Plan recommendation failed: {result.get('error')}")
    except Exception as e:
        print(f"   ❌ Plan recommendation test failed: {e}")
    
    # Test churn prediction
    print("\n3. Testing churn prediction...")
    try:
        churn_data = {
            "subscription_id": "test-123",
            "price": 49.99,
            "months_subscribed": 6,
            "start_date": "2024-01-01",
            "last_renewed_date": "2024-06-01",
            "payment_failures": 1,
            "renew_failures": 0,
            "subscription_type": "monthly",
            "auto_renewal_allowed": "Yes",
            "user_status": "active"
        }
        response = requests.post(f"{base_url}/churn/predict", json=churn_data)
        print(f"   Status: {response.status_code}")
        result = response.json()
        if result.get('success'):
            churn_prob = result.get('churn_prediction', {}).get('churn_probability')
            print(f"   Churn Probability: {churn_prob}")
            print("   ✅ Churn prediction working!")
        else:
            print(f"   ❌ Churn prediction failed: {result.get('error')}")
    except Exception as e:
        print(f"   ❌ Churn prediction test failed: {e}")
    
    # Test pricing optimization
    print("\n4. Testing pricing optimization...")
    try:
        pricing_data = {
            "current_price": 49.99,
            "subscriber_count": 150,
            "churn_rate": 0.08,
            "competitor_prices": [45.99, 52.99, 48.99]
        }
        response = requests.post(f"{base_url}/pricing/optimize", json=pricing_data)
        print(f"   Status: {response.status_code}")
        result = response.json()
        if result.get('success'):
            optimization = result.get('optimization', {})
            print(f"   Current Price: ${optimization.get('current_price')}")
            print(f"   Suggested Price: ${optimization.get('suggested_price')}")
            print(f"   Strategy: {optimization.get('strategy')}")
            print("   ✅ Pricing optimization working!")
        else:
            print(f"   ❌ Pricing optimization failed: {result.get('error')}")
    except Exception as e:
        print(f"   ❌ Pricing optimization test failed: {e}")
    
    print("\n🎉 ML Service test completed!")
    return True

if __name__ == "__main__":
    test_ml_service()
