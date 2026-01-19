
import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Scanning } from './components/Scanning';
import { Results } from './components/Results';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { BottomNav } from './components/BottomNav';
import { Screen, Language, Dish, SavedItem, ScanType } from './types';
import { MOCK_SAVED } from './constants';
import { supabase } from './lib/supabase';


const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // App State
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanType, setScanType] = useState<ScanType>('dish');

  // State for Features
  const [defaultLanguage, setDefaultLanguage] = useState<Language>('English');
  const [targetLanguage, setTargetLanguage] = useState<Language>('English');

  const [currentResults, setCurrentResults] = useState<Dish[]>([]);
  const [history, setHistory] = useState<Dish[]>([]); // All scanned items
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // Profile State
  const [userProfile, setUserProfile] = useState<any>(null);

  // State for History Tabs
  const [historyTab, setHistoryTab] = useState<'scans' | 'saved'>('scans');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else {
        setHistory([]);
        setSavedItems([]);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserProfile(profile);
        if (profile.default_language) {
          setDefaultLanguage(profile.default_language as Language);
          setTargetLanguage(profile.default_language as Language);
        }
        // Sync chef card language implicitly via userProfile prop, but we could also lift state if needed.
        // For now, Profile component reads from userProfile prop.
      }

      // Fetch Scans
      const { data: scans } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (scans) {
        const formattedScans: Dish[] = scans.map((s: any) => ({
          id: s.id,
          name: s.name,
          originalName: s.original_name,
          description: s.description,
          image: s.image_url,
          tags: s.tags || [],
          allergens: s.allergens || [],
          spiceLevel: s.spice_level,
          category: s.category,
          boundingBox: s.bounding_box,
          isMenu: s.is_menu
        }));

        setHistory(formattedScans);

        // Filter saved items
        const saved = scans.filter((s: any) => s.is_saved).map((s: any) => ({
          id: s.id,
          name: s.name,
          originalName: s.original_name,
          description: s.description,
          image: s.image_url,
          tags: s.tags || [],
          allergens: s.allergens || [],
          spiceLevel: s.spice_level,
          category: s.category,
          boundingBox: s.bounding_box,
          isMenu: s.is_menu,
          savedAt: new Date(s.saved_at || s.created_at)
        }));
        setSavedItems(saved);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultLanguageChange = async (lang: Language) => {
    setDefaultLanguage(lang);
    setTargetLanguage(lang);
    if (session?.user) {
      await supabase.from('profiles').update({ default_language: lang }).eq('id', session.user.id);
      setUserProfile((prev: any) => ({ ...prev, default_language: lang }));
    }
  };

  const handleImageSelect = (file: File, type: ScanType) => {
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setScanType(type);
    setCurrentScreen('scanning');
  };

  const handleScanCancel = () => {
    setCurrentScreen('home');
    setUploadedImage(null);
  };

  const handleScanComplete = async (results: Dish[]) => {
    setCurrentResults(results);
    setCurrentScreen('results');

    // Save to Database
    if (session?.user) {
      const newScans = results.map(dish => ({
        user_id: session.user.id,
        name: dish.name,
        original_name: dish.originalName,
        description: dish.description,
        image_url: dish.image, // Note: In real app, verify this is a persistent URL or Base64 is okay for small scale
        tags: dish.tags,
        allergens: dish.allergens,
        spice_level: dish.spiceLevel,
        category: dish.category,
        bounding_box: dish.boundingBox,
        is_menu: dish.isMenu,
        is_saved: false
      }));

      const { data, error } = await supabase.from('scans').insert(newScans).select();

      if (data) {
        const formattedNew: Dish[] = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          originalName: s.original_name,
          description: s.description,
          image: s.image_url,
          tags: s.tags || [],
          allergens: s.allergens || [],
          spiceLevel: s.spice_level,
          category: s.category,
          boundingBox: s.bounding_box,
          isMenu: s.is_menu
        }));
        setHistory(prev => [...formattedNew, ...prev]);
      }
    }
  };

  const handleToggleSave = async (dishId: string) => {
    const isAlreadySaved = savedItems.some(item => item.id === dishId);
    let newSavedItems = [...savedItems];

    if (isAlreadySaved) {
      newSavedItems = newSavedItems.filter(item => item.id !== dishId);
    } else {
      const dishToSave = currentResults.find(d => d.id === dishId) || history.find(d => d.id === dishId);
      if (dishToSave) {
        newSavedItems = [{ ...dishToSave, savedAt: new Date() }, ...newSavedItems];
      }
    }

    setSavedItems(newSavedItems);

    if (session?.user) {
      await supabase
        .from('scans')
        .update({
          is_saved: !isAlreadySaved,
          saved_at: !isAlreadySaved ? new Date().toISOString() : null
        })
        .eq('id', dishId);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: any) => {
    if (session?.user) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', session.user.id);
      if (!error) {
        setUserProfile((prev: any) => ({ ...prev, ...updates }));
      }
    }
  };

  // Pass profile data to child
  const profileProps = {
    defaultLanguage,
    onDefaultLanguageChange: handleDefaultLanguageChange,
    onNavigateHistory: (tab: 'scans' | 'saved') => {
      setHistoryTab(tab);
      setCurrentScreen('history');
    },
    scanCount: history.length,
    savedCount: savedItems.length,
    onLogout: handleLogout,
    userProfile: userProfile,
    onUpdateProfile: updateProfile
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <Home
            onImageSelect={handleImageSelect}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
          />
        );
      case 'scanning':
        return (
          <Scanning
            uploadedImage={uploadedImage}
            scanType={scanType}
            targetLanguage={targetLanguage}
            onCancel={handleScanCancel}
            onComplete={handleScanComplete}
          />
        );
      case 'results':
        return (
          <Results
            uploadedImage={uploadedImage}
            results={currentResults}
            savedIds={savedItems.map(s => s.id)}
            onBack={() => setCurrentScreen('home')}
            onSave={handleToggleSave}
          />
        );
      case 'history':
        return (
          <History
            historyItems={history}
            savedItems={savedItems}
            activeTab={historyTab}
            onTabChange={setHistoryTab}
            onBack={() => setCurrentScreen('home')}
            onToggleSave={handleToggleSave}
          />
        );
      case 'profile':
        return (
          <Profile {...profileProps} />
        );
      default:
        return <Home
          onImageSelect={handleImageSelect}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
        />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col bg-background-light dark:bg-background-dark shadow-xl overflow-hidden text-[#181310] dark:text-gray-100 font-display">

      {/* Screen Content */}
      <div className="flex-1 overflow-hidden h-full">
        {renderScreen()}
      </div>

      {/* Navigation (Only show on certain screens) */}
      {currentScreen !== 'scanning' && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
        />
      )}
    </div>
  );
};

export default App;