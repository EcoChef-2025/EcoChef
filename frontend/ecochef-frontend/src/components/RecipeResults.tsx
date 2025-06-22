import React, { useState } from 'react';
import { FaClock, FaLink } from 'react-icons/fa'; 
import { Link } from 'react-router-dom'; 

interface Recipe {
  id: string;
  title: string;
  prepTime: number;
  cookTime: number;
  dietaryTags: string[];
}

interface RecipeResultsProps {
  recipes: Recipe[];
}

const RecipeResults: React.FC<RecipeResultsProps> = ({ recipes }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 3;

  // Pagination logic
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  if (recipes.length === 0) {
    return <p className="text-gray-600 text-center">No recipes found.</p>;
  }

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Recipe Results</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800">{recipe.title}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-2">
              <FaClock className="mr-1" />
              <span>Prep: {recipe.prepTime} min</span>
              <span className="mx-2">|</span>
              <span>Cook: {recipe.cookTime} min</span>
            </div>
            <div className="mt-2">
              {recipe.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link to={`/recipe/${recipe.id}`} className="mt-2 inline-flex items-center text-blue-500 hover:underline">
              <FaLink className="mr-1" /> View Details
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2 disabled:opacity-50 sm:px-5 sm:py-2"
        >
          Previous
        </button>
        <span className="px-4 py-2 sm:px-5 sm:py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 sm:px-5 sm:py-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RecipeResults;