import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiService.auth.forgotPassword(email);
            setSent(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send recovery email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                        Recover Password
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Enter your email to receive a recovery link
                    </p>
                </div>

                {sent ? (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                            <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
                            <p style={{ fontWeight: 600 }}>Recovery Link Sent!</p>
                            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>Check your inbox for instructions.</p>
                        </div>
                        <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="fade-in">
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    className="input"
                                    style={{ paddingLeft: '3rem', width: '100%' }}
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: '1.5rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : <><Send size={18} /> Send Link</>}
                        </button>

                        <Link to="/login" className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
