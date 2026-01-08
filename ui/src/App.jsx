import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Activity, Settings, UploadCloud } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Investigation from './pages/Investigation';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadLogs from './pages/UploadLogs';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>;
  if (!user) return <Navigate to="/landing" state={{ from: location }} replace />;

  return children;
};

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Overview' },
    { path: '/investigate', icon: ShieldAlert, label: 'Investigation' },
    { path: '/upload', icon: UploadCloud, label: 'Upload Data' },
    { path: '/live', icon: Activity, label: 'Live Events' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const { logout, user } = useAuth();

  return (
    <div className="glass-panel" style={{
      width: '260px',
      height: '95vh',
      margin: '2.5vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      background: 'rgba(17, 5, 90, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem', gap: '1rem' }}>
        <div style={{
          width: 40,
          height: 40,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          borderRadius: 12,
          boxShadow: 'var(--glow-primary)'
        }}></div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: 'white' }}>Sentinel AI</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'max(0.75rem, 0.5vh)' }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 1.25rem',
              borderRadius: '14px',
              textDecoration: 'none',
              color: isActive(item.path) ? 'white' : 'var(--text-muted)',
              background: isActive(item.path) ? 'rgba(177, 59, 255, 0.15)' : 'transparent',
              border: isActive(item.path) ? '1px solid rgba(177, 59, 255, 0.3)' : '1px solid transparent',
              boxShadow: isActive(item.path) ? '0 0 15px rgba(177, 59, 255, 0.1)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: isActive(item.path) ? 600 : 400
            }}
            onMouseOver={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <item.icon size={22} color={isActive(item.path) ? 'var(--primary)' : 'currentColor'} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>User Session</p>
        <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--highlight)' }}>{user?.username}</p>
        <button
          onClick={logout}
          className="glass-panel"
          style={{
            width: '100%',
            padding: '0.75rem',
            color: 'var(--danger)',
            cursor: 'pointer',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            fontWeight: 600
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/*" element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const AuthenticatedLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5vh 2.5vh 2.5vh 0', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/investigate" element={<Investigation />} />
          <Route path="/upload" element={<UploadLogs />} />
          <Route path="*" element={<div style={{ color: 'white' }}>Work in Progress</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
