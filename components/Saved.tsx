import React from 'react';
import { SavedItem } from '../types';

interface SavedProps {
    items: SavedItem[];
    onBack: () => void;
    onRemove: (id: string) => void;
}

export const Saved: React.FC<SavedProps> = ({ items, onBack, onRemove }) => {
  return (
    <div className="relative flex h-full w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden">
        {/* Decorative background elements matching the theme */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#e65000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0"></div>

      <header className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
        <button 
            onClick={onBack}
            className="flex items-center justify-center size-10 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Saved Items</h1>
        <button className="flex items-center justify-center size-10 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">sort</span>
        </button>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-6 pt-4 pb-24 no-scrollbar">
        {/* Search Bar */}
        <div className="sticky top-0 z-20 pb-4 bg-background-light dark:bg-background-dark">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </span>
            <input 
                className="w-full py-3.5 pl-11 pr-4 bg-surface-light dark:bg-surface-dark border-none rounded-xl shadow-sm text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 outline-none transition-shadow" 
                placeholder="Search saved dishes..." 
                type="text" 
            />
          </div>
        </div>

        {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <span className="material-symbols-outlined text-4xl mb-2">bookmark_border</span>
                <p>No saved dishes yet.</p>
            </div>
        )}

        <div className="flex flex-col gap-4">
            {items.map(item => (
                <article key={item.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-5 shadow-card border border-gray-100 dark:border-gray-800/60 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 z-10">
                        <button 
                            onClick={() => onRemove(item.id)}
                            className="flex items-center justify-center text-primary hover:scale-110 transition-transform p-1" 
                            title="Unsave"
                        >
                            <span className="material-symbols-filled">bookmark</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-1 mb-3 pr-8">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                        <p className="text-sm font-medium text-primary italic">{item.originalName}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {item.tags.join(" • ")}
                        </span>
                        <div className="text-[10px] text-gray-400">
                            Saved {item.savedAt.toLocaleDateString()}
                        </div>
                    </div>
                </article>
            ))}
        </div>
      </main>

      <div className="relative z-10 w-full px-6 pb-6 pt-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent pointer-events-none">
        <div className="w-full flex justify-center">
        </div>
      </div>
    </div>
  );
};