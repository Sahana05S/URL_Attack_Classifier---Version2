import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, ShieldAlert } from 'lucide-react';
import { getTimeline, getTopIPs } from '../api';

const StatCard = ({ title, value, icon: Icon, color, isHighlight }) => (
    <div className="glass-panel" style={{
        padding: '1.75rem',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        border: isHighlight ? '1px solid rgba(255, 204, 0, 0.3)' : '1px solid var(--glass-border)',
        boxShadow: isHighlight ? 'var(--glow-highlight)' : 'none'
    }}>
        <div style={{
            padding: '0.875rem',
            background: isHighlight ? 'rgba(255, 204, 0, 0.1)' : `rgba(${color}, 0.1)`,
            borderRadius: '14px',
            color: isHighlight ? 'var(--highlight)' : `rgb(${color})`,
            boxShadow: isHighlight ? 'var(--glow-highlight)' : 'none'
        }}>
            <Icon size={26} />
        </div>
        <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</div>
            <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: isHighlight ? 'var(--highlight)' : 'white',
                textShadow: isHighlight ? 'var(--glow-highlight)' : 'none'
            }}>{value}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const [timeline, setTimeline] = useState([]);
    const [topIps, setTopIps] = useState([]);

    useEffect(() => {
        getTimeline().then(setTimeline);
        getTopIPs().then(setTopIps);
    }, []);

    const totalEvents = timeline.reduce((acc, curr) => acc + curr.attempt + curr.success, 0);
    const blockedAttacks = timeline.reduce((acc, curr) => acc + curr.attempt, 0);
    const criticalIncidents = timeline.reduce((acc, curr) => acc + curr.success, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Security <span className="glow-text">Overview</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>Real-time threat monitoring dashboard</p>
                </div>
                <button
                    onClick={async () => {
                        if (window.confirm("Are you sure you want to clear all data?")) {
                            const { clearAllEvents } = await import('../api');
                            await clearAllEvents();
                            window.location.reload();
                        }
                    }}
                    className="btn-primary"
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        boxShadow: 'none'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    Reset System State
                </button>
            </header>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <StatCard title="Total Events" value={totalEvents} icon={Activity} color="177, 59, 255" />
                <StatCard title="Blocked Attacks" value={blockedAttacks} icon={CheckCircle} color="16, 185, 129" />
                <StatCard title="Critical Incidents" value={criticalIncidents} icon={AlertTriangle} isHighlight={criticalIncidents > 0} color="255, 204, 0" />
            </div>

            {/* Main Chart */}
            <div className="glass-panel" style={{ padding: '2rem', height: '450px' }}>
                <h3 style={{ margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={20} color="var(--primary)" />
                    Attack Volume Timeline
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={timeline}>
                        <defs>
                            <linearGradient id="colorAttack" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--highlight)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--highlight)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                            }}
                        />
                        <Area type="monotone" dataKey="attempt" stackId="1" stroke="var(--primary)" fill="url(#colorAttack)" strokeWidth={3} />
                        <Area type="monotone" dataKey="success" stackId="1" stroke="var(--highlight)" fill="url(#colorCritical)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Top IPs */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldAlert size={20} color="var(--highlight)" />
                    Most Active Threat Actors
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {topIps.map((ip, idx) => (
                        <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between', padding: '1.25rem',
                            background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.2s'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(177, 59, 255, 0.3)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                        >
                            <span style={{ fontWeight: 600, color: 'white' }}>{ip.ip}</span>
                            <span style={{ color: 'var(--highlight)', fontWeight: 700, textShadow: 'var(--glow-highlight)' }}>{ip.count} events</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
