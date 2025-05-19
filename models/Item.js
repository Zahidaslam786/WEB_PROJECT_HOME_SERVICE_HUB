const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  // ...add more fields as needed...
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
