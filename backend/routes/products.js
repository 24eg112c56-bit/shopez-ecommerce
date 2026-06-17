const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products (with search & filtering)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Filter by category if provided
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by search keyword in name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).populate('seller', 'name email').sort({ createdAt: -1 });
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.id || req.params.id).populate('seller', 'name email');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a product listing
// @route   POST /api/products
// @access  Private/Seller
router.post('/', protect, authorize('SELLER'), async (req, res) => {
  try {
    const { name, description, price, discount, category, image, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name, description, price and category' });
    }

    const product = new Product({
      name,
      description,
      price,
      discount: discount || 0,
      category,
      image: image || undefined,
      stock: stock || 10,
      seller: req.user.id
    });

    const createdProduct = await product.save();
    return res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a product listing
// @route   PUT /api/products/:id
// @access  Private/Seller
router.put('/:id', protect, authorize('SELLER'), async (req, res) => {
  try {
    const { name, description, price, discount, category, image, stock } = req.body;

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership of listing
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this product' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.discount = discount !== undefined ? discount : product.discount;
    product.category = category || product.category;
    product.image = image || product.image;
    product.stock = stock !== undefined ? stock : product.stock;

    const updatedProduct = await product.save();
    return res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
// @access  Private/Seller
router.delete('/:id', protect, authorize('SELLER'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership of listing
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Product listing successfully deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a product review
// @route   POST /api/products/:id/review
// @access  Private/User
router.post('/:id/review', protect, authorize('USER'), async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide a rating and a comment' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already submitted a review
    const alreadyReviewed = product.reviews.find(
      (r) => r.username === req.user.name
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = {
      username: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date()
    };

    product.reviews.push(review);
    product.updateAverageRating();

    await product.save();
    return res.status(201).json({ success: true, message: 'Review added successfully', product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
