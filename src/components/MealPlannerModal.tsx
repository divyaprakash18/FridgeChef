import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  ShoppingBag,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  ChefHat,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Leaf,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { IngredientItem, MealPlan, Recipe, FoodType } from '../types';
import { generateLocalMealPlan } from '../utils/mealPlannerEngine';

interface MealPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: IngredientItem[];
  availableRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onAddMultipleToGrocery: (items: string[]) => void;
  initialDietary?: FoodType | 'all';
}

export const MealPlannerModal: React.FC<MealPlannerModalProps> = ({
  isOpen,
  onClose,
  ingredients,
  availableRecipes,
  onSelectRecipe,
  onAddMultipleToGrocery,
  initialDietary = 'all',
}) => {
  const [duration, setDuration] = useState<3 | 7>(3);
  const [dietary, setDietary] = useState<FoodType | 'all'>(initialDietary);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  // Load or generate plan
  const generatePlan = async (dur = duration, diet = dietary) => {
    setIsLoading(true);
    try {
      // Try backend AI planner first
      const res = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.map((i) => i.name),
          durationDays: dur,
          dietary: diet,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setMealPlan(data.plan);
      } else {
        // Fallback to local intelligent planner
        const local = generateLocalMealPlan(ingredients, availableRecipes, dur, diet);
        setMealPlan(local);
      }
    } catch (err) {
      console.warn('Backend meal plan fetch, using local engine:', err);
      const local = generateLocalMealPlan(ingredients, availableRecipes, dur, diet);
      setMealPlan(local);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generatePlan(duration, dietary);
    }
  }, [isOpen, duration, dietary]);

  if (!isOpen) return null;

  const handleShareWhatsApp = () => {
    if (!mealPlan) return;

    let text = `🗓️ *${mealPlan.title}*\n`;
    text += `🌿 *Zero-Waste Efficiency:* ${mealPlan.zeroWasteScore}% | Saved ~${mealPlan.estimatedMoneySaved}\n\n`;

    mealPlan.days.forEach((day) => {
      text += `📅 *${day.dayTitle}*\n_${day.priorityMessage}_\n`;
      day.meals.forEach((m) => {
        text += `• *${m.mealType}:* ${m.recipe.title} (${m.recipe.cookTimeMinutes + m.recipe.prepTimeMinutes}m)\n`;
        if (m.rescueIngredientsUsed.length > 0) {
          text += `  ⚠️ Rescues: ${m.rescueIngredientsUsed.join(', ')}\n`;
        }
      });
      text += '\n';
    });

    if (mealPlan.consolidatedMissingIngredients.length > 0) {
      text += `🛒 *Groceries to Pick Up:*\n${mealPlan.consolidatedMissingIngredients.map((item) => `- ${item}`).join('\n')}\n\n`;
    }

    text += `Cook zero-waste with FridgeChef!`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyPlan = () => {
    if (!mealPlan) return;

    let text = `${mealPlan.title}\n`;
    text += `Zero-Waste Efficiency: ${mealPlan.zeroWasteScore}% | Estimated Value Saved: ${mealPlan.estimatedMoneySaved}\n\n`;

    mealPlan.days.forEach((day) => {
      text += `--- ${day.dayTitle} ---\n${day.priorityMessage}\n`;
      day.meals.forEach((m) => {
        text += `[${m.mealType}] ${m.recipe.title}\n`;
        text += `Notes: ${m.wasteSavingNote}\n`;
      });
      text += '\n';
    });

    if (mealPlan.consolidatedMissingIngredients.length > 0) {
      text += `Missing Ingredients:\n${mealPlan.consolidatedMissingIngredients.join(', ')}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification('Meal plan copied to clipboard!');
      setTimeout(() => setCopiedNotification(null), 3000);
    });
  };

  const handleAddGroceries = () => {
    if (!mealPlan || mealPlan.consolidatedMissingIngredients.length === 0) return;
    onAddMultipleToGrocery(mealPlan.consolidatedMissingIngredients);
    setCopiedNotification(`Added ${mealPlan.consolidatedMissingIngredients.length} items to your shopping list!`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  Zero-Waste Meal Planner
                </h2>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Prep My Week
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Schedules meals so perishables are consumed first before they spoil.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generatePlan(duration, dietary)}
              disabled={isLoading}
              title="Regenerate Plan"
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Control Bar: Duration & Dietary */}
        <div className="px-6 py-3 border-b border-stone-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Duration:</span>
            <div className="inline-flex p-0.5 bg-stone-100 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setDuration(3)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  duration === 3 ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3-Day Express Plan
              </button>
              <button
                type="button"
                onClick={() => setDuration(7)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  duration === 7 ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                7-Day Full Week
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Diet:</span>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value as any)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Foods</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Veg</option>
              <option value="vegan">Vegan</option>
              <option value="egg">Eggitarian</option>
            </select>
          </div>
        </div>

        {/* Notification Toast */}
        {copiedNotification && (
          <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-medium transition-all">
            ✓ {copiedNotification}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-semibold text-stone-800">
                Crafting your {duration}-Day Zero-Waste Menu...
              </p>
              <p className="text-xs text-stone-400">
                Analyzing shelf life, ordering fragile items first, and maximizing your groceries.
              </p>
            </div>
          ) : mealPlan ? (
            <>
              {/* Sustainability & Savings Highlights Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      Estimated Savings
                    </span>
                    <span className="text-lg font-bold text-stone-900">
                      {mealPlan.estimatedMoneySaved}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-700 flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                      Food Waste Diverted
                    </span>
                    <span className="text-lg font-bold text-stone-900">
                      {mealPlan.wasteDivertedKg}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                      Zero-Waste Score
                    </span>
                    <span className="text-lg font-bold text-stone-900">
                      {mealPlan.zeroWasteScore}% Efficiency
                    </span>
                  </div>
                </div>
              </div>

              {/* Day Selector Pills for 7-day or 3-day */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {mealPlan.days.map((day, idx) => (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setActiveDayIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeDayIndex === idx
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>Day {day.dayNumber}</span>
                    {idx === 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              {/* Active Day Detail Card */}
              {mealPlan.days[activeDayIndex] && (
                <div className="border border-stone-200 rounded-2xl p-5 bg-white space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Day {mealPlan.days[activeDayIndex].dayNumber}
                        </span>
                        <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                          {mealPlan.days[activeDayIndex].dayTitle}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        {mealPlan.days[activeDayIndex].priorityMessage}
                      </p>
                    </div>
                  </div>

                  {/* Meals for this day */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mealPlan.days[activeDayIndex].meals.map((meal, mIdx) => (
                      <div
                        key={mIdx}
                        className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-sm transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-md">
                              {meal.mealType}
                            </span>
                            <span className="text-xs font-semibold text-emerald-700">
                              {meal.recipe.matchScore}% Match
                            </span>
                          </div>

                          <h4 className="font-serif font-bold text-stone-900 text-base">
                            {meal.recipe.title}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2">
                            {meal.recipe.tagline}
                          </p>

                          {/* Rescued ingredients tag */}
                          {meal.rescueIngredientsUsed.length > 0 && (
                            <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-700" />
                                Rescues:
                              </span>
                              {meal.rescueIngredientsUsed.map((ing) => (
                                <span
                                  key={ing}
                                  className="text-[10px] font-semibold text-stone-700 bg-white border border-stone-200 px-1.5 py-0.5 rounded"
                                >
                                  {ing}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Waste saving explanation */}
                          <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-xl">
                            💡 {meal.wasteSavingNote}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-stone-200/60 mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              {meal.recipe.prepTimeMinutes + meal.recipe.cookTimeMinutes}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-500" />
                              {meal.recipe.nutritionalFacts?.calories || 350} kcal
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectRecipe(meal.recipe);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <span>Cook Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consolidated Missing Ingredients Box */}
              {mealPlan.consolidatedMissingIngredients.length > 0 && (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-stone-700" />
                      <h4 className="text-xs font-bold text-stone-800">
                        Missing Groceries for This {duration}-Day Plan ({mealPlan.consolidatedMissingIngredients.length})
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      {mealPlan.consolidatedMissingIngredients.join(', ')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddGroceries}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add All to Shopping List</span>
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/90 flex flex-wrap items-center justify-between gap-3">
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
              onClick={handleCopyPlan}
              className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              <span>Copy Plan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
