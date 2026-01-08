import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadLogs } from '../api';

const UploadLogs = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
    const [clearExisting, setClearExisting] = useState(true);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        try {
            const result = await uploadLogs(file, clearExisting);
            setStatus('success');
            setMessage(result.message);

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'An error occurred during upload');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setStatus('idle');
            setMessage('');
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }} className="animate-in">
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Log <span className="glow-text">Ingestion</span> Terminal
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Upload external telemetry for instant AI scrutinization</p>
            </header>

            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', background: 'rgba(17, 5, 90, 0.4)' }}>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                        border: '2px dashed var(--glass-border)',
                        borderRadius: '20px',
                        padding: '4rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: file ? 'rgba(177, 59, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        borderColor: file ? 'var(--primary)' : 'var(--glass-border)',
                        boxShadow: file ? 'var(--glow-primary)' : 'none'
                    }}
                    onClick={() => document.getElementById('file-upload').click()}
                    onMouseOver={(e) => {
                        if (!file) e.currentTarget.style.borderColor = 'rgba(177, 59, 255, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        if (!file) e.currentTarget.style.borderColor = 'var(--glass-border)';
                    }}
                >
                    <input
                        id="file-upload"
                        type="file"
                        accept=".csv,.json"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    <div style={{
                        width: 80,
                        height: 80,
                        background: file ? 'var(--primary)' : 'rgba(177, 59, 255, 0.1)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        transition: 'all 0.3s',
                        boxShadow: file ? 'var(--glow-primary)' : 'none'
                    }}>
                        <UploadCloud size={40} color={file ? 'white' : 'var(--primary)'} />
                    </div>

                    {file ? (
                        <div>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>{file.name}</p>
                            <p style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 600 }}>Ready for Processing ({(file.size / 1024).toFixed(2)} KB)</p>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'white' }}>Deploy Log Package</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Drag & drop or browse for CSV / JSON artifacts</p>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <div className="glass-panel" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: clearExisting ? 'rgba(177, 59, 255, 0.05)' : 'transparent',
                        borderColor: clearExisting ? 'rgba(177, 59, 255, 0.2)' : 'var(--glass-border)'
                    }}
                        onClick={() => setClearExisting(!clearExisting)}
                    >
                        <input
                            type="checkbox"
                            checked={clearExisting}
                            onChange={(e) => e.stopPropagation()}
                            style={{ cursor: 'pointer', width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
                        />
                        <span style={{ fontSize: '1rem', color: clearExisting ? 'white' : 'var(--text-muted)', fontWeight: clearExisting ? 600 : 400 }}>Wipe current session data before upload</span>
                    </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    {status === 'idle' && file && (
                        <button
                            onClick={handleUpload}
                            className="btn-primary"
                            style={{ padding: '1.1rem 3rem', fontSize: '1.1rem' }}
                        >
                            Execute Analysis
                        </button>
                    )}

                    {status === 'uploading' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                            <span style={{ fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em' }}>AI MODELS ANALYZING TELEMETRY...</span>
                        </div>
                    )}

                    {status === 'success' && (
                        <div style={{ color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                                <CheckCircle size={32} />
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{message}</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div style={{ color: 'var(--danger)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                                <AlertCircle size={32} />
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{message}</span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '4rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Analysis Logic</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--accent)' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0, fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Normalization</h4>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>Logs are parsed and mapped to our unified security schema for consistency.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0, fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. AI Scrutiny</h4>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>Every URL is analyzed by hybrid models for deep pattern recognition.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--highlight)' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0, fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. Integration</h4>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>Results are instantly merged into your main Dashboard and investigation timeline.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadLogs;
