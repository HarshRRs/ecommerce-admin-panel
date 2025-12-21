import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    BarChart3,
    Globe,
    Store,
    ChevronRight,
    Settings,
    AlertCircle
} from 'lucide-react';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
        { icon: <Package size={20} />, label: 'Products', path: '/products' },
        { icon: <ShoppingCart size={20} />, label: 'Orders', path: '/orders' },
        { icon: <Users size={20} />, label: 'Customers', path: '/customers' },
        { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/analytics' },
        { icon: <Globe size={20} />, label: 'CMS', path: '/cms' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
    ];

    if (user?.role === 'SUPER_ADMIN') {
        navItems.push({ icon: <Store size={20} />, label: 'Stores', path: '/stores' });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="grid-cols-dashboard">
            {/* Sidebar */}
            <aside className="glass" style={{
                borderRight: '1px solid var(--border-color)',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100
            }}>
                <div style={{ padding: '0 1rem', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        AdminPanel
                    </h2>
                </div>

                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `btn btn-secondary ${isActive ? 'active' : ''}`}
                            style={({ isActive }) => ({
                                width: '100%',
                                justifyContent: 'flex-start',
                                marginBottom: '0.5rem',
                                border: 'none',
                                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'
                            })}
                        >
                            {item.icon}
                            <span style={{ marginLeft: '0.5rem' }}>{item.label}</span>
                            {window.location.pathname === item.path && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Logged in as</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</p>
                    </div>
                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--error)' }}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ overflowY: 'auto', background: 'var(--bg-primary)' }}>
                <header style={{
                    height: 'var(--header-height)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 2rem',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    background: 'rgba(10, 10, 12, 0.8)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 50
                }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem' }}>{user?.storeName || 'System Admin'}</h3>
                    </div>

                    <div className="flex-center" style={{ gap: '1rem' }}>
                        <ThemeToggle />
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                    </div>
                </header>

                {user?.storeStatus === 'SUSPENDED' && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.95)',
                        color: 'white',
                        padding: '1rem 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontWeight: 600,
                        fontSize: '0.95rem'
                    }}>
                        <AlertCircle size={20} />
                        <div>
                            YOUR STORE IS SUSPENDED. All customer-facing pages and checkout are disabled.
                            If this is a mistake, please contact support.
                        </div>
                    </div>
                )}

                {!user?.stripeOwnershipConfirmed && user?.role === 'OWNER' && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.95)',
                        color: 'black',
                        padding: '1rem 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontWeight: 600,
                        fontSize: '0.95rem'
                    }}>
                        <AlertCircle size={20} />
                        <div>
                            LEGAL ACTION REQUIRED: You must confirm Stripe ownership in <strong>Settings</strong> to enable payments.
                        </div>
                    </div>
                )}

                <section style={{ padding: '2rem' }}>
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default Layout;
