'use client';

import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { StoreConfig } from '@/lib/types';
import { useState } from 'react';

interface HeaderProps {
    store: StoreConfig;
}

export function Header({ store }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-black/80 dark:border-neutral-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo / Brand */}
                <Link href={`/${store.slug}`} className="flex items-center gap-2">
                    {store.logo ? (
                        <img src={store.logo} alt={store.name} className="h-8 w-auto object-contain" />
                    ) : (
                        <span className="text-xl font-bold tracking-tight">{store.name}</span>
                    )}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href={`/${store.slug}/products`} className="text-sm font-medium hover:text-blue-600 transition-colors">
                        All Products
                    </Link>
                    <Link href={`/${store.slug}/categories`} className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Categories
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 hover:bg-gray-100 rounded-full dark:hover:bg-neutral-800 transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute top-0 right-0 h-4 w-4 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                            0
                        </span>
                    </button>

                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-full dark:hover:bg-neutral-800"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 bg-white dark:bg-black">
                    <nav className="flex flex-col gap-4">
                        <Link
                            href={`/${store.slug}/products`}
                            className="text-sm font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            All Products
                        </Link>
                        <Link
                            href={`/${store.slug}/categories`}
                            className="text-sm font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Categories
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
