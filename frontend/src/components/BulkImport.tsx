import React, { useState } from 'react';
import api from '../services/api';
import { Upload, Loader2, AlertTriangle } from 'lucide-react';

const BulkImport: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{
        total: number;
        success: number;
        errors: Array<{ row: number; error: string }>;
    } | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError('');
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/products/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
            if (response.data.success > 0) {
                setTimeout(onComplete, 2000);
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Import failed. Check file format.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="glass-card">
            <div style={{ marginBottom: '1.5rem' }}>
                <h3>Bulk Product Import</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload a CSV file to import or update products in bulk.</p>
            </div>

            {!result ? (
                <div style={{
                    border: '2px dashed var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.1)'
                }}>
                    <input
                        type="file"
                        id="csv-upload"
                        accept=".csv"
                        hidden
                        onChange={handleFileChange}
                    />
                    <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
                        <Upload size={40} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
                        <p style={{ fontWeight: 500 }}>{file ? file.name : 'Click to select CSV file'}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Max file size: 10MB (Approx. 10,000 products)
                        </p>
                    </label>
                </div>
            ) : (
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{result.total}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Success</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>{result.success}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--error)', fontSize: '0.8rem' }}>Errors</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--error)' }}>{result.errors.length}</p>
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div style={{ textAlign: 'left', maxHeight: '150px', overflowY: 'auto' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--error)' }}>Errors Detail:</p>
                            {result.errors.slice(0, 5).map((err, i: number) => (
                                <p key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Row {err.row}: {err.error}
                                </p>
                            ))}
                            {result.errors.length > 5 && <p style={{ fontSize: '0.8rem' }}>...and {result.errors.length - 5} more</p>}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div style={{ marginTop: '1rem', color: 'var(--error)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={!file || importing}
                    onClick={handleImport}
                >
                    {importing ? <Loader2 className="animate-spin" /> : 'Start Import'}
                </button>
                {result && (
                    <button className="btn btn-secondary" onClick={() => { setFile(null); setResult(null); }}>
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
};

export default BulkImport;
