import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/ProductsList';
import ProductForm from './pages/ProductForm';
import StoreList from './pages/StoreList';
import StoreForm from './pages/StoreForm';
import StoreSettings from './pages/StoreSettings';
import RegisterPage from './pages/RegisterPage';
import OrdersList from './pages/OrdersList';
import CustomersDirectory from './pages/CustomersDirectory';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="customers" element={<CustomersDirectory />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="cms" element={<div>CMS Page (Coming Soon)</div>} />

            <Route path="stores" element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <StoreList />
              </ProtectedRoute>
            } />
            <Route path="stores/new" element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <StoreForm />
              </ProtectedRoute>
            } />
            <Route path="stores/:id" element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <StoreForm />
              </ProtectedRoute>
            } />

            <Route path="settings" element={<StoreSettings />} />

            <Route path="reset-password" element={<div>Reset Password (Coming Soon)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
