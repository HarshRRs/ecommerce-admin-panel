import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Save,
    ShieldCheck,
    AlertTriangle,
    CreditCard,
    Building,
    Info,
    Globe,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StoreSettings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);
    const [store, setStore] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        currency: 'EUR',
        timezone: 'Europe/Paris',
        stripeApiKey: '',
        stripeWebhookSecret: '',
        logo: '',
        customDomain: '',
        websiteUrl: ''
    });

    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if (user?.storeId) {
            fetchStore();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchStore = async () => {
        if (!user) return;
        try {
            const response = await api.get(`/stores/${user.storeId}`);
            setStore(response.data);
            setFormData({
                name: response.data.name || '',
                currency: response.data.currency || 'EUR',
                timezone: response.data.timezone || 'Europe/Paris',
                stripeApiKey: '', // Never show existing keys for security
                stripeWebhookSecret: '',
                logo: response.data.logo || '',
                customDomain: response.data.customDomain || '',
                websiteUrl: response.data.websiteUrl || ''
            });
            setConfirmed(response.data.stripeOwnershipConfirmed || false);
        } catch (err) {
            setError('Failed to load store settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // 1. Update basic settings and Stripe keys
            const updateData: any = { ...formData };
            if (!updateData.stripeApiKey) delete updateData.stripeApiKey;
            if (!updateData.stripeWebhookSecret) delete updateData.stripeWebhookSecret;

            await api.patch(`/stores/${user.storeId}`, updateData);

            setSuccess('Settings updated successfully!');
            // Clear sensitive inputs
            setFormData(prev => ({ ...prev, stripeApiKey: '', stripeWebhookSecret: '' }));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmOwnership = async () => {
        if (!window.confirm('Are you sure you want to confirm ownership? This action is legally binding.')) return;
        if (!user) return;

        setSaving(true);
        try {
            await api.post(`/stores/${user.storeId}/confirm-stripe`);
            setConfirmed(true);
            setSuccess('Stripe ownership confirmed and logged.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to confirm ownership');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading settings...</div>;

    if (!user) return null;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Store Settings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your shop identity and payment infrastructure</p>
            </div>

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--error)',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem'
                }}>
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {success && (
                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--success)',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem'
                }}>
                    <ShieldCheck size={20} /> {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section: Basic Identity */}
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <Building className="text-accent" />
                        <h2 style={{ fontSize: '1.25rem' }}>Business Identity</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Store Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Currency</label>
                            <select
                                className="form-control"
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="GBP">British Pound (£)</option>
                            </select>
                        </div>
                    </div>
                </div>
                {/* Section: Website & Domain */}
                <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <Globe className="text-secondary" />
                        <h2 style={{ fontSize: '1.25rem' }}>Website & Domain</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Your OrderNest URL (Live)</label>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                <div className="form-control" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', flex: 1, padding: '0.8rem' }}>
                                    https://{store?.slug}.ordernest.com
                                </div>
                                <a
                                    href={`https://${store?.slug}.ordernest.com`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{ height: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <ExternalLink size={16} /> Visit
                                </a>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label>Custom Domain (e.g. www.mystore.com)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your own domain"
                                    value={formData.customDomain}
                                    onChange={e => setFormData({ ...formData, customDomain: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>External Website Link (Portfolio/Social)</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    placeholder="https://..."
                                    value={formData.websiteUrl}
                                    onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Stripe Infrastructure */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <CreditCard className="text-secondary" />
                            <h2 style={{ fontSize: '1.25rem' }}>Payment Gateway (Stripe)</h2>
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '20px',
                            background: confirmed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: confirmed ? 'var(--success)' : 'var(--error)',
                            fontWeight: 600
                        }}>
                            {confirmed ? 'LEGAL STATUS: COMPLIANT' : 'LEGAL STATUS: NOT CONFIRMED'}
                        </span>
                    </div>

                    <div style={{
                        background: 'var(--bg-lighter)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        color: 'var(--text-secondary)',
                        borderLeft: '4px solid var(--accent-secondary)'
                    }}>
                        <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span>
                                As part of our freelancer multi-tenant agreement, you must provide your <strong>own Stripe API keys</strong>.
                                Money goes directly into your account; our platform never touches your revenue.
                                Keys are stored using AES-256-GCM encryption.
                            </span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="form-group">
                            <label>Stripe Secret Key (sk_test_... or sk_live_...)</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter new key to update, leave blank to keep existing"
                                value={formData.stripeApiKey}
                                onChange={e => setFormData({ ...formData, stripeApiKey: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Stripe Webhook Secret (whsec_...)</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter new secret to update, leave blank to keep existing"
                                value={formData.stripeWebhookSecret}
                                onChange={e => setFormData({ ...formData, stripeWebhookSecret: e.target.value })}
                            />
                        </div>

                        <div style={{
                            marginTop: '2rem',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            background: confirmed ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="checkbox"
                                    id="legal-confirm"
                                    style={{ width: '20px', height: '20px', marginTop: '4px' }}
                                    checked={confirmed}
                                    disabled={confirmed}
                                    onChange={() => { }} // Controlled by confirmed state
                                    onClick={!confirmed ? handleConfirmOwnership : undefined}
                                />
                                <label htmlFor="legal-confirm" style={{ fontSize: '0.9rem', cursor: confirmed ? 'default' : 'pointer' }}>
                                    <strong>Legal Responsibility Confirmation</strong><br />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        I confirm that the Stripe account associated with these keys belongs to me (or my legal entity).
                                        I accept sole responsibility for all transactions, chargebacks, refunds, taxes, and government
                                        compliance. The platform provider acts only as a software vendor and is not a financial intermediary.
                                    </span>
                                    {store?.stripeConfirmedAt && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                                            Confirmed on {new Date(store.stripeConfirmedAt).toLocaleString()}
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ padding: '0.8rem 2.5rem' }}
                    >
                        {saving ? 'Saving...' : <><Save size={20} /> Save All Settings</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StoreSettings;
