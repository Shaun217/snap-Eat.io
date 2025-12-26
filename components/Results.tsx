
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
  // State to track which cards are showing the "Menu Location" instead of the "Food Image"
  const [viewModeState, setViewModeState] = useState<Record<string, 'food' | 'menu'>>({});

  const toggleViewMode = (id: string) => {
    setViewModeState(prev => ({
        ...prev,
        [id]: prev[id] === 'menu' ? 'food' : 'menu'
    }));
  };

  // Helper to render spice level
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
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
        
        {/* Background Image with Blur (Subtle global ambience) */}
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-40 pointer-events-none">
            <div 
                className="absolute inset-0 bg-cover bg-center blur-3xl"
                style={{ 
                    backgroundImage: `url('${uploadedImage || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop"}')`,
                }}
            />
        </div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md p-4 shadow-sm transition-colors border-b border-gray-200/20">
        <button 
            onClick={onBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-[#181310] dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-[#181310] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Found {results.length} Item{results.length !== 1 ? 's' : ''}
        </h2>
        <div className="size-10"></div> {/* Spacer for alignment */}
      </header>

      {/* Main Content Feed */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 flex flex-col gap-6 no-scrollbar pb-24">
        {results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <span className="material-symbols-outlined text-6xl mb-4">no_food</span>
                <p>No dishes identified.</p>
            </div>
        )}

        {results.map((dish) => {
            const isSaved = savedIds.includes(dish.id);
            const bbox = dish.boundingBox;
            const isMenu = dish.isMenu;
            
            // Determine which image to show
            // Default for Menu: 'food' (Generated). Default for Photo: 'food' (which is Uploaded).
            // Toggle state overrides.
            const currentMode = viewModeState[dish.id] || 'food';
            
            // If mode is 'menu', show uploaded image (to see bbox). 
            // If mode is 'food', show dish.image (which is generated for menus, or uploaded for photos).
            // Note: For non-menu photos, dish.image IS uploadedImage, so flipping modes doesn't change image source, only the bbox visibility ideally.
            // But we simplify: 
            //  - Menu Item: 'food' = Generated Image (No BBox). 'menu' = Uploaded Image (With BBox).
            //  - Photo Item: 'food' = Uploaded Image (With BBox). 
            
            let displayImage = dish.image;
            let showBBox = false;

            if (isMenu) {
                if (currentMode === 'menu') {
                    displayImage = uploadedImage || dish.image;
                    showBBox = true;
                } else {
                    displayImage = dish.image; // Generated
                    showBBox = false;
                }
            } else {
                // Not a menu (it's a food photo)
                displayImage = uploadedImage || dish.image;
                showBBox = true; // Always show bbox for food photos
            }
            
            return (
            <article key={dish.id} className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1a1a1a] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-all ring-1 ring-gray-900/5 dark:ring-white/10">
            
            {/* Image Section */}
            <div className="relative w-full bg-black/5 dark:bg-black/50 overflow-hidden">
                <img 
                    src={displayImage} 
                    alt={dish.name}
                    className="w-full h-auto object-contain max-h-[500px] block mx-auto transition-opacity duration-300"
                />
                
                {/* Bounding Box Overlay */}
                {showBBox && bbox && bbox.length === 4 && (
                    <div 
                        className="absolute z-10 pointer-events-none"
                        style={{
                            top: `${bbox[0] / 10}%`,
                            left: `${bbox[1] / 10}%`,
                            height: `${(bbox[2] - bbox[0]) / 10}%`,
                            width: `${(bbox[3] - bbox[1]) / 10}%`,
                        }}
                    >
                         {/* The Visual Frame */}
                         <div className="relative w-full h-full animate-[pulse_2s_infinite]">
                            {/* Inner semi-transparent fill */}
                            <div className="absolute inset-0 bg-white/10 dark:bg-gray-500/10 mix-blend-overlay"></div>
                            
                            {/* Four Corners - Using Borders */}
                            {/* Top Left */}
                            <div className="absolute top-0 left-0 w-[20%] h-[20%] border-t-[3px] border-l-[3px] border-primary drop-shadow-md rounded-tl-sm"></div>
                            {/* Top Right */}
                            <div className="absolute top-0 right-0 w-[20%] h-[20%] border-t-[3px] border-r-[3px] border-primary drop-shadow-md rounded-tr-sm"></div>
                            {/* Bottom Left */}
                            <div className="absolute bottom-0 left-0 w-[20%] h-[20%] border-b-[3px] border-l-[3px] border-primary drop-shadow-md rounded-bl-sm"></div>
                            {/* Bottom Right */}
                            <div className="absolute bottom-0 right-0 w-[20%] h-[20%] border-b-[3px] border-r-[3px] border-primary drop-shadow-md rounded-br-sm"></div>
                         </div>
                    </div>
                )}

                {/* Menu Toggle Button (Only for Menus) */}
                {isMenu && (
                    <div className="absolute bottom-3 right-3 z-20">
                        <button
                            onClick={() => toggleViewMode(dish.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all text-xs font-bold border border-white/10 shadow-lg"
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                {currentMode === 'menu' ? 'image' : 'location_on'}
                            </span>
                            {currentMode === 'menu' ? 'Show Food' : 'Locate on Menu'}
                        </button>
                    </div>
                )}

                {/* Favorite Button (floating over image) */}
                <div className="absolute right-3 top-3 z-20">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSave(dish.id); }}
                        className={`flex size-10 items-center justify-center rounded-full backdrop-blur-md transition-colors active:scale-90 shadow-sm border border-white/20 ${isSaved ? 'bg-primary text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'material-symbols-filled' : ''}`}>favorite</span>
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-4 p-5">
                
                {/* Header Row: Title & Spice */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#181310] dark:text-white leading-tight">{dish.name}</h3>
                        <p className="text-sm font-medium text-primary italic mt-0.5">{dish.originalName}</p>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                        {renderSpiceLevel(dish.spiceLevel)}
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

                {/* Description */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/50">
                    <p className="text-sm leading-relaxed text-[#6b5850] dark:text-[#a89f9b]">
                        {dish.description}
                    </p>
                </div>

            </div>
            </article>
            )
        })}
        
        {/* Spacer for scroll */}
        <div className="h-4"></div>
      </main>
    </div>
  );
};
