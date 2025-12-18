import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateAddressDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async create(createCustomerDto: CreateCustomerDto, storeId: string) {
    const { addresses, ...customerData } = createCustomerDto;

    const existing = await this.prisma.customer.findFirst({
      where: { email: createCustomerDto.email, storeId },
    });

    if (existing) {
      throw new ConflictException('Customer with this email already exists');
    }

    return this.prisma.customer.create({
      data: {
        ...customerData,
        storeId,
        addresses: addresses
          ? {
            create: addresses.map((addr) => ({
              firstName: addr.firstName,
              lastName: addr.lastName,
              addressLine1: addr.addressLine1,
              addressLine2: addr.addressLine2,
              city: addr.city,
              state: addr.state,
              postalCode: addr.postalCode,
              country: addr.country,
              phone: addr.phone || '',
              isDefault: addr.isDefault || false,
            })),
          }
          : undefined,
      },
      include: {
        addresses: true,
      },
    });
  }

  async findAll(storeId: string, search?: string) {
    const where: any = { storeId };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.customer.findMany({
      where,
      include: {
        addresses: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, storeId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, storeId },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, storeId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, storeId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...updateCustomerDto,
        updatedAt: new Date(),
      },
      include: {
        addresses: true,
      },
    });
  }

  async remove(id: string, storeId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, storeId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customer.delete({ where: { id } });
  }

  async addAddress(customerId: string, createAddressDto: CreateAddressDto, storeId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, storeId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        phone: createAddressDto.phone || '',
        customerId,
      },
    });
  }
}
