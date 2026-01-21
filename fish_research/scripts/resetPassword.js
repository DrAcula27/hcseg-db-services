#!/usr/bin/env node

// Usage:
// node resetPassword.js --username <username> --password <newpassword>
// or
// node resetPassword.js <username> (will prompt for password)

require('dotenv').config({
  path: require('path').join(__dirname, '../../.env'),
});

const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/users');

const argv = process.argv.slice(2);
let username = null;
let email = null;
let password = null;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--username') {
    username = argv[i + 1];
    i++;
  } else if (a === '--email') {
    email = argv[i + 1];
    i++;
  } else if (a === '--password') {
    password = argv[i + 1];
    i++;
  } else if (!username) {
    // allow positional username as first arg
    username = a;
  }
}

const mongoUri = process.env.MONGODB_URI_DEV || process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_DEV || process.env.MONGODB_DB || undefined;

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  if (!mongoUri) {
    console.error('No MongoDB URI found in environment (MONGODB_URI_DEV or MONGODB_URI)');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, mongoDbName ? { dbName: mongoDbName } : {});
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message || err);
    process.exit(1);
  }

  try {
    if (!username && !email) {
      console.error('Provide --username or --email (or pass username positionally).');
      process.exit(1);
    }

    if (!password) {
      password = await prompt('New password: ');
      if (!password) {
        console.error('No password provided. Aborting.');
        process.exit(1);
      }
    }

    let user = null;
    if (username) user = await User.findOne({ username });
    if (!user && email) user = await User.findOne({ email });

    if (!user) {
      console.error('User not found.');
      process.exit(1);
    }

    user.password = password; // pre('save') hook will hash
    await user.save();

    console.log(`Password updated for user: ${user.username}`);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  } finally {
    try { await mongoose.connection.close(); } catch (e) {}
  }
}

main();
