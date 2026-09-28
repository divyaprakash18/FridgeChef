import React, { useState } from 'react';
import {
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  Tag,
  ShoppingBag,
  Clock,
  Sparkles,
  Flame,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { IngredientItem } from '../types';
import { estimateShelfLifeDays } from '../utils/expiryEstimator';

interface DetectedIngredientsListProps {
  ingredients: IngredientItem[];
  onAddIngredient: (item: IngredientItem) => void;
  onRemoveIngredient: (index: number) => void;
  onClearAll: () => void;
  source: 'gemini-vision' | 'standalone-engine';
  onToggleRescueMode?: () => void;
  isRescueModeActive?: boolean;
  onUpdateIngredientExpiry?: (index: number, days: number) => void;
}

export const DetectedIngredientsList: React.FC<DetectedIngredientsListProps> = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onClearAll,
  source,
  onToggleRescueMode,
  isRescueModeActive = false,
  onUpdateIngredientExpiry,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientItem['category']>('Produce');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const name = quickInput.trim();
    const days = estimateShelfLifeDays(name, selectedCategory);

    onAddIngredient({
      name,
      category: selectedCategory,
      quantityEstimate: 'Available',
      freshnessNotice: days <= 2 ? `Use within ${days} days` : 'Good condition',
      expiresInDays: days,
      priority: days <= 2 ? 'High (use first)' : 'Normal',
      isRescueUrgent: days <= 2,
    });
    setQuickInput('');
  };

  const commonQuickAdds = [
    { name: 'Olive Oil', category: 'Pantry' as const },
    { name: 'Garlic', category: 'Produce' as const },
    { name: 'Pasta', category: 'Pantry' as const },
    { name: 'Rice', category: 'Pantry' as const },
    { name: 'Eggs', category: 'Dairy' as const },
    { name: 'Soy Sauce', category: 'Condiment' as const },
  ];

  // Urgent items count (< 3 days left or High priority)
  const urgentItems = ingredients.filter(
    (item) => (item.expiresInDays !== undefined && item.expiresInDays <= 2) || item.priority === 'High (use first)'
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-stone-900">
              Fridge & Pantry Inventory ({ingredients.length})
            </h3>
            <span className="text-xs text-stone-400">
              · {source === 'gemini-vision' ? 'Multimodal Vision Verified' : 'Standalone Inventory'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time freshness monitoring: fragile items are flagged so you can cook them before they spoil.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {urgentItems.length > 0 && onToggleRescueMode && (
            <button
              type="button"
              onClick={onToggleRescueMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isRescueModeActive
                  ? 'bg-rose-600 text-white shadow-rose-200'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isRescueModeActive ? '🚨 Rescue Mode Active' : `Rescue Mode (${urgentItems.length})`}</span>
            </button>
          )}

          {ingredients.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Urgent Expiry Alert Banner if any items need rescue */}
      {urgentItems.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <span>{urgentItems.length} items need priority cooking</span>
                <span className="text-[10px] font-semibold bg-rose-200/70 text-rose-800 px-1.5 py-0.2 rounded-full">
                  Expires in ≤ 2 days
                </span>
              </div>
              <p className="text-[11px] text-rose-700/80">
                {urgentItems.map((u) => u.name).join(', ')}
              </p>
            </div>
          </div>

          {onToggleRescueMode && (
            <button
              type="button"
              onClick={onToggleRescueMode}
              className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer self-start sm:self-auto"
            >
              {isRescueModeActive ? 'Show All Recipes' : 'Show Rescue Recipes'}
            </button>
          )}
        </div>
      )}

      {/* Ingredient Items Grid */}
      {ingredients.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
          <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-stone-600">No ingredients in fridge list yet.</p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Scan a photo above or use the quick-add input below.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((item, idx) => {
            const days = item.expiresInDays !== undefined
              ? item.expiresInDays
              : estimateShelfLifeDays(item.name, item.category);
            const isUrgent = days <= 2 || item.priority === 'High (use first)';

            return (
              <div
                key={`${item.name}-${idx}`}
                className={`group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl text-xs transition-all border ${
                  isUrgent
                    ? 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-950 font-medium'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                }`}
              >
                <span className="font-semibold">{item.name}</span>

                {/* Expiry Pill */}
                <button
                  type="button"
                  title="Click to adjust days until expiry"
                  onClick={() => {
                    if (onUpdateIngredientExpiry) {
                      // Cycle through 1, 2, 4, 7 days
                      const nextDays = days <= 1 ? 4 : days <= 2 ? 7 : days <= 4 ? 1 : 2;
                      onUpdateIngredientExpiry(idx, nextDays);
                    }
                  }}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    days <= 1
                      ? 'bg-rose-500 text-white'
                      : days <= 2
                      ? 'bg-amber-500 text-white'
                      : days <= 4
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{days <= 1 ? '1d left' : `${days}d left`}</span>
                </button>

                {item.quantityEstimate && (
                  <span className="text-stone-400 text-[10px] hidden sm:inline">
                    · {item.quantityEstimate}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveIngredient(idx)}
                  title={`Remove ${item.name}`}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-white/80 transition-colors ml-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Bar */}
      <div className="pt-2 border-t border-stone-100 space-y-3">
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Type any ingredient (e.g. Avocado, Leftover Rice, Butter)..."
            className="flex-1 px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-2.5 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 text-stone-700 focus:outline-none"
          >
            <option value="Produce">Produce</option>
            <option value="Dairy">Dairy</option>
            <option value="Protein">Protein</option>
            <option value="Condiment">Condiment</option>
            <option value="Bakery">Bakery</option>
            <option value="Pantry">Pantry</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Quick Click Recommendations */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-stone-400 mr-1">Common extras:</span>
          {commonQuickAdds.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                const days = estimateShelfLifeDays(item.name, item.category);
                onAddIngredient({
                  name: item.name,
                  category: item.category,
                  quantityEstimate: 'Standard pantry staple',
                  freshnessNotice: 'Available',
                  expiresInDays: days,
                  priority: 'Normal',
                });
              }}
              className="text-[11px] font-medium text-stone-600 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-stone-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              + {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
