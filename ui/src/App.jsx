import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Activity, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Investigation from './pages/Investigation';
import './index.css';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Overview' },
    { path: '/investigate', icon: ShieldAlert, label: 'Investigation' },
    { path: '/live', icon: Activity, label: 'Live Events' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="glass-panel" style={{
      width: '240px',
      height: '95vh',
      margin: '2.5vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '0.75rem' }}>
        <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8 }}></div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Sentinel AI</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive(item.path) ? 'white' : 'var(--text-muted)',
              background: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2.5vh 2.5vh 2.5vh 0', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/investigate" element={<Investigation />} />
            <Route path="*" element={<div style={{ color: 'white' }}>Work in Progress</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
