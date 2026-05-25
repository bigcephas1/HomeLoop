// import jwt from 'jsonwebtoken';
// import Property from '../properties/property.model.js';
// import User from './userSchema.js';
// import bcrypt from 'bcryptjs';

// import generateToken from '../../utils/generateToken.js';

// const token = generateToken({
//   id: user._id,
// });

// ///////// GET CURRENT USER

// const getMe = async (req, res) => {
//   res.json(req.user);
// };

// ///////// REGISTER

// const registerUser = async (req, res) => {
//   try {
//     const { name, email, username, password } = req.body;

//     if (!name || !email || !username || !password) {
//       return res.status(400).json({
//         message: 'All fields are required',
//       });
//     }

//     const userExists = await User.findOne({
//       $or: [{ email }, { username }],
//     });

//     if (userExists) {
//       return res.status(400).json({
//         message: 'User already exists',
//       });
//     }

//     // Generate salt
//     const salt = await bcrypt.genSalt(10);

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       username,
//     });

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         username: user.username,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// //////// LOGIN
// const authUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Find user
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({
//         message: 'Invalid email or password',
//       });
//     }

//     // 2. Compare password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         message: 'Invalid email or password',
//       });
//     }

//     // // 3. Generate JWT
//     // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//     //   expiresIn: process.env.JWT_EXPIRES_IN || '1d',
//     // });

//     // 4. Send token as HTTP-only cookie
//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 60 * 60 * 1000, // 1 hour
//     });

//     res.json({
//       message: 'User authenticated',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         username: user.username,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// ///////////// LOGOUT USER

// const logoutUser = async (req, res) => {
//   try {
//     // Clear the JWT token cookie
//     res.cookie('token', '', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       expires: new Date(0), // expire immediately
//     });

//     res.status(200).json({ message: 'User logged out successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export { authUser, getMe, registerUser, logoutUser };

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user and include password
//     const user = await User.findOne({ email }).select('+password');

//     if (!user) {
//       return res.status(401).json({
//         message: 'Invalid credentials',
//       });
//     }

//     // Compare passwords
//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) {
//       return res.status(401).json({
//         message: 'Invalid credentials',
//       });
//     }

//     res.status(200).json({
//       message: 'Login successful',
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

/**
 * auth.controller.js
 *
 * Handles all authentication-related operations:
 * - Register (with optional role selection)
 * - Email verification
 * - Login (with 2FA support)
 * - Token refresh & rotation
 * - Logout & session management
 * - Password reset flow
 * - Google OAuth integration
 * - 2FA setup
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

import User from '../users/user.model.js';
import { queueEmail } from '../../services/emailQueue.service.js';

/////////////////////////////////////////////////////
// TOKEN HELPERS
/////////////////////////////////////////////////////

/**
 * Generate a short-lived access token (15m by default)
 */
const signAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

/**
 * Generate a long-lived refresh token (7d by default)
 */
const signRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/////////////////////////////////////////////////////
// REGISTER (with role selection)
/////////////////////////////////////////////////////

export const register = async (req, res) => {
  try {
    // Destructure incoming fields, including optional 'role'
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      username,
      role, // 👈 role is now accepted
      address,
      city,
      state,
      postalCode,
      country,
    } = req.body;

    
	  // Allowed roles (admin cannot be set via registration)
const allowedRoles = ['client', 'landlord', 'service_provider', 'representative'];
let finalRole = 'client'; // default

if (role && allowedRoles.includes(role)) {
  finalRole = role;
}


	  // ----- Validation -----
    const missingFields = [];
    if (!firstName?.trim()) missingFields.push('firstName');
    if (!lastName?.trim()) missingFields.push('lastName');
    if (!email?.trim()) missingFields.push('email');
    if (!password?.trim()) missingFields.push('password');
    if (!confirmPassword?.trim()) missingFields.push('confirmPassword');
    if (!username?.trim()) missingFields.push('username');
    if (!address?.trim()) missingFields.push('address');
    if (!city?.trim()) missingFields.push('city');
    if (!state?.trim()) missingFields.push('state');
    if (!country?.trim()) missingFields.push('country');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Check for existing email
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString('hex');

    // Create the user with the selected role (or default)
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      username: username.trim(),
      role: finalRole, // 👈 role set here
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode?.trim() || '',
      country: country.trim(),
      isEmailVerified: false,
      emailVerificationToken: crypto
        .createHash('sha256')
        .update(emailToken)
        .digest('hex'),
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000,
      loginHistory: [],
      refreshTokens: [],
    });

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;
    await queueEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>
          <p>Thank you for registering. Click the button below to verify your account.</p>
          <a href="${verifyUrl}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px;">Verify Email</a>
          <p>If you did not create this account, please ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully. Verification email sent.',
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/////////////////////////////////////////////////////
// VERIFY EMAIL
/////////////////////////////////////////////////////

export const verifyEmail = async (req, res) => {
  try {
    const hashed = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/////////////////////////////////////////////////////
// LOGIN
/////////////////////////////////////////////////////

export const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password +twoFactorSecret');

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Please verify your email before logging in',
        });
    }

    // 2FA check if enabled
    if (user.twoFactorEnabled) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });
      if (!verified) {
        return res
          .status(401)
          .json({ success: false, message: 'Invalid 2FA code' });
      }
    }

    // Update login history
    user.lastLogin = new Date();
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      date: new Date(),
    });

    // Generate tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Store refresh token session
    user.refreshTokens.push({
      token: refreshToken,
      device: req.headers['user-agent'],
      ip: req.ip,
      createdAt: new Date(),
      lastUsed: new Date(),
    });
    await user.save();

    // Set HTTP‑only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/////////////////////////////////////////////////////
