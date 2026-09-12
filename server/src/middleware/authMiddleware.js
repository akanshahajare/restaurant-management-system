import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Authorization required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      res.status(401);
      return next(new Error('Invalid token'));
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401);
    next(new Error('Token verification failed'));
  }
};

/*
 * Optional authentication.
 *
 * Guests are allowed to continue without authentication.
 * If a valid Bearer token is provided, req.user is populated.
 *
 * This is used for guest + logged-in customer flows such as
 * placing an order.
 */
export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Invalid/expired optional token should not block guest checkout.
    next();
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error('Not authorized'));
  }

  if (req.user.role !== 'admin') {
    res.status(403);
    return next(new Error('Admin access required'));
  }

  next();
};

export const customerOnly = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error('Not authorized'));
  }

  if (req.user.role !== 'customer') {
    res.status(403);
    return next(new Error('Customer access required'));
  }

  next();
};

/*
 * Backward-compatible middleware for existing admin routes.
 *
 * Existing routes currently use:
 *
 *   protectAdmin
 *
 * Internally it now uses the unified User model.
 */
export const protectAdmin = async (req, res, next) => {
  await protect(req, res, (error) => {
    if (error) {
      return next(error);
    }

    return adminOnly(req, res, next);
  });
};