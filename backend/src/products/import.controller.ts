import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProductsService } from './products.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assumed global or standard guard usage

const csvFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(new BadRequestException('Only CSV files are allowed!'), false);
  }
  callback(null, true);
};

const storage = diskStorage({
  destination: './uploads/temp', // Make sure this exists
  filename: (req, file, callback) => {
    callback(null, `${uuidv4()}${extname(file.originalname)}`);
  },
});

@Controller('products/import')
// @UseGuards(JwtAuthGuard) // Enable if not global
export class ImportController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('csv')
  @Roles(Role.OWNER, Role.MANAGER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage,
      fileFilter: csvFileFilter,
    }),
  )
  async importProducts(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('storeId') storeId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const result = await this.productsService.importProducts(storeId, file.path);
      return result;
    } catch (error) {
      throw new BadRequestException('Failed to process import');
    }
  }
}
