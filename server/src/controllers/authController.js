import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

const createToken = (id, role) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

/**
 * CUSTOMER REGISTER
 *
 * Creates only customer accounts.
 * A customer can never register themselves as an admin.
 */
export const registerCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422);
      return next(
        new Error(errors.array().map((e) => e.msg).join(', '))
      );
    }

    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409);
      return next(new Error('An account with this email already exists'));
    }

    const customer = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer',
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token: createToken(customer._id, customer.role),
        user: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CUSTOMER LOGIN
 */
export const loginCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422);
      return next(
        new Error(errors.array().map((e) => e.msg).join(', '))
      );
    }

    const { email, password } = req.body;

    const customer = await User.findOne({
      email,
      role: 'customer',
      isActive: true,
    });

    if (
      customer &&
      (await customer.matchPassword(password))
    ) {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: createToken(customer._id, customer.role),
          user: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            role: customer.role,
          },
        },
      });
    }

    res.status(401);
    return next(new Error('Invalid email or password'));
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN LOGIN
 *
 * Admin login now uses the User model,
 * but only users with role = admin can log in here.
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422);
      return next(
        new Error(errors.array().map((e) => e.msg).join(', '))
      );
    }

    const { email, password } = req.body;

    const admin = await User.findOne({
      email,
      role: 'admin',
      isActive: true,
    });

    if (
      admin &&
      (await admin.matchPassword(password))
    ) {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: createToken(admin._id, admin.role),
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        },
      });
    }

    res.status(401);
    return next(new Error('Invalid email or password'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET CURRENT USER PROFILE
 *
 * This will be used by both customers and admins
 * after the unified authentication middleware is added.
 */
export const getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }

    return res.json({
      success: true,
      message: 'Profile fetched',
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};
