import React, { useState, useEffect } from 'react';
import { FaLeaf } from 'react-icons/fa'; // Food-related icon (leaf)
import { Link } from 'react-router-dom';
import IngredientFilter from './IngredientFilter';
import RecipeResults from './RecipeResults';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DashboardPage: React.FC = () => {
  const { ingredients, setIngredients, recipes, setRecipes, user } = useAuth();
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dietaryOptions = ['vegan', 'halal', 'vegetarian', 'low-carb', 'gluten-free'];

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/recipes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
        console.log('API Response:', response.data);
        setRecipes(response.data); // Expect array of recipes
      } catch (error) {
        console.error('Failed to fetch recipes:', error.response?.data || error.message);
        setError('Failed to load recipes. Check your connection or filters.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [user, setRecipes]);

  const handleApplyFilters = () => {
    console.log('Applying filters:', { ingredients, dietaryPrefs, maxPrepTime });
    // Implement filtering logic with API later
  };

  if (loading) return <p className="text-center text-gray-600">Loading recipes...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <span className="animated-emoji emoji-1">🌱</span>
      <span className="animated-emoji emoji-2">🍃</span>
      <span className="animated-emoji emoji-3">🥦</span>
      <span className="animated-emoji emoji-4">🥬</span>
      <span className="animated-emoji emoji-5">🥒</span>
      <span className="animated-emoji emoji-6">🍏</span>
      <span className="animated-emoji emoji-7">🌿</span>
      <span className="animated-emoji emoji-8">🫑</span>
      <header className="bg-green-600 text-white p-4 flex items-center justify-between sm:p-6">
        <h1 className="text-xl font-bold flex items-center sm:text-2xl">
          <FaLeaf className="mr-2" /> EcoChef Dashboard
        </h1>
        <button
          onClick={() => console.log('Logout')}
          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 sm:p-3"
        >
          Logout
        </button>
      </header>
      <div className="p-6 sm:p-8">
        <IngredientFilter
          ingredients={ingredients.join(', ') || ''}
          setIngredients={(value) => setIngredients(value.split(',').map((ing) => ing.trim()))}
          dietaryPrefs={dietaryPrefs}
          setDietaryPrefs={setDietaryPrefs}
          maxPrepTime={maxPrepTime}
          setMaxPrepTime={setMaxPrepTime}
          onApplyFilters={handleApplyFilters}
        />
        <RecipeResults recipes={recipes} />
      </div>
      <div className="p-6 sm:p-8">
        <Link to="/recipe/1" className="text-blue-500 hover:underline text-sm sm:text-base">
          View Details for Vegan Stir-Fry
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;