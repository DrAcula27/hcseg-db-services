const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth');

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

// Reset password page
router.get('/reset-password', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/projects');
  }
  res.render('reset-password', { error: null });
});

// Reset password POST
router.post('/reset-password', authController.postResetPassword);

module.exports = router;
