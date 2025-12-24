import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertNavigationMenuDto, MenuLocation, MenuItemType, MenuItem } from './dto/navigation-menu.dto';

@Injectable()
export class NavigationMenuService {
  constructor(private prisma: PrismaService) {}

  async upsertMenu(dto: UpsertNavigationMenuDto, storeId: string) {
    // Validate menu items
    await this.validateMenuItems(dto.items, storeId);

    // Check if menu already exists
    const existingMenu = await this.prisma.prisma.navigationMenu.findFirst({
      where: {
        storeId,
        location: dto.location,
      },
    });

    if (existingMenu) {
      // Update existing menu
      return this.prisma.prisma.navigationMenu.update({
        where: { id: existingMenu.id },
        data: {
          items: dto.items as any,
          isActive: dto.isActive !== undefined ? dto.isActive : existingMenu.isActive,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new menu
      return this.prisma.prisma.navigationMenu.create({
        data: {
          storeId,
          location: dto.location,
          items: dto.items as any,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });
    }
  }

  async getMenuByLocation(location: MenuLocation, storeId: string) {
    const menu = await this.prisma.prisma.navigationMenu.findFirst({
      where: {
        storeId,
        location,
      },
    });

    if (!menu) {
      // Return empty menu structure if none exists
      return {
        location,
        items: [],
        isActive: true,
      };
    }

    return menu;
  }

  private async validateMenuItems(items: MenuItem[], storeId: string): Promise<void> {
    for (const item of items) {
      // Validate label
      if (!item.label || item.label.length > 50) {
        throw new BadRequestException(`Menu item label must be 1-50 characters: ${item.label}`);
      }

      // Validate based on type
      switch (item.type) {
        case MenuItemType.PAGE:
          // Verify page exists in store
          const page = await this.prisma.prisma.page.findFirst({
            where: {
              id: item.target,
              storeId,
            },
          });
          if (!page) {
            throw new BadRequestException(`Page not found: ${item.target}`);
          }
          break;

        case MenuItemType.CATEGORY:
          // Verify category exists in store
          const category = await this.prisma.prisma.category.findFirst({
            where: {
              id: item.target,
              storeId,
            },
          });
          if (!category) {
            throw new BadRequestException(`Category not found: ${item.target}`);
          }
          break;

        case MenuItemType.EXTERNAL:
          // Validate URL format
          if (!item.target.startsWith('http://') && !item.target.startsWith('https://')) {
            throw new BadRequestException(`External URL must start with http:// or https://: ${item.target}`);
          }
          break;

        default:
          throw new BadRequestException(`Invalid menu item type: ${item.type}`);
      }
    }
  }
}
