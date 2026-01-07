import React, { useEffect, useState } from 'react';
import { Search, AlertCircle, Shield, FileText } from 'lucide-react';
import { fetchEvents, fetchExplanation, fetchStoryline } from '../api';

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
        const exp = await fetchExplanation(event.event_id);
        setExplanation(exp);
        const story = await fetchStoryline(event.source_ip);
        setStoryline(story);
    };

    return (
        <div style={{ display: 'flex', height: '88vh', gap: '1.5rem' }}>

            {/* List Panel */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input placeholder="Search events..." style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }} />
                    </div>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {events.map(e => (
                        <div
                            key={e.event_id}
                            onClick={() => handleEventClick(e)}
                            style={{
                                padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer', background: selectedEvent?.event_id === e.event_id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600, color: e.is_successful ? '#ef4444' : '#3b82f6' }}>{e.attack_type}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{e.source_ip}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {e.url}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Panel */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Explainability Card */}
                {selectedEvent && explanation ? (
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Shield color={selectedEvent.is_successful ? "#ef4444" : "#10b981"} />
                            Threat Analysis
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CONFIDENCE</label>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{(explanation.confidence * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>RULE HITS</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {Object.entries(explanation.rule_hits).map(([type, rules]) => (
                                        <span key={type} style={{ background: '#3b82f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{type}</span>
                                    ))}
                                    {!Object.keys(explanation.rule_hits).length && <span style={{ color: '#94a3b8' }}>None (ML Detection)</span>}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            <div style={{ color: '#ef4444' }}>Payload Snippet:</div>
                            {explanation.payload_snippet || "No payload content"}
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Select an event to view analysis
                    </div>
                )}

                {/* Storyline Timeline */}
                {selectedEvent && (
                    <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}>Attack Storyline: {selectedEvent.source_ip}</h3>
                        <div style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', marginLeft: '0.5rem', paddingLeft: '1.5rem' }}>
                            {storyline.map((evt) => (
                                <div key={evt.event_id} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        position: 'absolute', left: '-2.1rem', top: '0.25rem', width: '12px', height: '12px', borderRadius: '50%',
                                        background: evt.is_successful ? '#ef4444' : '#3b82f6', border: '2px solid var(--bg-dark)'
                                    }}></div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(evt.timestamp).toLocaleString()}</div>
                                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{evt.attack_type}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Method: {evt.method} | Status: {evt.status_code}</div>
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
