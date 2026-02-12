const User = require('../models/users');

async function postResetPassword(req, res, next) {
  try {
    const username =
      req.body.username && String(req.body.username).trim();
    const password = req.body.password && String(req.body.password);
    const confirm =
      req.body['confirm-password'] &&
      String(req.body['confirm-password']);

    if (!username || !password || !confirm) {
      return res.render('reset-password', {
        error: 'All fields are required.',
      });
    }

    if (password !== confirm) {
      return res.render('reset-password', {
        error: 'Passwords do not match.',
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.render('reset-password', {
        error: 'User not found.',
      });
    }

    user.password = password;
    await user.save();

    return req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/projects');
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  postResetPassword,
};
