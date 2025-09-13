import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-telecom-primary font-semibold' : 'text-gray-600 hover:text-telecom-primary';
  };

  return (
    <nav className="glass-card fixed w-full top-0 z-50 border-0 border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-3xl">💎</div>
            <span className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform">
              SubManager Pro
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              location.pathname === '/' 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}>
              🏠 Home
            </Link>
            <Link to="/dashboard" className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              location.pathname === '/dashboard' 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}>
              📊 Dashboard
            </Link>
            <Link to="/plans" className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              location.pathname === '/plans' 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}>
              📋 Plans
            </Link>
            <Link to="/analytics" className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              location.pathname === '/analytics' 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}>
              📈 Analytics
            </Link>
            <Link to="/login" className="btn-glass ml-4">
              🔐 Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


