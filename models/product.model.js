const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true },
  price: { type: Number }, // Optional: in case the variation has a different price
  sku: { type: String },   // Optional: for inventory systems
  images: [{
    imageUrl: { type: String },
    publicId: { type: String },
  }],
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // Base price
  category: { type: String, required: true },
  description: { type: String, required: true },
  keyFeatures: [{ type: String, required: true }],

  variations: [variationSchema], // <-- Array of product variations

  images: [{
    imageUrl: { type: String },
    publicId: { type: String },
  }],

  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: { type: String },
      rating: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const ProductSchema = mongoose.model('Product', productSchema);
module.exports = ProductSchema;
