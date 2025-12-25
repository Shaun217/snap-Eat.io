
import React, { useEffect, useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Dish, Language } from '../types';

interface ScanningProps {
  uploadedImage: string | null;
  targetLanguage: Language;
  onCancel: () => void;
  onComplete: (results: Dish[]) => void;
}

export const Scanning: React.FC<ScanningProps> = ({ uploadedImage, targetLanguage, onCancel, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Identifying dish...");

  // Helper to convert blob URL to Base64
  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    let isMounted = true;

    const analyzeImage = async () => {
        if (!uploadedImage) return;

        try {
            // Start visual progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev > 85) return prev; // Hold at 85 until done
                    return prev + 2;
                });
            }, 100);

            // 1. Prepare Image
            const base64Image = await urlToBase64(uploadedImage);

            // 2. Initialize Gemini
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // 3. Define Schema for Dish Array
            const dishSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: `Name of the dish translated to ${targetLanguage}` },
                        originalName: { type: Type.STRING, description: "Original name of the dish in its native language" },
                        description: { type: Type.STRING, description: `Description of ingredients and taste profile in ${targetLanguage}` },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: `Top 3 dominant flavor profile words (e.g. Sweet, Salty, Umami) in ${targetLanguage}` },
                        allergens: { type: Type.ARRAY, items: { type: Type.STRING }, description: `List 1 to 5 potential allergens (e.g. Peanuts, Gluten, Dairy, Shellfish) in ${targetLanguage}` },
                        spiceLevel: { type: Type.STRING, enum: ["None", "Mild", "Medium", "Hot"], description: "None=Not Spicy, Mild=1 chili, Medium=2 chilies, Hot=3 chilies" },
                        category: { type: Type.STRING, description: "Broad category like Soup, Main, Dessert" }
                    },
                    required: ["name", "originalName", "description", "tags", "allergens", "spiceLevel", "category"]
                }
            };

            // 4. Update Status
            if (isMounted) setStatusText("Translating menu...");

            // 5. Call API
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview', 
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                        { text: `Analyze this image (food photo or menu). 
                                 Identify all distinct dishes. 
                                 Translate details to ${targetLanguage}.
                                 Provide 3 distinct flavor tags and up to 5 allergens per dish.
                                 Estimate spice level accurately.
                                 
                                 IMPORTANT: Return PURE JSON.` }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: dishSchema,
                    systemInstruction: "You are an expert food critic. Be concise. Identify allergens carefully."
                }
            });

            clearInterval(progressInterval);
            if (isMounted) setProgress(100);

            // 6. Parse Result with Robustness
            let jsonText = response.text || "[]";
            if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```json\s?/, '').replace(/^```\s?/, '').replace(/```$/, '');
            }
            
            const dishes = JSON.parse(jsonText);

            // Add IDs and image ref
            const processedDishes: Dish[] = dishes.map((d: any, index: number) => ({
                ...d,
                id: Date.now().toString() + index,
                image: uploadedImage 
            }));

            // 7. Complete
            setTimeout(() => {
                if (isMounted) onComplete(processedDishes);
            }, 500);

        } catch (error) {
            console.error("AI Error:", error);
            if (isMounted) {
                setStatusText("Error scanning. Try again.");
                setProgress(0);
                setTimeout(onCancel, 3000);
            }
        }
    };

    analyzeImage();

    return () => { isMounted = false; };
  }, [uploadedImage, targetLanguage, onComplete, onCancel]);

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="flex flex-col items-center justify-center flex-grow px-6 w-full mx-auto">
        
        {/* Visual Scanner */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="absolute w-72 h-72 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-80 h-80 rounded-full border border-primary/5 animate-pulse"></div>
          
          <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl shadow-primary/20 border-8 border-white dark:border-[#3a261c] bg-gray-100 dark:bg-gray-800 z-10">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{ backgroundImage: `url('${uploadedImage || "https://picsum.photos/400/400"}')` }}
            ></div>
            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.9)] z-20 animate-[scan_2s_ease-in-out_infinite]" style={{ top: '50%' }}></div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-3 text-center mb-10">
          <h2 className="text-[#181310] dark:text-white tracking-tight text-[28px] font-bold leading-tight px-4">
            {statusText}
          </h2>
          <p className="text-[#181310]/60 dark:text-[#f8f6f5]/60 text-base font-normal leading-normal max-w-[280px]">
             Identifying flavors and allergens in {targetLanguage}.
          </p>
        </div>

        {/* Progress */}
        <div className="w-full max-w-[300px] flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Processing</span>
            <span className="text-xs font-bold text-[#181310]/40 dark:text-white/40">{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="h-3 w-full bg-[#e7dfda] dark:bg-[#3a261c] rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary rounded-full transition-all duration-100 ease-linear" 
                style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="flex px-4 py-8 justify-center w-full bg-background-light dark:bg-background-dark">
        <button 
            onClick={onCancel}
            className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#e7dfda] dark:bg-[#3a261c] hover:bg-[#dcd3ce] dark:hover:bg-[#4a3225] text-[#181310] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
          <span className="truncate">Cancel Scan</span>
        </button>
      </div>

      <style>{`
        @keyframes scan {
            0% { top: 10%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
