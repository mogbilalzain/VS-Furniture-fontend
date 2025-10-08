'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FavoriteButton from '../../components/FavoriteButton';
import { useFavorites } from '../../lib/contexts/favorites-context';
import {
    getRecentFavorites,
    searchFavorites,
    getFavoritesByCategory,
    exportFavorites
} from '../../lib/utils/favorites-utils';

export default function FavoritesPage() {
    const {
        favorites,
        count,
        loading,
        initialized,
        clearAllFavorites
    } = useFavorites();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'category'

    // Get filtered and sorted favorites
    const getFilteredFavorites = () => {
        let filtered = favorites;

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = searchFavorites(searchQuery);
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(fav => fav.category === selectedCategory);
        }

        // Sort favorites
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'recent':
                default:
                    return new Date(b.addedAt) - new Date(a.addedAt);
            }
        });

        return filtered;
    };

    const filteredFavorites = getFilteredFavorites();
    const categorizedFavorites = getFavoritesByCategory();
    const categories = Object.keys(categorizedFavorites);

    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
            await clearAllFavorites();
        }
    };

    const handleExport = () => {
        try {
            const data = exportFavorites();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `vs-favorites-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const handleShare = () => {
        try {
            const shareData = {
                title: 'My VS Favorites',
                text: `Check out my favorite products! I have ${count} items in my list.`,
                url: window.location.origin + '/favorites'
            };

            if (navigator.share) {
                navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard');
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    if (!initialized) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                                        <div className="h-48 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <section className="text-center text-white py-20" style={{ backgroundColor: '#3d3d3d' }}>
                <h1 className="text-3xl font-semibold mb-4" style={{ color: '#f5f5f5' }}>Wishlist</h1>
                <p className="max-w-3xl mx-auto text-lg text-white mb-8 px-4" style={{ color: '#f5f5f5' }}>
                    Building your ideal learning space? Save products here by clicking
                    'Add to My List' or the star icon on any product page. Then, share
                    your list via email or send it to our team for more information.
                </p>

                {/* <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 ">
                    Send to VS Team
                </button> */}

                <div className="mt-6 flex justify-center items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                    <span>✉</span>
                    <span>Share by email</span>
                </div>
            </section>
            <main className="min-h-screen bg-gray-50 py-8">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
                        <p className="text-gray-600">
                            {count > 0 ? `You have ${count} favorite ${count === 1 ? 'product' : 'products'}` : 'No favorites yet'}
                        </p>
                    </div>

                    {count > 0 ? (
                        <>
                            {/* Controls */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                                    {/* Search */}
                                    <div className="flex-1 max-w-md">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search favorites..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Filters and Actions */}
                                    <div className="flex items-center gap-4">

                                        {/* Category Filter */}
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category} ({categorizedFavorites[category].length})
                                                </option>
                                            ))}
                                        </select>

                                        {/* Sort */}
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="recent">Most Recent</option>
                                            <option value="name">Name A-Z</option>
                                            <option value="category">Category</option>
                                        </select>

                                        {/* View Mode */}
                                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-yellow-400  text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-yellow-400  text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500  transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                        </svg>
                                        Share
                                    </button>

                                    {/* <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export
                                    </button> */}

                                    <button
                                        onClick={handleClearAll}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        style={{ color: '#f5f5f5' }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" style={{ color: '#f5f5f5' }} />
                                        </svg>
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* Results */}
                            {filteredFavorites.length > 0 ? (
                                <div className={viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'space-y-4'
                                }>
                                    {filteredFavorites.map((favorite) => (
                                        <div
                                            key={favorite.id}
                                            className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex items-center p-4' : 'overflow-hidden'
                                                }`}
                                        >
                                            {viewMode === 'grid' ? (
                                                // Grid View
                                                <>
                                                    <div className="relative h-48 bg-gray-100">
                                                        <Image
                                                            src={favorite.image || '/images/placeholder-product.jpg'}
                                                            alt={favorite.name}
                                                            fill
                                                            className="object-cover"
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder-product.jpg';
                                                            }}
                                                        />
                                                        <div className="absolute top-2 right-2">
                                                            <FavoriteButton
                                                                product={favorite.productData}
                                                                size="sm"
                                                                variant="icon"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                            {favorite.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-3">{favorite.category}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">
                                                                Added {new Date(favorite.addedAt).toLocaleDateString()}
                                                            </span>
                                                            <Link
                                                                href={`/products/${favorite.id}`}
                                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                            >
                                                                View →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                // List View
                                                <>
                                                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={favorite.image || '/images/placeholder-product.jpg'}
                                                            alt={favorite.name}
                                                            fill
                                                            className="object-cover"
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder-product.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 ml-4">
                                                        <h3 className="font-semibold text-gray-900 mb-1">{favorite.name}</h3>
                                                        <p className="text-sm text-gray-600 mb-2">{favorite.category}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Added {new Date(favorite.addedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/products/${favorite.id}`}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                        <FavoriteButton
                                                            product={favorite.productData}
                                                            size="sm"
                                                            variant="icon"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // No Results
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites found</h3>
                                    <p className="text-gray-600 mb-6">
                                        {searchQuery || selectedCategory !== 'all'
                                            ? 'Try adjusting your search or filters.'
                                            : 'Start adding products to your favorites to see them here.'
                                        }
                                    </p>
                                    {(searchQuery || selectedCategory !== 'all') && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedCategory('all');
                                            }}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        // Empty State
                        <div className="text-center py-16">
                            <svg className="mx-auto h-24 w-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <h3 className="text-2xl font-medium text-gray-900 mb-4">No favorites yet</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Start exploring our products and add your favorites by clicking the star icon.
                                Your favorite products will appear here for easy access.
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Browse Products
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
