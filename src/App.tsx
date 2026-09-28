/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera,
  Sparkles,
  HelpCircle,
  Clock,
  CheckCircle2,
  ChefHat,
  Filter,
  Search,
  ShoppingBag,
  ArrowRight,
  Info,
  Leaf,
  Flame,
  Heart,
  Activity,
  User,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { Header } from './components/Header';
import { FridgeScanner } from './components/FridgeScanner';
import { DetectedIngredientsList } from './components/DetectedIngredientsList';
import { RecipeCard } from './components/RecipeCard';
import { CookingModal } from './components/CookingModal';
import { PantryCatalogPicker } from './components/PantryCatalogPicker';
import { ApiExplainerModal } from './components/ApiExplainerModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { DietarySelector } from './components/DietarySelector';
import { CuisineSelectorBar } from './components/CuisineSelectorBar';
import { CuisinePreferencesModal } from './components/CuisinePreferencesModal';
import { ShoppingListModal } from './components/ShoppingListModal';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import { HeroHomeSection } from './components/HeroHomeSection';
import { SuggestedForYouSection } from './components/SuggestedForYouSection';
import { MealPlannerModal } from './components/MealPlannerModal';
import { PRESET_FRIDGES, heroFridgeImg } from './data/presetScans';
import { OFFLINE_RECIPES_DATABASE } from './data/offlineRecipes';
import { matchRecipesWithIngredients } from './utils/recipeMatcher';
import { enrichIngredientsWithExpiry, estimateShelfLifeDays } from './utils/expiryEstimator';
import {
  IngredientItem,
  Recipe,
  ScanResult,
  GoogleUserProfile,
  FoodType,
  SpiceLevel,
  ShoppingItem,
} from './types';

