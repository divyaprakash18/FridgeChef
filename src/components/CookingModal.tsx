import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChefHat,
  Sparkles,
  Send,
  Flame,
  MessageSquare,
  Volume2,
  VolumeX,
  Printer,
  ShoppingBag,
  Activity,
  Users,
  BellRing,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  Share2,
  Copy,
  Maximize2,
  Minimize2,
  Mic,
} from 'lucide-react';
import { Recipe } from '../types';

interface CookingModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  availableIngredients: string[];
  onAddMissingToGrocery?: (recipe: Recipe) => void;
}

interface StepTimerState {
  stepIdx: number;
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
}

// Extract duration from text e.g. "cook 3-4 minutes" -> 240 seconds
function extractStepDurationSeconds(stepText: string, fallbackMinutes = 3): number {
  const secMatch = stepText.match(/(\d+)(?:-(\d+))?\s*(?:seconds|secs|sec)\b/i);
  if (secMatch) {
    const sec = secMatch[2] ? parseInt(secMatch[2], 10) : parseInt(secMatch[1], 10);
    return Math.max(10, sec);
  }

  const minMatch = stepText.match(/(\d+)(?:-(\d+))?\s*(?:minutes|mins|min)\b/i);
  if (minMatch) {
    const mins = minMatch[2] ? parseInt(minMatch[2], 10) : parseInt(minMatch[1], 10);
    return Math.max(30, mins * 60);
  }

  return fallbackMinutes * 60;
}

