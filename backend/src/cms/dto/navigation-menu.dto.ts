import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export enum MenuLocation {
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
}

export enum MenuItemType {
  PAGE = 'PAGE',
  CATEGORY = 'CATEGORY',
  EXTERNAL = 'EXTERNAL',
}

export class UpsertNavigationMenuDto {
  @IsEnum(MenuLocation)
  @IsNotEmpty()
  location: MenuLocation;

  @IsArray()
  @IsNotEmpty()
  items: MenuItem[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  type: MenuItemType;
  target: string;
  openInNewTab?: boolean;
  isEnabled?: boolean;
  displayOrder: number;
}
