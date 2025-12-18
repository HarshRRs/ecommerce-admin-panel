import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto, UpdatePageDto, CreateBannerDto, UpdateBannerDto, CreateBlogDto, UpdateBlogDto } from './dto/cms.dto';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) { }

  // Pages
  async createPage(createPageDto: CreatePageDto, storeId: string) {
    const slug = this.generateSlug(createPageDto.title);
    return this.prisma.page.create({
      data: {
        ...createPageDto,
        slug,
        storeId,
      },
    });
  }

  async findAllPages(storeId: string, status?: string) {
    const where: any = { storeId };
    if (status) where.status = status;

    return this.prisma.page.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePage(id: string, storeId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, storeId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async updatePage(id: string, updatePageDto: UpdatePageDto, storeId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, storeId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        ...updatePageDto,
        updatedAt: new Date(),
      },
    });
  }

  async removePage(id: string, storeId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, storeId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return this.prisma.page.delete({ where: { id } });
  }

  // Banners
  async createBanner(createBannerDto: CreateBannerDto, storeId: string) {
    return this.prisma.banner.create({
      data: {
        ...createBannerDto,
        storeId,
      },
    });
  }

  async findAllBanners(storeId: string, status?: string) {
    const where: any = { storeId };
    if (status) where.status = status;

    return this.prisma.banner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBanner(id: string, updateBannerDto: UpdateBannerDto, storeId: string) {
    const banner = await this.prisma.banner.findFirst({
      where: { id, storeId },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return this.prisma.banner.update({
      where: { id },
      data: {
        ...updateBannerDto,
        updatedAt: new Date(),
      },
    });
  }

  async removeBanner(id: string, storeId: string) {
    const banner = await this.prisma.banner.findFirst({
      where: { id, storeId },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return this.prisma.banner.delete({ where: { id } });
  }

  // Blog Posts
  async createBlog(createBlogDto: CreateBlogDto, storeId: string, authorId: string) {
    const slug = this.generateSlug(createBlogDto.title);
    return this.prisma.blogPost.create({
      data: {
        ...createBlogDto,
        slug,
        storeId,
        authorId,
      },
    });
  }

  async findAllBlogs(storeId: string, status?: string) {
    const where: any = { storeId };
    if (status) where.status = status;

    return this.prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneBlog(id: string, storeId: string) {
    const blog = await this.prisma.blogPost.findFirst({
      where: { id, storeId },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found');
    }

    return blog;
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto, storeId: string) {
    const blog = await this.prisma.blogPost.findFirst({
      where: { id, storeId },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found');
    }

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...updateBlogDto,
        updatedAt: new Date(),
      },
    });
  }

  async removeBlog(id: string, storeId: string) {
    const blog = await this.prisma.blogPost.findFirst({
      where: { id, storeId },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found');
    }

    return this.prisma.blogPost.delete({ where: { id } });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now();
  }
}
