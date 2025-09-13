import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlanBrowser from './pages/NetworkData';
import AnalyticsDashboard from './pages/NetworkStats';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plans" element={<PlanBrowser />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;


