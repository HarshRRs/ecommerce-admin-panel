import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) { }

  async create(createCouponDto: CreateCouponDto, storeId: string) {
    const existing = await this.prisma.prisma.coupon.findFirst({
      where: { code: createCouponDto.code, storeId },
    });

    if (existing) {
      throw new ConflictException('Coupon with this code already exists');
    }

    return this.prisma.prisma.coupon.create({
      data: {
        ...createCouponDto,
        storeId,
        status: createCouponDto.status || 'ACTIVE',
      },
    });
  }

  async findAll(storeId: string, status?: string) {
    const where: any = { storeId };

    if (status) {
      where.status = status;
    }

    return this.prisma.prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, storeId: string) {
    const coupon = await this.prisma.prisma.coupon.findFirst({
      where: { id, storeId },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async findByCode(code: string, storeId: string) {
    const coupon = await this.prisma.prisma.coupon.findFirst({
      where: { code, storeId, status: 'ACTIVE' },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found or inactive');
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      throw new BadRequestException('Coupon not yet valid');
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      throw new BadRequestException('Coupon expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto, storeId: string) {
    const coupon = await this.prisma.prisma.coupon.findFirst({
      where: { id, storeId },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return this.prisma.prisma.coupon.update({
      where: { id },
      data: {
        ...updateCouponDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, storeId: string) {
    const coupon = await this.prisma.prisma.coupon.findFirst({
      where: { id, storeId },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return this.prisma.prisma.coupon.delete({ where: { id } });
  }

  async incrementUsage(id: string) {
    return this.prisma.prisma.coupon.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }
}
