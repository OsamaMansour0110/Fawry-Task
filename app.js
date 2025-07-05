const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/AppError');
const globalErrorHandling = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');

const app = express();

// app.enable('trust proxy');
app.set('trust proxy', 1);

// -Using pug
app.set('view engine', 'pug');
// -Any res.render -> lead to Views
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDLEWARES

// -CROSS-ORIGIN RSOURCE SHARING: Make your api available to everyone to access
// -Note That you deployement your app -> anyone can hit api/v1/tours or whatever
// -The POWER of cors -> SHARING APIs ('Saving time, coding efforts') is it amazing?
app.use(cors());

// -Handle preflight requests (PUT/DELETE/PATCH)
app.options('*', cors());

// -SET security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// -Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// -LIMIT requests from same api: Bruto Force ATTACK
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Many request from this IP'
});
app.use('/api', limiter);

// -STRIPE WEBHOOK: sending email, storing in DB
// app.post(
//   '/webhook-checkout',
//   bodyParser.raw({ type: 'application/json' }),
//   bookingController.webhookCheckout
// );

// -Body Parser: reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// -URL Parser: Get Data Came From Form action
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// -Cookie parser: get the cookies as prop into the req
app.use(cookieParser());

// -Data sanitization against noSql Query injection
app.use(mongoSanitize());

// -Data sanitization against xss: Input HTML in code
app.use(xss());

// NEED TO MAINPULATE the whitelist
// -Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['name', 'price', 'quantity', 'weight']
  })
);

// To compress the response text to client
app.use(compression());

// 2) Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);

// 3) Handle Wierd Errors
app.all('*', (req, res, next) => {
  next(new AppError(`can't reach this: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandling);

module.exports = app;
