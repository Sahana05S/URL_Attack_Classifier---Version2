import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, BarChart3, Database, Lock, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="glass-panel" style={{
        padding: '2.5rem',
        flex: '1',
        minWidth: '280px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default'
    }}
        onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.borderColor = 'rgba(177, 59, 255, 0.4)';
            e.currentTarget.style.boxShadow = 'var(--glow-primary)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{
            color: 'var(--primary)',
            marginBottom: '1.5rem',
            background: 'rgba(177, 59, 255, 0.1)',
            width: 'fit-content',
            padding: '1rem',
            borderRadius: '16px',
            boxShadow: '0 0 20px rgba(177, 59, 255, 0.1)'
        }}>
            <Icon size={36} />
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'white' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7' }}>{description}</p>
    </div>
);

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-deep)',
            padding: '2rem 5%',
            backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(177, 59, 255, 0.15) 0%, transparent 50%)'
        }}>
            {/* Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6rem', padding: '1rem 0' }} className="animate-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: 42,
                        height: 42,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        borderRadius: 12,
                        boxShadow: 'var(--glow-primary)'
                    }}></div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', color: 'white' }}>Sentinel AI</h2>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {user ? (
                        <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Command Center</Link>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = 'white'}>Terminal Login</Link>
                            <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>Shield Up Now</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: '8rem', maxWidth: '1000px', margin: '0 auto 8rem' }} className="animate-in">
                <div style={{
                    display: 'inline-block',
                    padding: '0.5rem 1.25rem',
                    background: 'rgba(255, 204, 0, 0.1)',
                    borderRadius: '50px',
                    border: '1px solid rgba(255, 204, 0, 0.2)',
                    color: 'var(--highlight)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    marginBottom: '2rem',
                    boxShadow: 'var(--glow-highlight)'
                }}>
                    ✨ NEW: ML-POWERED EXPLAINABILITY ENGINE
                </div>
                <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '2rem', lineHeight: '1.1', letterSpacing: '-0.04em', background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Next-Gen URL <span className="glow-text">Attack Intelligence</span>
                </h1>
                <p style={{ fontSize: '1.35rem', color: 'var(--text-muted)', marginBottom: '3.5rem', lineHeight: '1.7', maxWidth: '800px', margin: '0 auto 3.5rem' }}>
                    Unmask web threats in real-time. Our hybrid ML-Heuristic engine classifies SQLi, XSS, and SSRF with precision, delivering explainable evidence panels for every incident.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <Link to="/signup" className="btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.15rem', textDecoration: 'none' }}>
                        Establish Protection
                    </Link>
                    <a href="#features" className="glass-panel" style={{ padding: '1.25rem 2.5rem', fontSize: '1.15rem', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        System Overview
                    </a>
                </div>
            </div>

            {/* Features */}
            <div id="features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '8rem' }} className="animate-in">
                <FeatureCard
                    icon={Activity}
                    title="Real-time Detection"
                    description="Continuous monitoring of incoming traffic with instant classification and threat scoring."
                />
                <FeatureCard
                    icon={Search}
                    title="Evidence AI"
                    description="Go beyond 'Flagged'. See exactly which patterns and features triggered each security alert."
                />
                <FeatureCard
                    icon={Database}
                    title="Behavioral Data"
                    description="Maintain complete IP timelines and threat storylines to identify persistent malicious actors."
                />
            </div>

            {/* How it works */}
            <div style={{ marginBottom: '8rem' }} className="animate-in">
                <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem', fontWeight: 800 }}>Pipeline <span className="glow-text">Architecture</span></h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 900, fontSize: '1.5rem', boxShadow: 'var(--glow-primary)' }}>1</div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Normalization Layer</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Raw HTTP logs are parsed and mapped to our secure unified security schema for consistent analysis.</p>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ background: 'rgba(177, 59, 255, 0.1)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)', fontWeight: 900, fontSize: '1.5rem' }}>2</div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>ML Classification Engine</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Dual-stage verification using TF-IDF Vectorization and regex-based heuristics for maximum recall.</p>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                        <div style={{ background: 'rgba(255, 204, 0, 0.1)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--highlight)', fontWeight: 900, fontSize: '1.5rem', boxShadow: 'var(--glow-highlight)' }}>3</div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Explainable Visualization</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Actionable insights delivered through a premium, glassmorphism dashboard with deep-dive forensics.</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={{ textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', padding: '4rem 0' }}>
                <p style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'white' }}>Sentinel AI • URL Attack Classifier</p>
                <p>&copy; 2026 Premium Cyber-Security Analytics Terminal.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
