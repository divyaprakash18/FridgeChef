import { CuisineCategory } from '../types';

export const CUISINE_TAXONOMY: CuisineCategory[] = [
  {
    id: 'indian',
    name: 'Indian',
    flag: '🇮🇳',
    tagline: 'Rich aromatic spices, hearty lentils, fresh gravies & tandoor flavors',
    subCuisines: [
      {
        id: 'north-indian',
        name: 'North Indian (Punjabi / Awadhi)',
        description: 'Rich buttery gravies, paneer specialties, tandoori flavors & fragrant garam masalas.',
        popularDishes: ['Paneer Bhurji', 'Kadhai Paneer', 'Butter Chicken Masala', 'Aloo Gobi'],
      },
      {
        id: 'south-indian',
        name: 'South Indian (Chettinad / Udupi)',
        description: 'Mustard seeds, curry leaves, roasted lentils, coconut milk & tangy tamarind.',
        popularDishes: ['Tomato Onion Uttapam', 'Lemon Rice', 'Crispy Egg Dosa', 'Chettinad Pepper Fry'],
      },
      {
        id: 'rajasthani',
        name: 'Rajasthani (Marwari / Mewar)',
        description: 'Desert pantry genius: besan, dried chilies, yogurt gravies, papad & hing aromatics.',
        popularDishes: ['Sev Tamatar Ki Sabzi', 'Rajasthani Papad Curry', 'Besan Gatte', 'Methi Mangodi'],
      },
      {
        id: 'gujarati',
        name: 'Gujarati & West Indian',
        description: 'Delicate balance of sweet, salty, and sour with mild tempering and fresh cilantro.',
        popularDishes: ['Kadhi Khichdi', 'Batata Nu Shaak', 'Sev Usal', 'Methi Thepla'],
      },
      {
        id: 'indo-chinese',
        name: 'Indo-Chinese (Desi Street Style)',
        description: 'Fiery wok-tossed street classics combining dark soy, garlic, green chilies & spring onions.',
        popularDishes: ['Chilli Paneer Dry', 'Burnt Garlic Fried Rice', 'Chilli Chicken', 'Veg Manchurian'],
      },
    ],
  },
  {
    id: 'chinese',
    name: 'Chinese & Pan-Asian',
    flag: '🥢',
    tagline: 'High-heat wok searing, balanced sweet-savory sauces & crisp greens',
    subCuisines: [
      {
        id: 'szechuan',
        name: 'Szechuan (Spicy Wok)',
        description: 'Bold garlic, fiery crushed chili oil, and spicy peppercorns.',
        popularDishes: ['Kung Pao Tofu', 'Szechuan Spicy Noodles', 'Mapo Tofu', 'Firecracker Chicken'],
      },
      {
        id: 'cantonese',
        name: 'Cantonese & Mild Asian',
        description: 'Clean flavors highlighting natural ingredient freshness with ginger, scallions & light soy.',
        popularDishes: ['Egg Fried Rice', 'Ginger Scallion Stir-Fry', 'Steamed Veggie Dim Sum'],
      },
      {
        id: 'thai',
        name: 'Thai & Southeast Asian',
        description: 'Fragrant lemongrass, fresh lime, coconut milk, and basil.',
        popularDishes: ['Thai Basil Stir-Fry', 'Coconut Red Curry', 'Drunken Noodles'],
      },
    ],
  },
  {
    id: 'italian',
    name: 'Italian & Mediterranean',
    flag: '🇮🇹',
    tagline: 'Extra virgin olive oil, sweet tomatoes, garlic, aged parmesan & fresh herbs',
    subCuisines: [
      {
        id: 'tuscan',
        name: 'Tuscan & Rustic Central',
        description: 'Simple olive oil infusions, caramelized zucchini, white beans & crusty bread.',
        popularDishes: ['Zucchini & Tomato Pasta', 'Lemon Butter Noodles', 'Pan-Seared Mushrooms'],
      },
      {
        id: 'neapolitan',
        name: 'Neapolitan & Southern',
        description: 'Bubbling mozzarella, sweet stewed tomatoes, oregano & blistered garlic.',
        popularDishes: ['Skillet Mozzarella Chicken Melt', 'Cheesy Eggplant Parm', 'Caprese Melts'],
      },
      {
        id: 'roman',
        name: 'Roman & Bistro',
        description: 'Silky emulsified sauces, cracked black pepper, aged cheese & golden butter.',
        popularDishes: ['Cacio e Pepe Pasta', 'Carbonara-Style Eggs', 'Garlic Butter Herb Toast'],
      },
    ],
  },
  {
    id: 'mexican',
    name: 'Mexican & Latin',
    flag: '🇲🇽',
    tagline: 'Toasted tortillas, melted cheese, warm cumin, lime & zesty salsa',
    subCuisines: [
      {
        id: 'tex-mex',
        name: 'Tex-Mex & Cantina',
        description: 'Crispy folded tortillas, bubbling cheddar cheese, sriracha & skillet sizzle.',
        popularDishes: ['Crispy Cheddar Quesadilla', 'Cheesy Fajita Skillet', 'Loaded Breakfast Burrito'],
      },
      {
        id: 'oaxacan',
        name: 'Oaxacan & Street Taco',
        description: 'Charred peppers, warm cumin, pickled red onions, cilantro & lime.',
        popularDishes: ['Charred Pepper Tacos', 'Chilaquiles with Fried Eggs', 'Spiced Black Bean Wraps'],
      },
    ],
  },
  {
    id: 'american',
    name: 'American & Continental',
    flag: '🇺🇸',
    tagline: 'Sizzling skillets, bistro comfort classics & high-protein kitchen staples',
    subCuisines: [
      {
        id: 'bistro',
        name: 'Bistro & European Classics',
        description: 'French technique: velvety omelettes, clarified butter, sautéed mushrooms & reduction glazes.',
        popularDishes: ['French Cheesy Omelette', 'Garlic Butter Chicken Skillet', 'Cremini Mushroom Toast'],
      },
      {
        id: 'homestyle',
        name: 'American Homestyle Diner',
        description: 'Hearty pan-seared meats, roasted crispy potatoes, melted cheeses & comforting brunch.',
        popularDishes: ['Loaded Breakfast Skillet', 'Pan-Seared Chicken & Greens', 'Crispy Melts'],
      },
    ],
  },
  {
    id: 'middle-eastern',
    name: 'Middle Eastern & Levantine',
    flag: '🧆',
    tagline: 'Smoky paprika, stewed tomatoes, fresh herbs, tahini & poached eggs',
    subCuisines: [
      {
        id: 'levantine',
        name: 'Levantine & North African',
        description: 'Gentle poached eggs in spiced cumin-tomato reduction, garlic and olive oil.',
        popularDishes: ['Shakshuka with Soft Eggs', 'Spiced Chickpea Skillet', 'Herbed Tomato Dip with Toast'],
      },
    ],
  },
];
