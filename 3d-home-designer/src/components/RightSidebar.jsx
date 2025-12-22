import React from 'react';

export default function RightSidebar({ isOpen }) {
    const categories = [
        'Paints',
        'Furniture',
        'Appliances',
        'Accessories',
        'Decoration',
        'Surfaces',
    ];

    if (!isOpen) return null;

    return (
        <div className="w-[220px] min-w-[220px] bg-[#2a2a2a] flex flex-col h-full border-l border-white/10">
            {/* Header */}
            <div className="p-6 pt-8">
                <h2 className="text-2xl font-normal text-white underline underline-offset-8 decoration-white/40">
                    Products
                </h2>
            </div>

            {/* Search */}
            <div className="px-6 mb-6">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-transparent border border-white/30 rounded-lg px-4 py-3 text-base text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
                />
            </div>

            {/* Categories */}
            <div className="px-6 flex flex-col gap-1">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className="text-left text-lg text-white/80 hover:text-white py-3 px-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
