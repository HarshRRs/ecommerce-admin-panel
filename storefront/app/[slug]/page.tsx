import { getStoreConfig, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { notFound } from 'next/navigation';

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        const store = await getStoreConfig(slug);
        const { products } = await getProducts(store.id, undefined, true); // Fetch featured products first

        return (
            <div className="space-y-12 pb-12">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-neutral-900">
                    <div className="absolute inset-0 z-0">
                        {/* Placeholder for Banner Image */}
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-10" />
                    </div>

                    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            {store.name}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Discover our collection of premium products.
                            Quality you can trust, designs you will love.
                        </p>
                        <button className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:scale-105 transition-transform">
                            Shop Collection
                        </button>
                    </div>
                </section>

                {/* Featured Products */}
                <section className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
                        <a href={`/${slug}/products`} className="text-sm font-medium hover:underline">View All</a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product.id} product={product} storeSlug={slug} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No products found.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        );
    } catch (error) {
        notFound();
    }
}
