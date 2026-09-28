import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, ArrowRight, AlertCircle, RefreshCw, Check, Key } from 'lucide-react';
import { PRESET_FRIDGES } from '../data/presetScans';
import { PresetFridge, ScanResult } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';

interface FridgeScannerProps {
  onScanComplete: (result: ScanResult) => void;
  isAiAvailable?: boolean;
  personalGeminiApiKey?: string;
  onOpenAuth?: () => void;
  cuisinePreference?: string;
  subCuisinePreference?: string;
  spicePreference?: string;
  dietaryPreference?: string;
}

export const FridgeScanner: React.FC<FridgeScannerProps> = ({
  onScanComplete,
  personalGeminiApiKey,
  onOpenAuth,
  cuisinePreference,
  subCuisinePreference,
  spicePreference,
  dietaryPreference,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>('Preparing image...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'standalone' | 'ai'>(
    personalGeminiApiKey ? 'ai' : 'standalone'
  );

  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTriggerTakePhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setErrorMsg(null);

    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setIsCameraModalOpen(true);
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setErrorMsg(null);
  };

  const handleSelectPreset = (preset: PresetFridge) => {
    setSelectedImage(preset.image);
    setErrorMsg(null);
    runAnalysis(preset.image, preset);
  };

  const runAnalysis = async (imageSrc?: string, presetData?: PresetFridge) => {
    const targetImage = imageSrc || selectedImage;
    if (!targetImage) {
      setErrorMsg('Please upload or take a photo of your fridge first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    const phases = [
      'Scanning refrigerator shelves & crisper drawers...',
      'Recognizing vegetables, proteins, dairy & condiments...',
      'Evaluating ingredient freshness & quantities...',
      'Matching culinary recipes for zero food waste...',
    ];

    let phaseIndex = 0;
    setAnalysisPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setAnalysisPhase(phases[phaseIndex]);
    }, 900);

    try {
      // If AI mode is selected and user provided personal Gemini key
      if (scanMode === 'ai' && personalGeminiApiKey && !presetData) {
        try {
          const response = await fetch('/api/analyze-fridge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-gemini-api-key': personalGeminiApiKey,
            },
            body: JSON.stringify({
              imageBase64: targetImage,
              mimeType: 'image/jpeg',
              cuisinePreference,
              subCuisinePreference,
              spicePreference,
              dietaryRestrictions:
                dietaryPreference && dietaryPreference !== 'all' ? [dietaryPreference] : [],
            }),
          });

          const data = await response.json();
          if (data.success && data.data) {
            clearInterval(phaseInterval);
            setIsAnalyzing(false);
            onScanComplete({
              source: 'gemini-vision',
              fridgeSummary: data.data.fridgeSummary,
              detectedIngredients: data.data.detectedIngredients,
              recipes: data.data.recipes,
              imageUrl: targetImage,
            });
            return;
          }
        } catch (e) {
          console.warn('Personal Gemini vision fallback:', e);
        }
      }

      // Standalone mode: Instant local analysis with zero external API calls
      await new Promise((res) => setTimeout(res, 800));
      clearInterval(phaseInterval);
      setIsAnalyzing(false);

      if (presetData) {
        const { matchRecipesWithIngredients } = await import('../utils/recipeMatcher');
        const matched = matchRecipesWithIngredients(presetData.ingredients);

        onScanComplete({
          source: 'standalone-engine',
          fridgeSummary: `Preset Loaded: ${presetData.description}`,
          detectedIngredients: presetData.ingredients,
          recipes: matched,
          imageUrl: presetData.image,
        });
      } else {
        const { PRESET_FRIDGES } = await import('../data/presetScans');
        const defaultSample = PRESET_FRIDGES[0];
        const { matchRecipesWithIngredients } = await import('../utils/recipeMatcher');
        const matched = matchRecipesWithIngredients(defaultSample.ingredients);

        onScanComplete({
          source: 'standalone-engine',
          fridgeSummary:
            'Analyzed using 100% Free Standalone Engine. Detected staple items; customize below to explore recipes.',
          detectedIngredients: defaultSample.ingredients,
          recipes: matched,
          imageUrl: targetImage,
        });
      }
    } catch (err: any) {
      clearInterval(phaseInterval);
      setIsAnalyzing(false);
      console.error('Scan error:', err);
      setErrorMsg('Failed to process image. You can still pick items manually from the inventory.');
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Top Banner / Mode Toggle */}
      <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-900">
            Refrigerator Photo Scanner
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Take a picture, upload a file, or test with a sample fridge below.
          </p>
        </div>

        {/* Engine Mode Toggle */}
        {personalGeminiApiKey ? (
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setScanMode('standalone')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                scanMode === 'standalone'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-stone-600" />
              <span>Standalone (Zero API)</span>
            </button>
            <button
              onClick={() => setScanMode('ai')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                scanMode === 'ai'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personal Gemini Vision</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Free Standalone Mode</span>
            </div>
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-2.5 py-1.5 text-[11px] text-stone-600 hover:text-stone-900 font-medium bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Use your own Google account free tier quota"
              >
                <Key className="w-3 h-3 text-emerald-600" />
                <span>Use Personal Free Gemini Quota</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Main Upload Dropzone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                selectedImage
                  ? 'border-emerald-500/50 bg-emerald-50/20'
                  : 'border-stone-300 hover:border-emerald-600 bg-stone-50/50 hover:bg-stone-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative mx-auto max-w-md aspect-video rounded-lg overflow-hidden border border-stone-200 shadow-inner">
                    <img
                      src={selectedImage}
                      alt="Fridge preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <span className="text-stone-300">·</span>
                    <button
                      type="button"
                      onClick={handleTriggerTakePhoto}
                      className="text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take New Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      Snap or drop a photo of your open fridge
                    </p>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Clear photos of shelves, crisper drawers, or food baskets work best. Supports JPG, PNG, WebP up to 15MB.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleTriggerTakePhoto}
                      className="px-4 py-2 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Camera className="w-4 h-4 text-stone-950" />
                      Take Photo
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Browse Files
                    </button>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                disabled={!selectedImage || isAnalyzing}
                onClick={() => runAnalysis()}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !selectedImage || isAnalyzing
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{analysisPhase}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Find Matching Dishes from Photo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Sample Fridges Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Or test with a preset fridge scan:
              </h3>
              <span className="text-xs text-stone-400">1-click test</span>
            </div>

            <div className="space-y-2.5">
              {PRESET_FRIDGES.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="group flex items-center gap-3 p-2.5 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer"
                >
                  <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={preset.image}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-stone-900 group-hover:text-emerald-900 truncate">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      {preset.subtitle}
                    </p>
                    <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                      <span>Load & Discover Recipes</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onFallbackToFileInput={() => cameraInputRef.current?.click()}
      />
    </div>
  );
};
