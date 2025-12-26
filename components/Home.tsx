
import React, { useRef, useState } from 'react';
import { Language, ScanType } from '../types';
import { LANGUAGES } from '../constants';

interface HomeProps {
  onImageSelect: (file: File, type: ScanType) => void;
  targetLanguage: Language;
  setTargetLanguage: (lang: Language) => void;
}

export const Home: React.FC<HomeProps> = ({ 
    onImageSelect, 
    targetLanguage, 
    setTargetLanguage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanType, setScanType] = useState<ScanType>('dish');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0], scanType);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-background-light dark:bg-background-dark pb-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#e65000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      {/* Abstract Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-primary/5 rounded-full blur-3xl z-0"></div>

      {/* Header */}
      <header className="relative z-10 flex w-full items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-white shadow-lg">
            <span className="material-symbols-outlined text-[24px]">restaurant</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Snap <span className="text-primary">&</span> Eat
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full">
        <div className="text-center mb-6 animate-fade-in-up">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight leading-tight">
            {scanType === 'menu' ? 'Scan a Menu' : 'Scan a Dish'}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-[280px] mx-auto leading-relaxed">
            {scanType === 'menu' 
                ? 'Translate entire menus instantly.' 
                : 'Identify ingredients and nutrition.'}
          </p>
        </div>

        {/* Scan Type Toggle */}
        <div className="flex p-1.5 bg-gray-200/50 dark:bg-surface-dark border border-white/50 dark:border-white/5 rounded-full mb-8 backdrop-blur-md relative shadow-inner w-[200px]">
             <button 
                onClick={() => setScanType('dish')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${scanType === 'dish' ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
             >
                <span className="material-symbols-outlined text-[18px]">lunch_dining</span>
                Dish
             </button>
             <button 
                onClick={() => setScanType('menu')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${scanType === 'menu' ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
             >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                Menu
             </button>
        </div>

        {/* Language Selector */}
        <div className="mb-8 w-full max-w-[280px]">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
                Translate results to
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="material-symbols-outlined text-primary">translate</span>
                </div>
                <select 
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value as Language)}
                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark py-3 pl-10 pr-8 text-sm font-bold text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary cursor-pointer appearance-none bg-none"
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400">expand_more</span>
                </div>
            </div>
        </div>

        {/* Camera Button */}
        <div className="relative group cursor-pointer mb-8" onClick={triggerCamera}>
          <div className="absolute inset-0 rounded-full border border-primary/20 scale-125 group-hover:scale-150 transition-transform duration-700 ease-out animate-pulse-slow"></div>
          <div className="absolute inset-0 rounded-full border border-primary/10 scale-150 group-hover:scale-175 transition-transform duration-1000 ease-out delay-75"></div>
          
          <button className="relative flex items-center justify-center size-32 rounded-full bg-surface-light dark:bg-surface-dark border-4 border-white dark:border-gray-800 shadow-glow hover:shadow-primary/40 transition-all duration-300 active:scale-95 z-20">
            <div className="flex items-center justify-center size-24 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-inner-glow text-white">
              <span className="material-symbols-outlined text-[48px] drop-shadow-md">photo_camera</span>
            </div>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </div>

        <div className="flex flex-col items-center gap-4 mt-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider bg-primary/10 px-4 py-1.5 rounded-full">
            Tap to start
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            AI-Powered {scanType === 'menu' ? 'Menu' : 'Food'} Analysis
          </p>
        </div>
      </main>
    </div>
  );
};