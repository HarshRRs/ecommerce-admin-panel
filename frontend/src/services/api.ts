import axios from 'axios';

const getBaseUrl = () => {
    // Use production backend URL if VITE_API_URL is not set
    let url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    // Ensure URL has protocol
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }

    // Ensure URL ends with /api/v1 if it's pointing to the root domain
    if (!url.includes('/api/v1')) {
        url = url.endsWith('/') ? `${url}api/v1` : `${url}/api/v1`;
    }

    console.log('[API] Configured Base URL:', url);
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const apiService = {
    // Auth
    auth: {
        login: (credentials: any) => api.post('/auth/login', credentials),
        register: (data: any) => api.post('/auth/register-with-store', data),
        me: () => api.get('/auth/me'),
        forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
        resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
    },
    // Products
    products: {
        getAll: () => api.get('/products'),
        getById: (id: string) => api.get(`/products/${id}`),
        create: (data: any) => api.post('/products', data),
        update: (id: string, data: any) => api.patch(`/products/${id}`, data),
        delete: (id: string) => api.delete(`/products/${id}`),
    },
    // Categories
    categories: {
        getAll: () => api.get('/products/categories'),
    },
    // Orders
    orders: {
        getAll: (params?: any) => api.get('/orders', { params }),
        getById: (id: string) => api.get(`/orders/${id}`),
        updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
    },
    // Customers
    customers: {
        getAll: (params?: any) => api.get('/customers', { params }),
        getById: (id: string) => api.get(`/customers/${id}`),
    },
    // Analytics
    analytics: {
        getDashboard: () => api.get('/analytics/dashboard'),
        getRevenue: (period: string) => api.get('/analytics/revenue', { params: { period } }),
    },
    // Stores
    stores: {
        getAll: () => api.get('/stores'),
        getById: (id: string) => api.get(`/stores/${id}`),
        create: (data: any) => api.post('/stores', data),
        update: (id: string, data: any) => api.patch(`/stores/${id}`, data),
        delete: (id: string) => api.delete(`/stores/${id}`),
        updateStatus: (id: string, status: string) => api.patch(`/stores/${id}/status`, { status }),
        confirmStripe: (id: string) => api.post(`/stores/${id}/confirm-stripe`),
    },
};

export { api, apiService };
export default api;
