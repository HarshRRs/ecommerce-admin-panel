import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UpdateMediaAssetDto } from './dto/media.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('storeId') storeId: string,
    @CurrentUser('id') userId: string,
    @Body('folder') folder?: string,
    @Body('altText') altText?: string,
  ) {
    return this.mediaService.uploadFile(file, storeId, folder || '/', altText, userId);
  }

  @Get('assets')
  listAssets(
    @CurrentUser('storeId') storeId: string,
    @Query('folder') folder?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.mediaService.listAssets(storeId, folder, page || 1, limit || 50);
  }

  @Get('assets/:id')
  getAsset(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.mediaService.getAsset(id, storeId);
  }

  @Patch('assets/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  updateAsset(
    @Param('id') id: string,
    @Body() updateDto: UpdateMediaAssetDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.mediaService.updateAsset(id, updateDto, storeId);
  }

  @Delete('assets/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  deleteAsset(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.mediaService.deleteAsset(id, storeId);
  }

  @Get('folders')
  listFolders(@CurrentUser('storeId') storeId: string) {
    return this.mediaService.listFolders(storeId);
  }

  @Get('auth-params')
  getAuthParams() {
    return this.mediaService.getImageKitAuthParams();
  }
}
