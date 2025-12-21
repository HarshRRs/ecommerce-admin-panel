import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiService.auth.resetPassword(token!, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) return <div className="flex-center" style={{ minHeight: '100vh' }}>Invalid or missing token</div>;

    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                        Set New Password
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Create a strong, unique password for your account
                    </p>
                </div>

                {success ? (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                            <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
                            <p style={{ fontWeight: 600 }}>Password Reset Success!</p>
                            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>Redirecting to login...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="fade-in">
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    className="input"
                                    style={{ paddingLeft: '3rem', width: '100%' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    className="input"
                                    style={{ paddingLeft: '3rem', width: '100%' }}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Reseting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
