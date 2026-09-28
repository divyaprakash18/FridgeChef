import React from 'react';
import { Camera, Sparkles, HelpCircle, RefreshCw, ShoppingBag, Heart, User } from 'lucide-react';
import { GoogleUserProfile } from '../types';

interface HeaderProps {
  onOpenExplainer: () => void;
  onOpenScanner: () => void;
  onOpenPantry: () => void;
  onOpenAuth: () => void;
  onOpenShoppingList: () => void;
  onOpenMealPlanner: () => void;
  onReset: () => void;
  hasActiveScan: boolean;
  isAiActive: boolean;
  currentUser: GoogleUserProfile | null;
  shoppingListCount: number;
  favoritesCount: number;
  onFilterFavorites: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExplainer,
  onOpenScanner,
  onOpenPantry,
  onOpenAuth,
  onOpenShoppingList,
  onOpenMealPlanner,
  onReset,
  hasActiveScan,
  isAiActive,
  currentUser,
  shoppingListCount,
  favoritesCount,
  onFilterFavorites,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onReset}
          className="text-left font-serif text-2xl font-bold tracking-tight text-stone-900 hover:text-emerald-800 transition-colors cursor-pointer shrink-0"
        >
          FridgeChef
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={onOpenScanner}
            className="hover:text-stone-900 transition-colors cursor-pointer"
          >
            Scan Photo
          </button>
          <button
            onClick={onOpenPantry}
            className="hover:text-stone-900 transition-colors cursor-pointer"
          >
            Fridge Inventory
          </button>
          <button
            onClick={onOpenMealPlanner}
            className="flex items-center gap-1.5 text-emerald-800 font-semibold hover:text-emerald-950 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Meal Planner</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('preset-scans-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-stone-900 transition-colors cursor-pointer"
          >
            Sample Fridges
          </button>
          <button
            onClick={onOpenExplainer}
            className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer text-stone-600"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>APIs & Guide</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Google Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Meal Planner quick button */}
          <button
            onClick={onOpenMealPlanner}
            title="Open Zero-Waste Meal Planner"
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <span>📅</span>
            <span className="hidden sm:inline">Plan Week</span>
          </button>
          {/* Favorites Button */}
          {favoritesCount > 0 && (
            <button
              onClick={onFilterFavorites}
              title="View favorite recipes"
              className="p-2 text-stone-600 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer relative"
            >
              <Heart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            </button>
          )}

          {/* Shopping List Button */}
          <button
            onClick={onOpenShoppingList}
            title="Open Grocery Shopping List"
            className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4" />
            {shoppingListCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                {shoppingListCount}
              </span>
            )}
          </button>

          {/* Google Account Profile Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-stone-200 hover:border-emerald-600/70 bg-stone-50 hover:bg-white transition-all cursor-pointer text-xs font-medium text-stone-800"
          >
            {currentUser ? (
              <>
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full border border-emerald-500 object-cover"
                />
                <span className="hidden sm:inline font-semibold truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Google Login</span>
              </>
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan Fridge</span>
            <span className="sm:hidden">Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
