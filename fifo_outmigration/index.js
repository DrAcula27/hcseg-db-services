require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
});

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const passport = require('passport');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// Content Security Policy with per-request nonces for inline scripts/styles.
// This sets a `nonce` value on `res.locals.nonce` so EJS templates can add
// `<script nonce="<%= nonce %>">` or `<style nonce="<%= nonce %>">` when
// inline code is required. External resources from the same origin or https
// are allowed.
/**
 * How to use nonces in your templates (if you need inline code)
 * For an inline script:<script nonce="<%= nonce %>"> -> inline code <- </script>
 * For an inline style block:<style nonce="<%= nonce %>"> -> inline css <- ></style>
 */
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;

  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    `script-src 'self' 'nonce-${nonce}' https:`,
    // Allow Google Fonts stylesheet and other https styles
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https:`,
    "connect-src 'self' https:",
    // Allow fetching font files from Google's CDN and data URIs
    "font-src 'self' data: https://fonts.gstatic.com",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
});

// connect to the database with retry/backoff
const mongoUri =
  process.env.MONGODB_URI || process.env.MONGODB_URI_DEV;
if (!mongoUri) {
  console.error(
    '❌ No MongoDB URI set in env (MONGODB_URI or MONGODB_URI_DEV).'
  );
  process.exit(1);
}
const mongoDbName =
  process.env.MONGODB_DB || process.env.MONGODB_DB_DEV || undefined;

async function connectWithRetry(attempt = 1, maxAttempts = 5) {
  try {
    await mongoose.connect(mongoUri);
    console.log(
      `MongoDB connection successful.${
        mongoDbName ? ` (db: ${mongoDbName})` : ''
      }`
    );
  } catch (err) {
    console.error(
      `MongoDB connection attempt ${attempt} failed:`,
      err.message
    );
    if (attempt < maxAttempts) {
      const delay = Math.min(30000, 1000 * 2 ** attempt); // exponential backoff, cap 30s
      console.log(`Retrying MongoDB connection in ${delay}ms...`);
      setTimeout(
        () => connectWithRetry(attempt + 1, maxAttempts),
        delay
      );
    } else {
      console.error(
        'Exceeded max MongoDB connection attempts. Exiting process.'
      );
      process.exit(1);
    }
  }
}

connectWithRetry();

// Mongoose connection events
mongoose.connection.on('connected', () => {
  console.log(
    'Mongoose connected to',
    mongoUri,
    mongoDbName ? `(db: ${mongoDbName})` : ''
  );
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected.');
});
mongoose.connection.on('reconnected', () => {
  console.log('Mongoose reconnected.');
});

// set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: '*' }));

// session management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      ...(mongoDbName ? { dbName: mongoDbName } : {}),
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // use secure cookies (HTTPS only) in production
    },
  })
);

// passport initialization
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/auth', require('./routes/auth'));
app.use('/api/trap-samples', require('./routes/trap-samples'));
app.use('/api/users', require('./routes/users'));

// health endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// express error handler (catch-all)
app.use((err, req, res, next) => {
  console.error('Unhandled Express error:', err);
  if (res.headersSent) return next(err);
  res
    .status(500)
    .json({ message: 'Internal server (Express) error' });
});

// root route - redirect to form if authenticated, else to login
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/form');
  } else {
    res.redirect('/auth/login');
  }
});

// Form route at root level (easier access)
app.get('/form', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('form', { user: req.user });
  } else {
    res.redirect('/auth/login');
  }
});

// start the server with graceful shutdown handlers
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

async function gracefulShutdown(signal) {
  try {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async (err) => {
      if (err) {
        console.error('Error closing server:', err);
        process.exit(1);
      }
      try {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (closeErr) {
        console.error('Error closing MongoDB connection:', closeErr);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    'Unhandled Rejection at:',
    promise,
    'reason:',
    reason
  );
  // optional: graceful shutdown or alerting here
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // try to perform graceful shutdown, then exit
  gracefulShutdown('uncaughtException');
});
