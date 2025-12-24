import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { HomepageSectionService } from './homepage-section.service';
import { NavigationMenuService } from './navigation-menu.service';
import { CmsController } from './cms.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CmsService, HomepageSectionService, NavigationMenuService],
  controllers: [CmsController],
  exports: [CmsService, HomepageSectionService, NavigationMenuService],
})
export class CmsModule {}
