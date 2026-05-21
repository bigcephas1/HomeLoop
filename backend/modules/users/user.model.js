// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import crypto from 'crypto';

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       trim: true,
//       minlength: 2,
//       maxlength: 50,
//     },

//     username: {
//       type: String,
//       required: [true, 'Username is required'],
//       unique: true,
//       trim: true,
//       lowercase: true,
//       minlength: 3,
//       maxlength: 30,
//     },

//     email: {
//       type: String,
//       required: [true, 'Email is required'],
//       unique: true,
//       trim: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
//     },

//     phoneNumber: {
//       type: String,
//       trim: true,
//     },

//     avatar: {
//       type: String,
//       default: '',
//     },

//     bio: {
//       type: String,
//       maxlength: 500,
//       default: '',
//     },

//     role: {
//       type: String,
//       enum: ['house_seeker', 'landlord', 'representative', 'admin'],
//       default: 'house_seeker',
//     },

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },

//     password: {
//       type: String,
//       required: [true, 'Password is required'],
//       minlength: 6,
//       select: false,
//     },

//     refreshToken: {
//       type: String,
//       default: null,
//     },

//     lastLogin: {
//       type: Date,
//     },

//     loginHistory: [
//       {
//         ip: String,
//         userAgent: String,
//         date: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     verificationToken: {
//       type: String,
//       select: false,
//     },

//     verificationTokenExpire: {
//       type: Date,
//     },

//     resetPasswordToken: {
//       type: String,
//       select: false,
//     },

//     resetPasswordExpire: {
//       type: Date,
//     },

//     lastLogin: {
//       type: Date,
//     },
//     /////////////////////////////////////////////////////
//     // 2FA
//     /////////////////////////////////////////////////////

//     twoFactorEnabled: {
//       type: Boolean,
//       default: false,
//     },

//     twoFactorCode: {
//       type: String,
//       select: false,
//     },

//     twoFactorCodeExpire: {
//       type: Date,
//     },

//     /////////////////////////////////////////////////////
//     // GOOGLE AUTH
//     /////////////////////////////////////////////////////

//     googleId: {
//       type: String,
//       default: '',
//     },

//     isSuspended: {
//       type: Boolean,
//       default: false,
//     },

//     suspendedReason: {
//       type: String,
//       default: '',
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// /////////////////////////////////////////////////////
// // INDEXES
// /////////////////////////////////////////////////////

// // userSchema.index({ email: 1 });
// // userSchema.index({ username: 1 });

// /////////////////////////////////////////////////////
// // HASH PASSWORD BEFORE SAVING
// /////////////////////////////////////////////////////

// userSchema.pre('save', async function () {
//   if (!this.isModified('password')) {
//     return;
//   }

//   const salt = await bcrypt.genSalt(12);

//   this.password = await bcrypt.hash(this.password, salt);
// });

// /////////////////////////////////////////////////////
// // COMPARE PASSWORD METHOD
// /////////////////////////////////////////////////////

// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// /////////////////////////////////////////////////////
// // GENERATE PASSWORD RESET TOKEN
// /////////////////////////////////////////////////////

// userSchema.methods.generateResetPasswordToken = function () {
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   this.resetPasswordToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');

//   this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

//   return resetToken;
// };

// /////////////////////////////////////////////////////
// // GENERATE EMAIL VERIFICATION TOKEN
// /////////////////////////////////////////////////////

// userSchema.methods.generateVerificationToken = function () {
//   const verificationToken = crypto.randomBytes(32).toString('hex');

//   this.verificationToken = crypto
//     .createHash('sha256')
//     .update(verificationToken)
//     .digest('hex');

//   this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

//   return verificationToken;
// };

// /////////////////////////////////////////////////////
// // REMOVE PASSWORD & TOKENS FROM RESPONSE
// /////////////////////////////////////////////////////

// userSchema.methods.toJSON = function () {
//   const userObject = this.toObject();

//   delete userObject.password;
//   delete userObject.refreshToken;
//   delete userObject.resetPasswordToken;
//   delete userObject.resetPasswordExpire;
//   delete userObject.verificationToken;
//   delete userObject.verificationTokenExpire;

//   return userObject;
// };

// const User = mongoose.model('User', userSchema);

// export default User;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    /////////////////////////////////////////////////////
    // BASIC INFO
    /////////////////////////////////////////////////////

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phoneNumber: String,
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    role: {
      type: String,
      enum: ['house_seeker', 'landlord', 'representative', 'admin'],
      default: 'house_seeker',
    },
    // Add after 'avatar' field
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'Nigeria' },
    /////////////////////////////////////////////////////
    // AUTH
    /////////////////////////////////////////////////////

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    /////////////////////////////////////////////////////
    // EMAIL VERIFICATION
    /////////////////////////////////////////////////////

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpire: Date,

    /////////////////////////////////////////////////////
    // PASSWORD RESET
    /////////////////////////////////////////////////////

    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: Date,

    /////////////////////////////////////////////////////
    // SESSIONS / TOKENS
    /////////////////////////////////////////////////////

    refreshTokens: [
      {
        token: String,
        device: String,
        ip: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        lastUsed: Date,
      },
    ],

    /////////////////////////////////////////////////////
    // LOGIN TRACKING
    /////////////////////////////////////////////////////

    lastLogin: Date,
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /////////////////////////////////////////////////////
    // 2FA
    /////////////////////////////////////////////////////

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,

    /////////////////////////////////////////////////////
    // GOOGLE AUTH
    /////////////////////////////////////////////////////

    googleId: {
      type: String,
      default: '',
    },

    /////////////////////////////////////////////////////
    // ACCOUNT STATUS
    /////////////////////////////////////////////////////

    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/////////////////////////////////////////////////////
// VIRTUAL: fullName
/////////////////////////////////////////////////////
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/////////////////////////////////////////////////////
// PASSWORD HASHING
/////////////////////////////////////////////////////
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/////////////////////////////////////////////////////
// COMPARE PASSWORD
/////////////////////////////////////////////////////
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/////////////////////////////////////////////////////
// CLEAN OUTPUT (remove sensitive fields)
/////////////////////////////////////////////////////
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
