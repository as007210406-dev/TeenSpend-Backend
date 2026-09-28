const authService = require('../services/authService');
const { successResponse } = require('../utils/responseHandler');

const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, 201, 'User registered successfully', result);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return successResponse(res, 200, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res) {
    // Stateless JWT tokens are cleared on the client side
    return successResponse(res, 200, 'Logged out successfully');
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.userId);
      return successResponse(res, 200, 'Current user profile retrieved', { user });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updated = await authService.updateProfile(req.user.userId, req.body);
      return successResponse(res, 200, 'Profile updated successfully', { user: updated });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
