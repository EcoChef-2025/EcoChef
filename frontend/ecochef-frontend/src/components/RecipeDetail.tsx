import React, { useState } from 'react';
import { FaHeart, FaBookmark } from 'react-icons/fa'; // Icons for like and save

// Simulated detailed recipe data
const sampleRecipe = {
  id: '1',
  title: 'Vegan Stir-Fry',
  prepTime: 20,
  cookTime: 15,
  ingredients: ['1 cup tofu', '2 cups broccoli', '1 tbsp soy sauce', '1 tsp olive oil'],
  steps: ['Heat oil in a pan.', 'Add tofu and cook for 5 minutes.', 'Add broccoli and soy sauce, cook for 10 minutes.', 'Serve hot.'],
  dietaryTags: ['vegan', 'low-carb'],
  imageUrl: 'https://via.placeholder.com/400x300?text=Vegan+Stir-Fry', // Placeholder image
};

const RecipeDetail: React.FC = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      console.log('Feedback submitted:', { recipeId: sampleRecipe.id, rating, comment });
      setSubmitStatus('Feedback submitted successfully!');
      setRating(0);
      setComment('');
      setTimeout(() => setSubmitStatus(null), 3000);
    } else {
      setSubmitStatus('Please select a rating before submitting.');
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{sampleRecipe.title}</h2>
      <img
        src={sampleRecipe.imageUrl}
        alt={sampleRecipe.title}
        className="w-full h-64 object-cover rounded-lg mb-4 sm:h-80"
      />
      <div className="flex items-center text-gray-600 text-sm mb-4">
        <FaHeart className={`mr-2 ${isLiked ? 'text-red-500' : 'text-gray-400'}`} />
        <span>Prep: {sampleRecipe.prepTime} min | Cook: {sampleRecipe.cookTime} min</span>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Ingredients</h3>
        <ul className="list-disc list-inside mt-2">
          {sampleRecipe.ingredients.map((ingredient, index) => (
            <li key={index} className="text-gray-600">{ingredient}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Steps</h3>
        <ol className="list-decimal list-inside mt-2">
          {sampleRecipe.steps.map((step, index) => (
            <li key={index} className="text-gray-600">{step}</li>
          ))}
        </ol>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Dietary Tags</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {sampleRecipe.dietaryTags.map((tag) => (
            <span
              key={tag}
              className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Leave Feedback</h3>
        <form onSubmit={handleSubmitFeedback} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
            <select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:w-1/2"
            >
              <option value="0">Select a rating</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 sm:w-auto sm:px-6"
          >
            Submit Feedback
          </button>
          {submitStatus && <p className="text-green-600 text-sm mt-2">{submitStatus}</p>}
        </form>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="flex items-center px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 sm:px-5"
        >
          <FaHeart className={`mr-2 ${isLiked ? 'text-red-500' : 'text-gray-400'}`} />
          {isLiked ? 'Unlike' : 'Like'}
        </button>
        <button
          onClick={() => setIsSaved(!isSaved)}
          className="flex items-center px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 sm:px-5"
        >
          <FaBookmark className={`mr-2 ${isSaved ? 'text-yellow-500' : 'text-gray-400'}`} />
          {isSaved ? 'Unsave' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;