import React, { useState, useEffect } from 'react';
import { Search, Shield, FileText } from 'lucide-react';
import { fetchEvents, getExplanation, getStoryline } from '../api';

const Investigation = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [storyline, setStoryline] = useState([]);
    const [explanation, setExplanation] = useState(null);

    useEffect(() => {
        fetchEvents().then(setEvents);
    }, []);

    const handleEventClick = async (event) => {
        setSelectedEvent(event);
        const exp = await getExplanation(event.event_id);
        setExplanation(exp);
        const story = await getStoryline(event.source_ip);
        setStoryline(story);
    };

    return (
        <div style={{ display: 'flex', height: '88vh', gap: '2rem' }} className="animate-in">

            {/* List Panel */}
            <div className="glass-panel" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'rgba(17, 5, 90, 0.4)'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            placeholder="Filter by IP or Attack..."
                            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '0.95rem' }}
                        />
                    </div>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
                    {events.map(e => (
                        <div
                            key={e.event_id}
                            onClick={() => handleEventClick(e)}
                            style={{
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                background: selectedEvent?.event_id === e.event_id ? 'rgba(177, 59, 255, 0.1)' : 'transparent',
                                borderLeft: selectedEvent?.event_id === e.event_id ? '4px solid var(--primary)' : '4px solid transparent',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if (selectedEvent?.event_id !== e.event_id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }}
                            onMouseOut={(e) => {
                                if (selectedEvent?.event_id !== e.event_id) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{
                                    fontWeight: 700,
                                    color: e.is_successful ? 'var(--highlight)' : 'var(--primary)',
                                    textShadow: e.is_successful ? 'var(--glow-highlight)' : 'none'
                                }}>{e.attack_type}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>{e.source_ip}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.7 }}>
                                {e.url}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Panel */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Explainability Card */}
                {selectedEvent && explanation ? (
                    <div className="glass-panel animate-in" style={{ padding: '2.5rem', background: 'rgba(17, 5, 90, 0.6)' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.75rem' }}>
                            <div style={{
                                padding: '0.75rem',
                                background: selectedEvent.is_successful ? 'rgba(255, 204, 0, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '14px',
                                boxShadow: selectedEvent.is_successful ? 'var(--glow-highlight)' : 'none'
                            }}>
                                <Shield color={selectedEvent.is_successful ? "var(--highlight)" : "#10b981"} size={32} />
                            </div>
                            Incident <span className="glow-text">Intelligence</span>
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em', fontWeight: 600 }}>DETECTION CONFIDENCE</label>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginTop: '0.5rem' }}>
                                    {(explanation.confidence * 100).toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--primary)' }}>%</span>
                                </div>
                            </div>
                            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em', fontWeight: 600 }}>HEURISTIC MARKERS</label>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                                    {Object.entries(explanation.rule_hits).map(([type, rules]) => (
                                        <span key={type} style={{
                                            background: 'rgba(177, 59, 255, 0.15)',
                                            color: 'var(--primary)',
                                            padding: '0.5rem 0.8rem',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            border: '1px solid rgba(177, 59, 255, 0.2)'
                                        }}>{type}</span>
                                    ))}
                                    {!Object.keys(explanation.rule_hits).length && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Neural Network Prediction</span>}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>MALICIOUS PAYLOAD ANALYSIS</label>
                            <div style={{
                                background: 'rgba(0,0,0,0.4)',
                                padding: '1.5rem',
                                borderRadius: '14px',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.95rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: 'var(--highlight)',
                                overflowX: 'auto'
                            }}>
                                {explanation.payload_snippet || "No significant payload detected in this request string."}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(17, 5, 90, 0.3)' }}>
                        <FileText size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>Select an event from the telemetry stream to begin deep-dive forensics</p>
                    </div>
                )}

                {/* Storyline Timeline */}
                {selectedEvent && (
                    <div className="glass-panel animate-in" style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', background: 'rgba(17, 5, 90, 0.4)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '2.5rem', fontSize: '1.5rem' }}>
                            Threat Storyline: <span style={{ color: 'white' }}>{selectedEvent.source_ip}</span>
                        </h3>
                        <div style={{ borderLeft: '2px solid var(--accent)', marginLeft: '1rem', paddingLeft: '2.5rem' }}>
                            {storyline.map((evt) => (
                                <div key={evt.event_id} style={{ position: 'relative', marginBottom: '2rem' }}>
                                    <div style={{
                                        position: 'absolute', left: '-3.15rem', top: '0.4rem', width: '18px', height: '18px', borderRadius: '50%',
                                        background: evt.is_successful ? 'var(--highlight)' : 'var(--primary)',
                                        border: '4px solid var(--bg-deep)',
                                        boxShadow: evt.is_successful ? 'var(--glow-highlight)' : 'var(--glow-primary)'
                                    }}></div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(evt.timestamp).toLocaleString()}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: '0.25rem 0' }}>{evt.attack_type}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <span style={{ color: 'var(--primary)' }}>{evt.method}</span> | Status: <span style={{ color: evt.status_code >= 400 ? 'var(--danger)' : 'var(--success)' }}>{evt.status_code}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Investigation;
