const express = require('express');
const router = express.Router();
const passport = require('passport');

// Login page
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/projects');
  }
  res.render('login', { error: null });
});

// Login POST
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Authentication failed
      return res.render('login', {
        error: info.message || 'Invalid credentials',
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/projects');
    });
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/auth/login');
  });
});

// Forgot password page
router.get('/forgot-password', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/projects');
  }
  res.render('forgot-password', { error: null });
});

// Forgot password POST
router.post('/forgot-password', async (req, res) => {
  // Implement password reset logic here.
  res.render('forgot-password', {
    error: 'Password reset functionality is not implemented yet.',
  });
});

module.exports = router;
