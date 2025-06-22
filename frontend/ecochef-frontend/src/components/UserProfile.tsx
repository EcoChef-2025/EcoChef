import React, { useState } from 'react';
import { FaUser, FaEdit } from 'react-icons/fa'; // Icons for user and edit

// Simulated user data
const initialUser = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  dietaryPreferences: ['vegan', 'gluten-free'],
  savedRecipes: ['Vegan Stir-Fry', 'Low-Carb Salad'],
  savedIngredients: ['tofu', 'broccoli'],
};

const UserProfile: React.FC = () => {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrefs, setEditPrefs] = useState<string[]>(initialUser.dietaryPreferences);

  const dietaryOptions = ['vegan', 'halal', 'vegetarian', 'low-carb', 'gluten-free'];

  const handleSavePrefs = () => {
    setUser({ ...user, dietaryPreferences: editPrefs });
    setIsEditing(false);
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <FaUser className="mr-2" /> My Profile
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <p className="text-gray-700"><strong>Name:</strong> {user.name}</p>
          <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Dietary Preferences</h3>
          {!isEditing ? (
            <div>
              {user.dietaryPreferences.length > 0 ? (
                user.dietaryPreferences.map((pref) => (
                  <span
                    key={pref}
                    className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                  >
                    {pref}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No preferences set</p>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 sm:px-4"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-3">
                {dietaryOptions.map((pref) => (
                  <label key={pref} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editPrefs.includes(pref)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditPrefs([...editPrefs, pref]);
                        } else {
                          setEditPrefs(editPrefs.filter((p) => p !== pref));
                        }
                      }}
                      className="mr-2"
                    />
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </label>
                ))}
              </div>
              <button
                onClick={handleSavePrefs}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 sm:px-6"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 sm:px-5"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Saved Recipes</h3>
          <ul className="list-disc list-inside">
            {user.savedRecipes.map((recipe, index) => (
              <li key={index} className="text-gray-600">{recipe}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Saved Ingredients</h3>
          <ul className="list-disc list-inside">
            {user.savedIngredients.map((ingredient, index) => (
              <li key={index} className="text-gray-600">{ingredient}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;