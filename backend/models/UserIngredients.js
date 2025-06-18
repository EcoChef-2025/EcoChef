const mongoose = require('mongoose');

const userIngredientsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ingredientId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'unit' },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserIngredients', userIngredientsSchema);