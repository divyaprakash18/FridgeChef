export interface IngredientItem {
  name: string;
  category: 'Produce' | 'Dairy' | 'Protein' | 'Condiment' | 'Bakery' | 'Beverage' | 'Leftovers' | 'Pantry';
  quantityEstimate?: string;
  freshnessNotice?: string;
  priority?: 'High (use first)' | 'Normal' | 'Low';
  expiresInDays?: number;
  isRescueUrgent?: boolean;
}

export interface MealPlanMeal {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  recipe: Recipe;
  rescueIngredientsUsed: string[];
  wasteSavingNote: string;
}

export interface MealPlanDay {
  dayNumber: number;
  dayTitle: string; // e.g. "Day 1: Urgent Greens & Dairy Rescue"
  priorityMessage: string;
  meals: MealPlanMeal[];
}

export interface MealPlan {
  id: string;
  title: string;
  durationDays: 3 | 7;
  days: MealPlanDay[];
  estimatedMoneySaved: string;
  wasteDivertedKg: string;
  zeroWasteScore: number;
  consolidatedMissingIngredients: string[];
}

export interface MissingIngredient {
  name: string;
  isCommonStaple: boolean;
  substituteIdea?: string;
}

export type FoodType = 'veg' | 'non-veg' | 'vegan' | 'egg';
export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy' | 'Extra Hot';
export type ApplianceType = 'Stovetop / Pan' | 'Pressure Cooker / Pot' | 'Air Fryer' | 'Oven' | 'Quick / No-Cook';

export interface NutritionFacts {
  calories: number; // kcal
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  micronutrients?: string; // e.g. "High in Vitamin C, Iron & Potassium"
  healthScore?: number; // 1-100
}

export interface Recipe {
  id: string;
  title: string;
  tagline: string;
  cuisine: string; // e.g. "Indian", "Chinese", "Italian", "Mexican", "American"
  subCuisine?: string; // e.g. "North Indian", "South Indian", "Rajasthani", "Indo-Chinese", "Tuscan", "Szechuan"
  foodType: FoodType; // 'veg' | 'non-veg' | 'vegan' | 'egg'
  spiceLevel?: SpiceLevel;
  appliance?: ApplianceType;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  matchScore: number; // 0 to 100
  requiredIngredients?: string[]; // Master immutable ingredient list for scoring
  matchedIngredients: string[];
  missingOrStapleIngredients: MissingIngredient[];
  dietaryTags: string[];
  steps: string[];
  chefZeroWasteTip: string;
  nutritionalFacts: NutritionFacts;
  nutritionalHighlights?: {
    caloriesPerServing?: number;
    proteinGrams?: number;
    keyBenefit?: string;
  };
}

export interface ScanResult {
  source: 'gemini-vision' | 'standalone-engine';
  fridgeSummary: string;
  detectedIngredients: IngredientItem[];
  recipes: Recipe[];
  imageUrl?: string;
}

export interface PresetFridge {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ingredients: IngredientItem[];
  description: string;
}

export interface GoogleUserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  authProvider: 'google';
  savedDietaryPreference?: 'all' | 'veg' | 'non-veg' | 'vegan' | 'egg';
  savedCuisinePreference?: string;
  savedSubCuisinePreference?: string;
  savedSpicePreference?: SpiceLevel;
  personalGeminiApiKey?: string;
}

export interface GeminiChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: number;
  suggestedAction?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  recipeTitle?: string;
  completed: boolean;
}

export interface SubCuisine {
  id: string;
  name: string;
  description: string;
  popularDishes: string[];
}

export interface CuisineCategory {
  id: string;
  name: string;
  flag: string;
  tagline: string;
  subCuisines: SubCuisine[];
}
