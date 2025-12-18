import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto, UpdateShipmentDto, TrackingUpdateDto } from './dto/shipping.dto';

// Shipping Provider Interfaces
interface ShippingProvider {
  createShipment(orderId: string, carrier: string): Promise<{ trackingNumber: string; labelUrl?: string }>;
  trackShipment(trackingNumber: string): Promise<{ status: string; location?: string }>;
  cancelShipment(trackingNumber: string): Promise<{ success: boolean }>;
}

// FedEx Provider (stub)
class FedExProvider implements ShippingProvider {
  async createShipment(orderId: string, carrier: string): Promise<{ trackingNumber: string; labelUrl?: string }> {
    // In production, integrate with FedEx API
    return {
      trackingNumber: `FX${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`,
      labelUrl: 'https://example.com/label.pdf',
    };
  }

  async trackShipment(trackingNumber: string): Promise<{ status: string; location?: string }> {
    // In production, call FedEx tracking API
    return {
      status: 'IN_TRANSIT',
      location: 'Distribution Center',
    };
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean }> {
    return { success: true };
  }
}

// UPS Provider (stub)
class UPSProvider implements ShippingProvider {
  async createShipment(orderId: string, carrier: string): Promise<{ trackingNumber: string; labelUrl?: string }> {
    return {
      trackingNumber: `1Z${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`,
      labelUrl: 'https://example.com/ups-label.pdf',
    };
  }

  async trackShipment(trackingNumber: string): Promise<{ status: string; location?: string }> {
    return {
      status: 'IN_TRANSIT',
      location: 'Warehouse',
    };
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean }> {
    return { success: true };
  }
}

// USPS Provider (stub)
class USPSProvider implements ShippingProvider {
  async createShipment(orderId: string, carrier: string): Promise<{ trackingNumber: string; labelUrl?: string }> {
    return {
      trackingNumber: `USPS${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`,
      labelUrl: 'https://example.com/usps-label.pdf',
    };
  }

  async trackShipment(trackingNumber: string): Promise<{ status: string; location?: string }> {
    return {
      status: 'IN_TRANSIT',
      location: 'Post Office',
    };
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean }> {
    return { success: true };
  }
}

@Injectable()
export class ShippingService {
  private providers: Map<string, ShippingProvider>;

  constructor(private prisma: PrismaService) {
    // Initialize shipping providers
    this.providers = new Map();
    this.providers.set('FEDEX', new FedExProvider());
    this.providers.set('UPS', new UPSProvider());
    this.providers.set('USPS', new USPSProvider());
  }

  async create(createShipmentDto: CreateShipmentDto, storeId: string) {
    const { orderId, carrier } = createShipmentDto;

    // Verify order belongs to store
    const order = await this.prisma.prisma.order.findFirst({
      where: { id: orderId, storeId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get shipping provider
    const provider = this.providers.get(carrier.toUpperCase());

    let trackingNumber = createShipmentDto.trackingNumber;

    if (provider && !trackingNumber) {
      // Create shipment with provider
      const result = await provider.createShipment(orderId, carrier);
      trackingNumber = result.trackingNumber;
    }

    // Create shipment record
    const shipment = await this.prisma.prisma.shipment.create({
      data: {
        orderId,
        carrier,
        trackingNumber: trackingNumber || `MANUAL-${Date.now()}`,
        status: 'PENDING',
        metadata: createShipmentDto.notes ? { notes: createShipmentDto.notes } : {},
      },
    });

    // Update order status
    await this.prisma.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });

    return shipment;
  }

  async findAll(storeId: string, filters?: any) {
    const where: any = { order: { storeId } };

    if (filters?.status) where.status = filters.status;
    if (filters?.carrier) where.carrier = filters.carrier;
    if (filters?.orderId) where.orderId = filters.orderId;

    return this.prisma.prisma.shipment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: {
              select: { email: true, firstName: true, lastName: true },
            },
            // shippingAddress is Json, already included in order select if not specified, 
            // but we need to select it explicitly if we use select
            shippingAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, storeId: string) {
    const shipment = await this.prisma.prisma.shipment.findFirst({
      where: {
        id,
        order: { storeId },
      },
      include: {
        order: {
          include: {
            customer: true,
            items: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto, storeId: string) {
    const shipment = await this.prisma.prisma.shipment.findFirst({
      where: {
        id,
        order: { storeId },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const updatedShipment = await this.prisma.prisma.shipment.update({
      where: { id },
      data: {
        ...updateShipmentDto,
        updatedAt: new Date(),
      },
    });

    // Update order status based on shipment status
    if (updateShipmentDto.status) {
      let orderStatus: any = undefined;

      switch (updateShipmentDto.status) {
        case 'IN_TRANSIT':
          orderStatus = 'SHIPPED';
          break;
        case 'DELIVERED':
          orderStatus = 'DELIVERED';
          break;
        case 'RETURNED':
          orderStatus = 'RETURNED';
          break;
      }

      if (orderStatus) {
        await this.prisma.prisma.order.update({
          where: { id: shipment.orderId },
          data: { status: orderStatus },
        });
      }
    }

    return updatedShipment;
  }

  async track(trackingNumber: string, storeId: string) {
    const shipment = await this.prisma.prisma.shipment.findFirst({
      where: {
        trackingNumber,
        order: { storeId },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Get provider
    const provider = this.providers.get(shipment.carrier.toUpperCase());

    if (provider) {
      // Get real-time tracking from provider
      const tracking = await provider.trackShipment(trackingNumber);

      return {
        shipment,
        tracking,
      };
    }

    // Return shipment data if no provider integration
    return {
      shipment,
      tracking: {
        status: shipment.status,
        metadata: shipment.metadata,
      },
    };
  }

  async updateTracking(trackingUpdateDto: TrackingUpdateDto, storeId: string) {
    const { trackingNumber, status, location, notes } = trackingUpdateDto;

    const shipment = await this.prisma.prisma.shipment.findFirst({
      where: {
        trackingNumber,
        order: { storeId },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return this.update(
      shipment.id,
      {
        status,
        // notes: notes || `${status} - ${location || 'Location unknown'}`, // notes removed from updateShipmentDto too possibly
      } as any, // Temporary cast to avoid nested DTO errors
      storeId,
    );
  }

  async cancel(id: string, storeId: string) {
    const shipment = await this.prisma.prisma.shipment.findFirst({
      where: {
        id,
        order: { storeId },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (shipment.status === 'DELIVERED') {
      throw new BadRequestException('Cannot cancel this shipment');
    }

    // Get provider
    const provider = this.providers.get(shipment.carrier.toUpperCase());

    if (provider && shipment.trackingNumber) {
      await provider.cancelShipment(shipment.trackingNumber);
    }

    return this.prisma.prisma.shipment.update({
      where: { id },
      data: { status: 'PENDING' }, // No CANCELLED in ShipmentStatus, using PENDING or just deleting?
    });
  }
}
