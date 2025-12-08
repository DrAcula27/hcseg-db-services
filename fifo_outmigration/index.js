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
    `style-src 'self' 'nonce-${nonce}' https:`,
    "connect-src 'self' https:",
    "font-src 'self' data:",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
});

// connect to the database
const mongoUri =
  process.env.MONGODB_URI || process.env.MONGODB_URI_DEV;
if (!mongoUri) {
  console.error(
    '❌ No MongoDB URI set in env (MONGODB_URI or MONGODB_URI_DEV).'
  );
  process.exit(1);
}
const mongoDbName =
  process.env.MONGODB_DB || process.env.MONGODB_DB_DEV || 'test';
mongoose
  .connect(mongoUri)
  .then(() =>
    console.log(
      `MongoDB connection successful. ${
        mongoDbName ? `(db: ${mongoDbName})` : ''
      }`
    )
  )
  .catch((err) => console.error('MongoDB connection error:', err));

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

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
