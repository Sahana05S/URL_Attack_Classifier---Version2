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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Analyze External Logs</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Upload your CSV or JSON files for instant AI classification</p>
            </header>

            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                        border: '2px dashed var(--glass-border)',
                        borderRadius: '16px',
                        padding: '3rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: file ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        borderColor: file ? 'var(--primary)' : 'var(--glass-border)'
                    }}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <input
                        id="file-upload"
                        type="file"
                        accept=".csv,.json"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    <UploadCloud size={48} color={file ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />

                    {file ? (
                        <div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{file.name}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Click or drag to upload</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Supports CSV and JSON log formats</p>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <input
                        type="checkbox"
                        id="clear-existing"
                        checked={clearExisting}
                        onChange={(e) => setClearExisting(e.target.checked)}
                        style={{ cursor: 'pointer', width: '1.2rem', height: '1.2rem' }}
                    />
                    <label htmlFor="clear-existing" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
                        Wipe existing dashboard data before analysis
                    </label>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    {status === 'idle' && file && (
                        <button
                            onClick={handleUpload}
                            className="btn-primary"
                            style={{ padding: '0.75rem 2rem', width: '200px' }}
                        >
                            Start Analysis
                        </button>
                    )}

                    {status === 'uploading' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Analyzing data with Sentinel AI...</span>
                        </div>
                    )}

                    {status === 'success' && (
                        <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={20} />
                            <span>{message}</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={20} />
                            <span>{message}</span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>How it works</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0 }}>1. Ingestion</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Logs are parsed and mapped to our unified security schema.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0 }}>2. AI Scrutiny</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Every URL is analyzed by our models for unseen threat patterns.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0 }}>3. Integration</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Results are instantly merged into your main Dashboard and timeline.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadLogs;
