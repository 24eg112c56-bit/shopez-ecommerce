const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create a new order (Checkout)
// @route   POST /api/orders
// @access  Private/User
router.post('/', protect, authorize('USER'), async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in the order' });
    }
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ success: false, message: 'Please provide complete shipping address' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let calculatedTotalPrice = 0;
    const itemsToSave = [];

    // Verify stock and calculate price
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}`
        });
      }

      // Calculate discount price if applicable
      const priceAfterDiscount = product.price * (1 - (product.discount || 0) / 100);
      calculatedTotalPrice += priceAfterDiscount * item.quantity;

      itemsToSave.push({
        product: product._id,
        name: product.name,
        price: Math.round(priceAfterDiscount * 100) / 100,
        quantity: item.quantity
      });
    }

    calculatedTotalPrice = Math.round(calculatedTotalPrice * 100) / 100;
    const shippingFee = calculatedTotalPrice > 150 ? 0 : 9.99;
    const orderTotal = Math.round((calculatedTotalPrice + shippingFee) * 100) / 100;

    // Check if buyer has enough virtual wallet balance
    if (user.balance < orderTotal) {
      return res.status(400).json({
        success: false,
        message: `Insufficient virtual wallet balance. Required: $${orderTotal}, Available: $${user.balance}`
      });
    }

    // Deduct user balance and save user
    user.balance = Math.round((user.balance - orderTotal) * 100) / 100;
    await user.save();

    // Decrement product stock levels
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create order
    const order = await Order.create({
      buyer: req.user.id,
      items: itemsToSave,
      totalPrice: orderTotal,
      shippingFee,
      shippingAddress
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
      updatedBalance: user.balance
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private/User
router.get('/my-orders', protect, authorize('USER'), async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get orders for products listed by seller
// @route   GET /api/orders/seller-orders
// @access  Private/Seller
router.get('/seller-orders', protect, authorize('SELLER'), async (req, res) => {
  try {
    // Find all products owned by this seller
    const sellerProducts = await Product.find({ seller: req.user.id }).select('_id');
    const sellerProductIds = sellerProducts.map((p) => p._id.toString());

    // Find all orders that have any items matching those product ids
    const allOrders = await Order.find({
      'items.product': { $in: sellerProductIds }
    }).populate('buyer', 'name email').sort({ createdAt: -1 });

    // For each order, we can filter or mark the items that belong to this seller
    const filteredOrders = allOrders.map((order) => {
      const orderObj = order.toObject();
      // Filter items to show only seller's items
      const sellerItems = orderObj.items.filter((item) =>
        sellerProductIds.includes(item.product.toString())
      );
      
      // Calculate total price for this seller's share
      const sellerSubtotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        ...orderObj,
        sellerItems,
        sellerSubtotal: Math.round(sellerSubtotal * 100) / 100
      };
    });

    return res.json({ success: true, count: filteredOrders.length, orders: filteredOrders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Seller
router.put('/:id/status', protect, authorize('SELLER'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify order contains seller's products
    const sellerProducts = await Product.find({ seller: req.user.id }).select('_id');
    const sellerProductIds = sellerProducts.map((p) => p._id.toString());
    const hasSellerProduct = order.items.some((item) =>
      sellerProductIds.includes(item.product.toString())
    );

    if (!hasSellerProduct) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this order status (none of your products are in this order)'
      });
    }

    order.status = status;
    await order.save();

    return res.json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
