import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  displayOrder?: number;
}

interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  displayOrder?: number;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCategoryDto, storeId: string) {
    const slug = createDto.slug || this.generateSlug(createDto.name);

    // Check slug uniqueness within store
    const existing = await this.prisma.prisma.category.findFirst({
      where: { storeId, slug },
    });

    if (existing) {
      throw new ConflictException('Category with this slug already exists');
    }

    // Validate parent category if provided
    if (createDto.parentId) {
      const parent = await this.prisma.prisma.category.findFirst({
        where: { id: createDto.parentId, storeId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.prisma.category.create({
      data: {
        ...createDto,
        slug,
        storeId,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(storeId: string) {
    return this.prisma.prisma.category.findMany({
      where: { storeId },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, storeId: string) {
    const category = await this.prisma.prisma.category.findFirst({
      where: { id, storeId },
      include: {
        parent: true,
        children: true,
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateDto: UpdateCategoryDto, storeId: string) {
    const category = await this.prisma.prisma.category.findFirst({
      where: { id, storeId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check for circular reference if moving category
    if (updateDto.parentId) {
      if (updateDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const isCircular = await this.wouldCreateCircularReference(
        id,
        updateDto.parentId,
        storeId,
      );

      if (isCircular) {
        throw new BadRequestException('Cannot create circular category reference');
      }
    }

    return this.prisma.prisma.category.update({
      where: { id },
      data: updateDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string, storeId: string) {
    const category = await this.prisma.prisma.category.findFirst({
      where: { id, storeId },
      include: {
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    return this.prisma.prisma.category.delete({ where: { id } });
  }

  async getCategoryTree(storeId: string) {
    const categories = await this.prisma.prisma.category.findMany({
      where: { storeId, parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return categories;
  }

  private async wouldCreateCircularReference(
    categoryId: string,
    newParentId: string,
    storeId: string,
  ): Promise<boolean> {
    let currentId = newParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === categoryId) {
        return true;
      }

      if (visited.has(currentId)) {
        return true; // Circular reference detected
      }

      visited.add(currentId);

      const parent = await this.prisma.prisma.category.findFirst({
        where: { id: currentId, storeId },
        select: { parentId: true },
      });

      if (!parent || !parent.parentId) {
        break;
      }

      currentId = parent.parentId;
    }

    return false;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
