import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-telecom-primary mb-8">
        📡 Boiler Mate
      </h1>
      <p className="text-xl text-gray-600 mb-12">
        Telecom Network Management & Analytics Platform
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Network Data</h3>
          <p className="text-gray-600 mb-4">View real-time network tower data and performance metrics</p>
          <Link 
            to="/network" 
            className="inline-block bg-telecom-primary text-white px-6 py-2 rounded-lg hover:bg-telecom-secondary transition-colors"
          >
            View Data
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-2">Analytics</h3>
          <p className="text-gray-600 mb-4">Comprehensive network statistics and performance insights</p>
          <Link 
            to="/stats" 
            className="inline-block bg-telecom-primary text-white px-6 py-2 rounded-lg hover:bg-telecom-secondary transition-colors"
          >
            View Stats
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
          <p className="text-gray-600 mb-4">Machine learning powered network optimization</p>
          <button className="inline-block bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>
      
      <div className="mt-16 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-semibold text-telecom-primary mb-4">
          🚀 Hackathon Ready!
        </h2>
        <p className="text-gray-700">
          This boilerplate is ready for rapid development. When the PRD is provided, 
          we can quickly customize the features and add the specific requirements.
        </p>
      </div>
    </div>
  );
};

export default Home;


