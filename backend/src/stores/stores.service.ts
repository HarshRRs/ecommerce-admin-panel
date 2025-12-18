import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../common/services/security.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { Role } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
  ) { }

  async create(createStoreDto: CreateStoreDto, userId: string) {
    // Check if slug already exists
    const existingStore = await this.prisma.prisma.store.findUnique({
      where: { slug: createStoreDto.slug },
    });

    if (existingStore) {
      throw new ConflictException('Store with this slug already exists');
    }

    // Create store and assign user as owner
    const store = await this.prisma.prisma.store.create({
      data: {
        ...createStoreDto,
        ownerId: userId,
        status: 'ACTIVE',
      },
    });

    // Update user's storeId
    await this.prisma.prisma.user.update({
      where: { id: userId },
      data: { storeId: store.id },
    });

    return store;
  }

  async findAll(userId: string, userRole: Role) {
    // Super admin can see all stores
    if (userRole === 'SUPER_ADMIN') {
      return this.prisma.prisma.store.findMany({
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });
    }

    // Other users can only see their store
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
      select: { storeId: true },
    });

    if (!user?.storeId) {
      return [];
    }

    const store = await this.prisma.prisma.store.findUnique({
      where: { id: user.storeId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return store ? [store] : [];
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const store = await this.prisma.prisma.store.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check access
    await this.checkStoreAccess(store.id, userId, userRole);

    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto, userId: string, userRole: Role) {
    const store = await this.prisma.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check access (only super admin can update for now, or we should check if user is manager in that store)
    // For now, let's just check if user belongs to this store
    await this.checkStoreAccess(id, userId, userRole);

    // Check slug uniqueness if updating slug
    if (updateStoreDto.slug && updateStoreDto.slug !== store.slug) {
      const existingStore = await this.prisma.prisma.store.findUnique({
        where: { slug: updateStoreDto.slug },
      });

      if (existingStore) {
        throw new ConflictException('Store with this slug already exists');
      }
    }

    const data = { ...updateStoreDto };
    if (data.stripeApiKey) {
      data.stripeApiKey = this.securityService.encrypt(data.stripeApiKey);
    }
    if (data.stripeWebhookSecret) {
      data.stripeWebhookSecret = this.securityService.encrypt(data.stripeWebhookSecret);
    }

    return this.prisma.prisma.store.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const store = await this.prisma.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Only super admin can delete stores
    if (userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can delete stores');
    }

    return this.prisma.prisma.store.delete({
      where: { id },
    });
  }

  private async checkStoreAccess(storeId: string, userId: string, userRole: Role) {
    // Super admin has access to all stores
    if (userRole === 'SUPER_ADMIN') {
      return;
    }

    // Check if user belongs to this store
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
      select: { storeId: true },
    });

    if (user?.storeId !== storeId) {
      throw new ForbiddenException('You do not have access to this store');
    }
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
    return this.prisma.prisma.store.update({
      where: { id },
      data: { status },
    });
  }

  async confirmStripeOwnership(id: string, userId: string, userRole: Role) {
    await this.checkStoreAccess(id, userId, userRole);

    return this.prisma.prisma.store.update({
      where: { id },
      data: {
        stripeOwnershipConfirmed: true,
        stripeConfirmedAt: new Date(),
        stripeConfirmedBy: userId
      },
    });
  }
}
