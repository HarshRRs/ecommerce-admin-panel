import { getStoreConfig, getProductBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';

import { ProductDetails } from '@/components/shop/ProductDetails';

export default async function ProductPage({ params }: { params: Promise<{ slug: string, productSlug: string }> }) {
    const { slug, productSlug } = await params;

    let store;
    let product;

    try {
        store = await getStoreConfig(slug);
        product = await getProductBySlug(store.id, productSlug);
    } catch (error) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ProductDetails product={product} storeCurrency={store.currency} />
        </div>
    );
}
