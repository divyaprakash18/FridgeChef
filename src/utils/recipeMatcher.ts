import { IngredientItem, MissingIngredient, Recipe } from '../types';
import { OFFLINE_RECIPES_DATABASE } from '../data/offlineRecipes';

// Helper to normalize ingredient strings
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // remove parenthetical remarks like (approx 400g)
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Comprehensive synonym groups for home cooking
const SYNONYMS: Record<string, string[]> = {
  egg: ['egg', 'eggs', 'egg whites', 'boiled egg'],
  tomato: ['tomato', 'tomatoes', 'cherry tomatoes', 'roma tomatoes', 'crushed tomatoes'],
  onion: ['onion', 'onions', 'yellow onion', 'red onion', 'shallot', 'shallots', 'scallion', 'scallions', 'green onion'],
  garlic: ['garlic', 'garlic cloves', 'minced garlic', 'garlic paste'],
  ginger: ['ginger', 'fresh ginger', 'ginger paste', 'ginger root'],
  butter: ['butter', 'unsalted butter', 'salted butter', 'ghee'],
  spinach: ['spinach', 'baby spinach', 'palak', 'greens'],
  chicken: ['chicken', 'chicken breast', 'chicken thighs', 'boneless chicken', 'cooked chicken', 'rotisserie chicken'],
  zucchini: ['zucchini', 'courgette', 'yellow squash'],
  mushroom: ['mushroom', 'mushrooms', 'cremini', 'cremini mushrooms', 'button mushrooms', 'portobello'],
  tofu: ['tofu', 'firm tofu', 'extra firm tofu', 'silken tofu'],
  tortilla: ['tortilla', 'tortillas', 'wraps', 'flatbread', 'roti', 'chapati'],
  paneer: ['paneer', 'cottage cheese', 'firm paneer'],
  cheddar: ['cheddar', 'cheddar cheese', 'shredded cheddar', 'sharp cheddar'],
  mozzarella: ['mozzarella', 'shredded mozzarella', 'fresh mozzarella'],
  parmesan: ['parmesan', 'parmesan cheese', 'grated parmesan'],
  cheese: ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'paneer'],
  milk: ['milk', 'whole milk', 'dairy milk', 'almond milk', 'oat milk'],
  yogurt: ['yogurt', 'curd', 'dahi', 'greek yogurt', 'plain yogurt'],
  rice: ['rice', 'basmati rice', 'jasmine rice', 'cooked rice', 'white rice', 'brown rice'],
  pasta: ['pasta', 'spaghetti', 'penne', 'noodles', 'macaroni', 'linguine', 'fusilli'],
  noodles: ['noodles', 'pasta', 'ramen', 'egg noodles', 'wheat noodles'],
  broccoli: ['broccoli', 'broccoli head', 'broccoli florets'],
  carrot: ['carrot', 'carrots', 'baby carrots'],
  lemon: ['lemon', 'lemon juice', 'lime', 'lime juice'],
  soy: ['soy sauce', 'soy', 'tamari', 'shoyu', 'dark soy sauce'],
  chili: ['chili', 'chilies', 'chilli', 'green chilies', 'green chili', 'red chili', 'chili flakes', 'sriracha', 'hot sauce'],
  pepper: ['bell pepper', 'bell peppers', 'capsicum', 'peppers', 'green pepper', 'red pepper'],
  potato: ['potato', 'potatoes', 'russet potato', 'aloo'],
  coriander: ['coriander', 'cilantro', 'fresh coriander', 'coriander leaves', 'dhaniya'],
  bread: ['bread', 'bread slices', 'pav', 'toast', 'buns'],
  flour: ['flour', 'all purpose flour', 'wheat flour', 'besan', 'gram flour', 'atta'],
  oil: ['oil', 'cooking oil', 'olive oil', 'vegetable oil', 'mustard oil'],
};

