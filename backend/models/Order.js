const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    address: {
      type: String,
      required: [true, 'Please add a shipping address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
