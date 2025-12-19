import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ShoppingBag, TrendingUp, Users, DollarSign, Package, ExternalLink, Globe } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/analytics/stats');
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch stats');
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: <DollarSign />, color: '#6366f1' },
        { label: 'New Orders', value: stats?.orderCount || 0, icon: <ShoppingBag />, color: '#a855f7' },
        { label: 'Customers', value: stats?.customerCount || 0, icon: <Users />, color: '#10b981' },
        { label: 'Active Products', value: stats?.productCount || 0, icon: <Package />, color: '#f59e0b' },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Dashboard Overview</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back to {user?.storeName || 'System Management'}</p>
                </div>
                {user?.storeId && (
                    <a
                        href={`https://${user.storeName?.toLowerCase().replace(/\s+/g, '-')}.ordernest.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.2rem', gap: '0.6rem' }}
                    >
                        <Globe size={18} /> Visit My Website <ExternalLink size={16} />
                    </a>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {statCards.map((card, i) => (
                    <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: `${card.color}20`,
                            color: card.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{card.label}</p>
                            <h3 style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-card" style={{ minHeight: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Recent Activity</h3>
                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>View All</button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem' }}>No recent activity to display.</p>
                </div>

                <div className="glass-card">
                    <h3>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <Package size={18} /> Add New Product
                        </button>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <TrendingUp size={18} /> Review Sales
                        </button>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <Users size={18} /> Manage Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
