const mongoose = require('mongoose');
const slugfiy = require('slugify');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'product must has name'],
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'product must has price']
  },
  weight: {
    type: Number,
    required: [true, 'product must has weight']
  },
  quantity: {
    type: Number,
    maxlength: [100, 'To much quantity'],
    minlength: [0, 'Quantity cannot be zero or less'],
    required: [true, 'each product has quantity']
  },
  Slug: { type: String }
});

productSchema.pre('save', function (next) {
  this.Slug = slugfiy(this.name, { lower: true });
  next();
});

const product = mongoose.model('product', productSchema);

module.exports = product;
