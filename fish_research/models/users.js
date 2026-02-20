const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

// Validate password rules (min length, 1 or more digits, 1 or more letters)
userSchema.path('password').validate(function (value) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(value);
}, 'Password must be at least 8 characters long and contain at least one letter and one number');

// Check if user already exists with the same username or email
userSchema.path('username').validate(async function (value) {
  const user = await mongoose.models.User.findOne({
    username: value,
  });
  return !user || this.id === user.id;
}, 'User with this username already exists');

userSchema.path('email').validate(async function (value) {
  const user = await mongoose.models.User.findOne({ email: value });
  return !user || this.id === user.id;
}, 'User with this email already exists');

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare given password with the database hash
userSchema.methods.comparePassword = async function (
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
