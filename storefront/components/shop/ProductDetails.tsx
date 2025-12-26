'use client';

import { useState } from 'react';
import { Product, ProductVariant } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import clsx from 'clsx';

interface ProductDetailsProps {
    product: Product;
    storeCurrency: string;
}

export function ProductDetails({ product, storeCurrency }: ProductDetailsProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        product.variants.length > 0 ? product.variants[0] : null
    );
    const [mainImage, setMainImage] = useState(
        product.images?.[0] || product.variants?.[0]?.imageUrl || '/placeholder.png'
    );

    const price = selectedVariant?.price || product.basePrice;
    const isOutOfStock = (selectedVariant?.stock ?? product.stock) <= 0;

    // Group attributes for cleaner UI (assuming consistent attribute keys across variants)
    // This is a simplified logic. Real-world attribute grouping is more complex.
    const allAttributes = product.variants.reduce((acc, variant) => {
        Object.entries(variant.attributes).forEach(([key, value]) => {
            if (!acc[key]) acc[key] = new Set();
            acc[key].add(value);
        });
        return acc;
    }, {} as Record<string, Set<string>>);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
                <div className="aspect-square bg-gray-100 dark:bg-neutral-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800">
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {product.images?.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainImage(img)}
                            className={clsx(
                                "w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                                mainImage === img ? "border-black dark:border-white" : "border-transparent"
                            )}
                        >
                            <img src={img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Details */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
                    <div className="text-2xl font-medium text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(Number(price))}
                    </div>
                </div>

                {/* Variants (Simple implementation) */}
                {Object.keys(allAttributes).length > 0 && (
                    <div className="space-y-4">
                        {Object.entries(allAttributes).map(([attrName, values]) => (
                            <div key={attrName}>
                                <h3 className="text-sm font-medium mb-2 capitalize">{attrName}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(values).map((val) => {
                                        const isSelected = selectedVariant?.attributes[attrName] === val;
                                        return (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    // Find variant with this attribute value 
                                                    // (Naive approach: just pick the first one matching this value for simplicity in this demo)
                                                    const match = product.variants.find(v => v.attributes[attrName] === val);
                                                    if (match) setSelectedVariant(match);
                                                }}
                                                className={clsx(
                                                    "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                                                    isSelected
                                                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                                        : "bg-white text-black border-gray-200 hover:border-black dark:bg-black dark:text-gray-300 dark:border-neutral-700 dark:hover:border-white"
                                                )}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="pt-4 space-y-4">
                    <button
                        disabled={isOutOfStock}
                        className="w-full h-14 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <p className="text-xs text-center text-gray-500">
                        Free shipping on all orders over $50
                    </p>
                </div>

                {/* Description */}
                <div className="prose dark:prose-invert max-w-none pt-8 border-t dark:border-neutral-800">
                    <h3 className="text-lg font-bold mb-4">Description</h3>
                    <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                </div>
            </div>
        </div>
    );
}
