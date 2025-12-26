import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CmsService } from './cms.service';
import { HomepageSectionService } from './homepage-section.service';
import { NavigationMenuService } from './navigation-menu.service';
import {
  CreatePageDto,
  UpdatePageDto,
  SaveDraftDto,
  CreateBannerDto,
  UpdateBannerDto,
  CreateBlogDto,
  UpdateBlogDto,
} from './dto/cms.dto';
import {
  CreateHomepageSectionDto,
  UpdateHomepageSectionDto,
  ReorderSectionsDto,
} from './dto/homepage-section.dto';
import { UpsertNavigationMenuDto, MenuLocation } from './dto/navigation-menu.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('cms')
export class CmsController {
  constructor(
    private readonly cmsService: CmsService,
    private readonly homepageSectionService: HomepageSectionService,
    private readonly navigationMenuService: NavigationMenuService,
  ) {}

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

  @Patch('pages/:id/draft')
  @Roles(Role.OWNER, Role.MANAGER)
  saveDraft(
    @Param('id') id: string,
    @Body() saveDraftDto: SaveDraftDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.cmsService.saveDraft(id, saveDraftDto.draftContent, storeId);
  }

  @Get('pages/:id/preview')
  @Roles(Role.OWNER, Role.MANAGER)
  getPreview(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.cmsService.getPreview(id, storeId);
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

  // Homepage Sections
  @Post('homepage-sections')
  @Roles(Role.OWNER, Role.MANAGER)
  createSection(
    @Body() createSectionDto: CreateHomepageSectionDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.homepageSectionService.createSection(createSectionDto, storeId);
  }

  @Get('homepage-sections')
  listSections(
    @CurrentUser('storeId') storeId: string,
    @Query('enabledOnly') enabledOnly?: string,
  ) {
    return this.homepageSectionService.listSections(storeId, enabledOnly === 'true');
  }

  @Get('homepage-sections/:id')
  getSection(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.homepageSectionService.getSection(id, storeId);
  }

  @Patch('homepage-sections/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  updateSection(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateHomepageSectionDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.homepageSectionService.updateSection(id, updateSectionDto, storeId);
  }

  @Patch('homepage-sections/reorder')
  @Roles(Role.OWNER, Role.MANAGER)
  reorderSections(@Body() reorderDto: ReorderSectionsDto, @CurrentUser('storeId') storeId: string) {
    return this.homepageSectionService.reorderSections(reorderDto, storeId);
  }

  @Delete('homepage-sections/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  deleteSection(@Param('id') id: string, @CurrentUser('storeId') storeId: string) {
    return this.homepageSectionService.deleteSection(id, storeId);
  }

  // Navigation Menus
  @Post('navigation-menus')
  @Roles(Role.OWNER, Role.MANAGER)
  upsertMenu(
    @Body() upsertMenuDto: UpsertNavigationMenuDto,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.navigationMenuService.upsertMenu(upsertMenuDto, storeId);
  }

  @Get('navigation-menus/:location')
  getMenuByLocation(
    @Param('location') location: MenuLocation,
    @CurrentUser('storeId') storeId: string,
  ) {
    return this.navigationMenuService.getMenuByLocation(location, storeId);
  }
}
