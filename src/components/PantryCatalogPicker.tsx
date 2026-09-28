import React, { useState } from 'react';
import { X, Search, Check, Plus } from 'lucide-react';
import { COMMON_PANTRY_CATEGORIES } from '../data/pantryDatabase';
import { IngredientItem } from '../types';

interface PantryCatalogPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentIngredients: IngredientItem[];
  onToggleItem: (name: string, category: IngredientItem['category']) => void;
}

export const PantryCatalogPicker: React.FC<PantryCatalogPickerProps> = ({
  isOpen,
  onClose,
  currentIngredients,
  onToggleItem,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const currentNames = currentIngredients.map((i) => i.name.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Interactive Fridge & Pantry Inventory
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Tap any item to toggle it in your current fridge inventory. Recipes update instantly!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-stone-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search produce, cheeses, proteins, staples..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {COMMON_PANTRY_CATEGORIES.map((cat) => {
            const filteredItems = cat.items.filter((item) =>
              item.toLowerCase().includes(search.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={cat.category} className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {cat.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filteredItems.map((item) => {
                    const isSelected = currentNames.includes(item.toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => onToggleItem(item, cat.category as any)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-stone-400" />
                        )}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            {currentIngredients.length} ingredients selected in fridge
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            Done & View Dishes
          </button>
        </div>
      </div>
    </div>
  );
};
