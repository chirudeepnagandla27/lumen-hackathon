import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NetworkData from './pages/NetworkData';
import NetworkStats from './pages/NetworkStats';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/network" element={<NetworkData />} />
            <Route path="/stats" element={<NetworkStats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;


