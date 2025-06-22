require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const UserIngredients = require('./models/UserIngredients');
const Feedback = require('./models/Feedback');
const axios = require('axios');
const NodeCache = require('node-cache');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});

// CORS Configuration for development only
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json());

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined. Check your .env file.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

const cache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 120
});

app.post('/api/register', async (req, res) => {
  console.log('Registration request received:', req.body.email);
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      passwordHash,
      dietaryPreferences: [],
      isAdmin: false 
    });
    
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Registration successful for:', email);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('Login request received:', req.body.email);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    console.log('Login successful for:', email);
    
    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ingredients', authenticateToken, async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: 'Ingredients must be an array' });
    }

    const userId = req.user.id;
    const ingredientRecords = ingredients.map(ing => ({
      userId,
      ingredientId: ing.ingredientId || String(Math.random()),
      quantity: ing.quantity || 1,
      unit: ing.unit || 'unit'
    }));

    await UserIngredients.insertMany(ingredientRecords);
    res.status(201).json({ message: 'Ingredients saved successfully' });
  } catch (error) {
    console.error('Ingredient input error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/recommendations', authenticateToken, async (req, res) => {
  console.log('Recommendations route hit for userId:', req.user.id);
  try {
    const userId = req.user.id;
    const response = await axios.post('http://localhost:5000/api/recommend', { userId });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Recommendation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get recommendations', details: error.message });
  }
});

app.get('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const { ingredients, health } = req.query;
    const cacheKey = `${ingredients || ''}-${health || ''}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    let userIngredients = [];
    if (!ingredients) {
      const userIngredientsData = await UserIngredients.find({ userId: req.user.id });
      userIngredients = userIngredientsData.map(ing => ing.ingredientId);
    } else {
      userIngredients = ingredients.split(',');
    }

    const edamamUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(userIngredients.join(','))}&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&field=label&field=ingredients&field=totalTime&field=dietLabels${health ? `&health=${encodeURIComponent(health)}` : ''}`;
    const headers = { 'Edamam-Account-User': process.env.EDAMAM_USER_ID };
    const response = await axios.get(edamamUrl, { headers });

    const recipes = response.data.hits.map(hit => ({
      recipe_id: String(hash(`${hit.recipe.label}-${Date.now()}`)),
      title: hit.recipe.label,
      prep_time: hit.recipe.totalTime || 30,
      steps: ['No steps available'],
      dietary_tags: hit.recipe.dietLabels || []
    }));

    const recipesCollection = mongoose.connection.db.collection('Recipes');
    await recipesCollection.insertMany(recipes, { ordered: false });

    cache.set(cacheKey, recipes);

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Recipe API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch recipes', details: error.message });
  }
});

app.post('/api/feedback', [
  authenticateToken,
  body('recipeId').trim().escape(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipeId, rating, comment } = req.body;
    const userId = req.user.id;
    const feedback = new Feedback({ userId, recipeId, rating, comment });
    await feedback.save();
    res.status(201).json({ message: 'Feedback saved successfully' });
  } catch (error) {
    console.error('Feedback error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/recipes', authenticateAdmin, async (req, res) => {
  try {
    const recipes = await mongoose.connection.db.collection('Recipes').find().toArray();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Admin recipes error:', error.message);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.post('/api/admin/recipes', authenticateAdmin, async (req, res) => {
  try {
    const { title, prep_time, steps, dietary_tags } = req.body;
    if (!title || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'title and steps array are required' });
    }

    const recipe = {
      recipe_id: String(hash(`${title}-${Date.now()}`)),
      title,
      prep_time: prep_time || 30,
      steps,
      dietary_tags: dietary_tags || []
    };
    await mongoose.connection.db.collection('Recipes').insertOne(recipe);
    res.status(201).json({ message: 'Recipe added successfully', recipe });
  } catch (error) {
    console.error('Admin add recipe error:', error.message);
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

app.delete('/api/admin/recipes/:recipeId', authenticateAdmin, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const result = await mongoose.connection.db.collection('Recipes').deleteOne({ recipe_id: recipeId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Admin delete recipe error:', error.message);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

app.get('/api/admin/feedback', authenticateAdmin, async (req, res) => {
  try {
    const feedback = await mongoose.connection.db.collection('feedback').find().toArray();
    const totalRatings = feedback.reduce((sum, fb) => sum + fb.rating, 0);
    const averageRating = feedback.length > 0 ? totalRatings / feedback.length : 0;
    res.status(200).json({ feedback, analytics: { averageRating, totalFeedback: feedback.length } });
  } catch (error) {
    console.error('Admin feedback error:', error.message);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return hash;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:5173`);
});