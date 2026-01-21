
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';
import { LANGUAGES, COMMON_ALLERGENS, CHEF_CARD_DATA } from '../constants';


interface ProfileProps {
    defaultLanguage: Language;
    onDefaultLanguageChange: (lang: Language) => void;
    onNavigateHistory: (tab: 'scans' | 'saved') => void;
    scanCount: number;
    savedCount: number;
    onLogout: () => void;
    userProfile: any;
    onUpdateProfile: (updates: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({
    defaultLanguage,
    onDefaultLanguageChange,
    onNavigateHistory,
    scanCount,
    savedCount,
    onLogout,
    userProfile,
    onUpdateProfile
}) => {
    const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200");

    const [isEditingName, setIsEditingName] = useState(false);
    const [userName, setUserName] = useState("Guest User");
    const nameInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dietary Restrictions State
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
    const [dietaryNotes, setDietaryNotes] = useState("");
    const [showDietaryModal, setShowDietaryModal] = useState(false);

    // Chef Card State
    const [customAllergen, setCustomAllergen] = useState("");
    const [allergenSelectValue, setAllergenSelectValue] = useState(""); // Track dropdown selection
    const [showCustomAllergenInput, setShowCustomAllergenInput] = useState(false);

    // Chef Card State
    const [showChefCard, setShowChefCard] = useState(false);
    const [translatedNotes, setTranslatedNotes] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);

    // Sync from props
    useEffect(() => {
        if (userProfile) {
            if (userProfile.full_name) setUserName(userProfile.full_name);
            if (userProfile.allergens) setSelectedAllergens(userProfile.allergens);
            if (userProfile.dietary_notes) setDietaryNotes(userProfile.dietary_notes);
            if (userProfile.avatar_url) setAvatar(userProfile.avatar_url);
        }
    }, [userProfile]);



    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isEditingName]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
            // In a real app, upload to storage and get URL, then onUpdateProfile({ avatar_url: url })
        }
    };

    const handleNameSave = () => {
        setIsEditingName(false);
        if (userName !== userProfile?.full_name) {
            onUpdateProfile({ full_name: userName });
        }
    };

    const handleAllergenToggle = (allergen: string) => {
        let newAllergens;
        if (selectedAllergens.includes(allergen)) {
            newAllergens = selectedAllergens.filter(a => a !== allergen);
        } else {
            newAllergens = [...selectedAllergens, allergen];
        }
        setSelectedAllergens(newAllergens);
        onUpdateProfile({ allergens: newAllergens });
    };

    const handleAllergenSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "custom") {
            setAllergenSelectValue("custom");
            setShowCustomAllergenInput(true);
        } else if (value) {
            handleAllergenToggle(value);
            setAllergenSelectValue(""); // Reset dropdown
            setShowCustomAllergenInput(false);
        } else {
            setAllergenSelectValue("");
            setShowCustomAllergenInput(false);
        }
    };

    const handleAddCustomAllergen = () => {
        if (customAllergen.trim() && !selectedAllergens.includes(customAllergen.trim())) {
            const newAllergen = customAllergen.trim();
            const newAllergens = [...selectedAllergens, newAllergen];
            setSelectedAllergens(newAllergens);
            onUpdateProfile({ allergens: newAllergens });
            setCustomAllergen("");
            setShowCustomAllergenInput(false); // Hide input after adding
            setAllergenSelectValue(""); // Reset dropdown
        }
    };

    const handleSaveDietaryNotes = () => {
        setShowDietaryModal(false);
        onUpdateProfile({ dietary_notes: dietaryNotes });
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
                contents: {
                    parts: [
                        { text: `Translate the following dietary restriction note into ${defaultLanguage} for a chef to read. Keep it clear, polite and concise. Return ONLY the translated text.\n\nText: "${dietaryNotes}"` }
                    ]
                }
            });

            // Handle response
            if (response.text) {
                setTranslatedNotes(response.text.trim());
            } else {
                console.warn("Translation returned empty text", response);
                setTranslatedNotes(dietaryNotes);
            }
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
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center h-10 px-4 rounded-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                    Sign Out
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

                    <div className="mt-4 flex items-center justify-center gap-2">
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                onBlur={handleNameSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                                className="bg-transparent text-2xl font-extrabold text-gray-900 dark:text-white text-center border-b-2 border-primary outline-none min-w-[100px]"
                            />
                        ) : (
                            <h2
                                onClick={() => setIsEditingName(true)}
                                className="text-2xl font-extrabold text-gray-900 dark:text-white text-center cursor-pointer hover:opacity-80 flex items-center gap-2"
                            >
                                {userName}
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">edit</span>
                            </h2>
                        )}
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
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Preferences</h3>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800/50">

                            {/* Row 1: Allergens Dropdown */}
                            <div className="p-4 pb-6 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-[18px]">no_food</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Allergens</span>
                                </div>

                                <div>
                                    <select
                                        value={allergenSelectValue}
                                        onChange={handleAllergenSelectChange}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5"
                                    >
                                        <option value="">Select common allergen...</option>
                                        {COMMON_ALLERGENS.map(a => (
                                            <option key={a} value={a} disabled={selectedAllergens.includes(a)}>{a}</option>
                                        ))}
                                        <option value="custom">Custom / Other...</option>
                                    </select>
                                </div>

                                {showCustomAllergenInput && (
                                    <div className="flex gap-2 animate-[fadeIn_0.2s_ease-out] w-full">
                                        <input
                                            type="text"
                                            value={customAllergen}
                                            onChange={(e) => setCustomAllergen(e.target.value)}
                                            placeholder="Enter custom allergen..."
                                            className="flex-1 min-w-0 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAllergen()}
                                            autoFocus
                                        />
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={handleAddCustomAllergen}
                                                disabled={!customAllergen.trim()}
                                                className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowCustomAllergenInput(false);
                                                    setAllergenSelectValue("");
                                                    setCustomAllergen("");
                                                }}
                                                className="bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 font-bold px-3 py-2 rounded-xl text-sm transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedAllergens.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
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

                            {/* Row 2: Preferences */}
                            <div className="p-4 pb-6 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Preferences</span>
                                </div>

                                <button
                                    onClick={() => setShowDietaryModal(true)}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 text-left flex items-center justify-between group transition-colors hover:border-primary/50"
                                >
                                    <span className={`block truncate ${dietaryNotes ? 'text-gray-900 dark:text-white' : 'text-gray-400 italic'}`}>
                                        {dietaryNotes || "Tap to add specific dislikes..."}
                                    </span>
                                    <span className="material-symbols-outlined text-gray-400 text-[20px] group-hover:text-primary transition-colors shrink-0 ml-2">
                                        edit
                                    </span>
                                </button>
                            </div>

                            {/* Row 3: Chef Card Trigger with Merged Language */}
                            <div className="p-4 bg-primary/5 dark:bg-primary/10 flex items-center justify-between">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Target Language
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{defaultLanguage}</span>
                                        <span className="text-xs text-gray-400">(Used for Menu & Card)</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleShowCard}
                                    className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">id_card</span>
                                    Show Chef Card
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="px-6">
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Language</h3>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-2">
                            <div className="w-full flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl">
                                        <span className="material-symbols-outlined text-[20px]">language</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Target Language</span>
                                </div>

                                <div className="relative">
                                    <select
                                        value={defaultLanguage}
                                        onChange={(e) => onDefaultLanguageChange(e.target.value as Language)}
                                        className="appearance-none bg-none bg-gray-100 dark:bg-black/20 border border-transparent hover:border-gray-200 dark:hover:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-8 rounded-xl cursor-pointer transition-all outline-none focus:ring-2 focus:ring-primary/50 text-ellipsis overflow-hidden whitespace-nowrap w-[180px]"
                                    >
                                        {LANGUAGES.map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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
                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-gray-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 dark:bg-orange-900/30 text-primary p-1.5 rounded-lg">
                                        <span className="material-symbols-outlined text-[20px]">history</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Scan History</span>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                            </button>
                            <button
                                onClick={() => onNavigateHistory('saved')}
                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-pink-100 dark:bg-pink-900/30 text-pink-500 p-1.5 rounded-lg">
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
                {
                    showDietaryModal && createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-display">
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
                                    onClick={handleSaveDietaryNotes}
                                    className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-colors"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>,
                        document.body
                    )
                }

                {/* Modal: Chef Card (Card Style) */}
                {
                    showChefCard && createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-display">
                            <div className="w-full max-w-[340px] bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[scaleIn_0.2s_ease-out] relative">

                                {/* Close Button */}
                                {/* Close Button */}
                                <button
                                    onClick={() => setShowChefCard(false)}
                                    className="absolute top-3 right-3 z-50 size-8 rounded-full bg-gray-100/80 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>

                                <div className="overflow-y-auto p-0 no-scrollbar relative flex-1 bg-gray-50 dark:bg-black/40">

                                    {/* 1. ORIGINAL LANGUAGE (Top Half) */}
                                    <div className="p-6 pb-8 bg-white dark:bg-[#1a1a1a] shadow-sm relative z-10">
                                        <div className="flex items-center gap-2 mb-4 opacity-50">
                                            <span className="material-symbols-outlined text-[16px]">translate</span>
                                            <span className="text-xs font-bold uppercase tracking-wider">Original (English)</span>
                                        </div>

                                        <div className="text-center mb-6">
                                            <h1 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                                                {CHEF_CARD_DATA['English'].title}
                                            </h1>
                                        </div>

                                        {/* Content in English */}
                                        <div className="flex flex-col gap-4">
                                            {selectedAllergens.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                                        {CHEF_CARD_DATA['English'].allergyWarning}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedAllergens.map(allergen => (
                                                            <div key={allergen} className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30 px-2.5 py-1 rounded-lg font-bold text-sm">
                                                                {/* Display original allergen name if it's common, else just string */}
                                                                {COMMON_ALLERGENS.includes(allergen) ? CHEF_CARD_DATA['English'].allergens[allergen] : allergen}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {dietaryNotes && (
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                                        {CHEF_CARD_DATA['English'].avoidText}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                                        {dietaryNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. TARGET LANGUAGE (Bottom Half) */}
                                    <div className="p-6 pt-8 text-white bg-primary">
                                        <div className="flex items-center gap-2 mb-4 text-white/70">
                                            <span className="material-symbols-outlined text-[16px]">language</span>
                                            <span className="text-xs font-bold uppercase tracking-wider">Target ({defaultLanguage})</span>
                                        </div>

                                        <div className="text-center mb-6">
                                            <span className="material-symbols-outlined text-[40px] mb-2 text-white/90">warning</span>
                                            <h1 className="text-2xl font-black uppercase tracking-wide text-white">
                                                {CHEF_CARD_DATA[defaultLanguage].title}
                                            </h1>
                                        </div>

                                        <div className="flex flex-col gap-6">
                                            {selectedAllergens.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-bold text-white/70 mb-2 uppercase tracking-wide">
                                                        {CHEF_CARD_DATA[defaultLanguage].allergyWarning}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedAllergens.map(allergen => (
                                                            <div key={allergen} className="bg-white text-red-600 px-3 py-1.5 rounded-lg font-bold text-lg shadow-sm">
                                                                {/* Try to translate allergen, fallback to English/Original */}
                                                                {CHEF_CARD_DATA[defaultLanguage].allergens[allergen] || allergen}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {dietaryNotes && (
                                                <div>
                                                    <p className="text-sm font-bold text-white/70 mb-2 uppercase tracking-wide">
                                                        {CHEF_CARD_DATA[defaultLanguage].avoidText}
                                                    </p>
                                                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 relative min-h-[60px]">
                                                        {isTranslating ? (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg font-medium text-white leading-relaxed whitespace-pre-wrap">
                                                                {translatedNotes || dietaryNotes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-center pt-4 border-t border-white/20">
                                                <p className="text-lg font-bold text-white">
                                                    {CHEF_CARD_DATA[defaultLanguage].thankYou}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>,
                        document.body
                    )
                }

            </main >
        </div >
    );
};

