import React from 'react';
import { FoodType } from '../types';

interface DietarySelectorProps {
  selectedType: FoodType | 'all';
  onSelectType: (type: FoodType | 'all') => void;
  counts: {
    all: number;
    veg: number;
    'non-veg': number;
    vegan: number;
    egg: number;
  };
}

export const DietarySelector: React.FC<DietarySelectorProps> = ({
  selectedType,
  onSelectType,
  counts,
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* All Option */}
      <button
        type="button"
        onClick={() => onSelectType('all')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
          selectedType === 'all'
            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
            : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300'
        }`}
      >
        <span>All Dishes</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
          selectedType === 'all' ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
        }`}>
          {counts.all}
        </span>
      </button>

      {/* Pure Veg (Standard Indian Green Square with Dot) */}
      <button
        type="button"
        onClick={() => onSelectType('veg')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
          selectedType === 'veg'
            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 shadow-xs'
            : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-400'
        }`}
      >
        {/* Official Veg Symbol: Green square with green circle */}
        <span className="w-3.5 h-3.5 border border-emerald-600 p-[2px] rounded-xs flex items-center justify-center bg-white shrink-0">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
        </span>
        <span>Veg</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
          selectedType === 'veg' ? 'bg-emerald-200/80 text-emerald-900' : 'bg-stone-100 text-stone-500'
        }`}>
          {counts.veg}
        </span>
      </button>

      {/* Non-Veg (Standard Red/Brown Square with Dot) */}
      <button
        type="button"
        onClick={() => onSelectType('non-veg')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
          selectedType === 'non-veg'
            ? 'bg-rose-50 border-rose-600 text-rose-950 ring-1 ring-rose-600 shadow-xs'
            : 'bg-white border-stone-200 text-stone-700 hover:border-rose-400'
        }`}
      >
        {/* Official Non-Veg Symbol: Red/Brown square with red triangle or circle */}
        <span className="w-3.5 h-3.5 border border-rose-600 p-[2px] rounded-xs flex items-center justify-center bg-white shrink-0">
          <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
        </span>
        <span>Non-Veg</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
          selectedType === 'non-veg' ? 'bg-rose-200/80 text-rose-900' : 'bg-stone-100 text-stone-500'
        }`}>
          {counts['non-veg']}
        </span>
      </button>

      {/* Vegan */}
      <button
        type="button"
        onClick={() => onSelectType('vegan')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
          selectedType === 'vegan'
            ? 'bg-teal-50 border-teal-600 text-teal-950 ring-1 ring-teal-600 shadow-xs'
            : 'bg-white border-stone-200 text-stone-700 hover:border-teal-400'
        }`}
      >
        <span className="text-teal-700 text-xs">🌱</span>
        <span>Vegan</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
          selectedType === 'vegan' ? 'bg-teal-200/80 text-teal-900' : 'bg-stone-100 text-stone-500'
        }`}>
          {counts.vegan}
        </span>
      </button>

      {/* Eggitarian */}
      <button
        type="button"
        onClick={() => onSelectType('egg')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
          selectedType === 'egg'
            ? 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-600 shadow-xs'
            : 'bg-white border-stone-200 text-stone-700 hover:border-amber-400'
        }`}
      >
        <span className="text-amber-700 text-xs">🥚</span>
        <span>Eggitarian</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
          selectedType === 'egg' ? 'bg-amber-200/80 text-amber-900' : 'bg-stone-100 text-stone-500'
        }`}>
          {counts.egg}
        </span>
      </button>
    </div>
  );
};