// REFRESH TOKEN (rotating)
/////////////////////////////////////////////////////

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: 'Invalid session' });
    }

    const session = user.refreshTokens.find((t) => t.token === token);
    if (!session) {
      user.refreshTokens = [];
      await user.save();
      return res
        .status(403)
        .json({
          success: false,
          message: 'Session compromised. All sessions cleared.',
        });
    }

    // Rotate tokens: remove old refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    user.refreshTokens.push({
      token: newRefreshToken,
      device: req.headers['user-agent'],
      ip: req.ip,
      createdAt: new Date(),
      lastUsed: new Date(),
    });
    await user.save();

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: 'Token refreshed' });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

/////////////////////////////////////////////////////
// GOOGLE AUTH
/////////////////////////////////////////////////////

export const googleAuth = async (req, res) => {
  try {
    const { email, firstName, lastName, googleId, avatar } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firstName,
        lastName,
        googleId,
        username: email.split('@')[0],
        avatar: avatar || '',
        isEmailVerified: true,
        loginHistory: [],
        refreshTokens: [],
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshTokens.push({
      token: refreshToken,
      device: req.headers['user-agent'],
      ip: req.ip,
      createdAt: new Date(),
      lastUsed: new Date(),
    });
    await user.save();

    res.json({
      success: true,
      message: 'Google login successful',
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/////////////////////////////////////////////////////
// ENABLE 2FA
/////////////////////////////////////////////////////

export const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    const secret = speakeasy.generateSecret({
      name: `HomeLoop (${user.email})`,
    });
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();
    const qr = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ success: true, qr, secret: secret.base32 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/////////////////////////////////////////////////////
// GET SESSIONS (list all active refresh tokens)
/////////////////////////////////////////////////////

export const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, sessions: user.refreshTokens });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/////////////////////////////////////////////////////
// LOGOUT A SPECIFIC SESSION
/////////////////////////////////////////////////////

export const logoutSession = async (req, res) => {
  try {
    const { token } = req.body;
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { refreshTokens: { token } } },
    );
    res.json({ success: true, message: 'Session removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/////////////////////////////////////////////////////
// LOGOUT CURRENT DEVICE
/////////////////////////////////////////////////////

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ 'refreshTokens.token': token });
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t.token !== token,
        );
        await user.save();
      }
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/////////////////////////////////////////////////////
// FORGOT PASSWORD
/////////////////////////////////////////////////////

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await queueEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `<h2>Password Reset</h2><p>Click the link below to reset your password:</p><a href="${resetUrl}">Reset Password</a>`,
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/////////////////////////////////////////////////////
// RESET PASSWORD
/////////////////////////////////////////////////////

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshTokens = []; // invalidate all existing sessions

    await user.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
