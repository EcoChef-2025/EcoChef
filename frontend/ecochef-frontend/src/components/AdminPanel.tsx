import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'; // Icons for actions

// Simulated recipe data
const initialRecipes = [
  { id: '1', title: 'Vegan Stir-Fry', prepTime: 20, steps: ['Heat oil', 'Add tofu'] },
  { id: '2', title: 'Halal Chicken Curry', prepTime: 30, steps: ['Cook chicken', 'Add spices'] },
];

// Simulated feedback data for analytics
const initialFeedback = [
  { id: 'f1', recipeId: '1', rating: 4, comment: 'Great dish!' },
  { id: 'f2', recipeId: '2', rating: 3, comment: 'Needs more spice' },
];

const AdminPanel: React.FC = () => {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [newRecipe, setNewRecipe] = useState({ title: '', prepTime: 0, steps: [''] });
  const [editRecipe, setEditRecipe] = useState<{ id: string; title: string; prepTime: number; steps: string[] } | null>(null);
  const [feedback] = useState(initialFeedback);

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecipe.title && newRecipe.prepTime > 0) {
      setRecipes([...recipes, { id: Date.now().toString(), ...newRecipe }]);
      setNewRecipe({ title: '', prepTime: 0, steps: [''] });
    }
  };

  const handleEditRecipe = (recipe: { id: string; title: string; prepTime: number; steps: string[] }) => {
    setEditRecipe(recipe);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editRecipe) {
      setRecipes(recipes.map((r) => (r.id === editRecipe.id ? editRecipe : r)));
      setEditRecipe(null);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length || 0;

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Add New Recipe</h3>
        <form onSubmit={handleAddRecipe} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={newRecipe.title}
              onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:w-3/4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prep Time (min)</label>
            <input
              type="number"
              value={newRecipe.prepTime}
              onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:w-1/3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Steps</label>
            <textarea
              value={newRecipe.steps.join('\n')}
              onChange={(e) => setNewRecipe({ ...newRecipe, steps: e.target.value.split('\n') })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 sm:px-6"
          >
            <FaPlus className="mr-2" /> Add Recipe
          </button>
        </form>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Manage Recipes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold text-gray-800">{recipe.title}</h4>
              <p className="text-gray-600">Prep Time: {recipe.prepTime} min</p>
              <p className="text-gray-600">Steps: {recipe.steps.join(', ')}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleEditRecipe(recipe)}
                  className="flex items-center px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 sm:px-3"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="flex items-center px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 sm:px-3"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
              {editRecipe && editRecipe.id === recipe.id && (
                <form onSubmit={handleSaveEdit} className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={editRecipe.title}
                    onChange={(e) => setEditRecipe({ ...editRecipe!, title: e.target.value })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:w-3/4"
                  />
                  <input
                    type="number"
                    value={editRecipe.prepTime}
                    onChange={(e) => setEditRecipe({ ...editRecipe!, prepTime: parseInt(e.target.value) })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:w-1/3"
                  />
                  <textarea
                    value={editRecipe.steps.join('\n')}
                    onChange={(e) => setEditRecipe({ ...editRecipe!, steps: e.target.value.split('\n') })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 sm:px-6"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRecipe(null)}
                    className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 sm:px-5"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Analytics</h3>
        <p className="text-gray-600">Average Rating: {averageRating.toFixed(1)} / 5</p>
        <p className="text-gray-600">Total Feedback: {feedback.length}</p>
      </div>
    </div>
  );
};

export default AdminPanel;