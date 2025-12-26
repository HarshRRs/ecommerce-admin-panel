import { StoreConfig } from '@/lib/types';

interface FooterProps {
    store: StoreConfig;
}

export function Footer({ store }: FooterProps) {
    return (
        <footer className="border-t py-12 bg-gray-50 dark:bg-neutral-900 dark:border-neutral-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4">{store.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Premium quality products sourced directly to you.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Shop</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-black dark:hover:text-white">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-black dark:hover:text-white">Best Sellers</a></li>
                            <li><a href="#" className="hover:text-black dark:hover:text-white">All Products</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-black dark:hover:text-white">FAQ</a></li>
                            <li><a href="#" className="hover:text-black dark:hover:text-white">Shipping</a></li>
                            <li><a href="#" className="hover:text-black dark:hover:text-white">Returns</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Newsletter</h4>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-3 py-2 text-sm border rounded-md dark:bg-neutral-800 dark:border-neutral-700"
                            />
                            <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t dark:border-neutral-800 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} {store.name}. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
