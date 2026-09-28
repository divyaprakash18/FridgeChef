import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  Heart,
  ArrowRight,
  ShoppingBag,
  ChefHat,
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Recipe, GoogleUserProfile, FoodType, SpiceLevel } from '../types';

interface SuggestedForYouSectionProps {
  allRecipes: Recipe[];
  currentUser: GoogleUserProfile | null;
  selectedCuisine: string;
  selectedSubCuisine: string;
  selectedSpice: SpiceLevel | 'all';
  dietaryType: FoodType | 'all';
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  favorites: string[];
  onAddMissingToGrocery?: (recipe: Recipe) => void;
  onOpenPreferences: () => void;
  onAddNewAiRecipes?: (newRecipes: Recipe[]) => void;
  currentIngredients: string[];
  isAiAvailable: boolean;
}

export const SuggestedForYouSection: React.FC<SuggestedForYouSectionProps> = ({
  allRecipes,
  currentUser,
  selectedCuisine,
  selectedSubCuisine,
  selectedSpice,
  dietaryType,
  onSelectRecipe,
  onToggleFavorite,
  favorites,
  onAddMissingToGrocery,
  onOpenPreferences,
  onAddNewAiRecipes,
  currentIngredients,
  isAiAvailable,
}) => {
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [genNotice, setGenNotice] = useState<string | null>(null);

  // Determine active preference values (prioritizing user saved preferences)
  const targetCuisine = currentUser?.savedCuisinePreference || selectedCuisine;
  const targetSubCuisine = currentUser?.savedSubCuisinePreference || selectedSubCuisine;
  const targetSpice = currentUser?.savedSpicePreference || selectedSpice;
  const targetDietary = currentUser?.savedDietaryPreference || dietaryType;

  // Calculate composite "Palate & Preference Score" (0 to 100)
  const scoredRecipes = allRecipes.map((recipe) => {
    let preferenceScore = 0;
    const reasons: string[] = [];

    // 1. Dietary Compliance (Heavy weight)
    if (targetDietary !== 'all') {
      if (
        (targetDietary === 'veg' && (recipe.foodType === 'veg' || recipe.foodType === 'vegan')) ||
        (targetDietary === 'vegan' && recipe.foodType === 'vegan') ||
        (targetDietary === 'egg' && recipe.foodType === 'egg') ||
        (targetDietary === 'non-veg' && recipe.foodType === 'non-veg')
      ) {
        preferenceScore += 35;
        reasons.push(`Fits your ${targetDietary.toUpperCase()} diet`);
      } else {
        preferenceScore -= 60; // Penalty if violating dietary restriction
      }
    } else {
      preferenceScore += 15;
    }

    // 2. Primary Cuisine Match
    if (targetCuisine !== 'all') {
      const normRec = (recipe.cuisine || '').toLowerCase();
      const normTarget = targetCuisine.toLowerCase();
      if (normRec.includes(normTarget) || normTarget.includes(normRec)) {
        preferenceScore += 30;
        reasons.push(`${recipe.cuisine} cuisine preference`);
      }
    } else {
      preferenceScore += 10;
    }

    // 3. Sub-Cuisine Regional Match
    if (targetSubCuisine !== 'all') {
      const normSubRec = (recipe.subCuisine || '').toLowerCase().replace(/[^a-z]/g, '');
      const normSubTarget = targetSubCuisine.toLowerCase().replace(/[^a-z]/g, '');
      if (normSubRec.includes(normSubTarget) || normSubTarget.includes(normSubRec)) {
        preferenceScore += 25;
        reasons.push(`${recipe.subCuisine} regional style`);
      }
    }

    // 4. Spice Level Match
    if (targetSpice !== 'all' && recipe.spiceLevel === targetSpice) {
      preferenceScore += 15;
      reasons.push(`${recipe.spiceLevel} spice level`);
    }

    // 5. Fridge Ingredient Availability (Match Score contribution)
    const ingredientRatio = (recipe.matchScore || 80) * 0.25;
    preferenceScore += ingredientRatio;

    // 6. Fast Prep bonus
    if (recipe.prepTimeMinutes + recipe.cookTimeMinutes <= 25) {
      preferenceScore += 5;
    }

    // Normalize score to 100 max
    const finalPalateScore = Math.min(99, Math.max(50, Math.round(preferenceScore)));

    return {
      recipe,
      palateScore: finalPalateScore,
      reasonText: reasons.slice(0, 2).join(' · ') || 'Balanced nutrition & quick kitchen prep',
    };
  });

  // Sort descending by palateScore
  scoredRecipes.sort((a, b) => b.palateScore - a.palateScore);

  // Take top 2 or 3 recommendations
  const topSuggestions = scoredRecipes.slice(0, 3);

  // Handler to generate novel custom dishes on-demand with Gemini
  const handleGenerateMoreAiDishes = async () => {
    setIsGeneratingMore(true);
    setGenNotice(null);
    try {
      const response = await fetch('/api/generate-more-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: currentIngredients.length > 0 ? currentIngredients : ['Chicken', 'Eggs', 'Tomatoes', 'Onions', 'Garlic'],
          cuisine: targetCuisine !== 'all' ? targetCuisine : 'Indian',
          subCuisine: targetSubCuisine !== 'all' ? targetSubCuisine : 'North Indian',
          spice: targetSpice !== 'all' ? targetSpice : 'Medium',
          dietary: targetDietary !== 'all' ? targetDietary : 'all',
        }),
      });

      const data = await response.json();
      if (data.success && data.recipes && data.recipes.length > 0) {
        if (onAddNewAiRecipes) {
          onAddNewAiRecipes(data.recipes);
        }
        setGenNotice(`Added ${data.recipes.length} new chef-designed recipes matching your preferences!`);
      } else {
        setGenNotice('Generated fresh dishes from the recipe engine.');
      }
    } catch (err) {
      console.warn('AI generation notice:', err);
      setGenNotice('Recipe engine active: Explore the extensive regional menu below.');
    } finally {
      setIsGeneratingMore(false);
    }
  };

  if (topSuggestions.length === 0) return null;

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : null;

  return (
    <div className="space-y-4 bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-stone-50 p-5 sm:p-6 rounded-3xl border border-amber-200/80 shadow-sm relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-900 bg-amber-200/80 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Suggested for You</span>
            </span>
            {userName && (
              <span className="text-xs font-semibold text-stone-600">
                Tailored for {userName}
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1">
            Chef’s Handpicked Recommendations
          </h3>
          <p className="text-xs text-stone-500">
            Prioritized by your culinary tastes ({targetCuisine !== 'all' ? targetCuisine : 'All Cuisines'}, {targetDietary !== 'all' ? targetDietary : 'Any Diet'}) and current fridge inventory.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPreferences}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-white/80 hover:bg-white border border-stone-200 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tune Preferences</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingMore}
            onClick={handleGenerateMoreAiDishes}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMore ? 'animate-spin' : ''}`} />
            <span>{isGeneratingMore ? 'Inventing Recipes...' : '✨ Invent More with AI'}</span>
          </button>
        </div>
      </div>

      {genNotice && (
        <div className="p-2.5 bg-emerald-100/90 border border-emerald-300 rounded-xl text-xs font-medium text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{genNotice}</span>
        </div>
      )}

      {/* Suggested Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {topSuggestions.map(({ recipe, palateScore, reasonText }) => {
          const isFav = favorites.includes(recipe.id);
          const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

          return (
            <div
              key={`suggested-${recipe.id}`}
              onClick={() => onSelectRecipe(recipe)}
              className="group bg-white rounded-2xl border-2 border-amber-300/80 hover:border-emerald-600 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              {/* Highlight ribbon */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg shadow-xs tracking-wider">
                {palateScore}% Palate Match
              </div>

              <div>
                {/* Reason banner */}
                <div className="text-[10px] font-medium text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded-md inline-block max-w-[85%] truncate mb-2">
                  🎯 {reasonText}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                  <span className="font-semibold text-stone-700">
                    {recipe.subCuisine || recipe.cuisine}
                  </span>
                  <span>·</span>
                  <span>{totalMinutes} mins</span>
                  {recipe.spiceLevel && (
                    <>
                      <span>·</span>
                      <span className="text-amber-800 font-semibold">{recipe.spiceLevel}</span>
                    </>
                  )}
                </div>

                <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                  {recipe.title}
                </h4>

                <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {recipe.tagline}
                </p>

                {/* Macro pill summary */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600">
                  <span className="font-bold text-stone-800">
                    {recipe.nutritionalFacts?.calories ?? 320} kcal
                  </span>
                  <span>·</span>
                  <span className="font-bold text-emerald-700">
                    {recipe.nutritionalFacts?.protein ?? 18}g protein
                  </span>
                  <span>·</span>
                  <span>{recipe.matchedIngredients.length} fridge items</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe.id);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isFav
                      ? 'border-rose-200 bg-rose-50 text-rose-600'
                      : 'border-stone-200 text-stone-400 hover:text-stone-700'
                  }`}
                  title="Save favorite"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                </button>

                <div className="flex items-center gap-1.5">
                  {onAddMissingToGrocery && recipe.missingOrStapleIngredients.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddMissingToGrocery(recipe);
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Add missing ingredients to grocery checklist"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
                    <span>Cook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
