import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Activity, Pause, Play, RefreshCw, Filter, Shield, AlertTriangle, CheckCircle, XCircle, Wifi } from 'lucide-react';
import { fetchEvents } from '../api';

const ATTACK_COLORS = {
    'SQL Injection':    { bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.4)',    text: '#f87171' },
    'XSS':             { bg: 'rgba(251,146,60,0.12)',   border: 'rgba(251,146,60,0.4)',   text: '#fb923c' },
    'Path Traversal':  { bg: 'rgba(234,179,8,0.12)',    border: 'rgba(234,179,8,0.4)',    text: '#facc15' },
    'Command Injection':{ bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',    text: '#f87171' },
    'SSRF':            { bg: 'rgba(168,85,247,0.12)',   border: 'rgba(168,85,247,0.4)',   text: '#c084fc' },
    'Open Redirect':   { bg: 'rgba(251,146,60,0.12)',   border: 'rgba(251,146,60,0.4)',   text: '#fb923c' },
    'Normal':          { bg: 'rgba(16,185,129,0.09)',   border: 'rgba(16,185,129,0.3)',   text: '#34d399' },
};

const getAttackStyle = (type) => ATTACK_COLORS[type] || { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' };

const Badge = ({ label, style }) => (
    <span style={{
        padding: '0.2rem 0.65rem',
        borderRadius: '999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.text,
        whiteSpace: 'nowrap',
    }}>{label}</span>
);

const StatusDot = ({ active }) => (
    <span style={{
        display: 'inline-block',
        width: 9, height: 9,
        borderRadius: '50%',
        background: active ? 'var(--success)' : '#475569',
        boxShadow: active ? '0 0 8px #10b981' : 'none',
        animation: active ? 'pulse-dot 1.5s infinite' : 'none',
        flexShrink: 0,
    }} />
);

const ATTACK_TYPES = ['All', 'SQL Injection', 'XSS', 'Path Traversal', 'Command Injection', 'SSRF', 'Open Redirect', 'Normal'];
const REFRESH_INTERVALS = [3, 5, 10, 30];

const LiveEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [filter, setFilter] = useState('All');
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [newCount, setNewCount] = useState(0);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const prevCountRef = useRef(0);

    const refresh = useCallback(async () => {
        try {
            const data = await fetchEvents(200);
            setEvents(data);
            const diff = data.length - prevCountRef.current;
            if (diff > 0 && prevCountRef.current > 0) setNewCount(diff);
            prevCountRef.current = data.length;
            setLastRefresh(new Date());
            setError(null);
        } catch (e) {
            setError('Failed to fetch events. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (paused) {
            clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(refresh, refreshInterval * 1000);
        return () => clearInterval(intervalRef.current);
    }, [paused, refreshInterval, refresh]);

    useEffect(() => {
        if (newCount > 0) {
            const t = setTimeout(() => setNewCount(0), 3000);
            return () => clearTimeout(t);
        }
    }, [newCount]);

    const filtered = filter === 'All' ? events : events.filter(e => e.attack_type === filter);
    const threatCount = events.filter(e => e.attack_type !== 'Normal').length;
    const successCount = events.filter(e => e.is_successful).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-in">
            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(-12px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .event-row {
                    animation: slide-in 0.3s ease;
                    transition: background 0.2s;
                }
                .event-row:hover { background: rgba(177,59,255,0.06) !important; }
                .filter-btn { transition: all 0.2s; cursor: pointer; border: none; font-family: inherit; font-size: 0.82rem; font-weight: 600; }
                .filter-btn:hover { transform: translateY(-1px); }
            `}</style>

            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Live <span className="glow-text">Events</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.35rem' }}>
                        <StatusDot active={!paused} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                            {paused ? 'Feed paused' : `Auto-refreshing every ${refreshInterval}s`}
                            {lastRefresh && !paused && (
                                <span style={{ marginLeft: '0.5rem', color: '#475569', fontSize: '0.85rem' }}>
                                    · Last: {lastRefresh.toLocaleTimeString()}
                                </span>
                            )}
                        </span>
                        {newCount > 0 && (
                            <span style={{
                                padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem',
                                fontWeight: 700, background: 'rgba(16,185,129,0.15)',
                                border: '1px solid rgba(16,185,129,0.4)', color: '#34d399'
                            }}>+{newCount} new</span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Refresh interval */}
                    <select
                        value={refreshInterval}
                        onChange={e => setRefreshInterval(Number(e.target.value))}
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-muted)', borderRadius: 10, padding: '0.5rem 0.85rem',
                            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem'
                        }}
                    >
                        {REFRESH_INTERVALS.map(s => <option key={s} value={s}>{s}s interval</option>)}
                    </select>

                    {/* Manual refresh */}
                    <button
                        onClick={refresh}
                        className="glass-panel"
                        title="Refresh now"
                        style={{ padding: '0.5rem 0.85rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--glass-border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                        onMouseOver={e => e.currentTarget.style.color = 'white'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>

                    {/* Pause/Resume */}
                    <button
                        onClick={() => setPaused(p => !p)}
                        className="btn-primary"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.1rem',
                            background: paused ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(239,68,68,0.1)',
                            color: paused ? 'white' : '#f87171',
                            border: paused ? 'none' : '1px solid rgba(239,68,68,0.3)',
                            boxShadow: 'none',
                        }}
                    >
                        {paused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
                    </button>
                </div>
            </header>

            {/* Stat pills */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[
                    { icon: Activity, label: 'Total Events', value: events.length, color: '177,59,255' },
                    { icon: AlertTriangle, label: 'Threats Detected', value: threatCount, color: '239,68,68' },
                    { icon: CheckCircle, label: 'Successful Attacks', value: successCount, color: '251,146,60' },
                    { icon: Shield, label: 'Normal Traffic', value: events.length - threatCount, color: '16,185,129' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="glass-panel" style={{
                        padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 160px'
                    }}>
                        <div style={{ padding: '0.6rem', background: `rgba(${color},0.1)`, borderRadius: 10, color: `rgb(${color})` }}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <Filter size={15} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginRight: '0.25rem' }}>Filter:</span>
                {ATTACK_TYPES.map(type => {
                    const s = getAttackStyle(type);
                    const active = filter === type;
                    return (
                        <button
                            key={type}
                            className="filter-btn"
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '0.3rem 0.85rem', borderRadius: '999px',
                                background: active ? s.bg : 'transparent',
                                border: `1px solid ${active ? s.border : 'rgba(255,255,255,0.08)'}`,
                                color: active ? s.text : 'var(--text-muted)',
                            }}
                        >
                            {type}
                        </button>
                    );
                })}
                {filter !== 'All' && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {filtered.length} / {events.length} shown
                    </span>
                )}
            </div>

            {/* Events Table */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {error ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#f87171', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <Wifi size={36} />
                        <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
                    </div>
                ) : loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
                        <p>Loading events...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Shield size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ margin: 0, fontSize: '1.05rem' }}>No events found.</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Upload a log file from the Upload Data tab to populate this feed.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                                    {['Timestamp', 'Source IP', 'Method', 'URL', 'Attack Type', 'Status', 'Outcome'].map(h => (
                                        <th key={h} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((e, i) => {
                                    const s = getAttackStyle(e.attack_type);
                                    return (
                                        <tr key={e.event_id || i} className="event-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'transparent' }}>
                                            <td style={{ padding: '0.8rem 1.25rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {new Date(e.timestamp).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.8rem 1.25rem', fontFamily: 'monospace', fontWeight: 600, color: e.attack_type !== 'Normal' ? '#f87171' : '#94a3b8', whiteSpace: 'nowrap' }}>
                                                {e.source_ip}
                                            </td>
                                            <td style={{ padding: '0.8rem 1.25rem' }}>
                                                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(177,59,255,0.1)', color: 'var(--primary)', border: '1px solid rgba(177,59,255,0.2)' }}>
                                                    {e.http_method || 'GET'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.8rem 1.25rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }} title={e.url}>
                                                {e.url}
                                            </td>
                                            <td style={{ padding: '0.8rem 1.25rem' }}>
                                                <Badge label={e.attack_type} style={s} />
                                            </td>
                                            <td style={{ padding: '0.8rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: e.status_code >= 400 ? '#f87171' : '#34d399' }}>
                                                {e.status_code}
                                            </td>
                                            <td style={{ padding: '0.8rem 1.25rem' }}>
                                                {e.is_successful
                                                    ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fb923c', fontWeight: 600, fontSize: '0.8rem' }}><AlertTriangle size={13} /> Exploited</span>
                                                    : <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}><CheckCircle size={13} /> Blocked</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveEvents;
