import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, Loader2, Store as StoreIcon } from 'lucide-react';
import type { StoreStatus, StoreType } from '../types';

const StoreForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'ECOMMERCE' as StoreType,
        status: 'ACTIVE' as StoreStatus,
        currency: 'USD',
        ownerId: '',
    });

    useEffect(() => {
        if (isEdit) {
            fetchStore();
        }
    }, [id]);

    const fetchStore = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/stores/${id}`);
            setFormData(response.data);
        } catch (err) {
            console.error('Failed to fetch store');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.patch(`/stores/${id}`, formData);
            } else {
                await api.post('/stores', formData);
            }
            navigate('/stores');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save store');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '400px' }}><Loader2 className="animate-spin" /></div>;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/stores')}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>{isEdit ? 'Edit Store' : 'Create New Tenant Store'}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Configure the basic settings for this store</p>
                </div>
            </div>

            <div style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-primary)20', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <StoreIcon size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Store Configuration</h3>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Store Name</label>
                        <input
                            className="input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. My Premium Boutique"
                        />
                    </div>

                    <div>
                        <label className="label">Subdomain Slug</label>
                        <input
                            className="input"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            required
                            placeholder="e.g. my-boutique"
                        />
                    </div>

                    <div>
                        <label className="label">Currency</label>
                        <select
                            className="input"
                            value={formData.currency}
                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Store Type</label>
                        <select
                            className="input"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as StoreType })}
                        >
                            <option value="ECOMMERCE">E-commerce</option>
                            <option value="RESTAURANT">Restaurant</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Status</label>
                        <select
                            className="input"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as StoreStatus })}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Owner User ID</label>
                        <input
                            className="input"
                            value={formData.ownerId}
                            onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                            required
                            placeholder="UUID of the store owner"
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Configure</>}
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/stores')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreForm;
