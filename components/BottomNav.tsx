
import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const getIconClass = (screen: Screen) => {
    return currentScreen === screen
      ? "text-primary dark:text-white"
      : "text-[#8d6e5e] dark:text-gray-400 group-hover:text-primary transition-colors";
  };

  const getTextClass = (screen: Screen) => {
    return currentScreen === screen
      ? "text-primary dark:text-white"
      : "text-[#8d6e5e] dark:text-gray-400 group-hover:text-primary transition-colors";
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 flex border-t border-[#f5f1f0] dark:border-white/10 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-lg px-4 pb-2 pt-2 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
      <button
        onClick={() => onNavigate('home')}
        className="flex flex-1 flex-col items-center justify-end gap-1 rounded-lg py-2 transition-colors group relative"
      >
        {currentScreen === 'home' && <div className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"></div>}
        <span className={`material-symbols-outlined text-[26px] ${getIconClass('home')}`}>home</span>
        <p className={`text-[10px] font-bold leading-normal tracking-[0.015em] ${getTextClass('home')}`}>Home</p>
      </button>

      <button
        onClick={() => onNavigate('results')}
        className="flex flex-1 flex-col items-center justify-end gap-1 rounded-lg py-2 transition-colors group relative"
      >
        {currentScreen === 'results' && <div className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"></div>}
        <span className={`material-symbols-outlined text-[26px] ${getIconClass('results')}`}>restaurant_menu</span>
        <p className={`text-[10px] font-bold leading-normal tracking-[0.015em] ${getTextClass('results')}`}>Results</p>
      </button>

      <button
        onClick={() => onNavigate('history')}
        className="flex flex-1 flex-col items-center justify-end gap-1 rounded-lg py-2 transition-colors group relative"
      >
        {currentScreen === 'history' && <div className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"></div>}
        <span className={`material-symbols-outlined text-[26px] ${getIconClass('history')}`}>history</span>
        <p className={`text-[10px] font-bold leading-normal tracking-[0.015em] ${getTextClass('history')}`}>History</p>
      </button>

      <button
        onClick={() => onNavigate('profile')}
        className="flex flex-1 flex-col items-center justify-end gap-1 rounded-lg py-2 transition-colors group relative"
      >
        {currentScreen === 'profile' && <div className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"></div>}
        <span className={`material-symbols-outlined text-[26px] ${getIconClass('profile')}`}>person</span>
        <p className={`text-[10px] font-bold leading-normal tracking-[0.015em] ${getTextClass('profile')}`}>Profile</p>
      </button>
    </nav>
  );
};
