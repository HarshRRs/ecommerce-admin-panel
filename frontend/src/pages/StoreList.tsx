import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Plus,
    Store as StoreIcon,
    Settings,
    Activity,
    User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoreList: React.FC = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await api.get('/stores');
            setStores(response.data);
        } catch (err) {
            console.error('Failed to fetch stores');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (storeId: string, currentStatus: string) => {
        const action = currentStatus === 'ACTIVE' ? 'suspend' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this store?`)) return;

        try {
            await api.patch(`/stores/${storeId}/${action}`);
            fetchStores();
        } catch (err) {
            console.error(`Failed to ${action} store`);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Store Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage all tenant stores and their subscriptions</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/stores/new')}>
                    <Plus size={20} /> Create Store
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>Loading stores...</div>
                ) : stores.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                        <StoreIcon size={64} style={{ color: 'var(--glass-border)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>No stores found. Create your first tenant!</p>
                    </div>
                ) : (
                    stores.map((store) => (
                        <div key={store.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', opacity: store.status === 'SUSPENDED' ? 0.8 : 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: store.status === 'SUSPENDED' ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-primary)20',
                                    color: store.status === 'SUSPENDED' ? 'var(--error)' : 'var(--accent-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <StoreIcon size={24} />
                                </div>
                                <span style={{
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    background: store.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: store.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {store.status}
                                </span>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{store.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{store.slug}.yourdomain.com</p>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <Activity size={14} /> {store.type}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <UserIcon size={14} /> ID: {store.ownerId.substring(0, 8)}...
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }} onClick={() => navigate(`/stores/${store.id}`)}>
                                    <Settings size={16} /> Edit
                                </button>
                                <button
                                    className={`btn ${store.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                                    style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem 0' }}
                                    onClick={() => handleToggleStatus(store.id, store.status)}
                                >
                                    {store.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StoreList;
