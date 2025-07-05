const mongoose = require('mongoose');

const CartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'Each cart has user']
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product'
      },
      productName: { type: String },
      productPrice: { type: Number },
      orderedQuantity: { type: Number },
      productWeight: { type: Number }
    }
  ],
  totalamount: { type: Number },
  totalWeight: { type: Number }
});

const cart = mongoose.model('cart', CartSchema);
module.exports = cart;
