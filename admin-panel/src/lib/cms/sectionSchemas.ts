// Section type schemas for validation

export const SECTION_TYPES = {
  HERO_SECTION: 'HERO_SECTION',
  FEATURED_PRODUCTS: 'FEATURED_PRODUCTS',
  CATEGORY_GRID: 'CATEGORY_GRID',
  PROMO_BANNER: 'PROMO_BANNER',
  NEWSLETTER_SIGNUP: 'NEWSLETTER_SIGNUP',
} as const;

export type SectionType = typeof SECTION_TYPES[keyof typeof SECTION_TYPES];

export interface HeroSectionConfig {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  overlayOpacity: number;
  textAlignment: 'left' | 'center' | 'right';
}

export interface FeaturedProductsConfig {
  title: string;
  productIds: string[];
  displayStyle: 'grid' | 'carousel';
  showPrices: boolean;
  showAddToCart: boolean;
}

export interface CategoryGridConfig {
  title: string;
  categoryIds: string[];
  columns: 2 | 3 | 4;
  showDescription: boolean;
}

export interface PromoBannerConfig {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bannerImage: string;
  backgroundColor: string;
}

export interface NewsletterSignupConfig {
  heading: string;
  description: string;
  placeholderText: string;
  buttonText: string;
  backgroundColor: string;
}

export type SectionConfig =
  | HeroSectionConfig
  | FeaturedProductsConfig
  | CategoryGridConfig
  | PromoBannerConfig
  | NewsletterSignupConfig;

export interface Section {
  id: string;
  type: SectionType;
  config: SectionConfig;
  displayOrder: number;
  isEnabled: boolean;
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  HERO_SECTION: 'Hero Section',
  FEATURED_PRODUCTS: 'Featured Products',
  CATEGORY_GRID: 'Category Grid',
  PROMO_BANNER: 'Promo Banner',
  NEWSLETTER_SIGNUP: 'Newsletter Signup',
};

export const SECTION_TYPE_ICONS: Record<SectionType, string> = {
  HERO_SECTION: '🎯',
  FEATURED_PRODUCTS: '⭐',
  CATEGORY_GRID: '📦',
  PROMO_BANNER: '📢',
  NEWSLETTER_SIGNUP: '✉️',
};

export function validateSectionConfig(type: SectionType, config: any): string[] {
  const errors: string[] = [];

  switch (type) {
    case SECTION_TYPES.HERO_SECTION:
      if (!config.heading || config.heading.length > 100) {
        errors.push('Heading must be 1-100 characters');
      }
      if (!config.subheading || config.subheading.length > 200) {
        errors.push('Subheading must be 1-200 characters');
      }
      if (!config.ctaText || config.ctaText.length > 30) {
        errors.push('CTA text must be 1-30 characters');
      }
      if (!config.ctaLink) {
        errors.push('CTA link is required');
      }
      if (!config.backgroundImage) {
        errors.push('Background image is required');
      }
      if (config.overlayOpacity < 0 || config.overlayOpacity > 100) {
        errors.push('Overlay opacity must be 0-100');
      }
      break;

    case SECTION_TYPES.FEATURED_PRODUCTS:
      if (!config.title || config.title.length > 60) {
        errors.push('Title must be 1-60 characters');
      }
      if (!config.productIds || config.productIds.length === 0) {
        errors.push('At least one product must be selected');
      }
      if (config.productIds && config.productIds.length > 12) {
        errors.push('Maximum 12 products allowed');
      }
      break;

    case SECTION_TYPES.CATEGORY_GRID:
      if (!config.title || config.title.length > 60) {
        errors.push('Title must be 1-60 characters');
      }
      if (!config.categoryIds || config.categoryIds.length === 0) {
        errors.push('At least one category must be selected');
      }
      if (config.categoryIds && config.categoryIds.length > 8) {
        errors.push('Maximum 8 categories allowed');
      }
      if (![2, 3, 4].includes(config.columns)) {
        errors.push('Columns must be 2, 3, or 4');
      }
      break;

    case SECTION_TYPES.PROMO_BANNER:
      if (!config.title || config.title.length > 80) {
        errors.push('Title must be 1-80 characters');
      }
      if (!config.description || config.description.length > 200) {
        errors.push('Description must be 1-200 characters');
      }
      if (!config.ctaText || config.ctaText.length > 30) {
        errors.push('CTA text must be 1-30 characters');
      }
      if (!config.bannerImage) {
        errors.push('Banner image is required');
      }
      break;

    case SECTION_TYPES.NEWSLETTER_SIGNUP:
      if (!config.heading || config.heading.length > 60) {
        errors.push('Heading must be 1-60 characters');
      }
      if (!config.description || config.description.length > 200) {
        errors.push('Description must be 1-200 characters');
      }
      if (!config.placeholderText || config.placeholderText.length > 40) {
        errors.push('Placeholder text must be 1-40 characters');
      }
      if (!config.buttonText || config.buttonText.length > 30) {
        errors.push('Button text must be 1-30 characters');
      }
      break;
  }

  return errors;
}
