import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// File upload configuration
const imageFileFilter = (req: any, file: any, callback: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new BadRequestException('Only image files (JPEG, PNG, WebP) are allowed'),
      false,
    );
  }
  callback(null, true);
};

@Controller('products')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload-images')
  @Roles(Role.OWNER, Role.MANAGER)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
      },
      // No storage defined = MemoryStorage (buffer available)
    }),
  )
  async uploadImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls: string[] = [];

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      for (const file of files) {
        try {
          const result = await this.cloudinaryService.uploadImage(file);
          urls.push(result.url);
        } catch (error) {
          console.error('Upload failed:', error);
          // Continue or throw? Let's continue and return what succeeded or error out if all fail.
        }
      }
    } else {
      // Fallback to Local Disk (for dev)
      const uploadDir = './uploads/images';

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      for (const file of files) {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        const filePath = path.join(uploadDir, uniqueName);

        fs.writeFileSync(filePath, file.buffer);
        urls.push(`${baseUrl}/uploads/images/${uniqueName}`);
      }
    }

    if (urls.length === 0) {
      throw new BadRequestException('Failed to upload images');
    }

    return { urls };
  }
}
