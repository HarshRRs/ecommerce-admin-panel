import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CmsService } from './cms.service';
import {
  CreatePageDto,
  UpdatePageDto,
  CreateBannerDto,
  UpdateBannerDto,
  CreateBlogDto,
  UpdateBlogDto,
} from './dto/cms.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // Pages
  @Post('pages')
  @Roles(Role.OWNER, Role.MANAGER)
  createPage(@Body() createPageDto: CreatePageDto, @CurrentUser('storeId') storeId: string) {
    return this.cmsService.createPage(createPageDto, storeId);
  }

  @Get('pages')
  findAllPages(@CurrentUser('storeId') storeId: string, @Query('status') status?: string) {
    return this.cmsService.findAllPages(storeId, status);
  }

  @Get('pages/:id')
  findOnePage(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.cmsService.findOnePage(id, storeId);
  }

  @Patch('pages/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  updatePage(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.cmsService.updatePage(id, updatePageDto, storeId);
  }

  @Delete('pages/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  removePage(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.cmsService.removePage(id, storeId);
  }

  // Banners
  @Post('banners')
  @Roles(Role.OWNER, Role.MANAGER)
  createBanner(@Body() createBannerDto: CreateBannerDto, @CurrentUser('storeId') storeId: string) {
    return this.cmsService.createBanner(createBannerDto, storeId);
  }

  @Get('banners')
  findAllBanners(@CurrentUser('storeId') storeId: string, @Query('status') status?: string) {
    return this.cmsService.findAllBanners(storeId, status);
  }

  @Patch('banners/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  updateBanner(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.cmsService.updateBanner(id, updateBannerDto, storeId);
  }

  @Delete('banners/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  removeBanner(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.cmsService.removeBanner(id, storeId);
  }

  // Blog Posts
  @Post('blogs')
  @Roles(Role.OWNER, Role.MANAGER)
  createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @CurrentUser('storeId') storeId: string,
    @CurrentUser('id') authorId: string,
  ) {
    return this.cmsService.createBlog(createBlogDto, storeId, authorId);
  }

  @Get('blogs')
  findAllBlogs(@CurrentUser('storeId') storeId: string, @Query('status') status?: string) {
    return this.cmsService.findAllBlogs(storeId, status);
  }

  @Get('blogs/:id')
  findOneBlog(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.cmsService.findOneBlog(id, storeId);
  }

  @Patch('blogs/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.cmsService.updateBlog(id, updateBlogDto, storeId);
  }

  @Delete('blogs/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  removeBlog(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.cmsService.removeBlog(id, storeId);
  }
}
