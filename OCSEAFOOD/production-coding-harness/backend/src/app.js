const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { z } = require('zod');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const auth = require('./middleware/auth');
const authorize = require('./middleware/authorize');
const { validateBody } = require('./middleware/validate');
const { testAuthRateLimiter, testCheckoutRateLimiter } = require('./middleware/rateLimiter');
const { vietnamesePhone, threeLevelAddress } = require('./validation/shared');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const comboRoutes = require('./routes/combos');
const postRoutes = require('./routes/posts');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const settingsRoutes = require('./routes/settings');
const usersRoutes = require('./routes/users');
const recruitmentRoutes = require('./routes/recruitment');
const jobOpeningRoutes = require('./routes/jobOpenings');
const uploadRoutes = require('./routes/upload');
const healthRoutes = require('./routes/health');
const { validateMediaConfiguration } = require('./config/media');
const { getAllowedOrigins } = require('./config/cors');
const app = express();
const { mediaRoot } = validateMediaConfiguration();

// Production runs behind one trusted reverse proxy. This preserves the client IP
// used by rate limiters without trusting arbitrary forwarded-hop values.
app.set('trust proxy', 1);

app.use(helmet());
app.use(requestLogger);

// BUG-016 fix: CORS configuration
// Set CORS_ORIGIN env var to a comma-separated list of allowed origins in production
const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-side, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('CORS policy: origin not allowed');
    error.status = 403;
    callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes registration
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/combos', comboRoutes);
app.use('/posts', postRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/orders', orderRoutes);
app.use('/settings', settingsRoutes);
app.use('/users', usersRoutes);
app.use('/recruitment', recruitmentRoutes);
app.use('/job-openings', jobOpeningRoutes);
app.use('/upload', uploadRoutes);
app.use('/health', healthRoutes);

// Phục vụ thư mục uploads ra public
app.use('/uploads', express.static(mediaRoot, {
  fallthrough: false,
  immutable: true,
  maxAge: '7d',
}));

// BUG-L03 fix: Debug/test endpoints only available in non-production environments
if (process.env.NODE_ENV !== 'production') {
  // Test error endpoint
  app.get('/test-error', (req, res, next) => {
    const error = new Error('This is a test server error');
    error.status = 500;
    next(error);
  });

  // Test authentication endpoint
  app.get('/test-auth', auth, (req, res) => {
    res.status(200).json({ user: req.user });
  });

  // Test authorization endpoint for ADMIN only
  app.get('/test-admin', auth, authorize('ADMIN'), (req, res) => {
    res.status(200).json({ status: 'success', message: 'Admin access granted' });
  });

  // Test authorization endpoint for CUSTOMER and ADMIN
  app.get('/test-customer', auth, authorize('CUSTOMER', 'ADMIN'), (req, res) => {
    res.status(200).json({ status: 'success', message: 'Customer access granted' });
  });

  // Test validation endpoint for phone number
  app.post('/test-validate-phone', validateBody(z.object({ phone: vietnamesePhone })), (req, res) => {
    res.status(200).json({ status: 'success', phone: req.body.phone });
  });

  // Test validation endpoint for 3-level address
  app.post('/test-validate-address', validateBody(z.object({ address: threeLevelAddress })), (req, res) => {
    res.status(200).json({ status: 'success', address: req.body.address });
  });

  // Test rate limiting endpoint for authentication
  app.post('/test-rate-limit-auth', testAuthRateLimiter, (req, res) => {
    res.status(200).json({ status: 'success', message: 'Auth endpoint reached' });
  });

  // Test rate limiting endpoint for checkout
  app.post('/test-rate-limit-checkout', testCheckoutRateLimiter, (req, res) => {
    res.status(200).json({ status: 'success', message: 'Checkout endpoint reached' });
  });
}

// Keep unmatched API routes machine-readable and consistent with known 404s.
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      status: 404,
    },
  });
});

// Centralized error handler (must be registered last)
app.use(errorHandler);

module.exports = app;
