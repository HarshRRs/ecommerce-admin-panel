import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus, StoreStatus } from '@prisma/client';

@Injectable()
export class ShopService {
    constructor(private prisma: PrismaService) { }

    async getStoreConfig(slug?: string, customDomain?: string) {
        if (!slug && !customDomain) {
            throw new NotFoundException('Store identifier required');
        }

        const store = await this.prisma.store.findFirst({
            where: {
                OR: [
                    { slug: slug },
                    { customDomain: customDomain },
                ],
                status: StoreStatus.ACTIVE,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                currency: true,
                timezone: true,
                customDomain: true,
                websiteUrl: true,
                type: true,
                // Don't expose sensitive fields like API keys
            },
        });

        if (!store) {
            throw new NotFoundException('Store not found');
        }

        return store;
    }

    async getProducts(storeId: string, limit = 20, offset = 0, categoryId?: string, featured?: boolean) {
        const where: any = {
            storeId,
            status: ProductStatus.ACTIVE,
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (featured) {
            where.isFeatured = true;
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                take: Number(limit),
                skip: Number(offset),
                include: {
                    variants: true,
                    category: {
                        select: { name: true, slug: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);

        return { products, total };
    }

    async getCategories(storeId: string) {
        return this.prisma.category.findMany({
            where: { storeId },
            include: {
                children: true,
            },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async getProductBySlug(storeId: string, slug: string) {
        const product = await this.prisma.product.findFirst({
            where: {
                storeId,
                slug,
                status: ProductStatus.ACTIVE,
            },
            include: {
                variants: true,
                attributes: {
                    include: { attribute: true }
                },
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async getActiveBanners(storeId: string, position?: string) {
        const where: any = {
            storeId,
            status: 'ACTIVE',
            OR: [
                { startDate: null },
                { startDate: { lte: new Date() } },
            ],
        };

        // Check endDate separately
        const banners = await this.prisma.banner.findMany({
            where,
            orderBy: { displayOrder: 'asc' },
        });

        // Filter out expired banners
        const activeBanners = banners.filter(banner =>
            !banner.endDate || banner.endDate >= new Date()
        );

        // Filter by position if provided
        if (position) {
            return activeBanners.filter(b => b.position === position);
        }

        return activeBanners;
    }
}
