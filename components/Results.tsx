
import React, { useState } from 'react';
import { Dish } from '../types';

interface ResultsProps {
    uploadedImage: string | null;
    results: Dish[];
    savedIds: string[];
    onBack: () => void;
    onSave: (id: string) => void;
}

export const Results: React.FC<ResultsProps> = ({ uploadedImage, results, savedIds, onBack, onSave }) => {
    const isMenuScan = results.length > 0 && results[0].isMenu;

    // Rule: If we have multiple results, use List View. If single result, use Expanded Card (Feed/Detail) View.
    const isListView = results.length > 1;

    // State for Detail Modal
    const [selectedItem, setSelectedItem] = useState<Dish | null>(null);
    // State for Detail Modal Toggle (Only relevant for Menu Mode)
    const [modalViewMode, setModalViewMode] = useState<'food' | 'scan'>('food');

    // --- Helpers ---

    const renderSpiceLevel = (level: string) => {
        if (level === 'None' || !level) return null;
        let count = 0;
        if (level === 'Mild') count = 1;
        if (level === 'Medium') count = 2;
        if (level === 'Hot') count = 3;

        return (
            <div className="flex items-center gap-0.5" aria-label={`Spice level: ${level}`}>
                {[...Array(count)].map((_, i) => (
                    <span key={i} className="text-[14px] leading-none">🌶️</span>
                ))}
            </div>
        );
    };

    const renderAllergenIcons = (allergens: string[]) => {
        if (!allergens || allergens.length === 0) return null;
        return (
            <div className="flex items-center gap-1">
                {allergens.slice(0, 3).map((a, i) => (
                    <div key={i} className="size-4 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center text-[10px] font-bold" title={a}>
                        {a.charAt(0)}
                    </div>
                ))}
                {allergens.length > 3 && (
                    <span className="text-[10px] text-gray-400">+</span>
                )}
            </div>
        );
    };

    const getThumbnailStyle = (dish: Dish): React.CSSProperties => {
        // For Menu Scan: Image is a Bing URL (Square crop usually). Just cover.
        if (dish.isMenu) return { objectFit: 'cover' };

        // For Dish Scan: Image is the full Uploaded Image. We need to focus on the bbox.
        if (dish.boundingBox) {
            const [ymin, xmin, ymax, xmax] = dish.boundingBox;
            const cx = (xmin + xmax) / 2 / 10;
            const cy = (ymin + ymax) / 2 / 10;
            return {
                objectFit: 'cover',
                objectPosition: `${cx}% ${cy}%`,
                transform: 'scale(1.2)' // Slight zoom to fill frame better
            };
        }
        return { objectFit: 'cover' };
    };

    // Helper for Smart Zoom on Menu
    const getSmartZoomStyle = (dish: Dish): React.CSSProperties => {
        if (!dish.boundingBox) return {};

        const [ymin, xmin, ymax, xmax] = dish.boundingBox;
        // Calculate center percentage (0-100%)
        const cx = (xmin + xmax) / 2 / 10;
        const cy = (ymin + ymax) / 2 / 10;

        return {
            transformOrigin: `${cx}% ${cy}%`,
            transform: 'scale(2.0)', // 2x Zoom to read text clearly
        };
    };

    // --- Sub-Components ---

    // 1. Unified List Layout
    const ListLayout = () => (
        <div className="flex flex-col gap-3 pb-24">
            {results.map((dish) => {
                const isSaved = savedIds.includes(dish.id);
                return (
                    <div
                        key={dish.id}
                        onClick={() => {
                            setSelectedItem(dish);
                            // Default View Mode: 
                            // Menu -> 'food' (Bing Image)
                            // Dish -> 'scan' (Uploaded Image) because that IS the food image for Dish mode.
                            setModalViewMode(dish.isMenu ? 'food' : 'scan');
                        }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-transform cursor-pointer group"
                    >
                        {/* Thumbnail */}
                        <div className="size-20 shrink-0 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-100 dark:border-white/5">
                            <img
                                src={dish.image}
                                alt={dish.name}
                                className="size-full transition-transform duration-700"
                                style={getThumbnailStyle(dish)}
                                loading="lazy"
                            />
                            {dish.spiceLevel && dish.spiceLevel !== 'None' && (
                                <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-md px-1 py-0.5 text-[10px] shadow-sm">
                                    {renderSpiceLevel(dish.spiceLevel)}
                                </div>
                            )}
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate leading-tight group-hover:text-primary transition-colors">
                                {dish.name}
                            </h3>
                            <p className="text-sm font-medium text-primary truncate">
                                {dish.originalName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                {renderAllergenIcons(dish.allergens)}
                                <p className="text-xs text-gray-400 truncate flex-1 capitalize">
                                    {dish.category}
                                </p>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onSave(dish.id); }}
                                className={`size-8 flex items-center justify-center rounded-full transition-colors ${isSaved ? 'text-primary' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'material-symbols-filled' : ''}`}>favorite</span>
                            </button>
                            <span className="material-symbols-outlined text-gray-300 text-[20px]">chevron_right</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // 2. Single Item Layout (Big Card)
    const SingleItemLayout = () => {
        const dish = results[0];
        const isSaved = savedIds.includes(dish.id);
        const bbox = dish.boundingBox;
        const displayImage = (dish.isMenu) ? dish.image : (uploadedImage || dish.image);

        return (
            <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] shadow-card ring-1 ring-gray-900/5 dark:ring-white/10 shrink-0 pb-24">
                <div className="relative w-full bg-black/5 dark:bg-black/50 overflow-hidden min-h-[240px]">
                    <img
                        src={displayImage}
                        alt={dish.name}
                        className="w-full h-auto object-contain max-h-[500px] block mx-auto"
                    />

                    {/* Spotlight for single Dish Scan */}
                    {!dish.isMenu && bbox && (
                        <div
                            className="absolute z-10 pointer-events-none shadow-[0_0_0_9999px_rgba(255,255,255,0.55)] dark:shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                            style={{
                                top: `${bbox[0] / 10}%`,
                                left: `${bbox[1] / 10}%`,
                                height: `${(bbox[2] - bbox[0]) / 10}%`,
                                width: `${(bbox[3] - bbox[1]) / 10}%`,
                            }}
                        >
                            <div className="relative w-full h-full animate-[pulse_2s_infinite]">
                                <div className="absolute inset-0 bg-white/10 dark:bg-gray-500/10 mix-blend-overlay"></div>
                                {/* Corners */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-[3px] border-l-[3px] border-primary rounded-tl-sm"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-[3px] border-r-[3px] border-primary rounded-tr-sm"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[3px] border-l-[3px] border-primary rounded-bl-sm"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[3px] border-r-[3px] border-primary rounded-br-sm"></div>
                            </div>
                        </div>
                    )}

                    <div className="absolute right-3 top-3 z-20">
                        <button
                            onClick={() => onSave(dish.id)}
                            className={`flex size-10 items-center justify-center rounded-full backdrop-blur-md transition-colors active:scale-90 shadow-sm border border-white/20 ${isSaved ? 'bg-primary text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'material-symbols-filled' : ''}`}>favorite</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 p-5">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#181310] dark:text-white leading-tight">{dish.name}</h3>
                            <p className="text-sm font-medium text-primary italic mt-0.5">{dish.originalName}</p>
                        </div>
                        <div className="flex-shrink-0 pt-1">
                            {renderSpiceLevel(dish.spiceLevel)}
                        </div>
                    </div>
                    {/* Details... */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex items-center justify-center size-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0">
                                <span className="material-symbols-outlined text-[14px]">palette</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {dish.tags.map((tag, idx) => (
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
                                {dish.allergens && dish.allergens.length > 0 ? (
                                    dish.allergens.map((allergen, idx) => (
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
                            {dish.description}
                        </p>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">

            {/* Content Wrapper for Blur Effect */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${selectedItem ? 'blur-sm brightness-75 scale-[0.98] pointer-events-none select-none' : ''}`}>

                {/* Background Image with Blur */}
                {results.length > 0 ? (
                    <div className="absolute inset-0 z-0 opacity-20 dark:opacity-40 pointer-events-none">
                        <div
                            className="absolute inset-0 bg-cover bg-center blur-3xl"
                            style={{
                                backgroundImage: `url('${uploadedImage || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop"}')`,
                            }}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#e65000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                )}

                {/* Header */}
                <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md p-4 shadow-sm transition-colors border-b border-gray-200/20">
                    <button
                        onClick={onBack}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-[#181310] dark:text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center">
                        <h2 className="text-[#181310] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                            {isMenuScan ? 'Menu Translation' : 'Dish Analysis'}
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            Found {results.length} Item{results.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="size-10"></div>
                </header>

                {/* Main Content */}
                <main className="relative z-10 flex-1 overflow-y-auto p-4 no-scrollbar">
                    {results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <span className="material-symbols-outlined text-6xl mb-4">no_food</span>
                            <p>No dishes identified.</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        isListView ? <ListLayout /> : <SingleItemLayout />
                    )}
                </main>
            </div>

            {/* Detail Modal (Used for items in ListView) */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setSelectedItem(null)}></div>

                    <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl pointer-events-auto animate-[slideUp_0.3s_ease-out] sm:animate-[scaleIn_0.2s_ease-out] max-h-[90vh] flex flex-col">

                        {/* Header Controls - Enhanced Visibility */}
                        <div className="absolute top-0 left-0 right-0 p-4 pt-5 flex justify-between items-start z-50 pointer-events-none bg-gradient-to-b from-black/60 to-transparent">
                            <div className="pointer-events-auto">
                                {/* Toggle Switch */}
                                {selectedItem.isMenu && (
                                    <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
                                        <button
                                            onClick={() => setModalViewMode('food')}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${modalViewMode === 'food' ? 'bg-white text-black shadow-md' : 'text-white hover:bg-white/10'}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">restaurant</span>
                                            Food
                                        </button>
                                        <button
                                            onClick={() => setModalViewMode('scan')}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${modalViewMode === 'scan' ? 'bg-white text-black shadow-md' : 'text-white hover:bg-white/10'}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">menu_book</span>
                                            Menu
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="pointer-events-auto size-9 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 border border-white/10 shadow-lg active:scale-90 transition-all"
                            >
                                <span className="material-symbols-outlined text-[22px]">close</span>
                            </button>
                        </div>

                        {/* Image Area */}
                        <div className="relative w-full h-72 bg-gray-900 shrink-0 overflow-hidden">
                            {modalViewMode === 'food' ? (
                                <img
                                    src={selectedItem.image}
                                    alt={selectedItem.name}
                                    className="w-full h-full object-cover animate-[fadeIn_0.3s_ease-in]"
                                />
                            ) : (
                                // Scan/Menu Mode with Smart Zoom
                                <div
                                    className="relative w-full h-full transition-transform duration-500 ease-out"
                                    style={getSmartZoomStyle(selectedItem)}
                                >
                                    <img
                                        src={uploadedImage || ''}
                                        alt="Scan Context"
                                        className="w-full h-full object-contain bg-black/50"
                                    />
                                    {/* Spotlight Bounding Box */}
                                    {selectedItem.boundingBox && (
                                        <div
                                            className="absolute z-10 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                                            style={{
                                                top: `${selectedItem.boundingBox[0] / 10}%`,
                                                left: `${selectedItem.boundingBox[1] / 10}%`,
                                                height: `${(selectedItem.boundingBox[2] - selectedItem.boundingBox[0]) / 10}%`,
                                                width: `${(selectedItem.boundingBox[3] - selectedItem.boundingBox[1]) / 10}%`,
                                            }}
                                        >
                                            {/* Box Border */}
                                            <div className="w-full h-full border-2 border-primary shadow-[0_0_15px_rgba(230,80,0,0.5)] animate-pulse"></div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Gradient Overlay for Text Readability at Bottom of Image */}
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1a1a1a]">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                            {selectedItem.name}
                                        </h2>
                                        <p className="text-lg text-primary font-medium italic mt-1">
                                            {selectedItem.originalName}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onSave(selectedItem.id)}
                                        className={`shrink-0 size-10 flex items-center justify-center rounded-full border border-gray-100 dark:border-gray-700 ${savedIds.includes(selectedItem.id) ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    >
                                        <span className={`material-symbols-outlined ${savedIds.includes(selectedItem.id) ? 'material-symbols-filled' : ''}`}>favorite</span>
                                    </button>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {selectedItem.category && (
                                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {selectedItem.category}
                                        </span>
                                    )}
                                    {selectedItem.spiceLevel && selectedItem.spiceLevel !== 'None' && (
                                        <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-xs font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1">
                                            <span>🌶️</span> {selectedItem.spiceLevel}
                                        </span>
                                    )}
                                    {selectedItem.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-bold text-blue-700 dark:text-blue-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Description */}
                                <div className="prose dark:prose-invert">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                        {selectedItem.description}
                                    </p>
                                </div>

                                {/* Allergens Warning */}
                                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                                    <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                        <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
                                            <span className="material-symbols-outlined text-[18px]">warning</span>
                                            <h4 className="text-xs font-bold uppercase tracking-wider">Contains Allergens</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedItem.allergens.map(a => (
                                                <span key={a} className="text-xs font-bold text-red-600 dark:text-red-300 bg-white dark:bg-red-900/20 px-2 py-1 rounded-md shadow-sm">
                                                    {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
        </div>
    );
};
