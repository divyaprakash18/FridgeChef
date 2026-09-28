import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support base64 image uploads up to 20MB
app.use(express.json({ limit: '20mb' }));

// Health / status endpoint to inspect environment capabilities
app.get('/api/status', (_req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    hasGeminiKey,
    mode: hasGeminiKey ? 'ai-vision-enabled' : 'standalone-ready',
    message: hasGeminiKey
      ? 'Gemini Multimodal Vision API is active (Included via Google AI Studio).'
      : 'Running in Standalone Mode. Built-in 50+ recipe matcher and instant ingredient tagger ready.',
  });
});

// Analyze Fridge Photo via Gemini 3.8 Flash
app.post('/api/analyze-fridge', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      dietaryRestrictions = [],
      extraPantryItems = [],
      cuisinePreference,
      subCuisinePreference,
      spicePreference,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: 'MISSING_IMAGE',
        message: 'No image data provided. Please upload or take a photo of your fridge.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        fallback: true,
        message: 'No Gemini API Key detected in environment. Using standalone offline recipe engine.',
      });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
You are an expert executive chef and zero-waste kitchen master.
Analyze this photo of a refrigerator interior or kitchen pantry thoroughly.

Tasks:
1. Identify all visible edible food items, produce, proteins, dairy, condiments, and leftovers.
2. Estimate their condition/freshness (e.g. "Use within 2-3 days", "Fresh", "Pantry stable").
3. Create 5 to 7 realistic, delicious, tested recipes that can be prepared primarily using the ingredients found in the photo.
   Assume standard kitchen staples are available (salt, black pepper, cooking oil, water, basic spices).
4. Emphasize zero-waste: highlight which ingredients are used and provide practical chef substitutions.
${cuisinePreference && cuisinePreference !== 'all' ? `CRITICAL CUISINE REQUIREMENT: The user specifically requested ${cuisinePreference.toUpperCase()} cuisine${subCuisinePreference && subCuisinePreference !== 'all' ? ` with focus on the ${subCuisinePreference} regional style (e.g. if Rajasthani: sev tamatar, papad curry; if North Indian: bhurji, dhaba curries; if South Indian: uttapam, pepper roast, lemon rice; if Indo-Chinese: street chilli paneer, fried rice; if Italian: Tuscan pasta, mozzarella bakes)` : ''}. Generate recipes firmly rooted in this culinary tradition!` : ''}
${spicePreference ? `Tailor heat to ${spicePreference} spice level.` : ''}
${dietaryRestrictions.length > 0 ? `Respect these dietary preferences if possible: ${dietaryRestrictions.join(', ')}.` : ''}
${extraPantryItems.length > 0 ? `Also factor in these extra pantry items the user has available: ${extraPantryItems.join(', ')}.` : ''}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fridgeSummary: {
              type: Type.STRING,
              description: 'A friendly 1-2 sentence culinary summary of the scanned fridge.',
            },
            detectedIngredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'Produce, Dairy, Protein, Condiment, Bakery, Beverage, Leftovers, or Pantry',
                  },
                  quantityEstimate: { type: Type.STRING },
                  freshnessNotice: { type: Type.STRING },
                  priority: { type: Type.STRING, description: 'High (use first), Normal, Low' },
                },
                required: ['name', 'category'],
              },
            },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  subCuisine: {
                    type: Type.STRING,
                    description: 'Regional sub-cuisine e.g. "North Indian", "South Indian", "Rajasthani", "Indo-Chinese", "Tuscan", "Szechuan", "Tex-Mex"',
                  },
                  spiceLevel: {
                    type: Type.STRING,
                    description: 'Mild, Medium, Spicy, or Extra Hot',
                  },
                  foodType: {
                    type: Type.STRING,
                    description: 'Culinary classification: "veg" (vegetarian), "non-veg" (meat/poultry/fish), "vegan" (100% plant), or "egg" (eggitarian)',
                  },
                  difficulty: { type: Type.STRING }, // Easy, Medium, Challenging
                  prepTimeMinutes: { type: Type.INTEGER },
                  cookTimeMinutes: { type: Type.INTEGER },
                  servings: { type: Type.INTEGER },
                  matchScore: { type: Type.INTEGER, description: 'Percentage from 60 to 100 based on matched fridge items' },
                  matchedIngredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  missingOrStapleIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        isCommonStaple: { type: Type.BOOLEAN },
                        substituteIdea: { type: Type.STRING },
                      },
                      required: ['name', 'isCommonStaple'],
                    },
                  },
                  dietaryTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  chefZeroWasteTip: { type: Type.STRING },
                  nutritionalFacts: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.INTEGER, description: 'kcal per serving' },
                      protein: { type: Type.INTEGER, description: 'grams per serving' },
                      carbs: { type: Type.INTEGER, description: 'grams per serving' },
                      fat: { type: Type.INTEGER, description: 'grams per serving' },
                      fiber: { type: Type.INTEGER, description: 'grams per serving' },
                      micronutrients: { type: Type.STRING, description: 'e.g. Rich in Vitamin C, Iron & Calcium' },
                      healthScore: { type: Type.INTEGER, description: 'Score between 1 and 100' },
                    },
                    required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
                  },
                  nutritionalHighlights: {
                    type: Type.OBJECT,
                    properties: {
                      caloriesPerServing: { type: Type.INTEGER },
                      proteinGrams: { type: Type.INTEGER },
                      keyBenefit: { type: Type.STRING },
                    },
                  },
                },
                required: [
                  'id',
                  'title',
                  'tagline',
                  'cuisine',
                  'difficulty',
                  'prepTimeMinutes',
                  'cookTimeMinutes',
                  'servings',
                  'matchScore',
                  'matchedIngredients',
                  'steps',
                ],
              },
            },
          },
          required: ['fridgeSummary', 'detectedIngredients', 'recipes'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from vision model');
    }

    const parsedData = JSON.parse(responseText.trim());
    return res.json({
      success: true,
      source: 'gemini-vision',
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error analyzing fridge photo:', error);
    return res.status(500).json({
      success: false,
      error: 'ANALYSIS_FAILED',
      message: error?.message || 'Failed to analyze fridge photo with AI Vision.',
      fallbackAvailable: true,
    });
  }
});

