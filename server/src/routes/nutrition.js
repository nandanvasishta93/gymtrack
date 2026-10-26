const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const INDIAN_VEGETARIAN_FOODS = [
  { name: "Soy Chunks (Nutrela / Raw)", serving: "50g", calories: 172, proteinG: 26, carbsG: 16, fatG: 0.5, category: "High Protein", budgetTier: "Ultra Budget Friendly (₹10/serving)" },
  { name: "Paneer (Cottage Cheese)", serving: "100g", calories: 265, proteinG: 18, carbsG: 3, fatG: 20, category: "High Protein / Healthy Fats", budgetTier: "Moderate" },
  { name: "Low-Fat Paneer", serving: "100g", calories: 180, proteinG: 22, carbsG: 4, fatG: 8, category: "High Protein Lean", budgetTier: "Moderate" },
  { name: "Tofu (Soy Paneer)", serving: "100g", calories: 120, proteinG: 14, carbsG: 2, fatG: 6, category: "Lean Protein", budgetTier: "Moderate" },
  { name: "Roasted Chana (Bengal Gram)", serving: "50g", calories: 185, proteinG: 11, carbsG: 29, fatG: 3, category: "Healthy Snacks", budgetTier: "Budget Friendly" },
  { name: "Curd / Dahi (Plain)", serving: "200g (1 bowl)", calories: 130, proteinG: 8, carbsG: 9, fatG: 7, category: "Dairy / Probiotic", budgetTier: "Budget Friendly" },
  { name: "Greek Yogurt / Hung Curd", serving: "150g", calories: 135, proteinG: 15, carbsG: 6, fatG: 5, category: "High Protein Dairy", budgetTier: "Moderate" },
  { name: "Yellow Dal / Moong / Toor (Cooked)", serving: "1 medium bowl (150g)", calories: 160, proteinG: 9, carbsG: 27, fatG: 1.5, category: "Legumes", budgetTier: "Budget Friendly" },
  { name: "Rajma (Kidney Beans, Cooked)", serving: "1 medium bowl (150g)", calories: 190, proteinG: 11, carbsG: 32, fatG: 1, category: "Legumes", budgetTier: "Budget Friendly" },
  { name: "Chole / Chickpeas (Cooked)", serving: "1 medium bowl (150g)", calories: 210, proteinG: 12, carbsG: 35, fatG: 3, category: "Legumes", budgetTier: "Budget Friendly" },
  { name: "Sprouted Moong / Mixed Sprouts", serving: "100g", calories: 105, proteinG: 8, carbsG: 19, fatG: 0.8, category: "High Micro-nutrients", budgetTier: "Budget Friendly" },
  { name: "Rolled / Instant Oats", serving: "50g", calories: 190, proteinG: 7, carbsG: 34, fatG: 3, category: "Complex Carbs", budgetTier: "Budget Friendly" },
  { name: "Whole Wheat Roti (No oil)", serving: "1 medium (35g dough)", calories: 85, proteinG: 3, carbsG: 17, fatG: 0.5, category: "Carbs", budgetTier: "Budget Friendly" },
  { name: "Cooked White / Brown Rice", serving: "1 bowl (150g)", calories: 195, proteinG: 4, carbsG: 43, fatG: 0.5, category: "Carbs", budgetTier: "Budget Friendly" },
  { name: "Peanuts (Roasted)", serving: "30g (handful)", calories: 170, proteinG: 8, carbsG: 5, fatG: 14, category: "Healthy Fats & Protein", budgetTier: "Budget Friendly" },
  { name: "Almonds & Walnuts", serving: "20g", calories: 125, proteinG: 4, carbsG: 4, fatG: 11, category: "Healthy Fats", budgetTier: "Premium" },
  { name: "Whole Cow Milk / Toned Milk", serving: "250ml (1 glass)", calories: 150, proteinG: 8, carbsG: 12, fatG: 8, category: "Dairy", budgetTier: "Budget Friendly" },
  { name: "Banana", serving: "1 medium (100g)", calories: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, category: "Pre-Workout Carb", budgetTier: "Budget Friendly" }
];

const BUDGET_SUBSTITUTIONS = [
  {
    target: "Expensive Whey Protein Scoop",
    substitution: "50g Boiled Soy Chunks + 200g Curd Smoothie",
    savings: "Saves ~₹80/day",
    proteinYield: "~34g protein for under ₹25 total"
  },
  {
    target: "Commercial Protein Bars (₹150+)",
    substitution: "50g Roasted Chana + 25g Peanuts + 1 Banana",
    savings: "Saves ~₹120/snack",
    proteinYield: "~19g protein from natural whole foods"
  },
  {
    target: "Full-Fat Commercial Cream Cheese",
    substitution: "Hung Curd seasoned with black pepper, jeera & garlic",
    savings: "60% cheaper with double the protein",
    proteinYield: "~15g protein per 150g hung curd"
  },
  {
    target: "Imported Almond Butter",
    substitution: "Dry roasted ground peanuts with pinch of salt",
    savings: "75% cheaper",
    proteinYield: "~26g protein per 100g homemade peanut butter"
  }
];

