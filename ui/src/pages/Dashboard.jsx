import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { getTimeline, getTopIPs } from '../api';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', background: `rgba(${color}, 0.2)`, borderRadius: '12px', color: `rgb(${color})` }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <header>
                <h1 style={{ margin: 0 }}>Security Overview</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Real-time threat monitoring</p>
            </header>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <StatCard title="Total Events" value={timeline.reduce((acc, curr) => acc + curr.attempt + curr.success, 0)} icon={Activity} color="59, 130, 246" />
                <StatCard title="Blocked Attacks" value={timeline.reduce((acc, curr) => acc + curr.attempt, 0)} icon={CheckCircle} color="16, 185, 129" />
                <StatCard title="Critical Incidents" value={timeline.reduce((acc, curr) => acc + curr.success, 0)} icon={AlertTriangle} color="239, 68, 68" />
            </div>

            {/* Main Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
                <h3 style={{ margin: '0 0 1.5rem 0' }}>Attack Volume Timeline</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline}>
                        <defs>
                            <linearGradient id="colorAttack" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                        <Area type="monotone" dataKey="attempt" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="success" stackId="1" stroke="#ef4444" fill="url(#colorAttack)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Top IPs */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>High Risk Sources</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {topIps.map((ip, idx) => (
                        <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between', padding: '1rem',
                            background: 'rgba(255,255,255,0.03)', borderRadius: '8px'
                        }}>
                            <span style={{ fontWeight: 500 }}>{ip.ip}</span>
                            <span style={{ color: '#ef4444' }}>{ip.count} events</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
