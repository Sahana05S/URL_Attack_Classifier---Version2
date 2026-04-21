import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Info, CheckCircle, XCircle, Eye, EyeOff, ChevronRight, Cpu, Database, AlertOctagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = `http://${window.location.hostname}:8000`;

const Section = ({ icon: Icon, title, children }) => (
    <div className="glass-panel animate-in" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.25rem' }}>
            <div style={{ padding: '0.55rem', background: 'rgba(177,59,255,0.12)', borderRadius: 10, color: 'var(--primary)' }}>
                <Icon size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{title}</h3>
        </div>
        {children}
    </div>
);

const ToggleRow = ({ label, description, enabled, onToggle }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
            <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{label}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{description}</div>
        </div>
        <button
            onClick={onToggle}
            style={{
                width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: enabled ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'all 0.3s', flexShrink: 0,
                boxShadow: enabled ? 'var(--glow-primary)' : 'none',
            }}
            aria-checked={enabled}
            role="switch"
        >
            <span style={{
                position: 'absolute', top: 3, left: enabled ? 23 : 3,
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
            }} />
        </button>
    </div>
);

const InfoRow = ({ label, value, mono }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{label}</span>
        <span style={{ fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? '0.85rem' : '0.95rem', color: 'white' }}>{value}</span>
    </div>
);

const SettingsPage = () => {
    const { user } = useAuth();

    // Password change state
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [pwStatus, setPwStatus] = useState(null); // { type: 'success'|'error', msg }
    const [pwLoading, setPwLoading] = useState(false);

    // Preferences state
    const [prefs, setPrefs] = useState({
        autoRefresh: true,
        soundAlerts: false,
        showNormalTraffic: true,
        compactView: false,
    });

    const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwStatus(null);
        if (newPw !== confirmPw) { setPwStatus({ type: 'error', msg: 'New passwords do not match.' }); return; }
        if (newPw.length < 6) { setPwStatus({ type: 'error', msg: 'Password must be at least 6 characters.' }); return; }

        setPwLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ current_password: currentPw, new_password: newPw })
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.detail || 'Failed to change password');
            }
            setPwStatus({ type: 'success', msg: 'Password changed successfully!' });
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) {
            setPwStatus({ type: 'error', msg: err.message });
        } finally {
            setPwLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
        color: 'white', fontFamily: 'inherit', fontSize: '0.95rem',
        outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <style>{`
                .settings-input:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(177,59,255,0.15); }
                .settings-input::placeholder { color: #475569; }
            `}</style>

            <header>
                <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    System <span className="glow-text">Settings</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0', fontSize: '1rem' }}>
                    Manage your account, preferences, and system configuration.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>

                {/* Account Info */}
                <Section icon={User} title="Account">
                    <InfoRow label="Username" value={user?.username || '—'} />
                    <InfoRow label="Role" value={user?.role || 'analyst'} />
                    <InfoRow label="Session Token" value="••••••••••••••••" mono />
                    <div style={{ marginTop: '1.25rem' }}>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={() => window.location.href = '/landing'}
                        >
                            <ChevronRight size={16} /> View Profile
                        </button>
                    </div>
                </Section>

                {/* Change Password */}
                <Section icon={Lock} title="Change Password">
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.04em' }}>CURRENT PASSWORD</label>
                            <input
                                type={showPw ? 'text' : 'password'}
                                className="settings-input"
                                style={inputStyle}
                                value={currentPw}
                                onChange={e => setCurrentPw(e.target.value)}
                                placeholder="Enter current password"
                                required
                                id="settings-current-password"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.04em' }}>NEW PASSWORD</label>
                            <input
                                type={showPw ? 'text' : 'password'}
                                className="settings-input"
                                style={inputStyle}
                                value={newPw}
                                onChange={e => setNewPw(e.target.value)}
                                placeholder="Min. 6 characters"
                                required
                                id="settings-new-password"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.04em' }}>CONFIRM NEW PASSWORD</label>
                            <input
                                type={showPw ? 'text' : 'password'}
                                className="settings-input"
                                style={inputStyle}
                                value={confirmPw}
                                onChange={e => setConfirmPw(e.target.value)}
                                placeholder="Repeat new password"
                                required
                                id="settings-confirm-password"
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => setShowPw(p => !p)}>
                            {showPw ? <EyeOff size={15} color="var(--text-muted)" /> : <Eye size={15} color="var(--text-muted)" />}
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>Show passwords</span>
                        </div>

                        {pwStatus && (
                            <div style={{
                                padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: pwStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${pwStatus.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                color: pwStatus.type === 'success' ? '#34d399' : '#f87171',
                            }}>
                                {pwStatus.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                {pwStatus.msg}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={pwLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} id="settings-change-password-btn">
                            <Lock size={15} /> {pwLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </Section>

                {/* Preferences */}
                <Section icon={Bell} title="Display & Alerts">
                    <ToggleRow label="Auto-Refresh Feed" description="Automatically poll for new events on the Live Events page" enabled={prefs.autoRefresh} onToggle={() => toggle('autoRefresh')} />
                    <ToggleRow label="Sound Alerts" description="Play a sound when new threat events are detected" enabled={prefs.soundAlerts} onToggle={() => toggle('soundAlerts')} />
                    <ToggleRow label="Show Normal Traffic" description="Include benign requests in the event feed and charts" enabled={prefs.showNormalTraffic} onToggle={() => toggle('showNormalTraffic')} />
                    <ToggleRow label="Compact Table View" description="Reduce row height in event tables" enabled={prefs.compactView} onToggle={() => toggle('compactView')} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1.25rem', marginBottom: 0 }}>
                        * Preferences are stored locally in your browser session.
                    </p>
                </Section>

                {/* System Info */}
                <Section icon={Cpu} title="System Info">
                    <InfoRow label="Application" value="Sentinel AI" />
                    <InfoRow label="Version" value="v2.0.0" />
                    <InfoRow label="Detection Engine" value="URLAttackDetector" mono />
                    <InfoRow label="Backend" value="FastAPI / Python" />
                    <InfoRow label="Frontend" value="React + Vite" />
                    <InfoRow label="API Base" value={API_BASE} mono />
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <a
                            href={`${API_BASE}/docs`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', fontSize: '0.875rem', flex: 1, justifyContent: 'center' }}
                        >
                            <Info size={15} /> API Docs
                        </a>
                        <a
                            href="https://github.com/Sahana05S/URL_Attack_Classifier---Version2"
                            target="_blank"
                            rel="noreferrer"
                            className="glass-panel"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', fontSize: '0.875rem', color: 'var(--text-muted)', flex: 1, justifyContent: 'center', transition: 'color 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.color = 'white'}
                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            <Shield size={15} /> GitHub Repo
                        </a>
                    </div>
                </Section>

                {/* Danger Zone */}
                <Section icon={AlertOctagon} title="Danger Zone">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0 }}>
                        These actions are irreversible. Proceed with caution.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            className="glass-panel"
                            style={{ padding: '0.9rem 1.25rem', cursor: 'pointer', color: '#f87171', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                            onClick={async () => {
                                if (window.confirm('Clear ALL events from memory? This cannot be undone.')) {
                                    const { clearAllEvents } = await import('../api');
                                    await clearAllEvents();
                                    alert('All events cleared.');
                                }
                            }}
                            id="settings-clear-events-btn"
                        >
                            <Database size={15} /> Clear All Events
                        </button>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default SettingsPage;
