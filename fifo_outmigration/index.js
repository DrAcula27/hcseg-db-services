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

const app = express();

// connect to the database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connection successful'))
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
      mongoUrl: process.env.MONGODB_URI,
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
