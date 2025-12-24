import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHomepageSectionDto,
  UpdateHomepageSectionDto,
  ReorderSectionsDto,
} from './dto/homepage-section.dto';

@Injectable()
export class HomepageSectionService {
  constructor(private prisma: PrismaService) {}

  private readonly VALID_SECTION_TYPES = [
    'HERO_SECTION',
    'FEATURED_PRODUCTS',
    'CATEGORY_GRID',
    'PROMO_BANNER',
    'NEWSLETTER_SIGNUP',
  ];

  private validateSectionType(type: string): void {
    if (!this.VALID_SECTION_TYPES.includes(type)) {
      throw new BadRequestException(`Invalid section type: ${type}`);
    }
  }

  async createSection(dto: CreateHomepageSectionDto, storeId: string) {
    this.validateSectionType(dto.type);

    // Get the next display order if not provided
    if (dto.displayOrder === undefined) {
      const maxOrder = await this.prisma.prisma.homepageSection.findFirst({
        where: { storeId },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      dto.displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;
    }

    return this.prisma.prisma.homepageSection.create({
      data: {
        ...dto,
        storeId,
      },
    });
  }

  async listSections(storeId: string, enabledOnly?: boolean) {
    const where: any = { storeId };
    if (enabledOnly === true) {
      where.isEnabled = true;
    }

    return this.prisma.prisma.homepageSection.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getSection(id: string, storeId: string) {
    const section = await this.prisma.prisma.homepageSection.findFirst({
      where: { id, storeId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async updateSection(id: string, dto: UpdateHomepageSectionDto, storeId: string) {
    const section = await this.prisma.prisma.homepageSection.findFirst({
      where: { id, storeId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (dto.type) {
      this.validateSectionType(dto.type);
    }

    return this.prisma.prisma.homepageSection.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async deleteSection(id: string, storeId: string) {
    const section = await this.prisma.prisma.homepageSection.findFirst({
      where: { id, storeId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return this.prisma.prisma.homepageSection.delete({ where: { id } });
  }

  async reorderSections(dto: ReorderSectionsDto, storeId: string) {
    const { sections } = dto;

    // Validate all sections belong to this store
    const sectionIds = sections.map((s) => s.id);
    const existingSections = await this.prisma.prisma.homepageSection.findMany({
      where: {
        id: { in: sectionIds },
        storeId,
      },
    });

    if (existingSections.length !== sectionIds.length) {
      throw new BadRequestException('Some sections not found or do not belong to this store');
    }

    // Update display order for each section
    await this.prisma.prisma.$transaction(
      sections.map((s) =>
        this.prisma.prisma.homepageSection.update({
          where: { id: s.id },
          data: { displayOrder: s.displayOrder },
        }),
      ),
    );

    return { success: true, message: 'Sections reordered successfully' };
  }
}
