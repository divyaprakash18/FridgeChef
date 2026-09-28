import { IngredientItem } from '../types';

/**
 * Intelligent culinary shelf-life estimator based on ingredient category and name.
 */
export function estimateShelfLifeDays(name: string, category: string): number {
  const n = name.toLowerCase().trim();

  // Very fragile: 1-2 days (leafy greens, fresh herbs, raw fish, sliced mushrooms)
  if (
    n.includes('spinach') ||
    n.includes('lettuce') ||
    n.includes('kale') ||
    n.includes('herb') ||
    n.includes('basil') ||
    n.includes('cilantro') ||
    n.includes('coriander') ||
    n.includes('parsley') ||
    n.includes('mint') ||
    n.includes('berry') ||
    n.includes('berries') ||
    n.includes('strawberry') ||
    n.includes('fish') ||
    n.includes('salmon') ||
    n.includes('shrimp') ||
    n.includes('prawn') ||
    n.includes('mushroom') ||
    n.includes('sprout')
  ) {
    return 2;
  }

  // Fragile: 3 days (fresh chicken, ripe bananas, cut tomatoes, ripe avocado, fresh bread)
  if (
    n.includes('chicken') ||
    n.includes('meat') ||
    n.includes('beef') ||
    n.includes('pork') ||
    n.includes('banana') ||
    n.includes('tomato') ||
    n.includes('avocado') ||
    n.includes('bread') ||
    n.includes('bun') ||
    n.includes('croissant')
  ) {
    return 3;
  }

  // Moderate: 4-5 days (fresh milk, cream, broccoli, zucchini, cucumber, paneer, tofu)
  if (
    n.includes('milk') ||
    n.includes('cream') ||
    n.includes('broccoli') ||
    n.includes('cauliflower') ||
    n.includes('zucchini') ||
    n.includes('cucumber') ||
    n.includes('paneer') ||
    n.includes('tofu') ||
    n.includes('bell pepper') ||
    n.includes('capsicum')
  ) {
    return 4;
  }

  // Sturdy: 7-10 days (cheddar cheese, yogurt, curd, butter, carrots, cabbage, apples)
  if (
    n.includes('cheese') ||
    n.includes('yogurt') ||
    n.includes('curd') ||
    n.includes('butter') ||
    n.includes('carrot') ||
    n.includes('cabbage') ||
    n.includes('apple') ||
    n.includes('orange') ||
    n.includes('citrus')
  ) {
    return 7;
  }

  // Eggs: 14 days
  if (n.includes('egg')) {
    return 14;
  }

  // Long storage roots: 18-30 days
  if (
    n.includes('onion') ||
    n.includes('potato') ||
    n.includes('garlic') ||
    n.includes('ginger') ||
    n.includes('lemon') ||
    n.includes('lime')
  ) {
    return 21;
  }

  // Pantry & Condiments: 60+ days
  if (
    category === 'Pantry' ||
    category === 'Condiment' ||
    n.includes('rice') ||
    n.includes('pasta') ||
    n.includes('noodle') ||
    n.includes('oil') ||
    n.includes('sauce') ||
    n.includes('spice') ||
    n.includes('salt') ||
    n.includes('flour') ||
    n.includes('sugar')
  ) {
    return 60;
  }

  return 5;
}

/**
 * Normalizes an ingredient list so every item has a valid `expiresInDays` and priority.
 */
export function enrichIngredientsWithExpiry(items: IngredientItem[]): IngredientItem[] {
  return items.map((item) => {
    const days = item.expiresInDays !== undefined
      ? item.expiresInDays
      : estimateShelfLifeDays(item.name, item.category);

    const isUrgent = days <= 2 || item.priority === 'High (use first)';

    return {
      ...item,
      expiresInDays: days,
      priority: isUrgent ? 'High (use first)' : (item.priority || 'Normal'),
      isRescueUrgent: isUrgent,
      freshnessNotice: item.freshnessNotice || (
        days <= 1 ? 'Use today or tomorrow' :
        days <= 3 ? `Use within ${days} days` :
        days <= 7 ? 'Fresh (within 1 week)' : 'Shelf stable'
      ),
    };
  });
}
