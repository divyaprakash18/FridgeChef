import React, { useState } from 'react';
import {
  Clock,
  ChefHat,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Heart,
  ShoppingBag,
  Activity,
  Share2,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (recipeId: string) => void;
  onAddMissingToGrocery?: (recipe: Recipe) => void;
  urgentIngredientsList?: string[];
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelectRecipe,
  isFavorite = false,
  onToggleFavorite,
  onAddMissingToGrocery,
  urgentIngredientsList = [],
}) => {
  const [copiedToast, setCopiedToast] = useState(false);
  const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const isCompleteMatch = recipe.matchScore >= 95;

  // Check if this recipe rescues any expiring items
  const rescuedUrgentItems = urgentIngredientsList.filter((urgent) =>
    recipe.matchedIngredients.some(
      (m) => m.toLowerCase().includes(urgent.toLowerCase()) || urgent.toLowerCase().includes(m.toLowerCase())
    )
  );

  // Render official dietary icon
  const renderDietaryBadge = () => {
    switch (recipe.foodType) {
      case 'veg':
        return (
          <span
            title="Vegetarian"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300"
          >
            <span className="w-3 h-3 border border-emerald-600 p-[1.5px] rounded-xs flex items-center justify-center bg-white shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            </span>
            <span>Veg</span>
          </span>
        );
      case 'non-veg':
        return (
          <span
            title="Non-Vegetarian"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-300"
          >
            <span className="w-3 h-3 border border-rose-600 p-[1.5px] rounded-xs flex items-center justify-center bg-white shrink-0">
              <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
            </span>
            <span>Non-Veg</span>
          </span>
        );
      case 'vegan':
        return (
          <span
            title="100% Vegan (Plant-Based)"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-300"
          >
            <span>🌱</span>
            <span>Vegan</span>
          </span>
        );
      case 'egg':
        return (
          <span
            title="Eggitarian (Contains Eggs)"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300"
          >
            <span>🥚</span>
            <span>Egg</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🍳 *${recipe.title}* (${recipe.cuisine})\n\n⏱️ ${totalMinutes}m | ${recipe.servings} Servings\n\n🥗 *Ingredients:* ${recipe.matchedIngredients.join(', ')}\n\n💡 *Tip:* ${recipe.chefZeroWasteTip}\n\nCook with FridgeChef!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${recipe.title}\n${recipe.tagline}\nTime: ${totalMinutes} mins | Match: ${recipe.matchScore}%\nIngredients: ${recipe.matchedIngredients.join(', ')}\n\nSteps:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-600/60 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group relative">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="absolute top-2 inset-x-4 z-10 bg-stone-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg text-center animate-in fade-in shadow-md">
          ✓ Recipe copied to clipboard!
        </div>
      )}

      {/* Card Header & Match Meter */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {/* Match Score Indicator & Dietary Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isCompleteMatch ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-bold text-stone-900 tabular-nums">
              {recipe.matchScore}% Fridge Match
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {renderDietaryBadge()}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(recipe.id);
                }}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  isFavorite ? 'text-rose-500' : 'text-stone-300 hover:text-stone-500'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Urgent Rescue Badge if applicable */}
        {rescuedUrgentItems.length > 0 && (
          <div className="mb-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold rounded-lg self-start">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>🚨 Rescues {rescuedUrgentItems.join(', ')}</span>
          </div>
        )}

        {/* Recipe Title & Tagline */}
        <h3
          onClick={() => onSelectRecipe(recipe)}
          className="font-serif text-lg font-bold text-stone-900 group-hover:text-emerald-900 transition-colors leading-snug cursor-pointer"
        >
          {recipe.title}
        </h3>
        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
          {recipe.tagline}
        </p>

        {/* Nutritional Values Grid Banner */}
        <div className="mt-3.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nutrition Facts</span>
            </span>
            <span className="text-[10px] text-stone-400 font-medium">per serving</span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="bg-white p-1 rounded border border-stone-200/60">
              <span className="block font-bold text-stone-900 text-xs tabular-nums">
                {recipe.nutritionalFacts?.calories || recipe.nutritionalHighlights?.caloriesPerServing || 300}
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-medium">
                Calories
              </span>
            </div>
            <div className="bg-white p-1 rounded border border-stone-200/60">
              <span className="block font-bold text-emerald-700 text-xs tabular-nums">
                {recipe.nutritionalFacts?.protein || recipe.nutritionalHighlights?.proteinGrams || 15}g
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-medium">
                Protein
              </span>
            </div>
            <div className="bg-white p-1 rounded border border-stone-200/60">
              <span className="block font-bold text-stone-700 text-xs tabular-nums">
                {recipe.nutritionalFacts?.carbs ?? 25}g
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-medium">
                Carbs
              </span>
            </div>
            <div className="bg-white p-1 rounded border border-stone-200/60">
              <span className="block font-bold text-amber-700 text-xs tabular-nums">
                {recipe.nutritionalFacts?.fat ?? 12}g
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-medium">
                Fat
              </span>
            </div>
          </div>
        </div>

        {/* Clean Typographic Metadata */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mt-3 pt-3 border-t border-stone-100 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="tabular-nums">{totalMinutes} mins</span>
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>{recipe.difficulty}</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="tabular-nums">{recipe.servings} servings</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="font-medium text-stone-700">
            {recipe.subCuisine || recipe.cuisine}
          </span>
          {recipe.spiceLevel && (
            <>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-amber-800 font-medium">
                {recipe.spiceLevel === 'Spicy' ? '🌶️ Spicy' : recipe.spiceLevel === 'Extra Hot' ? '🔥 Extra Hot' : recipe.spiceLevel === 'Medium' ? '🌶️ Medium' : 'Mild'}
              </span>
            </>
          )}
        </div>

        {/* Matched Ingredients Breakdown */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 space-y-2">
          <div className="flex items-start gap-1.5 text-xs">
            <div className="p-0.5 text-emerald-700 mt-0.5 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div className="text-stone-700 leading-tight">
              <span className="font-semibold text-stone-900">In your fridge: </span>
              <span>{recipe.matchedIngredients.join(', ')}</span>
            </div>
          </div>

          {recipe.missingOrStapleIngredients.length > 0 && (
            <div className="flex items-start justify-between gap-1.5 text-xs text-stone-500">
              <div className="flex items-start gap-1.5 leading-tight min-w-0">
                <div className="p-0.5 text-stone-400 mt-0.5 shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-medium text-stone-600">Pantry essentials: </span>
                  <span>
                    {recipe.missingOrStapleIngredients
                      .map((item) => item.name)
                      .slice(0, 3)
                      .join(', ')}
                  </span>
                </div>
              </div>

              {onAddMissingToGrocery && (
                <button
                  type="button"
                  onClick={() => onAddMissingToGrocery(recipe)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline shrink-0 cursor-pointer ml-1"
                >
                  + Add to List
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 sm:px-6 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            title="Share via WhatsApp"
            className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopyCard}
            title="Copy Recipe Card"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectRecipe(recipe)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
        >
          <span>Cook Recipe</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
