import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { PageStatus, BlogPostStatus, BannerStatus } from '@prisma/client';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsBoolean()
  @IsOptional()
  noIndex?: boolean;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;
}

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  draftContent?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsBoolean()
  @IsOptional()
  noIndex?: boolean;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;
}

export class SaveDraftDto {
  @IsString()
  @IsNotEmpty()
  draftContent: string;
}

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsEnum(BannerStatus)
  @IsOptional()
  status?: BannerStatus;
}

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsEnum(BannerStatus)
  @IsOptional()
  status?: BannerStatus;
}

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus;
}

export class UpdateBlogDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus;
}
