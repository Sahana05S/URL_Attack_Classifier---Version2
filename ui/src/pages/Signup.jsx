import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(username, password);
            navigate('/');
        } catch (err) {
            console.error('Signup Error:', err);
            setError(err.message || 'Signup failed.');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)'
        }}>
            <div className="glass-panel" style={{ padding: '2.5rem', width: '400px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <UserPlus color="var(--accent)" size={40} />
                    <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Create Account</h1>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Username</label>
                        <input
                            type="text"
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', background: 'rgba(0,0,0,0.2)' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Password</label>
                        <input
                            type="password"
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', background: 'rgba(0,0,0,0.2)' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '0.75rem' }}>
                        Register
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
