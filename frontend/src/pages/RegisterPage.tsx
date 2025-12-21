import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { UserPlus, Loader2, Store, User, ArrowRight } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        storeName: '',
        storeSlug: '',
    });

    const handleStoreNameChange = (name: string) => {
        const slug = name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        setFormData({ ...formData, storeName: name, storeSlug: slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiService.auth.register(formData);
            const { access_token, refresh_token, user } = response.data;

            login(access_token, refresh_token, user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center min-vh-100" style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '900px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                        <UserPlus size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Launch Your Store</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Create your account and your e-commerce tenant in one step</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                    {/* User Profile Section */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={18} />
                            </div>
                            <h3 style={{ margin: 0 }}>Owner Details</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                            <div>
                                <label className="label">First Name</label>
                                <input
                                    className="input"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input
                                    className="input"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label className="label">Work Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="john@company.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Store Config Section */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Store size={18} />
                            </div>
                            <h3 style={{ margin: 0 }}>Store Configuration</h3>
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label className="label">Store Name</label>
                            <input
                                className="input"
                                placeholder="e.g. My Premium Boutique"
                                value={formData.storeName}
                                onChange={e => handleStoreNameChange(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label className="label">Store Slug (URL part)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="input"
                                    placeholder="my-boutique"
                                    value={formData.storeSlug}
                                    onChange={e => setFormData({ ...formData, storeSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    required
                                />
                                <div style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    .ordernest.com
                                </div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                This will be your permanent store identifier.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            gridColumn: '1 / -1',
                            color: 'var(--error)',
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                            Already have an account? Sign In
                        </Link>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ padding: '0.8rem 2.5rem', gap: '0.8rem' }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Create My Store <ArrowRight size={18} /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