// Interactive Chef Advice & Customization
app.post('/api/chef-advice', async (req, res) => {
  try {
    const { question, currentIngredients, recipeTitle } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        answer: `Chef Tip: If you don't have certain ingredients for ${recipeTitle || 'this dish'}, you can easily substitute with similar textures: olive oil works great in place of butter, plain yogurt replaces sour cream, and any hearty green (kale/cabbage) can swap with spinach!`,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
You are an encouraging, practical zero-waste chef assisting someone cooking right now.
Recipe: ${recipeTitle || 'Current meal'}
Available Ingredients in their fridge: ${JSON.stringify(currentIngredients || [])}
User Question: "${question}"

Provide a concise, practical, 2-4 sentence answer giving exact substitutions, flavor tweaks, or technique advice. Keep it warm, precise, and culinary-grounded.
`,
    });

    res.json({ answer: response.text || 'Cook on medium heat and taste as you season!' });
  } catch (err: any) {
    console.error('Error getting chef advice:', err);
    res.json({
      answer: 'Pro cooking tip: Adjust salt gradually, let aromatics sizzle before adding liquids, and use leftover vegetable stems in stocks or stir-fries!',
    });
  }
});

// Full Gemini AI Assistant (Bottom-Right Chat Widget)
app.post('/api/gemini-chat', async (req, res) => {
  try {
    const { messages, currentIngredients = [], activeRecipeTitle, dietaryPreference, userName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const lastUserMsg = messages[messages.length - 1]?.text || '';
      return res.json({
        reply: `Hello ${userName || 'Chef'}! I am FridgeChef Gemini. Currently running in standalone offline mode. You have ${currentIngredients.length} ingredients in your fridge list. For "${lastUserMsg}", I recommend pairing your available fresh produce with pantry basics, seasoning generously with garlic and olive oil!`,
        actionSuggestion: 'Browse recipes based on your fridge',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const conversationHistory = (messages || [])
      .map((m: any) => `${m.sender === 'user' ? 'User' : 'Gemini Chef'}: ${m.text}`)
      .join('\n');

    const systemPrompt = `
You are the interactive in-app Gemini Sous-Chef for FridgeChef.
User name: ${userName || 'Friend'}
Current Fridge Inventory: ${JSON.stringify(currentIngredients)}
Currently Viewed Recipe (if any): ${activeRecipeTitle || 'Browsing all recipes'}
User Dietary Preference: ${dietaryPreference || 'All'}

Guidelines:
1. Be helpful, concise, enthusiastic, and culinary-grounded (keep responses under 3-4 paragraphs or crisp bullet points).
2. Answer questions about:
   - What to cook right now with what is in their fridge.
   - Ingredient substitutions (e.g. eggs, dairy, spices).
   - Step-by-step culinary technique tips (e.g. pan temperature, seasoning, searing).
   - Nutritional facts and macro balancing (calories, protein, carbs).
   - Zero-waste grocery conservation tips.
3. Suggest practical actions they can take in the app.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemPrompt}\n\nConversation:\n${conversationHistory}\n\nGemini Chef:`,
    });

    const reply = response.text || 'I am ready to help you cook! What ingredients do you want to explore?';
    res.json({ reply });
  } catch (err: any) {
    console.error('Error in gemini-chat endpoint:', err);
    res.json({
      reply: 'Chef tip: Keep your pan hot before adding proteins, don’t overcrowd your skillet, and taste frequently for salt and acid balance!',
    });
  }
});

// Dynamic AI Recipe Generation on-demand
app.post('/api/generate-more-recipes', async (req, res) => {
  try {
    const {
      ingredients = [],
      cuisine = 'Indian',
      subCuisine = 'North Indian',
      spice = 'Medium',
      dietary = 'all',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        success: false,
        message: 'Gemini API Key unavailable. Use offline recipe catalog.',
        recipes: [],
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
You are an executive chef. Generate 3 unique, realistic, tested, high-flavor recipes tailored to the following specifications:
- Available ingredients: ${ingredients.join(', ')}
- Preferred cuisine: ${cuisine}
- Preferred regional sub-cuisine: ${subCuisine}
- Preferred spice heat level: ${spice}
- Dietary restrictions: ${dietary}
- Emphasize zero food waste, clear steps, and comprehensive nutritional facts.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  subCuisine: { type: Type.STRING },
                  spiceLevel: { type: Type.STRING },
                  foodType: {
                    type: Type.STRING,
                    description: 'veg, non-veg, vegan, or egg',
                  },
                  difficulty: { type: Type.STRING },
                  prepTimeMinutes: { type: Type.INTEGER },
                  cookTimeMinutes: { type: Type.INTEGER },
                  servings: { type: Type.INTEGER },
                  matchScore: { type: Type.INTEGER },
                  matchedIngredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  missingOrStapleIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        isCommonStaple: { type: Type.BOOLEAN },
                        substituteIdea: { type: Type.STRING },
                      },
                      required: ['name', 'isCommonStaple'],
                    },
                  },
                  dietaryTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  chefZeroWasteTip: { type: Type.STRING },
                  nutritionalFacts: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.INTEGER },
                      protein: { type: Type.INTEGER },
                      carbs: { type: Type.INTEGER },
                      fat: { type: Type.INTEGER },
                      fiber: { type: Type.INTEGER },
                      micronutrients: { type: Type.STRING },
                      healthScore: { type: Type.INTEGER },
                    },
                    required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
                  },
                },
                required: [
                  'id',
                  'title',
                  'tagline',
                  'cuisine',
                  'foodType',
                  'difficulty',
                  'prepTimeMinutes',
                  'cookTimeMinutes',
                  'servings',
                  'matchScore',
                  'matchedIngredients',
                  'steps',
                  'nutritionalFacts',
                ],
              },
            },
          },
          required: ['recipes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"recipes":[]}');
    res.json({
      success: true,
      recipes: parsed.recipes || [],
    });
  } catch (err: any) {
    console.error('Error generating more recipes:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate recipes',
      recipes: [],
    });
  }
});

// AI Multi-Day Zero-Waste Meal Planner
app.post('/api/generate-meal-plan', async (req, res) => {
  try {
    const {
      ingredients = [],
      durationDays = 3,
      dietary = 'all',
      cuisine = 'all',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        fallback: true,
        message: 'No Gemini API key available. Use client local planner engine.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
You are an expert culinary planner and zero-waste kitchen director.
Plan a structured ${durationDays}-day meal plan (Lunch and Dinner for each day) using the following ingredients currently in the user's fridge and pantry:
Ingredients: ${JSON.stringify(ingredients)}
Dietary preference: ${dietary}
Cuisine preference: ${cuisine}

Crucial zero-waste rules:
1. Day 1 MUST prioritize fragile perishables (leafy greens, fresh herbs, berries, raw seafood/poultry, open milk/cream, sliced mushrooms) so they are rescued before spoiling.
2. Days 2 and 3 can move to sturdy vegetables, cooked proteins, eggs, and hearty pantry starches (rice, pasta, grains).
3. Provide a clear "wasteSavingNote" explaining why this meal was scheduled on this specific day to minimize waste.
4. Calculate an estimated dollar/rupee savings and kg of food waste prevented.
5. List consolidated missing ingredients that need to be picked up from the store.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            estimatedMoneySaved: { type: Type.STRING },
            wasteDivertedKg: { type: Type.STRING },
            zeroWasteScore: { type: Type.INTEGER },
            consolidatedMissingIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dayTitle: { type: Type.STRING },
                  priorityMessage: { type: Type.STRING },
                  meals: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        mealType: { type: Type.STRING, description: 'Lunch or Dinner' },
                        recipe: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            tagline: { type: Type.STRING },
                            cuisine: { type: Type.STRING },
                            subCuisine: { type: Type.STRING },
                            foodType: { type: Type.STRING },
                            spiceLevel: { type: Type.STRING },
                            difficulty: { type: Type.STRING },
                            prepTimeMinutes: { type: Type.INTEGER },
                            cookTimeMinutes: { type: Type.INTEGER },
                            servings: { type: Type.INTEGER },
                            matchScore: { type: Type.INTEGER },
                            matchedIngredients: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                            },
                            steps: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                            },
                            chefZeroWasteTip: { type: Type.STRING },
                            nutritionalFacts: {
                              type: Type.OBJECT,
                              properties: {
                                calories: { type: Type.INTEGER },
                                protein: { type: Type.INTEGER },
                                carbs: { type: Type.INTEGER },
                                fat: { type: Type.INTEGER },
                                fiber: { type: Type.INTEGER },
                              },
                              required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
                            },
                          },
                          required: ['id', 'title', 'tagline', 'cuisine', 'foodType', 'difficulty', 'prepTimeMinutes', 'cookTimeMinutes', 'servings', 'matchedIngredients', 'steps', 'nutritionalFacts'],
                        },
                        rescueIngredientsUsed: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        wasteSavingNote: { type: Type.STRING },
                      },
                      required: ['mealType', 'recipe', 'rescueIngredientsUsed', 'wasteSavingNote'],
                    },
                  },
                },
                required: ['dayNumber', 'dayTitle', 'priorityMessage', 'meals'],
              },
            },
          },
          required: ['title', 'days', 'estimatedMoneySaved', 'wasteDivertedKg', 'zeroWasteScore', 'consolidatedMissingIngredients'],
        },
      },
    });

    const parsedPlan = JSON.parse(response.text || '{}');
    parsedPlan.id = `plan-${Date.now()}`;
    parsedPlan.durationDays = durationDays;

    return res.json({
      success: true,
      plan: parsedPlan,
    });
  } catch (error: any) {
    console.error('Error generating AI meal plan:', error);
    return res.status(200).json({
      success: false,
      message: error?.message || 'Failed to generate AI meal plan',
      fallback: true,
    });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FridgeChef server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
