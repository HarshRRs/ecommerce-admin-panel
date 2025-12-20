import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class ImageKitService {
  private imagekit: ImageKit;
  private readonly logger = new Logger(ImageKitService.name);

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');

    if (!publicKey || !privateKey || !urlEndpoint) {
      this.logger.warn('ImageKit credentials are missing. Image uploads will fail.');
    } else {
      this.imagekit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      });
    }
  }

  async uploadImage(
    file: Buffer,
    fileName: string,
    folder: string,
    useUniqueFileName: boolean = true,
  ) {
    if (!this.imagekit) {
      throw new Error('ImageKit not initialized');
    }

    try {
      const response = await this.imagekit.upload({
        file,
        fileName,
        folder,
        useUniqueFileName,
        tags: [folder],
      });

      return {
        url: response.url,
        fileId: response.fileId,
        thumbnailUrl: response.thumbnailUrl,
      };
    } catch (error) {
      this.logger.error(`ImageKit Upload Error: ${error.message}`);
      throw error;
    }
  }

  async deleteImage(fileId: string) {
    if (!this.imagekit) return;

    try {
      await this.imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      this.logger.error(`ImageKit Delete Error: ${error.message}`);
      return false;
    }
  }

  // Get optimized URL for frontend
  getOptimizedUrl(url: string, width?: number, height?: number) {
    if (!url) return '';

    let transform = 'tr:f-auto,q-80'; // Auto-format (WebP), 80% quality
    if (width) transform += `,w-${width}`;
    if (height) transform += `,h-${height}`;

    // Replace the default URL with transformed one if it's an imagekit URL
    const endpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');
    if (endpoint && url.startsWith(endpoint)) {
      return url.replace(endpoint, `${endpoint}/${transform}`);
    }

    return url;
  }

  getAuthenticationParameters() {
    if (!this.imagekit) {
      throw new Error('ImageKit not initialized');
    }
    return this.imagekit.getAuthenticationParameters();
  }
}
