import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/api';
import './Dashboard.css';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalOrders?: number;
  totalCustomers?: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products to calculate stats
        const productsRes = await apiClient.get('/products');
        const products = productsRes.data;
        
        const statsData: DashboardStats = {
          totalProducts: products.length,
          activeProducts: products.filter((p: any) => p.status === 'ACTIVE').length,
          draftProducts: products.filter((p: any) => p.status === 'DRAFT').length,
          totalOrders: 0,
          totalCustomers: 0,
        };
        
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Set default stats on error
        setStats({
          totalProducts: 0,
          activeProducts: 0,
          draftProducts: 0,
          totalOrders: 0,
          totalCustomers: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.firstName || user?.email}!</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{stats?.totalProducts || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Products</h3>
            <p className="stat-value">{stats?.activeProducts || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Draft Products</h3>
            <p className="stat-value">{stats?.draftProducts || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats?.totalOrders || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/products" className="action-card">
            <span className="action-icon">➕</span>
            <h3>Add Product</h3>
            <p>Create a new product</p>
          </Link>
          <Link to="/products" className="action-card">
            <span className="action-icon">📊</span>
            <h3>View Products</h3>
            <p>Manage your inventory</p>
          </Link>
          <Link to="/orders" className="action-card">
            <span className="action-icon">📦</span>
            <h3>View Orders</h3>
            <p>Track customer orders</p>
          </Link>
          <Link to="/customers" className="action-card">
            <span className="action-icon">👥</span>
            <h3>View Customers</h3>
            <p>Manage customer data</p>
          </Link>
        </div>
      </div>

      {user?.storeName && (
        <div className="store-info">
          <h2>Store Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Store Name:</strong>
              <span>{user.storeName}</span>
            </div>
            <div className="info-item">
              <strong>Your Role:</strong>
              <span>{user.role}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
