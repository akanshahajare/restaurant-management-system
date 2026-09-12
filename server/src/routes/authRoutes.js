import express from 'express';
import { body } from 'express-validator';

import {
  loginAdmin,
  loginCustomer,
  registerCustomer,
  getUserProfile,
} from '../controllers/authController.js';

import { protect, adminOnly, customerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Customer Authentication
|--------------------------------------------------------------------------
*/

// Customer registration
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),

    body('email')
      .isEmail()
      .withMessage('Valid email is required'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),

    body('phone')
      .optional()
      .trim(),
  ],
  registerCustomer
);

// Customer login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required'),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  loginCustomer
);

// Logged-in customer profile
router.get(
  '/profile',
  protect,
  customerOnly,
  getUserProfile
);

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/

// Admin login
router.post(
  '/admin/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required'),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  loginAdmin
);

// Logged-in admin profile
router.get(
  '/admin/profile',
  protect,
  adminOnly,
  getUserProfile
);

export default router;