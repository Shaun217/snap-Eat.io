
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';
import { LANGUAGES, COMMON_ALLERGENS, CHEF_CARD_DATA } from '../constants';

interface ProfileProps {
  defaultLanguage: Language;
  onDefaultLanguageChange: (lang: Language) => void;
  onNavigateHistory: (tab: 'scans' | 'saved') => void;
  scanCount: number;
  savedCount: number;
}

export const Profile: React.FC<ProfileProps> = ({ 
    defaultLanguage, 
    onDefaultLanguageChange, 
    onNavigateHistory,
    scanCount,
    savedCount
}) => {
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200");
  const [location, setLocation] = useState("Locating...");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dietary Restrictions State
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  
  // Chef Card State
  const [chefCardLanguage, setChefCardLanguage] = useState<Language>('English');
  const [showChefCard, setShowChefCard] = useState(false);
  const [translatedNotes, setTranslatedNotes] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Fetch location based on IP
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            if (data.city && data.country_name) {
                let country = data.country_name;
                // Special handling for HK, Macau, Taiwan to show as China
                const specialRegions = ['Hong Kong', 'Taiwan', 'Macau'];
                const specialCodes = ['HK', 'TW', 'MO'];
                
                if (specialRegions.includes(country) || specialCodes.includes(data.country_code)) {
                    country = 'China';
                }
                
                setLocation(`${data.city}, ${country}`);
            } else {
                setLocation("Unknown Location");
            }
        })
        .catch(() => setLocation("Earth, Milky Way"));
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const handleAllergenToggle = (allergen: string) => {
    if (selectedAllergens.includes(allergen)) {
        setSelectedAllergens(prev => prev.filter(a => a !== allergen));
    } else {
        setSelectedAllergens(prev => [...prev, allergen]);
    }
  };

  const handleShowCard = async () => {
    setShowChefCard(true);
    
    // If no notes, clear translated and return
    if (!dietaryNotes.trim()) {
        setTranslatedNotes("");
        return;
    }

    // Translate notes
    setIsTranslating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Translate the following dietary restriction note into ${chefCardLanguage} for a chef to read. Keep it clear, polite and concise. Return ONLY the translated text.\n\nText: "${dietaryNotes}"`,
        });
        setTranslatedNotes(response.text?.trim() || dietaryNotes);
    } catch (error) {
        console.error("Translation failed", error);
        setTranslatedNotes(dietaryNotes); // Fallback to original
    } finally {
        setIsTranslating(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#e65000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-[-20%] right-[-30%] w-96 h-96 bg-primary/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <header className="relative z-10 flex items-center justify-between p-6 shrink-0">
        <button className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors invisible">
          <span className="material-symbols-outlined text-gray-900 dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            My Profile
        </h1>
        <button className="flex items-center justify-center h-10 px-2 rounded-full text-primary font-semibold text-sm hover:text-primary-dark transition-colors">
            Edit
        </button>
      </header>

      <main className="relative z-10 flex-1 w-full overflow-y-auto no-scrollbar pb-24">
        <div className="flex flex-col items-center px-6 mb-8 pt-2">
            {/* Avatar Upload */}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <div className="size-28 rounded-full bg-surface-light dark:bg-surface-dark p-1.5 border-2 border-primary/20 shadow-glow overflow-hidden">
                    <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-4 border-surface-light dark:border-surface-dark shadow-md transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[16px] block">camera_alt</span>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-4 text-center">Guest User</h2>
            <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-gray-400 text-[16px]">location_on</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{location}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-6 w-full max-w-[280px] bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex-1 flex flex-col items-center border-r border-gray-100 dark:border-gray-700">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{scanCount}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Scans</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                    <span className="text-xl font-bold text-primary">{savedCount}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Saved</span>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            
            {/* Dietary Restrictions Section */}
            <div className="px-6">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Dietary Restrictions</h3>
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800/50">
                    
                    {/* Row 1: Allergens Dropdown */}
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                             <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-[18px]">no_food</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Allergens</span>
                        </div>
                        
                        <div className="relative w-full">
                            <select 
                                onChange={(e) => {
                                    if(e.target.value) {
                                        handleAllergenToggle(e.target.value);
                                        e.target.value = ""; // reset
                                    }
                                }}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5"
                            >
                                <option value="">Select an allergen to add...</option>
                                {COMMON_ALLERGENS.map(a => (
                                    <option key={a} value={a} disabled={selectedAllergens.includes(a)}>{a}</option>
                                ))}
                            </select>
                        </div>

                        {selectedAllergens.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {selectedAllergens.map(allergen => (
                                    <span key={allergen} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30">
                                        {allergen}
                                        <button onClick={() => handleAllergenToggle(allergen)} className="ml-1.5 hover:text-red-900 dark:hover:text-white">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Row 2: Dislikes (Click to Edit) */}
                    <button 
                        onClick={() => setShowDietaryModal(true)}
                        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Dislikes & Preferences</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-[16px] group-hover:text-primary transition-colors">edit</span>
                        </div>
                        <p className={`text-sm ${dietaryNotes ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 italic'}`}>
                            {dietaryNotes || "Tap to add specific dislikes (e.g. No Cilantro, Vegan)..."}
                        </p>
                    </button>

                    {/* Row 3: Chef Card Trigger */}
                    <div className="p-4 bg-primary/5 dark:bg-primary/10">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Show Chef Card in
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select
                                    value={chefCardLanguage}
                                    onChange={(e) => setChefCardLanguage(e.target.value as Language)}
                                    className="w-full appearance-none bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 hover:border-primary text-sm font-bold text-gray-900 dark:text-white py-2.5 pl-3 pr-8 rounded-xl cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 text-[18px]">expand_more</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleShowCard}
                                className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-4 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-[18px]">id_card</span>
                                Show
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <div className="px-6">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Preferences</h3>
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-2">
                    <div className="w-full flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl">
                                <span className="material-symbols-outlined text-[20px]">language</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Default Language</span>
                        </div>
                        
                        <div className="relative">
                            <select
                                value={defaultLanguage}
                                onChange={(e) => onDefaultLanguageChange(e.target.value as Language)}
                                className="appearance-none bg-none bg-gray-100 dark:bg-black/20 border border-transparent hover:border-gray-200 dark:hover:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-10 rounded-xl cursor-pointer transition-all outline-none focus:ring-2 focus:ring-primary/50 text-ellipsis overflow-hidden whitespace-nowrap w-[180px]"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500 text-[20px]">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">History & Data</h3>
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <button 
                        onClick={() => onNavigateHistory('scans')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-gray-800/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 dark:bg-orange-900/30 text-primary p-2.5 rounded-xl">
                                <span className="material-symbols-outlined text-[20px]">history</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Scan History</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                    </button>
                    <button 
                        onClick={() => onNavigateHistory('saved')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-pink-100 dark:bg-pink-900/30 text-pink-500 p-2.5 rounded-xl">
                                <span className="material-symbols-outlined text-[20px]">favorite</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Saved Dishes</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Modal: Edit Dislikes */}
        {showDietaryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div className="w-full max-w-[320px] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 animate-[scaleIn_0.2s_ease-out]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dietary Preferences</h3>
                        <button onClick={() => setShowDietaryModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                        Enter any foods you cannot eat or wish to avoid (e.g. "No Cilantro", "Vegan", "No Pork").
                    </p>
                    <textarea 
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                        className="w-full h-32 p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                        placeholder="I cannot eat..."
                    ></textarea>
                    <button 
                        onClick={() => setShowDietaryModal(false)}
                        className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-colors"
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        )}

        {/* Modal: Chef Card (Card Style) */}
        {showChefCard && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div className="w-full max-w-[340px] bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[scaleIn_0.2s_ease-out] relative">
                    
                    {/* Close Button */}
                    <button 
                        onClick={() => setShowChefCard(false)}
                        className="absolute top-3 right-3 z-10 size-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-white hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>

                    <div className="overflow-y-auto p-0 no-scrollbar">
                         <div className="bg-red-500 p-6 text-center text-white pt-8">
                            <span className="material-symbols-outlined text-[48px] mb-2">warning</span>
                            <h1 className="text-2xl font-black uppercase tracking-wide">
                                {CHEF_CARD_DATA[chefCardLanguage].title}
                            </h1>
                         </div>

                         <div className="p-6 flex flex-col gap-6">
                            {/* Allergens */}
                            {selectedAllergens.length > 0 && (
                                <div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                        {CHEF_CARD_DATA[chefCardLanguage].allergyWarning}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAllergens.map(allergen => (
                                            <div key={allergen} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-lg font-bold text-lg">
                                                {/* Try to translate allergen, fallback to English */}
                                                {CHEF_CARD_DATA[chefCardLanguage].allergens[allergen] || allergen}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {dietaryNotes && (
                                <div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                        {CHEF_CARD_DATA[chefCardLanguage].avoidText}
                                    </p>
                                    <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800 relative min-h-[60px]">
                                        {isTranslating ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                                                {translatedNotes || dietaryNotes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                             {/* Thank You */}
                             <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                 <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {CHEF_CARD_DATA[chefCardLanguage].thankYou}
                                </p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};
