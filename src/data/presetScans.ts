import { PresetFridge } from '../types';

// Real local image assets generated for presets
import familyFridgeImg from '../assets/images/fridge_sample_family_1790618951870.jpg';
import studentFridgeImg from '../assets/images/fridge_sample_student_1790618963665.jpg';
import produceFridgeImg from '../assets/images/fridge_sample_produce_1790618975335.jpg';
import heroFridgeImg from '../assets/images/fridge_hero_fresh_1790618937066.jpg';
import culinaryHeroDishesImg from '../assets/images/culinary_hero_dishes_1790621261979.jpg';

export { heroFridgeImg, culinaryHeroDishesImg };

export const PRESET_FRIDGES: PresetFridge[] = [
  {
    id: 'family-fridge',
    title: 'Everyday Family Fridge',
    subtitle: 'Chicken, shredded mozzarella, broccoli, carrots, eggs, butter, milk',
    image: familyFridgeImg,
    description: 'A classic well-stocked home fridge with everyday staples, dairy, vegetables, and chicken.',
    ingredients: [
      { name: 'Chicken Breast', category: 'Protein', quantityEstimate: 'approx. 400g', freshnessNotice: 'Good condition' },
      { name: 'Eggs', category: 'Dairy', quantityEstimate: '6-8 large eggs', freshnessNotice: 'Fresh' },
      { name: 'Mozzarella', category: 'Dairy', quantityEstimate: '1 bag shredded', freshnessNotice: 'Fresh' },
      { name: 'Broccoli', category: 'Produce', quantityEstimate: '1 large head', freshnessNotice: 'Use within 3 days', priority: 'High (use first)' },
      { name: 'Carrots', category: 'Produce', quantityEstimate: '3-4 whole carrots', freshnessNotice: 'Crisp & fresh' },
      { name: 'Butter', category: 'Dairy', quantityEstimate: 'Half block', freshnessNotice: 'Chilled' },
      { name: 'Milk', category: 'Dairy', quantityEstimate: '1 carton', freshnessNotice: 'Fresh' },
      { name: 'Garlic', category: 'Produce', quantityEstimate: '3 cloves', freshnessNotice: 'Dry storage' },
      { name: 'Onions', category: 'Produce', quantityEstimate: '1 yellow onion', freshnessNotice: 'Good' },
    ],
  },
  {
    id: 'student-minimalist',
    title: 'Student & Minimalist Shelf',
    subtitle: 'Eggs, spinach, firm tofu, cheddar cheese, tortillas, soy sauce, hot sauce',
    image: studentFridgeImg,
    description: 'Quick-prep friendly shelf with plant & egg proteins, greens, cheese, and flavorful condiments.',
    ingredients: [
      { name: 'Eggs', category: 'Dairy', quantityEstimate: '4 eggs', freshnessNotice: 'Fresh' },
      { name: 'Spinach', category: 'Produce', quantityEstimate: 'Half bag fresh greens', freshnessNotice: 'Use soon', priority: 'High (use first)' },
      { name: 'Firm Tofu', category: 'Protein', quantityEstimate: '1 block (350g)', freshnessNotice: 'Sealed' },
      { name: 'Cheddar Cheese', category: 'Dairy', quantityEstimate: '1 block / slices', freshnessNotice: 'Fresh' },
      { name: 'Tortillas / Wraps', category: 'Bakery', quantityEstimate: '1 pack (6 count)', freshnessNotice: 'Fresh' },
      { name: 'Soy Sauce', category: 'Condiment', quantityEstimate: '1 bottle', freshnessNotice: 'Pantry staple' },
      { name: 'Hot Sauce / Sriracha', category: 'Condiment', quantityEstimate: '1 bottle', freshnessNotice: 'Pantry staple' },
      { name: 'Garlic', category: 'Produce', quantityEstimate: '2 cloves', freshnessNotice: 'Good' },
    ],
  },
  {
    id: 'market-produce',
    title: 'Garden Fresh & Farmer’s Market',
    subtitle: 'Zucchini, cherry tomatoes, fresh basil, parmesan, mushrooms, lemon',
    image: produceFridgeImg,
    description: 'Crisper drawer loaded with Italian-style vegetables, herbs, mushrooms, and aged parmesan.',
    ingredients: [
      { name: 'Zucchini', category: 'Produce', quantityEstimate: '2 medium zucchini', freshnessNotice: 'Firm & fresh' },
      { name: 'Tomatoes', category: 'Produce', quantityEstimate: '1 cup cherry tomatoes', freshnessNotice: 'Sweet & ripe', priority: 'High (use first)' },
      { name: 'Mushrooms', category: 'Produce', quantityEstimate: '200g cremini mushrooms', freshnessNotice: 'Use within 2 days', priority: 'High (use first)' },
      { name: 'Parmesan Cheese', category: 'Dairy', quantityEstimate: '1 wedge aged parmesan', freshnessNotice: 'Fresh' },
      { name: 'Lemon', category: 'Produce', quantityEstimate: '1 whole yellow lemon', freshnessNotice: 'Fresh' },
      { name: 'Garlic', category: 'Produce', quantityEstimate: '4 cloves', freshnessNotice: 'Fresh' },
      { name: 'Butter', category: 'Dairy', quantityEstimate: 'Quarter block', freshnessNotice: 'Chilled' },
      { name: 'Olive Oil', category: 'Pantry', quantityEstimate: 'Kitchen bottle', freshnessNotice: 'Pantry staple' },
    ],
  },
];
