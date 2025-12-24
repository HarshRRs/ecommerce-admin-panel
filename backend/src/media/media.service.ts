import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMediaAssetDto } from './dto/media.dto';
import ImageKit from 'imagekit';

@Injectable()
export class MediaService {
  private imagekit: ImageKit | null = null;
  private isImageKitEnabled: boolean = false;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize ImageKit if credentials are available
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');

    if (publicKey && privateKey && urlEndpoint) {
      this.imagekit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      });
      this.isImageKitEnabled = true;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    storeId: string,
    folder: string = '/',
    altText?: string,
    uploaderId?: string,
  ) {
    if (!this.isImageKitEnabled || !this.imagekit) {
      throw new BadRequestException('ImageKit is not configured');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    try {
      // Construct folder path with store isolation
      const folderPath = `/stores/${storeId}${folder}`;

      // Upload to ImageKit
      const uploadResponse = await this.imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: folderPath,
      });

      // Create MediaAsset record
      const mediaAsset = await this.prisma.prisma.mediaAsset.create({
        data: {
          storeId,
          fileName: file.originalname,
          fileUrl: uploadResponse.url,
          fileId: uploadResponse.fileId,
          altText: altText || '',
          folder: folder,
          mimeType: file.mimetype,
          size: file.size,
          width: uploadResponse.width,
          height: uploadResponse.height,
          uploadedBy: uploaderId,
        },
      });

      return mediaAsset;
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async listAssets(storeId: string, folder?: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const where: any = { storeId };

    if (folder) {
      where.folder = folder;
    }

    const [assets, total] = await Promise.all([
      this.prisma.prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.prisma.mediaAsset.count({ where }),
    ]);

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAsset(id: string, storeId: string) {
    const asset = await this.prisma.prisma.mediaAsset.findFirst({
      where: { id, storeId },
    });

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    return asset;
  }

  async updateAsset(id: string, dto: UpdateMediaAssetDto, storeId: string) {
    const asset = await this.prisma.prisma.mediaAsset.findFirst({
      where: { id, storeId },
    });

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    // If folder is being changed, we would need to move the file in ImageKit
    // For simplicity, we'll just update the metadata
    return this.prisma.prisma.mediaAsset.update({
      where: { id },
      data: {
        altText: dto.altText !== undefined ? dto.altText : asset.altText,
        folder: dto.folder !== undefined ? dto.folder : asset.folder,
      },
    });
  }

  async deleteAsset(id: string, storeId: string) {
    if (!this.isImageKitEnabled || !this.imagekit) {
      throw new BadRequestException('ImageKit is not configured');
    }

    const asset = await this.prisma.prisma.mediaAsset.findFirst({
      where: { id, storeId },
    });

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    try {
      // Delete from ImageKit
      await this.imagekit.deleteFile(asset.fileId);
    } catch (error) {
      // Log error but continue to delete from database
      console.error('Failed to delete from ImageKit:', error.message);
    }

    // Delete from database
    return this.prisma.prisma.mediaAsset.delete({ where: { id } });
  }

  async listFolders(storeId: string) {
    const assets = await this.prisma.prisma.mediaAsset.findMany({
      where: { storeId },
      select: { folder: true },
      distinct: ['folder'],
      orderBy: { folder: 'asc' },
    });

    return assets.map((a) => a.folder);
  }

  getImageKitAuthParams() {
    if (!this.isImageKitEnabled || !this.imagekit) {
      throw new BadRequestException('ImageKit is not configured');
    }

    return this.imagekit.getAuthenticationParameters();
  }
}
