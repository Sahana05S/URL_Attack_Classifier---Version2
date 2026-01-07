import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, BarChart3, Database, Lock, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', flex: '1', minWidth: '250px' }}>
        <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
            <Icon size={32} />
        </div>
        <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{description}</p>
    </div>
);

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '2rem' }}>
            {/* Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield color="var(--primary)" size={32} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Sentinel AI</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {user ? (
                        <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem' }}>Log In</Link>
                            <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: '6rem', maxWidth: '800px', margin: '0 auto 6rem' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Next-Gen URL Attack Classification
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    Automatically detect and classify web-based attacks using machine learning and heuristic rules.
                    Real-time analysis, explainable AI, and actionable security insights.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                    <Link to="/signup" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>
                        Start Protecting
                    </Link>
                    <a href="#features" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        Learn More
                    </a>
                </div>
            </div>

            {/* Features */}
            <div id="features" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '6rem' }}>
                <FeatureCard
                    icon={Activity}
                    title="Real-time Detection"
                    description="Monitor incoming requests and identify SQLi, XSS, SSRF, and more as they happen."
                />
                <FeatureCard
                    icon={Search}
                    title="Explainable UI"
                    description="Understand why an attack was flagged with our deep-dive evidence panel."
                />
                <FeatureCard
                    icon={BarChart3}
                    title="Threat Scoring"
                    description="Dynamic risk assessment for every source IP based on historical behavior."
                />
            </div>

            {/* How it works */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ background: 'var(--primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                        <div>
                            <h3>Ingest & Pre-process</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We take raw HTTP logs and normalize them into a unified security schema.</p>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ background: 'var(--accent)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                        <div>
                            <h3>Classify & Score</h3>
                            <p style={{ color: 'var(--text-muted)' }}>TF-IDF models and heuristic rules work together to determine the attack type and confidence.</p>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ background: 'var(--success)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                        <div>
                            <h3>Investigate & Act</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Review storylines and take defensive actions to block malicious actors.</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={{ textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                <p>&copy; 2026 Sentinel AI URL Attack Classifier. Premium Security Dashboard.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
