
import React, { useState } from 'react';
import { Dish, SavedItem } from '../types';

interface HistoryProps {
    historyItems: Dish[];
    savedItems: SavedItem[];
    activeTab: 'scans' | 'saved';
    onTabChange: (tab: 'scans' | 'saved') => void;
    onBack: () => void;
    onToggleSave: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ historyItems, savedItems, activeTab, onTabChange, onBack, onToggleSave }) => {
    const [expandedDish, setExpandedDish] = useState<Dish | null>(null);
    const displayItems = activeTab === 'scans' ? historyItems : savedItems;

    // Helper to render spice level (reused logic for consistency)
    const renderSpiceLevel = (level: string) => {
        if (level === 'None' || !level) {
            return <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">Not Spicy</span>;
        }

        let count = 0;
        if (level === 'Mild') count = 1;
        if (level === 'Medium') count = 2;
        if (level === 'Hot') count = 3;

        return (
            <div className="flex items-center gap-0.5" aria-label={`Spice level: ${level}`}>
                {[...Array(count)].map((_, i) => (
                    <span key={i} className="text-[16px] leading-none">🌶️</span>
                ))}
            </div>
        );
    };

    return (
        <div className="relative flex h-full w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#e65000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <header className="relative z-10 flex flex-col w-full bg-white/80 dark:bg-surface-dark/90 backdrop-blur-md shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Activity</h1>
                    <div className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800">
                        <span className="material-symbols-outlined text-gray-500 text-sm">history</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pb-0 gap-8 border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => onTabChange('scans')}
                        className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'scans'
                                ? 'text-primary'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        History Scan
                        {activeTab === 'scans' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => onTabChange('saved')}
                        className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'saved'
                                ? 'text-primary'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        Saved
                        {activeTab === 'saved' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                        )}
                    </button>
                </div>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto px-4 pt-4 pb-24 no-scrollbar">
                {displayItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">
                            {activeTab === 'scans' ? 'history_toggle_off' : 'bookmark_border'}
                        </span>
                        <p className="text-gray-500">
                            {activeTab === 'scans' ? 'No recent scans.' : 'No saved dishes yet.'}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {displayItems.map((item) => {
                        // Check if item is saved to show correct heart status
                        const isSaved = savedItems.some(s => s.id === item.id);

                        return (
                            <article
                                key={item.id}
                                onClick={() => setExpandedDish(item)}
                                className="flex gap-4 p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800/60 relative overflow-hidden group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                {/* Image Thumb */}
                                <div className="w-20 h-20 rounded-lg bg-gray-200 shrink-0 overflow-hidden relative">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url('${item.image || 'https://via.placeholder.com/150'}')` }}
                                    ></div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">{item.name}</h3>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleSave(item.id); }}
                                                className={`flex items-center justify-center p-1 -mt-1 -mr-1 transition-colors ${isSaved ? 'text-primary' : 'text-gray-300 hover:text-gray-500'}`}
                                            >
                                                <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'material-symbols-filled' : ''}`}>favorite</span>
                                            </button>
                                        </div>
                                        <p className="text-xs font-medium text-primary line-clamp-1">{item.originalName}</p>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center gap-2 mt-2">
                                        {item.spiceLevel && item.spiceLevel !== 'None' && (
                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                <span>🌶️</span> {item.spiceLevel}
                                            </span>
                                        )}
                                        {item.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </main>

            {/* Expanded Dish Modal */}
            {expandedDish && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setExpandedDish(null)}
                >
                    <div
                        className="relative w-full max-w-[340px] bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setExpandedDish(null)}
                            className="absolute top-3 right-3 z-20 flex items-center justify-center size-8 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>

                        {/* Image */}
                        <div className="relative h-56 w-full bg-gray-200">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${expandedDish.image || 'https://via.placeholder.com/400'}')` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#181310] dark:text-white leading-tight">{expandedDish.name}</h3>
                                    <p className="text-sm font-medium text-primary italic mt-0.5">{expandedDish.originalName}</p>
                                </div>
                                <div className="pt-1 shrink-0">
                                    {renderSpiceLevel(expandedDish.spiceLevel)}
                                </div>
                            </div>

                            {/* Info Rows: Flavors & Allergens */}
                            <div className="flex flex-col gap-3">
                                {/* Flavors */}
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 flex items-center justify-center size-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0">
                                        <span className="material-symbols-outlined text-[14px]">palette</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {expandedDish.tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 text-xs font-bold text-orange-700 dark:text-orange-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Allergens */}
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 flex items-center justify-center size-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">
                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {expandedDish.allergens && expandedDish.allergens.length > 0 ? (
                                            expandedDish.allergens.slice(0, 5).map((allergen, idx) => (
                                                <span key={idx} className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">
                                                    {allergen}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic py-0.5">No major allergens detected</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800/50">
                                <p className="text-sm leading-relaxed text-[#6b5850] dark:text-[#a89f9b]">
                                    {expandedDish.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
