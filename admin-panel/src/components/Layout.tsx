import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🛍️ Admin Panel</h2>
          <div className="user-info">
            <p className="user-name">{user?.firstName || user?.email}</p>
            <p className="user-role">{user?.role}</p>
            {user?.storeName && <p className="store-name">{user.storeName}</p>}
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className={isActive('/')}>📊 Dashboard</Link>
          <Link to="/products" className={isActive('/products')}>📦 Products</Link>
          <Link to="/orders" className={isActive('/orders')}>📋 Orders</Link>
          <Link to="/customers" className={isActive('/customers')}>👥 Customers</Link>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 mb-2">Website</div>
            <Link to="/cms/pages" className={isActive('/cms/pages')}>📄 Pages</Link>
            <Link to="/cms/homepage" className={isActive('/cms/homepage')}>🏠 Homepage</Link>
            <Link to="/cms/menus" className={isActive('/cms/menus')}>🔗 Menus</Link>
            <Link to="/cms/media" className={isActive('/cms/media')}>🖼️ Media</Link>
          </div>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
