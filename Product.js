
import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  label: String,
  value: Number,
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  media: String,
  prices: [priceSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
