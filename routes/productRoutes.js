const express = require('express');
const authController = require('./../controllers/AuthController');
const productController = require('./../controllers/productController');
const productRouter = express.Router();

productRouter
  .route('/')
  .post(productController.createProduct)
  .get(productController.getAllProducts);

productRouter
  .route('/checkout')
  .get(authController.protect, productController.checkout);

productRouter
  .route('/add-item/:productname/:quantity')
  .get(authController.protect, productController.addProductToCart);

productRouter
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct);

module.exports = productRouter;
