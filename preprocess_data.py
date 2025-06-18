import requests
import pymongo
import nltk
from nltk.stem import WordNetLemmatizer

# Download NLTK data
nltk.download('wordnet')

# Edamam Recipe Search API credentials
EDAMAM_APP_ID = "d4bba782"  # ID
EDAMAM_APP_KEY = "8777696d5d73716ab8f322ce0359830c"  # API Key
MONGO_URI = "mongodb+srv://ecochef08:fXDkRGDHHBrgcyeJ@ecochef-db.bailntz.mongodb.net/?retryWrites=true&w=majority&appName=EcoChef-DB"  # Your connection string
EDAMAM_USER_ID = "Ecochef2025"  # Edamam account ID

def connect_to_mongodb():
    client = pymongo.MongoClient(MONGO_URI)
    db = client["ecochef_db"]  # Use 'ecochef_db' database
    return db

def fetch_recipes(query="chicken,tomato"):
    url = f"https://api.edamam.com/api/recipes/v2?type=public&q={query}&app_id={EDAMAM_APP_ID}&app_key={EDAMAM_APP_KEY}&field=label&field=ingredients&field=totalTime&field=dietLabels"
    headers = {
        "Edamam-Account-User": EDAMAM_USER_ID
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

def clean_ingredient_name(ingredient_dict):
    lemmatizer = WordNetLemmatizer()
    # Use 'food' field if available (base ingredient name), otherwise use 'text'
    name = ingredient_dict.get('food', ingredient_dict.get('text', ''))
    # Clean the name by removing descriptors and lemmatizing
    return lemmatizer.lemmatize(name.lower().replace("fresh ", "").replace("dried ", ""))

def store_recipes(db, recipe_data):
    recipes_collection = db["Recipes"]
    ingredients_collection = db["Ingredients"]
    recipe_ingredient_collection = db["Recipe_Ingredient"]

    if recipe_data and "hits" in recipe_data:
        for hit in recipe_data["hits"]:
            recipe = hit["recipe"]
            recipe_id = str(hash(recipe["label"]))  # Simple ID generation
            recipes_collection.update_one(
                {"recipe_id": recipe_id},
                {"$set": {
                    "recipe_id": recipe_id,
                    "title": recipe["label"],
                    "prep_time": recipe.get("totalTime", 0),
                    "steps": ["No steps available"],  # Add logic later to fetch steps if needed
                    "dietary_tags": recipe.get("dietLabels", [])
                }},
                upsert=True
            )
            for ing in recipe.get("ingredients", []):
                ing_name = clean_ingredient_name(ing)
                ing_id = str(hash(ing_name))
                ingredients_collection.update_one(
                    {"ingredient_id": ing_id},
                    {"$set": {
                        "ingredient_id": ing_id,
                        "name": ing_name,
                        "category": ing.get("foodCategory", "unknown")  # Use the API's category if available
                    }},
                    upsert=True
                )
                recipe_ingredient_collection.update_one(
                    {"recipe_id": recipe_id, "ingredient_id": ing_id},
                    {"$set": {
                        "recipe_id": recipe_id,
                        "ingredient_id": ing_id,
                        "quantity": ing.get("quantity", 1),
                        "unit": ing.get("measure", "unit")
                    }},
                    upsert=True
                )
        print(f"Stored {len(recipe_data['hits'])} recipes in MongoDB.")

def main():
    db = connect_to_mongodb()
    recipe_data = fetch_recipes()
    if recipe_data:
        store_recipes(db, recipe_data)

if __name__ == "__main__":
    main()