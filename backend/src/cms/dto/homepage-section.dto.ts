import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsObject, Min } from 'class-validator';

export class CreateHomepageSectionDto {
  @IsString()
  @IsNotEmpty()
  type: string; // HERO_SECTION, FEATURED_PRODUCTS, etc.

  @IsObject()
  @IsNotEmpty()
  config: any; // Section-specific configuration

  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}

export class UpdateHomepageSectionDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  config?: any;

  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}

export class ReorderSectionsDto {
  @IsObject({ each: true })
  @IsNotEmpty()
  sections: Array<{ id: string; displayOrder: number }>;
}