export function itemsMatch(target: string, query: string): boolean {
  const normTarget = normalize(target);
  const normQuery = normalize(query);

  if (!normTarget || !normQuery) return false;

  // Exact or direct inclusion check
  if (normTarget === normQuery || normTarget.includes(normQuery) || normQuery.includes(normTarget)) {
    return true;
  }

  // Word token overlap check (e.g. "chicken breast" matches "chicken")
  const targetWords = normTarget.split(' ');
  const queryWords = normQuery.split(' ');
  if (targetWords.some((tw) => queryWords.includes(tw) && tw.length > 2)) {
    return true;
  }

  // Synonym group cross-check
  for (const [key, group] of Object.entries(SYNONYMS)) {
    const targetInGroup = group.some((g) => normTarget.includes(g) || g.includes(normTarget));
    const queryInGroup = group.some((g) => normQuery.includes(g) || g.includes(normQuery));
    if (targetInGroup && queryInGroup) return true;
  }

  return false;
}

// Cache of master ingredients per recipe ID so we never lose required items across runs
const recipeMasterIngredientsCache = new Map<string, string[]>();

export function getRecipeMasterIngredients(recipe: Recipe): string[] {
  if (recipe.requiredIngredients && recipe.requiredIngredients.length > 0) {
    return recipe.requiredIngredients;
  }

  if (recipeMasterIngredientsCache.has(recipe.id)) {
    return recipeMasterIngredientsCache.get(recipe.id)!;
  }

  // Derive master required ingredients once and cache immutably
  const extracted = Array.from(
    new Set([
      ...(recipe.matchedIngredients || []),
      ...(recipe.missingOrStapleIngredients || []).map((m) => m.name),
    ])
  );

  recipeMasterIngredientsCache.set(recipe.id, extracted);
  return extracted;
}

export function matchRecipesWithIngredients(
  availableIngredients: (string | IngredientItem)[],
  allRecipes: Recipe[] = OFFLINE_RECIPES_DATABASE
): Recipe[] {
  const cleanAvailable = availableIngredients
    .map((ing) => (typeof ing === 'string' ? ing : ing.name))
    .filter(Boolean);

  return allRecipes.map((recipe) => {
    const masterIngredients = getRecipeMasterIngredients(recipe);
    const matched: string[] = [];
    const missing: MissingIngredient[] = [];

    masterIngredients.forEach((req) => {
      // Find matching available item if any
      const matchingAvail = cleanAvailable.find((avail) => itemsMatch(req, avail));

      if (matchingAvail) {
        matched.push(req);
      } else {
        // Check if recipe originally marked this as a common staple
        const originalMissing = recipe.missingOrStapleIngredients?.find((m) =>
          itemsMatch(m.name, req)
        );

        missing.push({
          name: req,
          isCommonStaple: originalMissing?.isCommonStaple ?? false,
          substituteIdea:
            originalMissing?.substituteIdea ||
            `Substitute with another available protein or vegetable`,
        });
      }
    });

    // Separate primary fresh/protein/produce ingredients from common background staples
    const isGenericKitchenStaple = (name: string) => {
      const norm = name.toLowerCase();
      return (
        norm.includes('salt') ||
        norm.includes('black pepper') ||
        norm.includes('cooking oil') ||
        norm.includes('vegetable oil') ||
        norm.includes('water') ||
        norm.includes('turmeric & garam masala')
      );
    };

    const primaryRequired = masterIngredients.filter((m) => !isGenericKitchenStaple(m));
    const primaryMatched = matched.filter((m) => !isGenericKitchenStaple(m));

    const totalPrimary = Math.max(1, primaryRequired.length);
    const primaryRatio = primaryMatched.length / totalPrimary;

    let matchScore: number;
    if (primaryMatched.length === 0) {
      matchScore = 15;
    } else if (primaryMatched.length >= totalPrimary) {
      matchScore = 98;
    } else {
      // Scale from 35 to 94 based on primary items
      matchScore = Math.min(94, Math.max(30, Math.round(primaryRatio * 100)));
    }

    // Return a pristine, non-mutated copy
    return {
      ...recipe,
      requiredIngredients: masterIngredients,
      matchScore,
      matchedIngredients: matched,
      missingOrStapleIngredients: missing,
    };
  }).sort((a, b) => {
    // 1. Highest match score first
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    // 2. Most matched ingredients
    if (b.matchedIngredients.length !== a.matchedIngredients.length) {
      return b.matchedIngredients.length - a.matchedIngredients.length;
    }
    // 3. Quickest prep + cook time
    return a.prepTimeMinutes + a.cookTimeMinutes - (b.prepTimeMinutes + b.cookTimeMinutes);
  });
}
