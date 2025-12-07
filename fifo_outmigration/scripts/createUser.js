require('dotenv').config({
  path: require('path').join(__dirname, '../../.env'),
});
const mongoose = require('mongoose');
const readline = require('readline');

// User Schema (duplicated from model to avoid circular dependencies)
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Create readline interface for user input via console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function createUser() {
  try {
    // Choose connection URI
    const mongoUri = process.env.MONGODB_URI_DEV;
    if (!mongoUri) {
      console.error(
        '\n❌ Error: No MongoDB connection URI found in environment variables.'
      );
      process.exit(1);
    }

    // Optionally allow specifying the database name separately.
    // If the connection URI already contains a database, mongoose will use it.
    // Otherwise set `MONGODB_DB` to the desired database name.
    const mongoDbName = process.env.MONGODB_DB_DEV || undefined;
    const connectOptions = mongoDbName
      ? { dbName: mongoDbName }
      : undefined;

    // Connect to MongoDB
    await mongoose.connect(mongoUri, connectOptions);
    console.log(
      `✅ Connected to MongoDB${
        mongoDbName ? ` (db: ${mongoDbName})` : ''
      }\n`
    );

    // Get user input
    console.log('=== Create New User ===\n');

    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const roleInput = await question(
      'Role (admin/user) [default: user]: '
    );

    const role =
      roleInput.toLowerCase() === 'admin' ? 'admin' : 'user';

    // Validate input
    if (!username || !email || !password) {
      console.error(
        '\n❌ Error: Username, email, and password are required'
      );
      process.exit(1);
    }

    if (password.length < 6) {
      console.error(
        '\n❌ Error: Password must be at least 6 characters'
      );
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      console.error(
        '\n❌ Error: User with this email or username already exists'
      );
      process.exit(1);
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      role,
    });

    await user.save();

    console.log('\n✅ User created successfully!');
    console.log(`\nDetails:`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Created: ${user.createdAt}`);
    console.log(
      `\nYou can now log in at: http://localhost:3000/auth/login\n`
    );
  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
createUser();
