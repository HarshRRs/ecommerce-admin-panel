import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Users, Search, Mail, ShieldCheck } from 'lucide-react';

const CustomersDirectory: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await apiService.customers.getAll();
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Customers Directory</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View and manage your customer relationships</p>
                </div>
            </div>

            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', maxWidth: '500px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search customers by name or email..."
                        className="input"
                        style={{ paddingLeft: '3rem', width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-center" style={{ height: '300px' }}><div className="spinner"></div></div>
            ) : filteredCustomers.length === 0 ? (
                <div className="glass flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1rem' }}>
                    <Users size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No customers found</p>
                </div>
            ) : (
                <div className="grid-responsive">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="glass card card-hover" style={{ padding: '1.5rem' }}>
                            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                                    {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                                </div>
                                <span style={{
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '2rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    background: customer.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: customer.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                }}>
                                    <ShieldCheck size={12} />
                                    {customer.status}
                                </span>
                            </div>

                            <h3 style={{ marginBottom: '0.2rem' }}>{customer.firstName} {customer.lastName}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                <Mail size={14} />
                                {customer.email}
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total Orders</span>
                                    <span style={{ fontWeight: 600 }}>{customer.totalOrders || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total Spent</span>
                                    <span style={{ fontWeight: 600 }}>${parseFloat(customer.totalSpent || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.85rem' }}>
                                View Profile
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomersDirectory;
