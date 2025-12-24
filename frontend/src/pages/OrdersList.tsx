import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { ShoppingBag, Search, Filter, Eye, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const OrdersList: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await apiService.orders.getAll();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'var(--warning)';
            case 'PROCESSING': return 'var(--accent-primary)';
            case 'SHIPPED': return '#3B82F6';
            case 'DELIVERED': return 'var(--success)';
            case 'CANCELLED': return 'var(--error)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} />;
            case 'PROCESSING': return <Clock size={16} />;
            case 'SHIPPED': return <Truck size={16} />;
            case 'DELIVERED': return <CheckCircle size={16} />;
            case 'CANCELLED': return <XCircle size={16} />;
            default: return null;
        }
    };

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Orders Portal</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your customer orders and fulfillment</p>
                </div>
            </div>

            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search by order number or customer email..."
                        className="input"
                        style={{ paddingLeft: '3rem', width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={20} />
                    <span>Filter</span>
                </button>
            </div>

            {loading ? (
                <div className="flex-center" style={{ height: '300px' }}>
                    <div className="spinner"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="glass flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1rem' }}>
                    <ShoppingBag size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No orders found</p>
                </div>
            ) : (
                <div className="glass" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ORDER #</th>
                                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>CUSTOMER</th>
                                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>DATE</th>
                                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TOTAL</th>
                                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>STATUS</th>
                                <th style={{ textAlign: 'right', padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>{order.orderNumber}</td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ fontWeight: 500 }}>{order.customer.firstName} {order.customer.lastName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.customer.email}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)' }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total)}
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: `${getStatusColor(order.status)}20`,
                                            color: getStatusColor(order.status)
                                        }}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                                        <button className="btn btn-secondary" style={{ padding: '0.5rem', minWidth: 'auto', border: 'none' }} onClick={() => navigate(`/orders/${order.id}`)}>
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrdersList;
