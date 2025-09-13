import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <div className="text-8xl mb-6">💎</div>
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            SubManager
            <span className="block text-4xl font-light text-white/80 mt-2">
              Professional Edition
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            The most advanced subscription management platform with AI-powered analytics, 
            seamless plan transitions, and enterprise-grade security.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/dashboard" className="btn-gradient text-lg px-8 py-4">
              🚀 Get Started
            </Link>
            <Link to="/plans" className="btn-glass text-lg px-8 py-4">
              🔍 Explore Plans
            </Link>
          </div>
        </div>
      </div>
      
      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="card-modern p-8 group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Dashboard</h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">AI-powered insights with real-time usage tracking and predictive analytics</p>
          <Link to="/dashboard" className="btn-gradient w-full text-center block">
            Launch Dashboard
          </Link>
        </div>
        
        <div className="card-modern p-8 group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📋</div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Premium Plans</h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">Flexible subscription tiers from basic to enterprise with instant activation</p>
          <Link to="/plans" className="btn-gradient w-full text-center block">
            Browse Plans
          </Link>
        </div>
        
        <div className="card-modern p-8 group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📈</div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Live Analytics</h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">Advanced metrics with revenue forecasting and churn prediction models</p>
          <Link to="/analytics" className="btn-gradient w-full text-center block">
            View Analytics
          </Link>
        </div>
        
        <div className="card-modern p-8 group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">AI Assistant</h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">Machine learning recommendations for optimal subscription management</p>
          <button className="w-full py-3 px-6 rounded-xl bg-gray-200 text-gray-500 font-semibold">
            Coming Soon
          </button>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="glass-card p-8 mb-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          🚀 Trusted by Thousands of Businesses
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-white/80">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">10K+</div>
            <div className="text-white/80">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50M+</div>
            <div className="text-white/80">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-white/80">Support</div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="text-center">
        <div className="card-modern p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Transform Your Subscription Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using SubManager Pro to streamline their subscription operations.
          </p>
          <Link to="/dashboard" className="btn-gradient text-xl px-12 py-4 mr-4">
            Start Free Trial
          </Link>
          <Link to="/plans" className="btn-glass text-xl px-12 py-4">
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;


