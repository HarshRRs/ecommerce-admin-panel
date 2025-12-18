import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UploadController } from './upload.controller';
import { ImportController } from './import.controller';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProductsService, CategoriesService, CloudinaryService],
  controllers: [ProductsController, CategoriesController, UploadController, ImportController],
  exports: [ProductsService, CategoriesService],
})
export class ProductsModule { }
