const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a product description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: [0, 'Price must be positive']
  },
  discount: {
    type: Number,
    default: 0, // Discount percentage, e.g. 15 for 15% off
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  category: {
    type: String,
    required: [true, 'Please add a product category'],
    trim: true
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' // High-quality default product image
  },
  stock: {
    type: Number,
    default: 10,
    min: [0, 'Stock cannot be negative']
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [ReviewSchema],
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average ratings dynamically before saving review list updates
ProductSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const total = this.reviews.reduce((acc, item) => acc + item.rating, 0);
    this.ratings.average = Math.round((total / this.reviews.length) * 10) / 10;
    this.ratings.count = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', ProductSchema);
