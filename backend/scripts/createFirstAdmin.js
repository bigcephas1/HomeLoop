import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../modules/users/user.model.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root (one level up from scripts folder)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
};

const adminData = {
  firstName: getArg('--firstName') || 'Super',
  lastName: getArg('--lastName') || 'Admin',
  username: getArg('--username') || 'superadmin',
  email: getArg('--email') || 'admin@homeloop.com',
  password: getArg('--password') || 'Admin123!',
  role: 'admin',
  isEmailVerified: true,
  avatar: '',
  bio: '',
};

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log(`Admin with email ${adminData.email} already exists.`);
      process.exit(0);
    }

    const admin = new User(adminData);
    await admin.save();

    console.log(`✅ Admin created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();

// # Minimal (uses defaults for missing fields)
// node scripts/createFirstAdmin.js

// # Full custom credentials
// node scripts/createFirstAdmin.js --email ceo@homeloop.com --password StrongPass123 --firstName Jane --lastName Doe --username janedoe

// # Only override email and password
// node scripts/createFirstAdmin.js --email admin@myapp.com --password secret123
