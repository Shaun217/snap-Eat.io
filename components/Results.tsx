
import React from 'react';
import { Dish } from '../types';

interface ResultsProps {
  uploadedImage: string | null;
  results: Dish[];
  savedIds: string[];
  onBack: () => void;
  onSave: (id: string) => void;
}

export const Results: React.FC<ResultsProps> = ({ uploadedImage, results, savedIds, onBack, onSave }) => {
  
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
        
        {/* Background Image with Blur */}
        <div className="absolute inset-0 z-0">
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                    backgroundImage: `url('${uploadedImage || "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop"}')`,
                }}
            />
            <div className="absolute inset-0 backdrop-blur-3xl bg-white/80 dark:bg-black/80"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/90 dark:from-black/40 dark:to-black/90"></div>
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
            return (
            <article key={dish.id} className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1a1a1a] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-all ring-1 ring-gray-900/5 dark:ring-white/10">
            
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                    style={{ backgroundImage: `url('${dish.image || uploadedImage}')` }}
                ></div>
                <div className="absolute right-3 top-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSave(dish.id); }}
                        className={`flex size-10 items-center justify-center rounded-full backdrop-blur-sm transition-colors active:scale-90 shadow-sm ${isSaved ? 'bg-primary text-white' : 'bg-white/80 dark:bg-black/50 text-gray-400 hover:text-primary'}`}
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
                            {dish.tags.slice(0, 3).map((tag, idx) => (
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
                                dish.allergens.slice(0, 5).map((allergen, idx) => (
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
