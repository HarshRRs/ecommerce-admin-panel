import { getStoreConfig, getProductBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import { ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';

// Client component wrapper will be needed for state (variants/gallery)
// For now, implementing as a server component with a client-side part for interactions if needed,
// but for simplicity in this MVP step, let's keep it mostly server-rendered or use a client component for the interactive parts.
// We'll make the main page server-rendered and import a client component for the details.

import { ProductDetails } from '@/components/shop/ProductDetails';

export default async function ProductPage({ params }: { params: Promise<{ slug: string, productSlug: string }> }) {
    const { slug, productSlug } = await params;

    try {
        const store = await getStoreConfig(slug);
        const product = await getProductBySlug(store.id, productSlug);

        return (
            <div className="container mx-auto px-4 py-8">
                <ProductDetails product={product} storeCurrency={store.currency} />
            </div>
        );
    } catch (error) {
        notFound();
    }
}