export const CookingModal: React.FC<CookingModalProps> = ({
  recipe,
  onClose,
  availableIngredients,
  onAddMissingToGrocery,
}) => {
  if (!recipe) return null;

  // View mode
  const [activeTab, setActiveTab] = useState<'steps' | 'ingredients'>('steps');
  const [isKitchenMode, setIsKitchenMode] = useState<boolean>(false);
  const [kitchenStepIdx, setKitchenStepIdx] = useState<number>(0);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [isReadingStep, setIsReadingStep] = useState<number | null>(null);
  const [autoReadNext, setAutoReadNext] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active step timer state
  const [activeStepTimer, setActiveStepTimer] = useState<StepTimerState | null>(null);

  // Chef advice state
  const [chefQuestion, setChefQuestion] = useState('');
  const [chefMessages, setChefMessages] = useState<Array<{ role: 'user' | 'chef'; text: string }>>([
    {
      role: 'chef',
      text: `Hello! Need a substitution or spice tweak for ${recipe.title}? Ask me anytime.`,
    },
  ]);
  const [isAskingChef, setIsAskingChef] = useState(false);
  const [isChefExpanded, setIsChefExpanded] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synthesized chime using Web Audio API
  const playTimerChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;

      // Two-tone bell chime
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.18); // A5

      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 1.4);

      if ('vibrate' in navigator) {
        navigator.vibrate([300, 150, 300]);
      }
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  // Step Timer countdown interval
  useEffect(() => {
    let stepInterval: any = null;
    if (activeStepTimer && activeStepTimer.isRunning && activeStepTimer.remainingSeconds > 0) {
      stepInterval = setInterval(() => {
        setActiveStepTimer((prev) => {
          if (!prev || !prev.isRunning) return prev;
          if (prev.remainingSeconds <= 1) {
            playTimerChime();
            return {
              ...prev,
              remainingSeconds: 0,
              isRunning: false,
              isFinished: true,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    }
    return () => clearInterval(stepInterval);
  }, [activeStepTimer?.isRunning, activeStepTimer?.remainingSeconds]);

  // Clean up speech on close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleStep = (stepIdx: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIdx) ? prev.filter((i) => i !== stepIdx) : [...prev, stepIdx]
    );
  };

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  // Trigger step countdown timer
  const handleStartStepTimer = (stepIdx: number, stepText: string) => {
    const duration = extractStepDurationSeconds(stepText);
    setActiveStepTimer({
      stepIdx,
      initialSeconds: duration,
      remainingSeconds: duration,
      isRunning: true,
      isFinished: false,
    });
  };

  const handlePauseResumeStepTimer = () => {
    if (!activeStepTimer) return;
    setActiveStepTimer((prev) =>
      prev ? { ...prev, isRunning: !prev.isRunning } : null
    );
  };

  const handleResetStepTimer = () => {
    if (!activeStepTimer) return;
    setActiveStepTimer((prev) =>
      prev
        ? {
            ...prev,
            remainingSeconds: prev.initialSeconds,
            isRunning: false,
            isFinished: false,
          }
        : null
    );
  };

  const handleAddOneMinute = () => {
    if (!activeStepTimer) return;
    setActiveStepTimer((prev) =>
      prev
        ? {
            ...prev,
            remainingSeconds: prev.remainingSeconds + 60,
            isFinished: false,
            isRunning: true,
          }
        : null
    );
  };

  const handleDismissFinishedStep = (stepIdx: number) => {
    if (!completedSteps.includes(stepIdx)) {
      setCompletedSteps((prev) => [...prev, stepIdx]);
    }
    setActiveStepTimer(null);
  };

  // Voice narration using Web Speech API
  const readStepAloud = (stepText: string, stepIdx: number) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported in this browser.');
      return;
    }

    if (isReadingStep === stepIdx) {
      window.speechSynthesis.cancel();
      setIsReadingStep(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`Step ${stepIdx + 1}: ${stepText}`);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsReadingStep(null);
    utterance.onerror = () => setIsReadingStep(null);
    setIsReadingStep(stepIdx);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsReadingStep(null);
  };

  // WhatsApp Recipe Share
  const handleShareWhatsApp = () => {
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    const ingredientsList = [
      ...recipe.matchedIngredients.map((i) => `✓ ${i} (in fridge)`),
      ...recipe.missingOrStapleIngredients.map((m) => `• ${m.name}${m.substituteIdea ? ` (sub: ${m.substituteIdea})` : ''}`),
    ].join('\n');

    const stepsText = recipe.steps
      .map((s, idx) => `${idx + 1}. ${s}`)
      .join('\n\n');

    const message = `🍳 *${recipe.title}*
_${recipe.subCuisine || recipe.cuisine} • ${recipe.difficulty} • ⏱️ ${totalTime} mins • 👥 ${recipe.servings * servingMultiplier} Servings_

🥗 *Ingredients:*
${ingredientsList}

👨‍🍳 *Cooking Steps:*
${stepsText}

🌱 *Zero-Waste Chef Tip:*
${recipe.chefZeroWasteTip}

✨ _Cooked with FridgeChef zero-waste app_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Copy Recipe Card to Clipboard
  const handleCopyRecipeCard = () => {
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    const text = `# ${recipe.title}
${recipe.tagline}

Cuisine: ${recipe.subCuisine || recipe.cuisine} | Difficulty: ${recipe.difficulty} | Time: ${totalTime} mins | Servings: ${recipe.servings * servingMultiplier}
Calories: ${scaledCalories} kcal | Protein: ${scaledProtein}g

## Ingredients:
${recipe.matchedIngredients.map((i) => `- [x] ${i} (available in fridge)`).join('\n')}
${recipe.missingOrStapleIngredients.map((m) => `- [ ] ${m.name}${m.substituteIdea ? ` (or ${m.substituteIdea})` : ''}`).join('\n')}

## Instructions:
${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Zero-Waste Chef Tip:
${recipe.chefZeroWasteTip}
`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Recipe card copied to clipboard!');
    });
  };

  const handleAskChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chefQuestion.trim() || isAskingChef) return;

    const userText = chefQuestion.trim();
    setChefMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChefQuestion('');
    setIsAskingChef(true);
    setIsChefExpanded(true);

    try {
      const response = await fetch('/api/chef-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          currentIngredients: availableIngredients,
          recipeTitle: recipe.title,
        }),
      });

      const data = await response.json();
      setChefMessages((prev) => [
        ...prev,
        {
          role: 'chef',
          text: data.answer || 'Chef tip: Keep flame controlled and taste for seasoning as you go!',
        },
      ]);
    } catch (err) {
      setChefMessages((prev) => [
        ...prev,
        {
          role: 'chef',
          text: 'Chef Advice: In a pinch, neutral oil, a pinch of lemon juice, or extra garlic can balance the flavor seamlessly.',
        },
      ]);
    } finally {
      setIsAskingChef(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Scaled Nutritional Facts
  const baseNutrition = recipe.nutritionalFacts || {
    calories: recipe.nutritionalHighlights?.caloriesPerServing || 320,
    protein: recipe.nutritionalHighlights?.proteinGrams || 18,
    carbs: 28,
    fat: 14,
    fiber: 4,
    micronutrients: 'Vitamin C, Calcium, Iron, Potassium',
    healthScore: 92,
  };

  const scaledCalories = Math.round(baseNutrition.calories * servingMultiplier);
  const scaledProtein = Math.round(baseNutrition.protein * servingMultiplier);
  const scaledCarbs = Math.round(baseNutrition.carbs * servingMultiplier);
  const scaledFat = Math.round(baseNutrition.fat * servingMultiplier);

  const progressPercent = Math.round((completedSteps.length / recipe.steps.length) * 100);

  // KITCHEN MODE (HANDS-FREE HUD)
  if (isKitchenMode) {
    const currentStepText = recipe.steps[kitchenStepIdx] || '';
    const isStepDone = completedSteps.includes(kitchenStepIdx);
    const stepDuration = extractStepDurationSeconds(currentStepText);
    const isThisStepTimerActive = activeStepTimer?.stepIdx === kitchenStepIdx;

    return (
      <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
        {/* Top Kitchen HUD Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 max-w-4xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 block">
                Hands-Free Kitchen HUD
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white truncate max-w-xs sm:max-w-md">
                {recipe.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setIsKitchenMode(false);
              }}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit HUD</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-4xl mx-auto my-3 bg-stone-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((kitchenStepIdx + 1) / recipe.steps.length) * 100}%` }}
          />
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="max-w-md mx-auto w-full bg-emerald-600 text-white text-xs py-2 px-4 rounded-xl text-center font-bold mb-3 animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* Big Step Display Area */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto py-4 space-y-6">
          <div className="flex items-center justify-between text-stone-400 text-sm font-semibold">
            <span>
              STEP {kitchenStepIdx + 1} OF {recipe.steps.length}
            </span>
            <span className="text-emerald-400 font-mono">
              {completedSteps.length} steps checked
            </span>
          </div>

          {/* Giant Step Instruction Box */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            <p className="text-xl sm:text-3xl font-medium leading-relaxed sm:leading-relaxed text-stone-100 font-serif">
              {currentStepText}
            </p>

            {/* Voice Read Aloud Indicator / Controls */}
            <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => readStepAloud(currentStepText, kitchenStepIdx)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
                    isReadingStep === kitchenStepIdx
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 animate-pulse'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                  }`}
                >
                  {isReadingStep === kitchenStepIdx ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Read Step Aloud</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleStep(kitchenStepIdx)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
                    isStepDone
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isStepDone ? 'Marked Complete' : 'Mark Step Complete'}</span>
                </button>
              </div>

              {/* Step Timer Controller */}
              <div className="flex items-center gap-2">
                {isThisStepTimerActive ? (
                  <div className="flex items-center gap-2 bg-stone-950 border border-emerald-500/50 px-4 py-2 rounded-2xl">
                    <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span className="font-mono text-xl font-black text-emerald-400 tracking-wider">
                      {formatTimer(activeStepTimer.remainingSeconds)}
                    </span>
                    <button
                      type="button"
                      onClick={handlePauseResumeStepTimer}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      {activeStepTimer.isRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddOneMinute}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      +1m
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStepTimer(null)}
                      className="p-1 text-stone-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartStepTimer(kitchenStepIdx, currentStepText)}
                    className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Start Timer ({Math.ceil(stepDuration / 60)} min)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Big Giant Navigation Controls for Hands-Free Countertop use */}
        <div className="max-w-4xl w-full mx-auto pt-4 border-t border-stone-800 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={kitchenStepIdx === 0}
            onClick={() => {
              stopSpeaking();
              setKitchenStepIdx((prev) => Math.max(0, prev - 1));
            }}
            className="flex-1 py-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-base"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            disabled={kitchenStepIdx >= recipe.steps.length - 1}
            onClick={() => {
              stopSpeaking();
              if (!completedSteps.includes(kitchenStepIdx)) {
                setCompletedSteps((prev) => [...prev, kitchenStepIdx]);
              }
              const nextIdx = Math.min(recipe.steps.length - 1, kitchenStepIdx + 1);
              setKitchenStepIdx(nextIdx);
              if (autoReadNext) {
                readStepAloud(recipe.steps[nextIdx], nextIdx);
              }
            }}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-base shadow-lg shadow-emerald-950"
          >
            <span>Next Step</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // STANDARD COOKING MODAL VIEW
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {recipe.matchScore}% Match
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {recipe.subCuisine || recipe.cuisine} · {recipe.difficulty}
              </span>
              {recipe.spiceLevel && (
                <span className="text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  {recipe.spiceLevel}
                </span>
              )}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              {recipe.title}
            </h2>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
            {/* Kitchen Mode Trigger */}
            <button
              type="button"
              onClick={() => {
                setKitchenStepIdx(0);
                setIsKitchenMode(true);
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Kitchen Mode</span>
            </button>

            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              title="Share Recipe on WhatsApp"
              className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Copy Recipe */}
            <button
              type="button"
              onClick={handleCopyRecipeCard}
              title="Copy Recipe Card"
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Print Recipe */}
            <button
              type="button"
              onClick={() => window.print()}
              title="Print Recipe"
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-bold">
            ✓ {toastMessage}
          </div>
        )}

        {/* Cooking Progress Bar */}
        <div className="w-full bg-stone-100 h-1.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Global Active Step Timer Alert Bar */}
        {activeStepTimer && (
          <div
            className={`px-6 py-3 text-xs font-medium border-b flex items-center justify-between gap-3 transition-all ${
              activeStepTimer.isFinished
                ? 'bg-amber-400 text-stone-950 font-bold border-amber-500 animate-pulse'
                : 'bg-stone-900 text-white border-stone-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {activeStepTimer.isFinished ? (
                <BellRing className="w-5 h-5 text-stone-950 animate-bounce shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
              )}
              <div className="truncate">
                <span className="font-semibold">
                  {activeStepTimer.isFinished
                    ? `Step ${activeStepTimer.stepIdx + 1} timer finished!`
                    : `Step ${activeStepTimer.stepIdx + 1} timer: `}
                </span>
                <span className="font-mono font-bold text-sm ml-1 tracking-wider text-emerald-300">
                  {formatTimer(activeStepTimer.remainingSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeStepTimer.isFinished ? (
                <button
                  type="button"
                  onClick={() => handleDismissFinishedStep(activeStepTimer.stepIdx)}
                  className="px-3.5 py-1.5 bg-stone-950 text-white hover:bg-stone-800 rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                >
                  ✓ Mark Step Complete
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePauseResumeStepTimer}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {activeStepTimer.isRunning ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddOneMinute}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    +1 Min
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStepTimer(null)}
                    className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
                    title="Dismiss timer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile View Switcher (Simple Tabs) */}
        <div className="lg:hidden flex items-center border-b border-stone-200 bg-stone-50 px-4 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-2.5 border-b-2 text-center transition-all cursor-pointer ${
              activeTab === 'steps'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500'
            }`}
          >
            👨‍🍳 Cooking Steps ({completedSteps.length}/{recipe.steps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-2.5 border-b-2 text-center transition-all cursor-pointer ${
              activeTab === 'ingredients'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500'
            }`}
          >
            📋 Ingredients & Nutrition
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Ingredients Checklist, Serving Scaler & Macro Facts */}
          <div
            className={`lg:col-span-4 space-y-5 ${
              activeTab === 'ingredients' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Serving Size Scaler */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Servings</span>
                </span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {recipe.servings * servingMultiplier} servings
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => setServingMultiplier(mult)}
                    className={`py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      servingMultiplier === mult
                        ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Nutritional Cards */}
            <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nutrition Facts</span>
                </span>
                <span className="text-[11px] text-stone-400 font-normal">
                  {servingMultiplier}x portion
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 uppercase font-medium block">
                    Calories
                  </span>
                  <span className="font-bold text-stone-900 text-base tabular-nums">
                    {scaledCalories} <span className="text-[10px] font-normal text-stone-400">kcal</span>
                  </span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <span className="text-[10px] text-emerald-800 uppercase font-medium block">
                    Protein
                  </span>
                  <span className="font-bold text-emerald-900 text-base tabular-nums">
                    {scaledProtein}g
                  </span>
                </div>
                <div className="p-2 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 uppercase font-medium block">
                    Carbs
                  </span>
                  <span className="font-bold text-stone-800 text-sm tabular-nums">
                    {scaledCarbs}g
                  </span>
                </div>
                <div className="p-2 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 uppercase font-medium block">
                    Fats
                  </span>
                  <span className="font-bold text-stone-800 text-sm tabular-nums">
                    {scaledFat}g
                  </span>
                </div>
              </div>
            </div>

            {/* Ingredients Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Ingredients ({recipe.matchedIngredients.length + recipe.missingOrStapleIngredients.length})
                </h3>
                {onAddMissingToGrocery && recipe.missingOrStapleIngredients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onAddMissingToGrocery(recipe)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>+ Add to Grocery</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {recipe.matchedIngredients.map((ing) => {
                  const isChecked = checkedIngredients.includes(ing);
                  return (
                    <div
                      key={ing}
                      onClick={() => toggleIngredient(ing)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors border ${
                        isChecked
                          ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                          : 'bg-emerald-50/50 border-emerald-200/60 text-stone-800 font-medium'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="flex-1 truncate">{ing}</span>
                      <span className="text-[10px] text-emerald-700 shrink-0 font-normal">
                        in fridge
                      </span>
                    </div>
                  );
                })}

                {recipe.missingOrStapleIngredients.map((staple) => {
                  const isChecked = checkedIngredients.includes(staple.name);
                  return (
                    <div
                      key={staple.name}
                      onClick={() => toggleIngredient(staple.name)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors border ${
                        isChecked
                          ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-stone-600 border-stone-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="truncate block font-medium text-stone-800">
                          {staple.name}
                        </span>
                        {staple.substituteIdea && (
                          <span className="text-[10px] text-stone-400 block truncate">
                            Sub: {staple.substituteIdea}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0">pantry</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zero Waste Tip */}
            {recipe.chefZeroWasteTip && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chef’s Zero-Waste Tip</span>
                </div>
                <p className="text-amber-900/80 leading-relaxed text-[11px]">
                  {recipe.chefZeroWasteTip}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Cooking Steps */}
          <div
            className={`lg:col-span-8 space-y-4 ${
              activeTab === 'steps' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                  Step-by-Step Instructions
                </h3>
                <p className="text-xs text-stone-500">
                  Tap to check off, start step timers, or launch Hands-Free Kitchen Mode.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setKitchenStepIdx(0);
                    setIsKitchenMode(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fullscreen HUD</span>
                </button>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full tabular-nums">
                  {completedSteps.length} of {recipe.steps.length} done
                </span>
              </div>
            </div>

            {/* Step Cards */}
            <div className="space-y-3">
              {recipe.steps.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                const isSpeakingThis = isReadingStep === idx;
                const stepDuration = extractStepDurationSeconds(step);
                const isThisStepTimerActive = activeStepTimer?.stepIdx === idx;
                const isThisTimerFinished = isThisStepTimerActive && activeStepTimer.isFinished;
                const isThisTimerRunning = isThisStepTimerActive && activeStepTimer.isRunning;

                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                      isThisTimerFinished
                        ? 'bg-amber-50/90 border-amber-500 ring-4 ring-amber-400/40 shadow-lg animate-pulse'
                        : isThisTimerRunning
                        ? 'bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                        : isDone
                        ? 'bg-stone-50/70 border-stone-200 opacity-60'
                        : 'bg-white border-stone-200 hover:border-emerald-600/50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isDone
                            ? 'bg-emerald-700 text-white'
                            : isThisTimerFinished
                            ? 'bg-amber-600 text-white animate-bounce'
                            : isThisTimerRunning
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <p
                          className={`text-sm sm:text-base leading-relaxed ${
                            isDone ? 'line-through text-stone-400' : 'text-stone-800'
                          }`}
                        >
                          {step}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          readStepAloud(step, idx);
                        }}
                        title={isSpeakingThis ? 'Stop speaking' : 'Read step aloud'}
                        className={`p-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
                          isSpeakingThis
                            ? 'bg-emerald-600 text-white'
                            : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2"
                    >
                      {isThisStepTimerActive ? (
                        <div className="flex items-center justify-between w-full bg-stone-900 text-white px-3.5 py-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            {isThisTimerFinished ? (
                              <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
                            ) : (
                              <Clock className="w-4 h-4 text-emerald-400" />
                            )}
                            <span className="font-mono text-base font-bold text-emerald-400">
                              {formatTimer(activeStepTimer.remainingSeconds)}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              {isThisTimerFinished ? "Time's up!" : isThisTimerRunning ? 'Running' : 'Paused'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isThisTimerFinished ? (
                              <button
                                type="button"
                                onClick={() => handleDismissFinishedStep(idx)}
                                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg cursor-pointer"
                              >
                                Mark Done
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={handlePauseResumeStepTimer}
                                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold cursor-pointer"
                                >
                                  {isThisTimerRunning ? 'Pause' : 'Resume'}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAddOneMinute}
                                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold cursor-pointer"
                                >
                                  +1 Min
                                </button>
                                <button
                                  type="button"
                                  onClick={handleResetStepTimer}
                                  className="p-1 hover:bg-white/20 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                                  title="Reset timer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-stone-400">
                            ~{Math.ceil(stepDuration / 60)} mins
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartStepTimer(idx, step)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                          >
                            <Clock className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Start Timer ({Math.ceil(stepDuration / 60)}m)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Chef Q&A / Substitution Help */}
            <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/70 space-y-3">
              <div
                onClick={() => setIsChefExpanded(!isChefExpanded)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <ChefHat className="w-4 h-4 text-emerald-700" />
                  <span>Ask Chef Gemini for Substitutions or Flavor Advice</span>
                </div>
                <span className="text-xs text-emerald-800 font-semibold underline">
                  {isChefExpanded ? 'Hide' : 'Open'}
                </span>
              </div>

              {isChefExpanded && (
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {chefMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                          msg.role === 'chef'
                            ? 'bg-white border border-stone-200 text-stone-800'
                            : 'bg-emerald-700 text-white ml-6'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAskChef} className="flex gap-2">
                    <input
                      type="text"
                      value={chefQuestion}
                      onChange={(e) => setChefQuestion(e.target.value)}
                      placeholder="Need to swap an ingredient or fix heat? Type here..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="submit"
                      disabled={!chefQuestion.trim() || isAskingChef}
                      className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 rounded-xl transition-colors cursor-pointer"
                    >
                      Ask
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyRecipeCard}
              className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              <span>Copy Recipe</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setKitchenStepIdx(0);
                setIsKitchenMode(true);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Enter Hands-Free Kitchen Mode</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-200 hover:bg-stone-300 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
