import { IsString, IsNotEmpty, IsNumber, IsDate, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType, CouponStatus } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CouponType)
  @IsNotEmpty()
  type: CouponType;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  value: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderValue?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validUntil?: Date;

  @IsEnum(CouponStatus)
  @IsOptional()
  status?: CouponStatus;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderValue?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validUntil?: Date;

  @IsEnum(CouponStatus)
  @IsOptional()
  status?: CouponStatus;
}
