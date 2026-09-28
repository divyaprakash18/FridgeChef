export interface PantryCategory {
  category: 'Produce' | 'Dairy' | 'Protein' | 'Condiment' | 'Bakery' | 'Pantry';
  items: string[];
}

export const COMMON_PANTRY_CATEGORIES: PantryCategory[] = [
  {
    category: 'Produce',
    items: [
      'Tomatoes',
      'Onions',
      'Garlic',
      'Spinach',
      'Bell Peppers',
      'Broccoli',
      'Carrots',
      'Zucchini',
      'Mushrooms',
      'Potatoes',
      'Lemon',
      'Cilantro',
      'Avocado',
      'Cucumber',
      'Ginger',
      'Cabbage',
      'Green Onions',
    ],
  },
  {
    category: 'Dairy',
    items: [
      'Eggs',
      'Milk',
      'Cheddar Cheese',
      'Mozzarella',
      'Butter',
      'Parmesan Cheese',
      'Greek Yogurt',
      'Heavy Cream',
      'Feta Cheese',
      'Sour Cream',
    ],
  },
  {
    category: 'Protein',
    items: [
      'Chicken Breast',
      'Chicken Thighs',
      'Ground Beef',
      'Eggs',
      'Firm Tofu',
      'Bacon',
      'Canned Tuna',
      'Shrimp',
      'Salmon Fillet',
      'Sausage',
      'Black Beans',
      'Chickpeas',
    ],
  },
  {
    category: 'Condiment',
    items: [
      'Soy Sauce',
      'Hot Sauce / Sriracha',
      'Dijon Mustard',
      'Mayonnaise',
      'Ketchup',
      'Balsamic Vinegar',
      'Tomato Paste',
      'Sesame Oil',
      'Honey',
      'BBQ Sauce',
    ],
  },
  {
    category: 'Bakery',
    items: [
      'Bread Slices',
      'Tortillas / Wraps',
      'Pita Bread',
      'Burger Buns',
      'English Muffins',
    ],
  },
  {
    category: 'Pantry',
    items: [
      'Olive Oil',
      'Salt & Black Pepper',
      'Pasta / Spaghetti',
      'Rice (Jasmine/Basmati)',
      'All-Purpose Flour',
      'Canned Crushed Tomatoes',
      'Dried Oregano / Italian Herbs',
      'Red Pepper Flakes',
      'Cumin',
      'Soy Sauce',
    ],
  },
];

export const ALL_COMMON_ITEMS = Array.from(
  new Set(COMMON_PANTRY_CATEGORIES.flatMap((c) => c.items))
).sort();