// GET /api/nutrition/today
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const entries = await prisma.nutritionEntry.findMany({
      where: {
        userId: req.user.id,
        date: todayStr
      },
      orderBy: { createdAt: 'asc' }
    });

    const waterLog = await prisma.waterLog.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: todayStr
        }
      }
    });

    // Compute totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const item of entries) {
      totalCalories += (item.calories || 0);
      totalProtein += (item.proteinG || 0);
      totalCarbs += (item.carbsG || 0);
      totalFat += (item.fatG || 0);
    }

    res.json({
      date: todayStr,
      entries,
      water: waterLog || { glasses: 0, amountMl: 0 },
      totals: {
        calories: Math.round(totalCalories),
        proteinG: Math.round(totalProtein * 10) / 10,
        carbsG: Math.round(totalCarbs * 10) / 10,
        fatG: Math.round(totalFat * 10) / 10
      },
      targets: {
        proteinTargetG: req.user.dailyProteinTarget || 115,
        waterTargetMl: req.user.dailyWaterTarget || 3000
      }
    });
  } catch (error) {
    console.error('Nutrition today error:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition logs' });
  }
});

// GET /api/nutrition/foods
router.get('/foods', (req, res) => {
  res.json({
    foods: INDIAN_VEGETARIAN_FOODS,
    budgetSubstitutions: BUDGET_SUBSTITUTIONS
  });
});

// POST /api/nutrition/log
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { mealType, foodItem, quantity, calories, proteinG, carbsG, fatG, notes, date } = req.body;

    if (!mealType || !foodItem) {
      return res.status(400).json({ error: 'mealType and foodItem are required' });
    }

    const entry = await prisma.nutritionEntry.create({
      data: {
        userId: req.user.id,
        date: date || new Date().toISOString().split('T')[0],
        mealType,
        foodItem,
        quantity: quantity || '1 serving',
        calories: calories ? parseFloat(calories) : 0,
        proteinG: proteinG ? parseFloat(proteinG) : 0,
        carbsG: carbsG ? parseFloat(carbsG) : 0,
        fatG: fatG ? parseFloat(fatG) : 0,
        notes
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Log nutrition error:', error);
    res.status(500).json({ error: 'Failed to log nutrition item' });
  }
});

// DELETE /api/nutrition/log/:id
router.delete('/log/:id', authMiddleware, async (req, res) => {
  try {
    const item = await prisma.nutritionEntry.findUnique({
      where: { id: req.params.id }
    });

    if (!item || item.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this meal entry' });
    }

    await prisma.nutritionEntry.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Meal entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete meal entry' });
  }
});

// POST /api/nutrition/water
router.post('/water', authMiddleware, async (req, res) => {
  try {
    const { glasses, date } = req.body;
    const dateStr = date || new Date().toISOString().split('T')[0];
    const glassesNum = Math.max(0, parseInt(glasses) || 0);
    const amountMl = glassesNum * 250;

    const log = await prisma.waterLog.upsert({
      where: {
        userId_date: {
          userId: req.user.id,
          date: dateStr
        }
      },
      update: {
        glasses: glassesNum,
        amountMl
      },
      create: {
        userId: req.user.id,
        date: dateStr,
        glasses: glassesNum,
        amountMl
      }
    });

    res.json(log);
  } catch (error) {
    console.error('Water log error:', error);
    res.status(500).json({ error: 'Failed to update water intake' });
  }
});

// GET /api/nutrition/grocery
router.get('/grocery', authMiddleware, (req, res) => {
  const groceryList = [
    { category: "High Protein Staples", items: ["Soy Chunks (Nutrela) - 500g", "Paneer / Low-Fat Paneer - 1kg", "Tofu - 500g", "Curd / Dahi - 2kg", "Greek Yogurt / Hung Curd"] },
    { category: "Pulses & Legumes", items: ["Yellow Moong Dal - 1kg", "Rajma (Kidney Beans) - 1kg", "Kabuli Chana (Chickpeas) - 1kg", "Whole Green Moong (for sprouting) - 500g"] },
    { category: "Smart High-Protein Snacks", items: ["Roasted Chana - 500g", "Raw Peanuts - 500g", "Mixed Seeds (Chia, Pumpkin, Flax) - 250g", "Almonds - 250g"] },
    { category: "Complex Carbohydrates", items: ["Rolled Oats - 1kg", "Whole Wheat Atta - 5kg", "Brown / Basmati Rice - 2kg", "Bananas - 1 dozen"] },
    { category: "Hydration & Essentials", items: ["Lemons (for electrolyte water)", "Rock Salt (Himalayan Pink)", "Ginger & Garlic paste", "Green Chillies & Turmeric"] }
  ];
  res.json({ groceryList });
});

module.exports = router;
