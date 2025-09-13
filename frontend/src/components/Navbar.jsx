import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-telecom-primary font-semibold' : 'text-gray-600 hover:text-telecom-primary';
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-telecom-primary">
            📡 Boiler Mate
          </Link>
          
          <div className="space-x-6">
            <Link to="/" className={isActive('/')}>
              Home
            </Link>
            <Link to="/network" className={isActive('/network')}>
              Network Data
            </Link>
            <Link to="/stats" className={isActive('/stats')}>
              Statistics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


