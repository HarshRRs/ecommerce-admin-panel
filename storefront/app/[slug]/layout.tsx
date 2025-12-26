import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { getStoreConfig } from '@/lib/api';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const store = await getStoreConfig(slug);
        return {
            title: store.name,
            description: `Shop online at ${store.name}`,
        };
    } catch (error) {
        return {
            title: 'Store Not Found',
        };
    }
}

export default async function ShopLayout({ children, params }: Props) {
    const { slug } = await params;
    let store;

    try {
        store = await getStoreConfig(slug);
    } catch (error) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white">
            <Header store={store} />
            <main className="flex-grow">
                {children}
            </main>
            <Footer store={store} />
        </div>
    );
}
