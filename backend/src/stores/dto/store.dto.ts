import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { StoreStatus, StoreType } from '@prisma/client';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsEnum(StoreType)
  @IsOptional()
  type?: StoreType;

  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;
}

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;

  @IsEnum(StoreType)
  @IsOptional()
  type?: StoreType;

  @IsString()
  @IsOptional()
  stripeApiKey?: string;

  @IsString()
  @IsOptional()
  stripeWebhookSecret?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;
}
