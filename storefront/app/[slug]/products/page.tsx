import { getStoreConfig, getProducts } from '@/lib/api';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { notFound } from 'next/navigation';

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

    try {
        const store = await getStoreConfig(slug);
        const { products } = await getProducts(store.id, undefined, undefined);
        // Note: In a real app we would pass categoryId/search to getProducts. 
        // My simple getProducts implementation supports categoryId but I need to make sure I pass it.
        // Let's refactor getProducts usage slightly below or leave as is if the API supports it.
        // The current api.ts getProducts supports categoryId.

        // FETCHING WITH FILTERS
        const productsData = await getProducts(
            store.id,
            typeof categoryId === 'string' ? categoryId : undefined
        );

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
    } catch (error) {
        notFound();
    }
}
