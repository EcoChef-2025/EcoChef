from flask import Flask, request, jsonify
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import numpy as np

# Download NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')

app = Flask(__name__)

# MongoDB connection
MONGO_URI = "mongodb+srv://ecochef08:fXDkRGDHHBrgcyeJ@ecochef-db.bailntz.mongodb.net/ecochef_db?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["ecochef_db"]
recipes_collection = db["Recipes"]
ingredients_collection = db["Ingredients"]
recipe_ingredient_collection = db["Recipe_Ingredient"]  # Corrected collection name
user_ingredients_collection = db["useringredients"]

# Load recipe data
def load_recipes():
    recipes = list(recipes_collection.find())
    for recipe in recipes:
        # Fetch ingredient names by joining Recipe_Ingredient with Ingredients
        ingredient_ids = [ing['ingredient_id'] for ing in recipe_ingredient_collection.find({'recipe_id': recipe['recipe_id']})]
        ingredient_names = [ing['name'] for ing in ingredients_collection.find({'ingredient_id': {'$in': ingredient_ids}})]
        recipe['ingredients_text'] = ' '.join(ingredient_names)
    return recipes

# Preprocess text for TF-IDF
def preprocess_text(text):
    stop_words = set(stopwords.words('english'))
    tokens = word_tokenize(text.lower())
    return ' '.join([word for word in tokens if word.isalnum() and word not in stop_words])

# Build TF-IDF matrix
recipes = load_recipes()
corpus = [preprocess_text(recipe['ingredients_text']) for recipe in recipes]
tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(corpus)

@app.route('/api/recommend', methods=['POST'])
def recommend_recipes():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        if not user_id:
            return jsonify({"error": "userId is required"}), 400

        # Get user ingredients
        user_ingredients = list(user_ingredients_collection.find({"userId": user_id}))
        user_ingredients_text = ' '.join([ing['ingredientId'] for ing in user_ingredients])

        # Transform user ingredients to TF-IDF
        user_tfidf = tfidf_vectorizer.transform([preprocess_text(user_ingredients_text)])

        # Calculate cosine similarity
        similarity_scores = cosine_similarity(user_tfidf, tfidf_matrix)

        # Get top 5 recommendations
        top_indices = similarity_scores.argsort()[0][-5:][::-1]
        recommendations = [recipes[i]['recipe_id'] for i in top_indices]

        return jsonify({"recommendations": recommendations}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')