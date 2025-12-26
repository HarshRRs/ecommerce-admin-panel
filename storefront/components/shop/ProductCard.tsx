import Link from 'next/link';
import { Product } from '@/lib/types';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    storeSlug: string;
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
    const mainImage = product.images?.[0] || '/placeholder.png';

    return (
        <div className="group relative border rounded-lg overflow-hidden bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 transition-all hover:shadow-lg">
            <div className="aspect-square bg-gray-100 dark:bg-neutral-800 relative overflow-hidden">
                <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Quick Add Button */}
                <button className="absolute bottom-3 right-3 p-3 bg-white dark:bg-black text-black dark:text-white rounded-full shadow-md opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white">
                    <ShoppingBag className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    <Link href={`/${storeSlug}/product/${product.slug}`}>
                        <span className="absolute inset-0" />
                        {product.name}
                    </Link>
                </h3>

                <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(product.basePrice))}
                        </span>
                        {product.compareAtPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(product.compareAtPrice))}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
