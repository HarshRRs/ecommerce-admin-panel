import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadMediaDto {
  @IsString()
  @IsOptional()
  folder?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  altText?: string;
}

export class UpdateMediaAssetDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  altText?: string;

  @IsString()
  @IsOptional()
  folder?: string;
}
