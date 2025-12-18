export type Role = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF';
export type StoreStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type StoreType = 'ECOMMERCE' | 'RESTAURANT';

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: Role;
    storeId?: string;
    storeName?: string;
    storeStatus?: StoreStatus;
    stripeOwnershipConfirmed?: boolean;
    forcePasswordChange: boolean;
}

export interface Store {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    currency: string;
    status: StoreStatus;
    type: StoreType;
    ownerId: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface Product {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description?: string;
    basePrice: number;
    stock: number;
    status: ProductStatus;
    images: string[];
    tags: string[];
    categoryId?: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
}
