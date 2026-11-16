
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    // Check whether credentials are available
    if (!username || !password) {
      throw new Error('ADMIN_USERNAME or ADMIN_PASSWORD is missing in .env');
    }

    // Prevent duplicate admin creation
    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save admin in MongoDB
    await Admin.create({
      username,
      password: hashedPassword
    });

    console.log('Admin account created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
