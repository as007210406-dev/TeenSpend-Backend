const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const env = require('../config/env');

const authService = {
  async register(registrationData) {
    const { email, password, full_name, username, date_of_birth, currency, monthly_allowance } = registrationData;

    // Check if email already exists
    const existingByEmail = await userModel.findByEmail(email);
    if (existingByEmail) {
      const err = new Error('An account with this email already exists');
      err.statusCode = 409;
      err.code = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    // Check if username already exists
    const existingByUsername = await userModel.findByUsername(username);
    if (existingByUsername) {
      const err = new Error('This username is already taken');
      err.statusCode = 409;
      err.code = 'USERNAME_TAKEN';
      throw err;
    }

    // Hash password with bcrypt salt rounds = 10
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user profile
    const newUser = await userModel.create({
      email,
      password_hash,
      full_name,
      username,
      date_of_birth,
      currency: currency || 'INR',
      monthly_allowance: monthly_allowance || 0
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Never return password_hash to the client
    const { password_hash: _, ...safeUser } = newUser;

    return { user: safeUser, token };
  },

  async login(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    // Validate password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async getCurrentUser(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      const err = new Error('User profile not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  },

  async updateProfile(userId, profileUpdates) {
    const updated = await userModel.update(userId, profileUpdates);
    const { password_hash: _, ...safeUser } = updated;
    return safeUser;
  }
};

module.exports = authService;
