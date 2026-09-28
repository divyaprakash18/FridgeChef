import React from 'react';
import { CUISINE_TAXONOMY } from '../data/cuisineDatabase';
import { SpiceLevel } from '../types';
import { SlidersHorizontal, Flame, Sparkles } from 'lucide-react';

interface CuisineSelectorBarProps {
  selectedCuisine: string; // 'all' or cuisine.id
  selectedSubCuisine: string; // 'all' or subCuisine.id
  selectedSpice: SpiceLevel | 'all';
  onSelectCuisine: (cuisineId: string) => void;
  onSelectSubCuisine: (subCuisineId: string) => void;
  onSelectSpice: (spice: SpiceLevel | 'all') => void;
  onOpenPreferencesModal?: () => void;
}

export const CuisineSelectorBar: React.FC<CuisineSelectorBarProps> = ({
  selectedCuisine,
  selectedSubCuisine,
  selectedSpice,
  onSelectCuisine,
  onSelectSubCuisine,
  onSelectSpice,
  onOpenPreferencesModal,
}) => {
  const currentCategory = CUISINE_TAXONOMY.find((c) => c.id === selectedCuisine);

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
      {/* Top Row: Primary Cuisine Selector + Preferences Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* All Cuisines */}
          <button
            type="button"
            onClick={() => {
              onSelectCuisine('all');
              onSelectSubCuisine('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCuisine === 'all'
                ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span>All Cuisines</span>
          </button>

          {/* Cuisines */}
          {CUISINE_TAXONOMY.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelectCuisine(c.id);
                onSelectSubCuisine('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedCuisine === c.id
                  ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {onOpenPreferencesModal && (
          <button
            type="button"
            onClick={onOpenPreferencesModal}
            title="Set default culinary preferences"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            <span>Customize</span>
          </button>
        )}
      </div>

      {/* Sub-Cuisine Row: Appears when a specific primary cuisine is selected */}
      {currentCategory && currentCategory.subCuisines.length > 0 && (
        <div className="pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 shrink-0">
            {currentCategory.name} Regions:
          </span>

          <button
            type="button"
            onClick={() => onSelectSubCuisine('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedSubCuisine === 'all'
                ? 'bg-emerald-100 text-emerald-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            All {currentCategory.name}
          </button>

          {currentCategory.subCuisines.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelectSubCuisine(sub.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSubCuisine === sub.id
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Spice Level Row */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Spice Level:</span>
          </span>

          <div className="flex items-center gap-1">
            {(['all', 'Mild', 'Medium', 'Spicy', 'Extra Hot'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onSelectSpice(level)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                  selectedSpice === level
                    ? 'bg-stone-800 text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {level === 'all' ? 'Any Heat' : level}
              </button>
            ))}
          </div>
        </div>

        {currentCategory && (
          <span className="text-[11px] text-stone-400 italic hidden md:inline">
            {currentCategory.tagline}
          </span>
        )}
      </div>
    </div>
  );
};
