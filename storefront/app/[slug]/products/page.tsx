import { getStoreConfig, getProducts } from '@/lib/api';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';

// Next.js 15 page props type
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: SearchParams
}) {
    const { slug } = await params;
    const { categoryId, search } = await searchParams;

    let productsData: { products: Product[], total: number } = { products: [], total: 0 };

    try {
        const store = await getStoreConfig(slug);
        productsData = await getProducts(
            store.id,
            typeof categoryId === 'string' ? categoryId : undefined
        );
    } catch (error) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-8">
                <h1 className="text-3xl font-bold">
                    {categoryId ? 'Filtered Products' : 'All Products'}
                </h1>
                <span className="text-sm text-gray-500">{productsData.total} items</span>
            </div>

            <ProductGrid products={productsData.products} storeSlug={slug} />
        </div>
    );
}
