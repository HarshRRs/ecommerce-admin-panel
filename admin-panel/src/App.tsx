import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Layout from './components/Layout';
import StoreWizard from './pages/StoreWizard';
import CMSPages from './pages/cms/CMSPages';
import HomepageEditor from './pages/cms/HomepageEditor';
import MenuEditor from './pages/cms/MenuEditor';
import MediaLibrary from './pages/cms/MediaLibrary';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup-store" element={
            <ProtectedRoute>
              <StoreWizard />
            </ProtectedRoute>
          } />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="cms/pages" element={<CMSPages />} />
            <Route path="cms/homepage" element={<HomepageEditor />} />
            <Route path="cms/menus" element={<MenuEditor />} />
            <Route path="cms/media" element={<MediaLibrary />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
