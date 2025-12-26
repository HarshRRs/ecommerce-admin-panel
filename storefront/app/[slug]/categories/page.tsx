import { getStoreConfig, getCategories } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let store;
    let categories = [];

    try {
        store = await getStoreConfig(slug);
        categories = await getCategories(store.id);
    } catch (error) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Categories</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/${slug}/products?categoryId=${category.id}`}
                        className="group flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-neutral-900 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <div className="w-16 h-16 mb-4 bg-gray-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                            {category.name.charAt(0)}
                        </div>
                        <span className="font-medium text-center group-hover:text-blue-600 transition-colors">
                            {category.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
