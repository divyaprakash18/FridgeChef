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

// Health / status endpoint - reporting Standalone / BYO-User-Key architecture
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: false, // Developer server key is disabled to protect against host billing
    mode: 'byo-gemini-or-standalone',
    message: 'Host runs in Zero-Cost Standalone Mode. Users can optionally use their personal Google Gemini free tier quota.',
  });
});

// Analyze Fridge Photo: uses user's personal free Gemini key if provided; otherwise uses Standalone Engine
app.post('/api/analyze-fridge', async (req, res) => {
  const {
    imageBase64,
    mimeType = 'image/jpeg',
    userApiKey,
    cuisinePreference,
    subCuisinePreference,
    spicePreference,
    dietaryRestrictions = [],
  } = req.body;

  const apiKey = (req.headers['x-gemini-api-key'] as string) || userApiKey;

  if (!imageBase64) {
    return res.status(400).json({
      error: 'MISSING_IMAGE',
      message: 'No image data provided. Please upload or take a photo of your fridge.',
    });
  }

  // If user provided their personal Google Gemini API key, use their personal free quota
  if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 10) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build-client-quota',
          },
        },
      });

      const promptText = `
You are an expert executive chef and zero-waste kitchen master.
Analyze this photo of a refrigerator interior or kitchen pantry thoroughly.
1. Identify all visible edible food items, produce, proteins, dairy, condiments, and leftovers.
2. Estimate their condition and freshness.
3. Generate 5 to 7 realistic recipes using the ingredients in the photo plus common staples.
${cuisinePreference && cuisinePreference !== 'all' ? `Cuisine Preference: ${cuisinePreference} (${subCuisinePreference || ''})` : ''}
${spicePreference ? `Spice Level: ${spicePreference}` : ''}
${dietaryRestrictions.length > 0 ? `Dietary: ${dietaryRestrictions.join(', ')}` : ''}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            { inlineData: { mimeType, data: cleanBase64 } },
            { text: promptText },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fridgeSummary: { type: Type.STRING },
              detectedIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    quantityEstimate: { type: Type.STRING },
                    freshnessNotice: { type: Type.STRING },
                    priority: { type: Type.STRING },
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
                    subCuisine: { type: Type.STRING },
                    foodType: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    prepTimeMinutes: { type: Type.INTEGER },
                    cookTimeMinutes: { type: Type.INTEGER },
                    servings: { type: Type.INTEGER },
                    matchedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
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
                    dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
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
                    'matchedIngredients',
                    'missingOrStapleIngredients',
                    'steps',
                    'nutritionalFacts',
                  ],
                },
              },
            },
            required: ['fridgeSummary', 'detectedIngredients', 'recipes'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'user-gemini-vision',
        data: parsed,
      });
    } catch (err: any) {
      console.warn('Personal Gemini API call notice:', err.message);
      return res.json({
        fallback: true,
        message: 'Could not complete Gemini request with personal key. Fallback to Standalone Engine.',
      });
    }
  }

  // Pure Standalone mode
  return res.status(200).json({
    fallback: true,
    message: '100% Standalone Mode active. Using built-in inventory matcher with zero API billing.',
  });
});

// Chef Cooking Advice & Substitutions endpoint
app.post('/api/chef-advice', async (req, res) => {
  const { question, recipeTitle, userApiKey } = req.body;
  const apiKey = (req.headers['x-gemini-api-key'] as string) || userApiKey;
  const q = (question || '').toLowerCase();

  // If user provided their personal key, answer with personalized Gemini advice
  if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build-client-quota' },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert zero-waste chef assisting someone cooking ${recipeTitle || 'this meal'}. Question: "${question}". Provide a concise, practical 2-3 sentence answer with exact substitutions or technique advice.`,
      });

      if (response.text) {
        return res.json({ answer: response.text });
      }
    } catch (err) {
      console.warn('Personal Gemini chef advice fallback:', err);
    }
  }

  // Local instant culinary advice
  let answer =
    'Pro Chef Advice: Balance your dish by tasting as you season! If you need substitutions, olive oil works well in place of butter, plain yogurt substitutes for sour cream or heavy cream, and lemon juice or vinegar brightens flavors if lacking freshness.';

  if (q.includes('substitut') || q.includes('replace') || q.includes('instead')) {
    answer =
      'Culinary Substitution Guide: Greek yogurt or blended silken tofu easily replaces heavy cream or sour cream. For aromatics, shallots or leeks replace yellow onions. For fresh herbs, dried herbs work at 1/3 quantity.';
  } else if (q.includes('spic') || q.includes('hot') || q.includes('chili') || q.includes('pepper')) {
    answer =
      'Heat Balance Guide: To reduce heat, stir in a spoonful of yogurt, coconut milk, dairy cream, or a touch of sugar and lime. To increase heat, bloom red chili flakes or fresh sliced green chilies in a tablespoon of warm cooking oil.';
  } else if (recipeTitle) {
    answer = `Chef Tip for ${recipeTitle}: Cook aromatics (garlic/ginger/onion) on medium heat until fragrant before adding liquids. Keep vegetable cook times brief to retain crisp texture and vibrant nutrients!`;
  }

  res.json({ answer });
});

// Meal Planner endpoint - delegates to client local zero-waste planner
app.post('/api/generate-meal-plan', async (_req, res) => {
  res.json({
    fallback: true,
    message: '100% Zero-API Standalone mode. Using client local planner engine.',
  });
});

app.post('/api/generate-more-recipes', async (_req, res) => {
  res.json({
    success: false,
    message: '100% Standalone Mode: Browse 50+ built-in recipes.',
    recipes: [],
  });
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
