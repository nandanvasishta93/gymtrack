import React, { useState, useEffect } from 'react';
import {
  Salad,
  Droplet,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Info,
  DollarSign,
  ChevronDown,
  Check,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Nutrition() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState(null);
  const [foodDb, setFoodDb] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showGrocery, setShowGrocery] = useState(false);
  const [activeTab, setActiveTab] = useState('meals'); // 'meals', 'database', 'substitutions'

  // Meal Form
  const [mealType, setMealType] = useState('Breakfast');
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('100g');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [notes, setNotes] = useState('');
  const [savingMeal, setSavingMeal] = useState(false);

  useEffect(() => {
    loadNutrition();
  }, []);

  const loadNutrition = async () => {
    try {
      setLoading(true);
      const [todayRes, foodsRes, groceryRes] = await Promise.all([
        api.getTodayNutrition(),
        api.getFoodsList(),
        api.getGroceryList()
      ]);
      setNutritionData(todayRes);
      setFoodDb(foodsRes);
      setGroceryList(groceryRes.groceryList || []);
    } catch (err) {
      console.error('Failed to load nutrition:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPredefinedFood = (food) => {
    setFoodItem(food.name);
    setQuantity(food.serving);
    setCalories(food.calories.toString());
    setProteinG(food.proteinG.toString());
    setCarbsG(food.carbsG.toString());
    setFatG(food.fatG.toString());
    setShowAddMeal(true);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!foodItem) return;

    try {
      setSavingMeal(true);
      await api.logNutrition({
        mealType,
        foodItem,
        quantity,
        calories: calories ? parseFloat(calories) : 0,
        proteinG: proteinG ? parseFloat(proteinG) : 0,
        carbsG: carbsG ? parseFloat(carbsG) : 0,
        fatG: fatG ? parseFloat(fatG) : 0,
        notes
      });
      setShowAddMeal(false);
      setFoodItem('');
      setNotes('');
      await loadNutrition();
    } catch (err) {
      alert(err.message || 'Failed to log meal');
    } finally {
      setSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await api.deleteNutrition(id);
      await loadNutrition();
    } catch (err) {
      alert('Failed to delete meal');
    }
  };

  const handleAdjustWater = async (delta) => {
    const currentGlasses = nutritionData?.water?.glasses || 0;
    const newGlasses = Math.max(0, currentGlasses + delta);
    try {
      await api.logWater(newGlasses);
      await loadNutrition();
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totals = nutritionData?.totals || { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
  const targets = nutritionData?.targets || { proteinTargetG: 115, waterTargetMl: 3000 };
  const proteinPercent = Math.min(100, Math.round((totals.proteinG / targets.proteinTargetG) * 100));
  const waterGlasses = nutritionData?.water?.glasses || 0;
  const targetGlasses = Math.round(targets.waterTargetMl / 250); // 12 glasses
  const waterPercent = Math.min(100, Math.round((waterGlasses / targetGlasses) * 100));
  const entries = nutritionData?.entries || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
            <Salad className="w-4 h-4" /> Indian Vegetarian Nutrition
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
            Macro & Meal Tracker
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Prioritizing daily protein ({targets.proteinTargetG}g target) through budget-friendly, whole-food Indian vegetarian staples.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGrocery(!showGrocery)}
            className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Grocery List
          </button>
          <button
            onClick={() => setShowAddMeal(!showAddMeal)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Log Meal
          </button>
        </div>
      </div>

      {/* Target Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Protein Progress Card */}
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-emerald-950 text-white p-6 border border-emerald-800/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Daily Protein Target</span>
              <h3 className="text-2xl font-black font-mono mt-0.5">
                {totals.proteinG} / {targets.proteinTargetG} <span className="text-xs font-normal text-gray-400">grams</span>
              </h3>
            </div>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {proteinPercent}%
            </span>
          </div>

          <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>Calories: {totals.calories} kcal</span>
            <span>Carbs: {totals.carbsG}g • Fat: {totals.fatG}g</span>
          </div>
        </div>

        {/* Water Intake Tracker Card */}
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-cyan-950 text-white p-6 border border-cyan-800/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5" /> Hydration
              </span>
              <h3 className="text-2xl font-black font-mono mt-0.5">
                {waterGlasses} / {targetGlasses} <span className="text-xs font-normal text-gray-400">glasses (~{(waterGlasses * 250) / 1000}L)</span>
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAdjustWater(-1)}
                className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm flex items-center justify-center transition-colors"
              >
                -
              </button>
              <button
                onClick={() => handleAdjustWater(1)}
                className="w-8 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-sm flex items-center justify-center transition-colors shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          <span className="text-xs text-gray-400 block pt-1">Target: ~3000ml daily for optimal performance and recovery.</span>
        </div>

      </div>

      {/* Grocery List Modal / Collapsible */}
      {showGrocery && (
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" /> High-Protein Indian Vegetarian Grocery Checklist
            </h3>
            <button onClick={() => setShowGrocery(false)} className="text-xs text-gray-400 hover:text-white">Close</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {groceryList.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                  {cat.category}
                </span>
                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Meal Form */}
      {showAddMeal && (
        <form onSubmit={handleAddMeal} className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-md space-y-4 animate-scale-up">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log Vegetarian Meal</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Meal Timing</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snack">Snack</option>
                <option value="Dinner">Dinner</option>
                <option value="Pre-workout">Pre-workout</option>
                <option value="Post-workout">Post-workout</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Food Item *</label>
              <input
                type="text"
                required
                placeholder="e.g. Soy Chunks with Rice or Paneer Bhurji"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Quantity</label>
              <input
                type="text"
                placeholder="e.g. 50g raw"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Protein (g)</label>
              <input
                type="number"
                step="0.5"
                placeholder="grams"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Carbs (g)</label>
              <input
                type="number"
                step="0.5"
                placeholder="grams"
                value={carbsG}
                onChange={(e) => setCarbsG(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Calories</label>
              <input
                type="number"
                step="1"
                placeholder="kcal"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddMeal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingMeal}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-gray-950 font-bold text-xs sm:text-sm"
            >
              {savingMeal ? 'Logging...' : 'Save Meal'}
            </button>
          </div>
        </form>
      )}

      {/* Navigation Tabs between Today's Meals, Food Database, and Budget Substitutions */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('meals')}
          className={`pb-3 transition-colors ${
            activeTab === 'meals'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          Today's Logged Meals ({entries.length})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 transition-colors ${
            activeTab === 'database'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          Indian Vegetarian Foods Directory ({foodDb?.foods?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('substitutions')}
          className={`pb-3 transition-colors ${
            activeTab === 'substitutions'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          Budget-Friendly Swaps
        </button>
      </div>

      {/* Tab 1: Today's Logged Meals */}
      {activeTab === 'meals' && (
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 space-y-3">
          {entries.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">
              No meals logged today yet. Use the "Log Meal" button or pick a food from the directory below!
            </p>
          ) : (
            entries.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {item.mealType}
                    </span>
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.foodItem}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty: {item.quantity} • {item.calories || 0} kcal • {item.carbsG || 0}g Carbs • {item.fatG || 0}g Fat
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                    +{item.proteinG}g protein
                  </span>
                  <button
                    onClick={() => handleDeleteMeal(item.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Foods Directory */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {foodDb?.foods?.map((f, i) => (
            <div
              key={i}
              onClick={() => handleSelectPredefinedFood(f)}
              className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-500 block mb-1">
                  {f.category}
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{f.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{f.serving} • {f.calories} kcal</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {f.proteinG}g Protein
                </span>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-0.5">
                  + Log this
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Budget Substitutions */}
      {activeTab === 'substitutions' && (
        <div className="space-y-3">
          {foodDb?.budgetSubstitutions?.map((sub, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-500 line-through">{sub.target}</span>
                  <span className="text-gray-400">➔</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{sub.substitution}</span>
                </div>
                <p className="text-xs text-gray-500">{sub.proteinYield}</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs shrink-0 self-start sm:self-auto">
                {sub.savings}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
