import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-deep)',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(177, 59, 255, 0.1) 0%, transparent 60%)'
        }}>
            <div className="glass-panel animate-in" style={{
                padding: '3.5rem',
                width: '100%',
                maxWidth: '450px',
                textAlign: 'center',
                background: 'rgba(17, 5, 90, 0.8)',
                boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), var(--glow-primary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        borderRadius: 14,
                        boxShadow: 'var(--glow-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Shield color="white" size={28} />
                    </div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>Sentinel <span className="glow-text">AI</span></h1>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', marginLeft: '0.25rem' }}>Account Username</label>
                        <input
                            type="text"
                            className="glass-panel"
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                borderRadius: '14px',
                                boxSizing: 'border-box'
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', marginLeft: '0.25rem' }}>Security Password</label>
                        <input
                            type="password"
                            className="glass-panel"
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                borderRadius: '14px',
                                boxSizing: 'border-box'
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger)',
                            padding: '0.75rem',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1.1rem' }}>
                        Establish Secure Session
                    </button>
                </form>

                <p style={{ marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Unauthorized access? <Link to="/signup" className="glow-text" style={{ textDecoration: 'none' }}>Initialize new credentials</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
