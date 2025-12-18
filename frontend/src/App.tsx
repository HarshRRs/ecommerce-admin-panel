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

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="orders" element={<div>Orders Page (Coming Soon)</div>} />
            <Route path="customers" element={<div>Customers Page (Coming Soon)</div>} />
            <Route path="analytics" element={<div>Analytics Page (Coming Soon)</div>} />
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
