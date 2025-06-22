import React from 'react';

interface IngredientFilterProps {
  ingredients: string;
  setIngredients: (value: string) => void;
  dietaryPrefs: string[];
  setDietaryPrefs: (value: string[]) => void;
  maxPrepTime: number;
  setMaxPrepTime: (value: number) => void;
  onApplyFilters: () => void;
}

const IngredientFilter: React.FC<IngredientFilterProps> = ({
  ingredients,
  setIngredients,
  dietaryPrefs,
  setDietaryPrefs,
  maxPrepTime,
  setMaxPrepTime,
  onApplyFilters,
}) => {
  const dietaryOptions = ['vegan', 'halal', 'vegetarian', 'low-carb', 'gluten-free'];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Ingredient & Filter Selection</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ingredients (comma-separated)</label>
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., chicken, tomato"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dietary Preferences</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {dietaryOptions.map((pref) => (
              <label key={pref} className="flex items-center">
                <input
                  type="checkbox"
                  checked={dietaryPrefs.includes(pref)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDietaryPrefs([...dietaryPrefs, pref]);
                    } else {
                      setDietaryPrefs(dietaryPrefs.filter((p) => p !== pref));
                    }
                  }}
                  className="mr-2"
                />
                {pref.charAt(0).toUpperCase() + pref.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Prep Time (minutes)</label>
          <input
            type="range"
            min="0"
            max="120"
            value={maxPrepTime}
            onChange={(e) => setMaxPrepTime(parseInt(e.target.value))}
            className="w-full mt-1"
          />
          <span className="text-sm text-gray-600">{maxPrepTime} min</span>
        </div>
        <button
          onClick={onApplyFilters}
          className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default IngredientFilter;