const ProductModel = require('./../models/productModel');
const CartModel = require('./../models/cartModel');
const catchAsync = require('./../utils/catchAsync');
const product = require('./../classes/product');
const cart = require('./../classes/carts');
const Email = require('./../utils/email');
const AppError = require('../utils/AppError');

exports.createProduct = catchAsync(async (req, res, next) => {
  const item = await ProductModel.create(req.body);

  res.status(201).json({
    status: 'success',
    item
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const items = await ProductModel.find();

  res.status(200).json({
    status: 'success',
    items
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const item = await ProductModel.findById(id);
  if (!item) return next(new AppError('No Product exist with this ID', 404));

  res.status(200).json({
    status: 'success',
    item
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const item = await ProductModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });
  if (!item) return next(new appError('No Product exist with this ID', 404));

  res.status(200).json({
    status: 'success',
    item
  });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {
  // User Quantity
  const RequiredQuantity = +req.params.quantity;
  // Get The product to add
  const item = await ProductModel.findOne({ Slug: req.params.productname });

  // Check if the product still exist
  if (!item)
    return next(new AppError('This product not exist, will be add soon', 404));

  // Handel if the product Quantity not enough
  const Addedproduct = new product(item);
  if (Addedproduct.CheckQuantity(RequiredQuantity))
    return next(
      new AppError(
        `Not Enough Quantity, max Quantity is : ${item.quantity}`,
        404
      )
    );

  let UserCart;
  UserCart = await CartModel.findOne({ user: req.user.id }).select('-__v');
  if (!UserCart)
    UserCart = await CartModel.create({
      user: req.user.id,
      items: [],
      totalamount: 0,
      totalWeight: 0
    });

  const user_cart = new cart(UserCart);
  user_cart.addItem(item, RequiredQuantity);
  await user_cart.updateCart();

  // Remove the Quantity from the product
  const UpdatePrdouct = await ProductModel.findByIdAndUpdate(
    item.id,
    {
      $inc: { quantity: -RequiredQuantity }
    },
    {
      new: true,
      runValidators: true
    }
  );

  // Check if product quantity = zero
  if (UpdatePrdouct.quantity == 0)
    await ProductModel.findByIdAndDelete(item.id);

  res.status(200).json({
    status: 'success',
    UserCart
  });
});

exports.checkout = catchAsync(async (req, res, next) => {
  // Get UserCart
  const UserCart = await CartModel.findOne({ user: req.user.id }).select(
    '-__v'
  );
  if (!UserCart)
    return next(new AppError('You make the payment only one time.', 404));

  const user_cart = new cart(UserCart);
  const shipmentMessage = user_cart.Shipment();
  const receiptMessage = user_cart.receipt();
  const fullMessage = shipmentMessage + '\n' + receiptMessage;
  await new Email(req.user, fullMessage).CheckOut();

  await CartModel.deleteOne({ user: req.user.id });
  res.status(200).json({
    status: 'success',
    message: 'Please check your gmail'
  });
});
