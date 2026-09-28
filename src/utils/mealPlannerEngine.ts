import { IngredientItem, MealPlan, MealPlanDay, Recipe } from '../types';
import { enrichIngredientsWithExpiry } from './expiryEstimator';
import { matchRecipesWithIngredients } from './recipeMatcher';
import { OFFLINE_RECIPES_DATABASE } from '../data/offlineRecipes';

export function generateLocalMealPlan(
  ingredients: IngredientItem[],
  recipePool: Recipe[] = OFFLINE_RECIPES_DATABASE,
  durationDays: 3 | 7 = 3,
  dietaryFilter: string = 'all',
  cuisineFilter: string = 'all'
): MealPlan {
  const enriched = enrichIngredientsWithExpiry(ingredients);
  const urgentItems = enriched.filter((i) => (i.expiresInDays || 5) <= 3);
  const regularItems = enriched.filter((i) => (i.expiresInDays || 5) > 3);

  // Filter pool by dietary and cuisine if specified
  let validRecipes = recipePool.filter((r) => {
    if (dietaryFilter !== 'all') {
      if (dietaryFilter === 'veg' && r.foodType !== 'veg' && r.foodType !== 'vegan') return false;
      if (dietaryFilter === 'non-veg' && r.foodType !== 'non-veg') return false;
      if (dietaryFilter === 'vegan' && r.foodType !== 'vegan') return false;
      if (dietaryFilter === 'egg' && r.foodType !== 'egg') return false;
    }
    if (cuisineFilter !== 'all') {
      const c = (r.cuisine || '').toLowerCase();
      if (!c.includes(cuisineFilter.toLowerCase())) return false;
    }
    return true;
  });

  if (validRecipes.length === 0) {
    validRecipes = recipePool;
  }

  // Score recipes by how well they rescue urgent items
  const scoredRecipes = validRecipes.map((recipe) => {
    const matched = recipe.matchedIngredients || [];
    const urgentMatches = urgentItems.filter((u) =>
      matched.some((m) => m.toLowerCase().includes(u.name.toLowerCase()) || u.name.toLowerCase().includes(m.toLowerCase()))
    ).map((u) => u.name);

    return {
      recipe,
      urgentMatches,
      rescueScore: urgentMatches.length * 3 + (recipe.matchScore || 50),
    };
  });

  // Sort descending by rescue score
  scoredRecipes.sort((a, b) => b.rescueScore - a.rescueScore);

  const usedRecipeIds = new Set<string>();
  const days: MealPlanDay[] = [];
  const allMissing = new Set<string>();

  const dayTitles3 = [
    { title: 'Day 1: Urgent Perishables Rescue', note: 'Prioritize fragile leafy greens, dairy, and ripe items before they spoil' },
    { title: 'Day 2: Fresh Protein & Veggie Power', note: 'Cook through chilled proteins, crisp vegetables, and fresh aromatics' },
    { title: 'Day 3: Hearty Stems & Pantry Stretchers', note: 'Utilize long-lasting root vegetables, grains, and pantry staples' },
  ];

  const dayTitles7 = [
    { title: 'Day 1: Delicate Greens & Fresh Dairy', note: 'Zero-waste target: use rapid-spoil items today' },
    { title: 'Day 2: High-Freshness Produce', note: 'Tender vegetables, mushrooms, and fresh proteins' },
    { title: 'Day 3: Mid-Shelf Veggies & Eggs', note: 'Broccoli, zucchini, bell peppers, and eggs' },
    { title: 'Day 4: Sturdy Comfort Cook', note: 'Hearty one-pot meals utilizing firm produce' },
    { title: 'Day 5: Grain & Legume Stretch', note: 'Rich curries or pastas combining pantry starches with remaining veg' },
    { title: 'Day 6: Root Vegetable Harvest', note: 'Carrots, onions, potatoes, and garlic infusions' },
    { title: 'Day 7: Fridge Clearing Feast', note: 'Toss remaining bits into creative scrambles, fried rice, or bakes' },
  ];

  const dayMetadata = durationDays === 7 ? dayTitles7 : dayTitles3;

  for (let d = 0; d < durationDays; d++) {
    const dayNumber = d + 1;
    const meta = dayMetadata[d] || {
      title: `Day ${dayNumber}: Balanced Home Cooking`,
      note: 'Delicious balanced meal crafted from your pantry and fridge.',
    };

    // Pick 2 unique recipes for Lunch and Dinner
    const availableForDay = scoredRecipes.filter((sr) => !usedRecipeIds.has(sr.recipe.id));

    // Fallback if we run low on unique recipes
    const lunchItem = availableForDay[0] || scoredRecipes[0];
    if (lunchItem) usedRecipeIds.add(lunchItem.recipe.id);

    const dinnerItem = availableForDay.slice(1)[0] || scoredRecipes[1] || lunchItem;
    if (dinnerItem) usedRecipeIds.add(dinnerItem.recipe.id);

    // Collect missing ingredients
    [lunchItem, dinnerItem].forEach((item) => {
      if (item?.recipe?.missingOrStapleIngredients) {
        item.recipe.missingOrStapleIngredients.forEach((m) => {
          if (!m.isCommonStaple) {
            allMissing.add(m.name);
          }
        });
      }
    });

    const dayMeals: MealPlanDay['meals'] = [];

    if (lunchItem) {
      dayMeals.push({
        mealType: 'Lunch',
        recipe: lunchItem.recipe,
        rescueIngredientsUsed: lunchItem.urgentMatches.length > 0 ? lunchItem.urgentMatches : lunchItem.recipe.matchedIngredients.slice(0, 2),
        wasteSavingNote: lunchItem.urgentMatches.length > 0
          ? `Rescues ${lunchItem.urgentMatches.join(', ')} while peak fresh!`
          : `Uses available ${lunchItem.recipe.matchedIngredients.slice(0, 2).join(' & ')}.`,
      });
    }

    if (dinnerItem) {
      dayMeals.push({
        mealType: 'Dinner',
        recipe: dinnerItem.recipe,
        rescueIngredientsUsed: dinnerItem.urgentMatches.length > 0 ? dinnerItem.urgentMatches : dinnerItem.recipe.matchedIngredients.slice(0, 2),
        wasteSavingNote: dinnerItem.urgentMatches.length > 0
          ? `Consumes ${dinnerItem.urgentMatches.join(', ')} preventing spoilage.`
          : `Satisfying zero-waste dinner maximizing pantry staples.`,
      });
    }

    days.push({
      dayNumber,
      dayTitle: meta.title,
      priorityMessage: meta.note,
      meals: dayMeals,
    });
  }

  const estimatedSaved = durationDays === 7 ? '$34.50 (₹1,250)' : '$18.00 (₹650)';
  const wasteKg = durationDays === 7 ? '3.8 kg' : '1.9 kg';

  return {
    id: `meal-plan-${Date.now()}`,
    title: `${durationDays}-Day Zero-Waste Smart Meal Plan`,
    durationDays,
    days,
    estimatedMoneySaved: estimatedSaved,
    wasteDivertedKg: wasteKg,
    zeroWasteScore: 96,
    consolidatedMissingIngredients: Array.from(allMissing),
  };
}
