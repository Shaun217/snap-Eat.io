
import React, { useState } from 'react';
import { Home } from './components/Home';
import { Scanning } from './components/Scanning';
import { Results } from './components/Results';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { BottomNav } from './components/BottomNav';
import { Screen, Language, Dish, SavedItem } from './types';
import { MOCK_SAVED } from './constants';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // State for Features
  const [defaultLanguage, setDefaultLanguage] = useState<Language>('English');
  // targetLanguage is initialized with default, but can be changed independently on Home
  const [targetLanguage, setTargetLanguage] = useState<Language>('English');

  const [currentResults, setCurrentResults] = useState<Dish[]>([]);
  const [history, setHistory] = useState<Dish[]>([]); // All scanned items
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  
  // State for History Tabs (lifted up to control from Profile)
  const [historyTab, setHistoryTab] = useState<'scans' | 'saved'>('scans');

  const handleDefaultLanguageChange = (lang: Language) => {
    setDefaultLanguage(lang);
    // When default changes, sync target language to it (user expectation when changing settings)
    setTargetLanguage(lang);
  };

  const handleImageSelect = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setCurrentScreen('scanning');
  };

  const handleScanCancel = () => {
    setCurrentScreen('home');
    setUploadedImage(null);
  };

  const handleScanComplete = (results: Dish[]) => {
    setCurrentResults(results);
    // Add to history (flattened list of dishes scanned)
    // Avoid exact duplicates if possible, but for history log, keeping all scans is fine.
    // For now, prepend new results to history
    setHistory(prev => [...results, ...prev]); 
    setCurrentScreen('results');
  };

  const handleToggleSave = (dishId: string) => {
    const isAlreadySaved = savedItems.some(item => item.id === dishId);
    
    if (isAlreadySaved) {
        // Remove from saved
        setSavedItems(prev => prev.filter(item => item.id !== dishId));
    } else {
        // Add to saved
        // Look in both current results and history to find the dish object
        const dishToSave = currentResults.find(d => d.id === dishId) || history.find(d => d.id === dishId);
        if (dishToSave) {
            setSavedItems(prev => [{ ...dishToSave, savedAt: new Date() }, ...prev]);
        }
    }
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
          <Profile 
            defaultLanguage={defaultLanguage}
            onDefaultLanguageChange={handleDefaultLanguageChange}
            onNavigateHistory={(tab) => {
                setHistoryTab(tab);
                setCurrentScreen('history');
            }}
            scanCount={history.length}
            savedCount={savedItems.length}
          />
        );
      default:
        return <Home 
            onImageSelect={handleImageSelect} 
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
        />;
    }
  };

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
