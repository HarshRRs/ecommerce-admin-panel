import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto } from './dto/product.dto';
import { Role } from '@prisma/client';

import { ImageKitService } from '../common/services/imagekit.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private imagekitService: ImageKitService,
  ) {}

  async create(createProductDto: CreateProductDto, storeId: string) {
    // Check SKU uniqueness within store
    const existing = await this.prisma.prisma.product.findFirst({
      where: { storeId, sku: createProductDto.sku },
    });

    if (existing) {
      throw new ConflictException('Product with this SKU already exists');
    }

    const { images, tags, ...productData } = createProductDto;

    return this.prisma.prisma.product.create({
      data: {
        ...productData,
        storeId,
        slug: this.generateSlug(createProductDto.name),
        images: images || [],
        tags: tags || [],
      },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async findAll(storeId: string, filters?: any) {
    const where: any = { storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        _count: {
          select: { variants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, storeId: string) {
    const product = await this.prisma.prisma.product.findFirst({
      where: { id, storeId },
      include: {
        category: true,
        variants: true,
        attributes: {
          include: {
            attribute: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, storeId: string) {
    const product = await this.prisma.prisma.product.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { images, tags, ...productData } = updateProductDto;

    return this.prisma.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(images && { images }),
        ...(tags && { tags }),
        updatedAt: new Date(),
      },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async remove(id: string, storeId: string) {
    const product = await this.prisma.prisma.product.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.prisma.product.delete({ where: { id } });
  }

  async createVariant(productId: string, createVariantDto: CreateVariantDto, storeId: string) {
    const product = await this.prisma.prisma.product.findFirst({
      where: { id: productId, storeId, type: 'VARIABLE' },
    });

    if (!product) {
      throw new NotFoundException('Product not found or not a variable product');
    }

    // Check SKU uniqueness
    const existing = await this.prisma.prisma.productVariant.findUnique({
      where: { sku: createVariantDto.sku },
    });

    if (existing) {
      throw new ConflictException('Variant SKU already exists');
    }

    return this.prisma.prisma.productVariant.create({
      data: {
        ...createVariantDto,
        productId,
      },
    });
  }

  async updateStock(id: string, quantity: number, storeId: string) {
    const product = await this.prisma.prisma.product.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (quantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    return this.prisma.prisma.product.update({
      where: { id },
      data: {
        stock: quantity,
        updatedAt: new Date(),
      },
    });
  }

  async adjustStock(id: string, adjustment: number, storeId: string, reason?: string) {
    const product = await this.prisma.prisma.product.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock = product.stock + adjustment;
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock for adjustment');
    }

    return this.prisma.prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
        updatedAt: new Date(),
      },
    });
  }

  async updateVariantStock(variantId: string, quantity: number, storeId: string) {
    const variant = await this.prisma.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.product.storeId !== storeId) {
      throw new NotFoundException('Variant not found');
    }

    if (quantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    return this.prisma.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: quantity,
        updatedAt: new Date(),
      },
    });
  }

  async getLowStockProducts(storeId: string) {
    const products = await this.prisma.prisma.product.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
        OR: [
          {
            AND: [
              { lowStockThreshold: { not: null } },
              { stock: { lte: this.prisma.prisma.product.fields.lowStockThreshold } },
            ],
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: { stock: 'asc' },
    });

    return products;
  }

  async importProducts(storeId: string, filePath: string) {
    const results: any[] = [];
    const errors: any[] = [];
    let successCount = 0;

    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const csv = require('csv-parser');

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data: any) => results.push(data))
        .on('error', (error: any) => {
          this.logger.error(`CSV Read Error: ${error.message}`);
          reject(error);
        })
        .on('end', async () => {
          this.logger.log(`Starting import of ${results.length} items for store ${storeId}`);

          const CHUNK_SIZE = 50;
          for (let i = 0; i < results.length; i += CHUNK_SIZE) {
            const chunk = results.slice(i, i + CHUNK_SIZE);
            await Promise.all(
              chunk.map(async (row, chunkIndex) => {
                const rowIndex = i + chunkIndex;
                try {
                  if (!row.name || !row.sku || !row.price) {
                    throw new Error('Missing required fields (name, sku, price)');
                  }

                  const productData: CreateProductDto = {
                    sku: row.sku,
                    name: row.name,
                    description: row.description || '',
                    basePrice: parseFloat(row.price),
                    stock: parseInt(row.stock || '0', 10),
                    type: 'SIMPLE',
                    status: row.status || 'DRAFT',
                    taxable: row.taxable !== 'false',
                    images: row.images ? row.images.split(',') : [],
                    tags: row.tags ? row.tags.split(',') : [],
                  };

                  const existing = await this.prisma.prisma.product.findFirst({
                    where: { storeId, sku: productData.sku },
                  });

                  if (existing) {
                    await this.prisma.prisma.product.update({
                      where: { id: existing.id },
                      data: {
                        name: productData.name,
                        description: productData.description,
                        basePrice: productData.basePrice,
                        stock: productData.stock,
                        status: productData.status,
                        updatedAt: new Date(),
                      },
                    });
                  } else {
                    await this.create(productData, storeId);
                  }
                  successCount++;
                } catch (err: any) {
                  this.logger.warn(`Import failed for row ${rowIndex + 1}: ${err.message}`);
                  errors.push({ row: rowIndex + 1, error: err.message, sku: row.sku });
                }
              }),
            );
          }

          // Cleanup file
          try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          } catch (e) {
            this.logger.warn(`Failed to delete temp file: ${filePath}`);
          }

          resolve({
            total: results.length,
            success: successCount,
            errors,
          });
        });
    });
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now()
    );
  }
}
