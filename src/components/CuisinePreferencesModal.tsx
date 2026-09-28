import React, { useState } from 'react';
import { X, Check, Globe, Flame, Sparkles, ChefHat } from 'lucide-react';
import { CUISINE_TAXONOMY } from '../data/cuisineDatabase';
import { GoogleUserProfile, SpiceLevel, FoodType } from '../types';

interface CuisinePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GoogleUserProfile | null;
  onSavePreferences: (prefs: {
    cuisine?: string;
    subCuisine?: string;
    spice?: SpiceLevel;
    dietary?: FoodType | 'all';
  }) => void;
  currentCuisine: string;
  currentSubCuisine: string;
  currentSpice: SpiceLevel | 'all';
  currentDietary: FoodType | 'all';
}

export const CuisinePreferencesModal: React.FC<CuisinePreferencesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSavePreferences,
  currentCuisine,
  currentSubCuisine,
  currentSpice,
  currentDietary,
}) => {
  if (!isOpen) return null;

  const [tempCuisine, setTempCuisine] = useState(currentCuisine);
  const [tempSubCuisine, setTempSubCuisine] = useState(currentSubCuisine);
  const [tempSpice, setTempSpice] = useState<SpiceLevel | 'all'>(currentSpice);
  const [tempDietary, setTempDietary] = useState<FoodType | 'all'>(currentDietary);

  const selectedCategory = CUISINE_TAXONOMY.find((c) => c.id === tempCuisine);

  const handleSave = () => {
    onSavePreferences({
      cuisine: tempCuisine,
      subCuisine: tempSubCuisine,
      spice: tempSpice === 'all' ? undefined : tempSpice,
      dietary: tempDietary,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Culinary Preferences & Regional Tastes
              </h3>
              <p className="text-xs text-stone-500">
                Personalize recipes generated for your kitchen & saved in your profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Primary Cuisine */}
          <div className="space-y-2">
            <label className="font-bold text-stone-900 uppercase tracking-wider block">
              Primary Cuisine Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTempCuisine('all');
                  setTempSubCuisine('all');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tempCuisine === 'all'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                }`}
              >
                <span className="text-base block mb-0.5">🌍</span>
                <span className="font-semibold block">All Cuisines</span>
                <span className="text-[10px] text-stone-400">Discover everything</span>
              </button>

              {CUISINE_TAXONOMY.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setTempCuisine(c.id);
                    setTempSubCuisine('all');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tempCuisine === c.id
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                  }`}
                >
                  <span className="text-base block mb-0.5">{c.flag}</span>
                  <span className="font-semibold block">{c.name}</span>
                  <span className="text-[10px] text-stone-400 truncate block">
                    {c.subCuisines.length} regions
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Regional Sub-Cuisine */}
          {selectedCategory && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="font-bold text-stone-900 uppercase tracking-wider block">
                Regional Sub-Cuisine ({selectedCategory.name})
              </label>
              <div className="space-y-2">
                <div
                  onClick={() => setTempSubCuisine('all')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    tempSubCuisine === 'all'
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 font-bold'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div>
                    <span className="block font-semibold">All Regional Styles</span>
                    <span className="text-[10px] text-stone-500">
                      Mix and match all styles of {selectedCategory.name} cooking
                    </span>
                  </div>
                  {tempSubCuisine === 'all' && <Check className="w-4 h-4 text-emerald-700" />}
                </div>

                {selectedCategory.subCuisines.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setTempSubCuisine(sub.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      tempSubCuisine === sub.id
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-600'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="block font-bold text-stone-900">{sub.name}</span>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                        {sub.description}
                      </p>
                      <div className="flex gap-1.5 flex-wrap mt-1 text-[10px] text-emerald-700 font-medium">
                        {sub.popularDishes.slice(0, 3).map((d) => (
                          <span key={d} className="bg-stone-100 px-1.5 py-0.2 rounded">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    {tempSubCuisine === sub.id && (
                      <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Spice Preference */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="font-bold text-stone-900 uppercase tracking-wider block">
              Default Spice Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Mild', desc: 'Family & kids friendly', icon: '🌶️' },
                { label: 'Medium', desc: 'Balanced warm spices', icon: '🌶️🌶️' },
                { label: 'Spicy', desc: 'Authentic kick', icon: '🌶️🌶️🌶️' },
                { label: 'Extra Hot', desc: 'Fiery street level', icon: '🔥' },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setTempSpice(s.label as SpiceLevel)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    tempSpice === s.label
                      ? 'border-amber-500 bg-amber-50/50 text-amber-950 font-bold ring-1 ring-amber-500'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="text-sm block">{s.icon}</span>
                  <span className="font-bold text-xs block mt-0.5">{s.label}</span>
                  <span className="text-[9px] text-stone-400 block truncate">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => {
              setTempCuisine('all');
              setTempSubCuisine('all');
              setTempSpice('all');
              setTempDietary('all');
            }}
            className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
          >
            Reset to defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
