import { IngredientItem, Recipe } from '../types';
import { OFFLINE_RECIPES_DATABASE } from '../data/offlineRecipes';

// Helper to normalize ingredient names for fuzzy matching
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SYNONYMS: Record<string, string[]> = {
  egg: ['eggs', 'egg'],
  cheese: ['cheddar', 'mozzarella', 'parmesan', 'feta', 'cheese'],
  tomato: ['tomatoes', 'tomato', 'cherry tomatoes'],
  onion: ['onions', 'onion', 'yellow onion', 'red onion', 'shallots'],
  garlic: ['garlic cloves', 'garlic'],
  butter: ['butter', 'unsalted butter', 'salted butter'],
  spinach: ['spinach', 'baby spinach', 'greens'],
  chicken: ['chicken breast', 'chicken thighs', 'chicken'],
  zucchini: ['zucchini', 'courgette'],
  mushroom: ['mushrooms', 'cremini mushrooms', 'button mushrooms'],
  tofu: ['firm tofu', 'tofu'],
  tortilla: ['tortillas', 'tortillas / wraps', 'wraps', 'flatbread'],
  pepper: ['bell peppers', 'bell pepper', 'peppers'],
  soy: ['soy sauce', 'shoyu', 'tamari'],
};

function itemsMatch(target: string, query: string): boolean {
  const normTarget = normalize(target);
  const normQuery = normalize(query);

  if (normTarget.includes(normQuery) || normQuery.includes(normTarget)) {
    return true;
  }

  // Check synonym map
  for (const [key, list] of Object.entries(SYNONYMS)) {
    const queryInGroup = list.some((item) => normQuery.includes(item) || item.includes(normQuery));
    const targetInGroup = list.some((item) => normTarget.includes(item) || item.includes(normTarget));
    if (queryInGroup && targetInGroup) return true;
  }

  return false;
}

export function matchRecipesWithIngredients(
  availableIngredients: (string | IngredientItem)[],
  allRecipes: Recipe[] = OFFLINE_RECIPES_DATABASE
): Recipe[] {
  const normalizedAvailable = availableIngredients.map((ing) =>
    typeof ing === 'string' ? normalize(ing) : normalize(ing.name)
  );

  return allRecipes.map((recipe) => {
    const requiredItems = recipe.matchedIngredients;
    const matched: string[] = [];
    const missing: typeof recipe.missingOrStapleIngredients = [];

    requiredItems.forEach((req) => {
      const isFound = normalizedAvailable.some((avail) => itemsMatch(avail, req));
      if (isFound) {
        matched.push(req);
      } else {
        // Missing
        missing.push({
          name: req,
          isCommonStaple: false,
          substituteIdea: `Look for a similar ingredient or swap with an available veggie/protein`,
        });
      }
    });

    // Combine with recipe's innate staple requirements
    const combinedMissing = [...missing, ...recipe.missingOrStapleIngredients];

    // Calculate score
    const totalPrimary = requiredItems.length;
    const matchRatio = totalPrimary > 0 ? matched.length / totalPrimary : 1;
    const matchScore = Math.max(20, Math.round(matchRatio * 100));

    return {
      ...recipe,
      matchScore,
      matchedIngredients: matched,
      missingOrStapleIngredients: combinedMissing,
    };
  }).sort((a, b) => {
    // Sort highest match score first, then quickest cooking time
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (a.prepTimeMinutes + a.cookTimeMinutes) - (b.prepTimeMinutes + b.cookTimeMinutes);
  });
}
