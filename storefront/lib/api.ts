import axios from 'axios';
import { StoreConfig, Product, Category } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1/shop';

/**
 * API client for fetching shop data.
 * Supports passing a storeId explicitly, or relying on query params constructed in the helper.
 */
const api = axios.create({
    baseURL: API_URL,
});

export const getStoreConfig = async (slug?: string, domain?: string): Promise<StoreConfig> => {
    const params: Record<string, string | boolean | undefined> = {};
    if (slug) params.slug = slug;
    if (domain) params.domain = domain;

    const response = await api.get('/config', { params });
    return response.data;
};

export const getProducts = async (storeId: string, categoryId?: string, featured?: boolean): Promise<{ products: Product[], total: number }> => {
    const params: Record<string, string | boolean | undefined> = { storeId };
    if (categoryId) params.categoryId = categoryId;
    if (featured) params.featured = 'true';

    const response = await api.get('/products', { params });
    return response.data;
};

export const getCategories = async (storeId: string): Promise<Category[]> => {
    const response = await api.get('/categories', { params: { storeId } });
    return response.data;
};

export const getProductBySlug = async (storeId: string, slug: string): Promise<Product> => {
    const response = await api.get(`/products/${slug}`, { params: { storeId } });
    return response.data;
};
