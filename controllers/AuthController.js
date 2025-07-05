const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const AppError = require('./../utils/AppError');

const singToken = (id) => {
  //PAYLOAD: id of record, SECRET: long string, OPTIONS: expireIn after x days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRE_IN
  });
};

const sendToken = (user, statusCode, req, res) => {
  const token = singToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // REMOVE password from response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    user
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check email, password has values
  if (!email || !password)
    return next(new AppError('Please Enter password and email', 400));

  // 2) Check if email, password exist in database
  const user = await User.findOne({ email }).select('+password');
  // console.log(user);
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('incorrect password or email', 401));

  // 3) Ruturn a token
  sendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('You not logged in, pleas log in'), 401);

  // 2) Verifying the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('This user has no longer exist.', 401));
  // 4) check if the user changed his password
  if (currentUser.changedPassword(decoded.iat))
    return next(new AppError('password has changed, please login again', 401));

  //TOKEN has been verfiyied
  //Let's send out user throw middlewares to make some authorization
  //USER NOW is a prop of the req so we can use it in next
  req.user = currentUser;
  next();
});
