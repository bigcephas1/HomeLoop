import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // Basic info
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    phoneNumber: String,
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },

    // Role (primary role for auth)
    role: {
      type: String,
      enum: ['client', 'landlord', 'service_provider', 'representative', 'admin'],
      default: 'client',
    },
    // Support for multi‑provider roles (if a user can act as both landlord and service provider)
    providerRoles: { type: [String], enum: ['landlord', 'service_provider', 'representative'], default: [] },
    isIdentityVerified: { type: Boolean, default: false },
    profilePhoto: { url: String, public_id: String },
    lastSeen: Date,
    trustScore: { type: Number, default: 0 },

    // Address fields
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'Nigeria' },

    // Authentication
    password: { type: String, required: true, minlength: 6, select: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpire: Date,
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: Date,
    refreshTokens: [{ token: String, device: String, ip: String, createdAt: Date, lastUsed: Date }],
    lastLogin: Date,
    loginHistory: [{ ip: String, userAgent: String, date: Date }],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    googleId: { type: String, default: '' },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: { type: String, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual('fullName').get(function () { return `${this.firstName} ${this.lastName}`; });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.emailVerificationToken;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
