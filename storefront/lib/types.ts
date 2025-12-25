export interface StoreConfig {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    currency: string;
    timezone: string;
    customDomain?: string | null;
    websiteUrl?: string | null;
    type: 'ECOMMERCE' | 'RESTAURANT';
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
    children?: Category[];
}

export interface ProductVariant {
    id: string;
    sku: string;
    price?: number;
    stock: number;
    attributes: Record<string, string>;
    imageUrl?: string;
}

export interface Product {
    id: string;
    storeId: string;
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    compareAtPrice?: number;
    images?: string[];
    stock: number;
    variants: ProductVariant[];
    category?: {
        name: string;
        slug: string;
    };
}

export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    attributes?: Record<string, string>;
}