export default function App() {
  // Status & environment
  const [isAiAvailable, setIsAiAvailable] = useState<boolean>(true);
  const [apiChecked, setApiChecked] = useState<boolean>(false);

  // User Google Account Authentication state
  const [currentUser, setCurrentUser] = useState<GoogleUserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('fridgechef_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fridgechef_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Grocery Shopping List state
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('fridgechef_shopping_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active scan & inventory state (lightweight starter: only 2 essentials pre-selected)
  const initialStarterIngredients: IngredientItem[] = [
    {
      name: 'Eggs',
      category: 'Dairy',
      quantityEstimate: '4 large eggs',
      freshnessNotice: 'Fresh condition',
      expiresInDays: 7,
      priority: 'Normal',
    },
    {
      name: 'Tomatoes',
      category: 'Produce',
      quantityEstimate: '2 ripe tomatoes',
      freshnessNotice: 'Sweet & ripe',
      expiresInDays: 4,
      priority: 'Normal',
    },
  ];
  const initialEnrichedIngredients = enrichIngredientsWithExpiry(initialStarterIngredients);
  const initialRecipes = matchRecipesWithIngredients(initialEnrichedIngredients);

  const [activeScan, setActiveScan] = useState<ScanResult>({
    source: 'standalone-engine',
    fridgeSummary: 'Started light with 2 sample pantry essentials. Snap your fridge photo or add items to explore more dishes.',
    detectedIngredients: initialEnrichedIngredients,
    recipes: initialRecipes,
    imageUrl: undefined,
  });

  // UI modals
  const [personalGeminiApiKey, setPersonalGeminiApiKey] = useState<string>(
    () => currentUser?.personalGeminiApiKey || localStorage.getItem('user_gemini_api_key') || ''
  );
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);
  const [isPantryPickerOpen, setIsPantryPickerOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState<boolean>(false);
  const [isCuisinePrefsOpen, setIsCuisinePrefsOpen] = useState<boolean>(false);
  const [isMealPlannerOpen, setIsMealPlannerOpen] = useState<boolean>(false);
  const [isRescueModeActive, setIsRescueModeActive] = useState<boolean>(false);

  // Cuisine & Regional Sub-Cuisine Filters
  const [selectedCuisine, setSelectedCuisine] = useState<string>(
    currentUser?.savedCuisinePreference || 'all'
  );
  const [selectedSubCuisine, setSelectedSubCuisine] = useState<string>(
    currentUser?.savedSubCuisinePreference || 'all'
  );
  const [selectedSpice, setSelectedSpice] = useState<SpiceLevel | 'all'>(
    currentUser?.savedSpicePreference || 'all'
  );

  // Dietary foodType & secondary tabs
  const [dietaryType, setDietaryType] = useState<FoodType | 'all'>(
    currentUser?.savedDietaryPreference || 'all'
  );
  const [filterTab, setFilterTab] = useState<'all' | 'ready' | 'quick' | 'high-protein' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist user and favorites
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fridgechef_google_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fridgechef_google_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fridgechef_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('fridgechef_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Check server environment capabilities
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setIsAiAvailable(Boolean(data.hasGeminiKey));
        setApiChecked(true);
      })
      .catch((err) => {
        console.warn('Status check notice:', err);
        setIsAiAvailable(false);
        setApiChecked(true);
      });
  }, []);

  // Custom recipes added dynamically from AI scans
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);

  // Update recipes whenever detected ingredients change
  const currentIngredientNames = useMemo(
    () => activeScan.detectedIngredients.map((i) => i.name),
    [activeScan.detectedIngredients]
  );

  const allCandidateRecipes = useMemo(() => {
    return [...customRecipes, ...OFFLINE_RECIPES_DATABASE];
  }, [customRecipes]);

  const matchedRecipes = useMemo(() => {
    return matchRecipesWithIngredients(
      activeScan.detectedIngredients,
      allCandidateRecipes
    );
  }, [activeScan.detectedIngredients, allCandidateRecipes]);

  // Calculate dietary counts for badges
  const dietaryCounts = useMemo(() => {
    const counts = {
      all: matchedRecipes.length,
      veg: 0,
      'non-veg': 0,
      vegan: 0,
      egg: 0,
    };
    matchedRecipes.forEach((r) => {
      if (r.foodType === 'veg') counts.veg++;
      if (r.foodType === 'non-veg') counts['non-veg']++;
      if (r.foodType === 'vegan') counts.vegan++;
      if (r.foodType === 'egg') counts.egg++;
    });
    return counts;
  }, [matchedRecipes]);

  // Urgent expiring ingredients list (< 3 days left or High priority)
  const urgentIngredientNames = useMemo(() => {
    return activeScan.detectedIngredients
      .filter(
        (i) =>
          (i.expiresInDays !== undefined && i.expiresInDays <= 2) ||
          i.priority === 'High (use first)'
      )
      .map((i) => i.name.toLowerCase());
  }, [activeScan.detectedIngredients]);

  // Filtered recipes with Cuisine, Sub-Cuisine, Spice, Dietary, Rescue Mode, and Tabs
  const filteredRecipes = useMemo(() => {
    return matchedRecipes.filter((recipe) => {
      // 0. Rescue Mode Filter: only include recipes using urgent items if active
      if (isRescueModeActive && urgentIngredientNames.length > 0) {
        const rescuesAny = recipe.matchedIngredients.some((m) =>
          urgentIngredientNames.some(
            (u) => m.toLowerCase().includes(u) || u.includes(m.toLowerCase())
          )
        );
        if (!rescuesAny) return false;
      }

      // 1. Primary Cuisine Filter
      if (selectedCuisine !== 'all') {
        const normRecCuisine = (recipe.cuisine || '').toLowerCase();
        const normSelCuisine = selectedCuisine.toLowerCase();
        if (!normRecCuisine.includes(normSelCuisine) && !normSelCuisine.includes(normRecCuisine)) {
          return false;
        }
      }

      // 2. Regional Sub-Cuisine Filter
      if (selectedSubCuisine !== 'all') {
        const normRecSub = (recipe.subCuisine || '').toLowerCase().replace(/[^a-z]/g, '');
        const normSelSub = selectedSubCuisine.toLowerCase().replace(/[^a-z]/g, '');
        if (!normRecSub.includes(normSelSub) && !normSelSub.includes(normRecSub)) {
          return false;
        }
      }

      // 3. Spice Level Filter
      if (selectedSpice !== 'all') {
        if (recipe.spiceLevel && recipe.spiceLevel !== selectedSpice) {
          return false;
        }
      }

      // 4. Dietary Type Filter
      if (dietaryType !== 'all') {
        if (dietaryType === 'veg' && recipe.foodType !== 'veg' && recipe.foodType !== 'vegan') {
          return false;
        }
        if (dietaryType === 'non-veg' && recipe.foodType !== 'non-veg') {
          return false;
        }
        if (dietaryType === 'vegan' && recipe.foodType !== 'vegan') {
          return false;
        }
        if (dietaryType === 'egg' && recipe.foodType !== 'egg') {
          return false;
        }
      }

      // 5. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(q);
        const matchesCuisine = (recipe.cuisine || '').toLowerCase().includes(q);
        const matchesSubCuisine = (recipe.subCuisine || '').toLowerCase().includes(q);
        const matchesIngredient = recipe.matchedIngredients.some((i) => i.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCuisine && !matchesSubCuisine && !matchesIngredient) return false;
      }

      // 6. Tab filter
      if (filterTab === 'favorites') {
        return favorites.includes(recipe.id);
      }
      if (filterTab === 'ready') {
        return recipe.matchScore >= 95;
      }
      if (filterTab === 'quick') {
        return recipe.prepTimeMinutes + recipe.cookTimeMinutes <= 25;
      }
      if (filterTab === 'high-protein') {
        return (
          (recipe.nutritionalFacts?.protein || 0) >= 18 ||
          recipe.dietaryTags.some((t) => t.toLowerCase().includes('protein'))
        );
      }

      return true;
    });
  }, [
    matchedRecipes,
    selectedCuisine,
    selectedSubCuisine,
    selectedSpice,
    dietaryType,
    filterTab,
    searchQuery,
    favorites,
    isRescueModeActive,
    urgentIngredientNames,
  ]);

  // Sort recipes: recipes that rescue more urgent ingredients appear first
  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort((a, b) => {
      if (urgentIngredientNames.length > 0) {
        const aRescue = a.matchedIngredients.filter((m) =>
          urgentIngredientNames.some((u) => m.toLowerCase().includes(u) || u.includes(m.toLowerCase()))
        ).length;
        const bRescue = b.matchedIngredients.filter((m) =>
          urgentIngredientNames.some((u) => m.toLowerCase().includes(u) || u.includes(m.toLowerCase()))
        ).length;
        if (bRescue !== aRescue) return bRescue - aRescue;
      }
      return b.matchScore - a.matchScore;
    });
  }, [filteredRecipes, urgentIngredientNames]);

  // Handlers for modifying ingredients
  const handleAddIngredient = (newItem: IngredientItem) => {
    setActiveScan((prev) => ({
      ...prev,
      detectedIngredients: [newItem, ...prev.detectedIngredients],
    }));
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setActiveScan((prev) => ({
      ...prev,
      detectedIngredients: prev.detectedIngredients.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleClearAll = () => {
    setActiveScan((prev) => ({
      ...prev,
      detectedIngredients: [],
    }));
  };

  const handleUpdateIngredientExpiry = (index: number, days: number) => {
    setActiveScan((prev) => {
      const copy = [...prev.detectedIngredients];
      if (copy[index]) {
        copy[index] = {
          ...copy[index],
          expiresInDays: days,
          priority: days <= 2 ? 'High (use first)' : 'Normal',
          isRescueUrgent: days <= 2,
          freshnessNotice:
            days <= 1
              ? 'Use today or tomorrow'
              : days <= 3
              ? `Use within ${days} days`
              : 'Fresh condition',
        };
      }
      return { ...prev, detectedIngredients: copy };
    });
  };

  const handleAddMultipleToGrocery = (items: string[]) => {
    const newItems: ShoppingItem[] = items.map((name) => ({
      id: `grocery-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      completed: false,
    }));
    setShoppingList((prev) => [...prev, ...newItems]);
    setIsShoppingListOpen(true);
  };

  const handleTogglePantryItem = (name: string, category: IngredientItem['category']) => {
    const exists = activeScan.detectedIngredients.some(
      (i) => i.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setActiveScan((prev) => ({
        ...prev,
        detectedIngredients: prev.detectedIngredients.filter(
          (i) => i.name.toLowerCase() !== name.toLowerCase()
        ),
      }));
    } else {
      setActiveScan((prev) => ({
        ...prev,
        detectedIngredients: [
          { name, category, quantityEstimate: 'Available' },
          ...prev.detectedIngredients,
        ],
      }));
    }
  };

  const handleScanComplete = (result: ScanResult) => {
    const enriched = {
      ...result,
      detectedIngredients: enrichIngredientsWithExpiry(result.detectedIngredients),
    };
    setActiveScan(enriched);
    // Smooth scroll to results
    const resultsEl = document.getElementById('recipes-section');
    resultsEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    const enriched = enrichIngredientsWithExpiry(initialStarterIngredients);
    const initialMatched = matchRecipesWithIngredients(enriched);
    setActiveScan({
      source: 'standalone-engine',
      fridgeSummary: 'Started light with 2 sample essentials. Snap a photo or edit ingredients to explore dishes.',
      detectedIngredients: enriched,
      recipes: initialMatched,
      imageUrl: undefined,
    });
    setSearchQuery('');
    setFilterTab('all');
    setDietaryType('all');
    setSelectedCuisine('all');
    setSelectedSubCuisine('all');
    setSelectedSpice('all');
    setIsRescueModeActive(false);
  };

  // Toggle favorite
  const handleToggleFavorite = (recipeId: string) => {
    setFavorites((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  // Add missing ingredients to grocery list
  const handleAddMissingToGrocery = (recipe: Recipe) => {
    const missing = recipe.missingOrStapleIngredients.map((ing) => ({
      id: `grocery-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: ing.name,
      recipeTitle: recipe.title,
      completed: false,
    }));

    setShoppingList((prev) => [...prev, ...missing]);
    setIsShoppingListOpen(true);
  };

  // Save permanent user culinary preferences
  const handleSavePreferences = (prefs: {
    cuisine?: string;
    subCuisine?: string;
    spice?: SpiceLevel;
    dietary?: FoodType | 'all';
  }) => {
    if (prefs.cuisine) setSelectedCuisine(prefs.cuisine);
    if (prefs.subCuisine) setSelectedSubCuisine(prefs.subCuisine);
    if (prefs.spice) setSelectedSpice(prefs.spice);
    if (prefs.dietary) setDietaryType(prefs.dietary);

    if (currentUser) {
      const updated: GoogleUserProfile = {
        ...currentUser,
        savedCuisinePreference: prefs.cuisine,
        savedSubCuisinePreference: prefs.subCuisine,
        savedSpicePreference: prefs.spice,
        savedDietaryPreference: prefs.dietary,
      };
      setCurrentUser(updated);
    }
  };

  // Add newly generated AI recipes into state
  const handleAddNewAiRecipes = (newRecipes: Recipe[]) => {
    setActiveScan((prev) => ({
      ...prev,
      recipes: [...newRecipes, ...prev.recipes],
    }));
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col antialiased">
      {/* Android PWA / Play Store Install Banner */}
      <AndroidInstallBanner />

      {/* Top Bar Header */}
      <Header
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenScanner={() => {
          const el = document.getElementById('scanner-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenPantry={() => setIsPantryPickerOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenShoppingList={() => setIsShoppingListOpen(true)}
        onOpenMealPlanner={() => setIsMealPlannerOpen(true)}
        onReset={handleReset}
        hasActiveScan={activeScan.detectedIngredients.length > 0}
        isAiActive={isAiAvailable}
        currentUser={currentUser}
        shoppingListCount={shoppingList.filter((i) => !i.completed).length}
        favoritesCount={favorites.length}
        onFilterFavorites={() => {
          setFilterTab('favorites');
          const el = document.getElementById('recipes-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 w-full">
        {/* Editorial Hero Landing Section */}
        <HeroHomeSection
          onScanClick={() => {
            const el = document.getElementById('scanner-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectPreset={(preset) => {
            const enriched = enrichIngredientsWithExpiry(preset.ingredients);
            const initialMatched = matchRecipesWithIngredients(enriched);
            setActiveScan({
              source: 'standalone-engine',
              fridgeSummary: `Preset Loaded: ${preset.description}`,
              detectedIngredients: enriched,
              recipes: initialMatched,
              imageUrl: preset.image,
            });
            const resultsEl = document.getElementById('recipes-section');
            resultsEl?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenExplainer={() => setIsExplainerOpen(true)}
          onExploreCuisines={() => setIsCuisinePrefsOpen(true)}
          isAiAvailable={isAiAvailable}
        />

        {/* Simplified 3-Step Workflow Quick-Jump Strip */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-1.5 sm:p-2 shadow-xs grid grid-cols-3 gap-1 sm:gap-2 text-xs font-semibold">
          <button
            onClick={() => document.getElementById('scanner-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-xl hover:bg-stone-100/70 text-stone-700 transition-colors cursor-pointer text-center"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
            <span className="truncate">Scan Fridge</span>
          </button>
          <button
            onClick={() => document.getElementById('ingredients-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-xl hover:bg-stone-100/70 text-stone-700 transition-colors cursor-pointer text-center"
          >
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
            <span className="truncate">Review ({activeScan.detectedIngredients.length})</span>
          </button>
          <button
            onClick={() => document.getElementById('recipes-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-xl hover:bg-stone-100/70 text-stone-700 transition-colors cursor-pointer text-center"
          >
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
            <span className="truncate">Cook ({filteredRecipes.length})</span>
          </button>
        </div>

        {/* Scanner & Photo Upload Section */}
        <section id="scanner-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                1. Provide Fridge Photo
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Upload your kitchen photo, take a picture, or select a preset to see instantaneous results.
              </p>
            </div>
          </div>

          <FridgeScanner
            onScanComplete={handleScanComplete}
            isAiAvailable={Boolean(personalGeminiApiKey)}
            personalGeminiApiKey={personalGeminiApiKey}
            onOpenAuth={() => setIsAuthOpen(true)}
            cuisinePreference={selectedCuisine}
            subCuisinePreference={selectedSubCuisine}
            spicePreference={selectedSpice}
            dietaryPreference={dietaryType}
          />
        </section>

        {/* Current Fridge Inventory Bar */}
        <section id="ingredients-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                2. Identified Ingredients
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Review what was detected. Add or remove any items to tailor the recipes to your pantry.
              </p>
            </div>

            <button
              onClick={() => setIsPantryPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span>Browse Full Pantry Catalog</span>
            </button>
          </div>

          <DetectedIngredientsList
            ingredients={activeScan.detectedIngredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            onClearAll={handleClearAll}
            source={activeScan.source}
            onToggleRescueMode={() => setIsRescueModeActive((prev) => !prev)}
            isRescueModeActive={isRescueModeActive}
            onUpdateIngredientExpiry={handleUpdateIngredientExpiry}
          />
        </section>

        {/* Zero-Waste Smart Meal Planner Callout Card */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                AI Zero-Waste Feature
              </span>
              <span className="text-xs text-emerald-200">
                🌱 100% Waste Diversion
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Multi-Day Smart Meal Planner ("Prep My Week")
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Have fragile ingredients like greens, milk, or chicken? Generate a 3 or 7-day culinary schedule that organizes meals by perishable shelf life—saving money while ensuring zero food waste.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMealPlannerOpen(true)}
              className="px-5 py-3 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2"
            >
              <span>Open 3 & 7 Day Planner</span>
              <ArrowRight className="w-4 h-4 text-emerald-800" />
            </button>
          </div>
        </div>

        {/* Matching Dishes / Recipes Section */}
        <section id="recipes-section" className="space-y-6">
          <div className="space-y-4 border-b border-stone-200 pb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    3. Exact Dishes You Can Make
                  </h2>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full tabular-nums">
                    {filteredRecipes.length} dishes found
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Filtered by cuisine, regional tastes & highest fridge match score. Click any dish for step-by-step cooking steps.
                </p>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes, ingredients, regional cuisines..."
                  className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Hierarchical Cuisine & Regional Sub-Cuisine Selector Bar */}
            <CuisineSelectorBar
              selectedCuisine={selectedCuisine}
              selectedSubCuisine={selectedSubCuisine}
              selectedSpice={selectedSpice}
              onSelectCuisine={(c) => setSelectedCuisine(c)}
              onSelectSubCuisine={(s) => setSelectedSubCuisine(s)}
              onSelectSpice={(sp) => setSelectedSpice(sp)}
              onOpenPreferencesModal={() => setIsCuisinePrefsOpen(true)}
            />

            {/* Selectors Bar: Dietary Selector + Secondary Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {/* Veg / Non-Veg / Vegan / Egg Selectors */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Dietary Filter:
                </span>
                <DietarySelector
                  selectedType={dietaryType}
                  onSelectType={(t) => setDietaryType(t)}
                  counts={dietaryCounts}
                />
              </div>

              {/* Secondary Category Filters */}
              <div className="space-y-1 self-start sm:self-auto">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Preferences:
                </span>
                <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      filterTab === 'all'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterTab('ready')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      filterTab === 'ready'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    100% Match
                  </button>
                  <button
                    onClick={() => setFilterTab('quick')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      filterTab === 'quick'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    &lt;25 Mins
                  </button>
                  <button
                    onClick={() => setFilterTab('high-protein')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      filterTab === 'high-protein'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    High Protein
                  </button>
                  <button
                    onClick={() => setFilterTab('favorites')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                      filterTab === 'favorites'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>Favorites ({favorites.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested for You (Personalized Palate & Preferences Showcase) */}
          <SuggestedForYouSection
            allRecipes={matchedRecipes}
            currentUser={currentUser}
            selectedCuisine={selectedCuisine}
            selectedSubCuisine={selectedSubCuisine}
            selectedSpice={selectedSpice}
            dietaryType={dietaryType}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onAddMissingToGrocery={handleAddMissingToGrocery}
            onOpenPreferences={() => setIsCuisinePrefsOpen(true)}
            onAddNewAiRecipes={handleAddNewAiRecipes}
            currentIngredients={currentIngredientNames}
            isAiAvailable={isAiAvailable}
          />

          {/* Main Recipe Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                All Matching Recipes ({filteredRecipes.length})
              </h3>
              <span className="text-xs text-stone-500">
                Sorted by available ingredients in your fridge
              </span>
            </div>

            {sortedRecipes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                <ChefHat className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="text-base font-semibold text-stone-800">
                  No matching recipes found for this filter combination
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Try switching the cuisine to "All Cuisines", turning off Rescue Mode, changing the dietary selector to "All Dishes", or adding a few more ingredients from your pantry above.
                </p>
                <button
                  onClick={() => {
                    setFilterTab('all');
                    setDietaryType('all');
                    setSelectedCuisine('all');
                    setSelectedSubCuisine('all');
                    setSelectedSpice('all');
                    setSearchQuery('');
                    setIsRescueModeActive(false);
                  }}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  Reset All Filters & Rescue Mode
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelectRecipe={(r) => setSelectedRecipe(r)}
                    isFavorite={favorites.includes(recipe.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onAddMissingToGrocery={handleAddMissingToGrocery}
                    urgentIngredientsList={urgentIngredientNames}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Quiet, Compliant Footer */}
      <footer className="mt-16 bg-white border-t border-stone-200 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-stone-800 text-sm">FridgeChef</span>
              <span>·</span>
              <span>Production Zero-Waste Recipe Engine · Regional Cuisines · PWA & Android Store Ready</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-stone-600">
              <button
                onClick={() => setIsMealPlannerOpen(true)}
                className="hover:text-stone-900 transition-colors cursor-pointer font-semibold text-emerald-800"
              >
                Zero-Waste Meal Planner
              </button>
              <button
                onClick={() => setIsCuisinePrefsOpen(true)}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                Cuisine Preferences
              </button>
              <button
                onClick={() => setIsExplainerOpen(true)}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                How It Works & Free API Guide
              </button>
              <button
                onClick={() => setIsPantryPickerOpen(true)}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                Pantry Catalog
              </button>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                {currentUser ? `Account: ${currentUser.name}` : 'Sign in with Google'}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
            <span>© {new Date().getFullYear()} FridgeChef. All recipes crafted for zero food waste.</span>
            <div className="flex items-center gap-1.5 font-medium text-stone-600 bg-stone-50 px-3 py-1 rounded-full border border-stone-200/60 shadow-2xs">
              <span>Built with love</span>
              <span className="text-rose-500">❤️</span>
              <span className="font-semibold text-stone-800">: DP</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <CookingModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        availableIngredients={currentIngredientNames}
        onAddMissingToGrocery={handleAddMissingToGrocery}
      />

      <MealPlannerModal
        isOpen={isMealPlannerOpen}
        onClose={() => setIsMealPlannerOpen(false)}
        ingredients={activeScan.detectedIngredients}
        availableRecipes={activeScan.recipes.length > 0 ? activeScan.recipes : OFFLINE_RECIPES_DATABASE}
        onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
        onAddMultipleToGrocery={handleAddMultipleToGrocery}
        initialDietary={dietaryType}
      />

      <PantryCatalogPicker
        isOpen={isPantryPickerOpen}
        onClose={() => setIsPantryPickerOpen(false)}
        currentIngredients={activeScan.detectedIngredients}
        onToggleItem={handleTogglePantryItem}
        onClearAll={handleClearAll}
      />

      <ApiExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        isAiActive={isAiAvailable}
      />

      <GoogleAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSignIn={(user) => {
          setCurrentUser(user);
          if (user.personalGeminiApiKey !== undefined) {
            setPersonalGeminiApiKey(user.personalGeminiApiKey);
          }
        }}
        onSignOut={() => {
          setCurrentUser(null);
          setPersonalGeminiApiKey('');
        }}
        onSavePersonalKey={(key) => setPersonalGeminiApiKey(key)}
      />

      <ShoppingListModal
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        items={shoppingList}
        onToggleItem={(id) =>
          setShoppingList((prev) =>
            prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
          )
        }
        onRemoveItem={(id) => setShoppingList((prev) => prev.filter((item) => item.id !== id))}
        onAddItem={(name) =>
          setShoppingList((prev) => [
            ...prev,
            { id: `custom-${Date.now()}`, name, completed: false },
          ])
        }
        onClearCompleted={() => setShoppingList((prev) => prev.filter((item) => !item.completed))}
      />

      <CuisinePreferencesModal
        isOpen={isCuisinePrefsOpen}
        onClose={() => setIsCuisinePrefsOpen(false)}
        currentUser={currentUser}
        onSavePreferences={handleSavePreferences}
        currentCuisine={selectedCuisine}
        currentSubCuisine={selectedSubCuisine}
        currentSpice={selectedSpice}
        currentDietary={dietaryType}
      />
    </div>
  );
}
