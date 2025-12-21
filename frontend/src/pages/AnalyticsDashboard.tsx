import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { TrendingUp, ShoppingCart, Users, DollarSign, Calendar } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await apiService.analytics.getDashboard();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Mock data for display if API not fully ready
            setStats({
                revenue: 12450.50,
                orders: 142,
                customers: 86,
                growth: 12.5,
                recentSales: [
                    { day: 'Mon', amount: 1200 },
                    { day: 'Tue', amount: 1500 },
                    { day: 'Wed', amount: 1100 },
                    { day: 'Thu', amount: 1800 },
                    { day: 'Fri', amount: 2200 },
                    { day: 'Sat', amount: 2500 },
                    { day: 'Sun', amount: 2100 },
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '300px' }}><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Analytics Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track your store's performance and growth</p>
                </div>
                <button className="btn btn-secondary">
                    <Calendar size={20} />
                    <span>Last 30 Days</span>
                </button>
            </div>

            <div className="grid-responsive" style={{ marginBottom: '2rem' }}>
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '0.8rem', borderRadius: '1rem' }}>
                            <DollarSign size={24} />
                        </div>
                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>+{stats?.growth}%</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue</p>
                    <h2 style={{ fontSize: '1.8rem' }}>${stats?.revenue.toLocaleString()}</h2>
                </div>

                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', padding: '0.8rem', borderRadius: '1rem' }}>
                            <ShoppingCart size={24} />
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Orders</p>
                    <h2 style={{ fontSize: '1.8rem' }}>{stats?.orders}</h2>
                </div>

                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', padding: '0.8rem', borderRadius: '1rem' }}>
                            <Users size={24} />
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Customers</p>
                    <h2 style={{ fontSize: '1.8rem' }}>{stats?.customers}</h2>
                </div>
            </div>

            <div className="glass" style={{ padding: '2rem' }}>
                <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
                        Revenue Over Time
                    </h3>
                </div>

                <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
                    {stats?.recentSales.map((sale: any) => (
                        <div key={sale.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '100%',
                                height: `${(sale.amount / 3000) * 100}%`,
                                background: 'linear-gradient(to top, var(--accent-primary), var(--accent-secondary))',
                                borderRadius: '0.4rem 0.4rem 0 0',
                                minHeight: '4px',
                                transition: 'height 1s ease-out'
                            }}></div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sale.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
