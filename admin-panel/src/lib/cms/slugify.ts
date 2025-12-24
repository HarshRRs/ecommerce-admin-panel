import slugifyLib from 'slugify';

export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function generateUniqueSlug(title: string): string {
  const baseSlug = slugify(title);
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
}
