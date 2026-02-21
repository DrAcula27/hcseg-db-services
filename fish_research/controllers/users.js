const User = require('../models/users');

// Get current user profile
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username email role',
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Admin-only user management endpoints ---
// Get all users
exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find().select('username email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new user
exports.create = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser._id, username, email, role },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
exports.delete = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.update = async (req, res, next) => {
  try {
    const { username, email, role } = req.body;
    const updateData = { username, email, role };
    if (req.body.password) {
      updateData.password = req.body.password;
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
