import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error('ADMIN_PASSWORD is not set in .env');
    }

    const existingAdmin = await User.findOne({
      email,
      role: 'admin',
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    await User.create({
      name: 'Restaurant Admin',
      email,
      password,
      role: 'admin',
    });

    console.log('Admin created successfully');
    console.log('Email:', email);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();