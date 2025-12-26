import { Controller, Get, Query, Param, Headers, NotFoundException } from '@nestjs/common';
import { ShopService } from './shop.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('api/v1/shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) { }

    @Get('config')
    async getStoreConfig(
        @Query('slug') slug?: string,
        @Query('domain') domain?: string,
    ) {
        if (!slug && !domain) {
            // Fallback to reading from header if needed, but Query is explicit
            throw new NotFoundException('Please provide store slug or domain');
        }
        return this.shopService.getStoreConfig(slug, domain);
    }

    @Get('products')
    async getProducts(
        @Query('storeId') storeId: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @Query('categoryId') categoryId?: string,
        @Query('featured') featured?: string,
    ) {
        if (!storeId) throw new NotFoundException('Store ID is required');
        return this.shopService.getProducts(storeId, limit, offset, categoryId, featured === 'true');
    }

    @Get('categories')
    async getCategories(@Query('storeId') storeId: string) {
        if (!storeId) throw new NotFoundException('Store ID is required');
        return this.shopService.getCategories(storeId);
    }

    @Get('products/:slug')
    async getProduct(
        @Param('slug') slug: string,
        @Query('storeId') storeId: string,
    ) {
        if (!storeId) throw new NotFoundException('Store ID is required');
        return this.shopService.getProductBySlug(storeId, slug);
    }

    @Get('banners')
    async getBanners(
        @Query('storeId') storeId: string,
        @Query('position') position?: string,
    ) {
        if (!storeId) throw new NotFoundException('Store ID is required');
        return this.shopService.getActiveBanners(storeId, position);
    }
}
