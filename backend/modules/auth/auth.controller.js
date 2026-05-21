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

const signAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

const signRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/////////////////////////////////////////////////////
// REGISTER
/////////////////////////////////////////////////////

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      username,
      address,
      city,
      state,
      postalCode,
      country,
    } = req.body;
    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !username ||
      !address ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const emailToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      username,
      address,
      city,
      state,
      postalCode,
      country,
      isEmailVerified: false,
      emailVerificationToken: crypto
        .createHash('sha256')
        .update(emailToken)
        .digest('hex'),
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000,
      loginHistory: [],
      refreshTokens: [],
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;
    await queueEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `<h2>Email Verification</h2><p>Click below to verify your account:</p><a href="${verifyUrl}">Verify Email</a>`,
    });

    res.status(201).json({
      message: 'User created. Verification email sent.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/////////////////////////////////////////////////////
// LOGIN (WITH 2FA + SESSION TRACKING)
/////////////////////////////////////////////////////

export const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    const user = await User.findOne({ email }).select(
      '+password +twoFactorSecret',
    );
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2FA check
    if (user.twoFactorEnabled) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });
      if (!verified) {
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
    }

    // Update login data
    user.lastLogin = new Date();
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      date: new Date(),
    });

    // Create tokens
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

    // Set cookies
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
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
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
    res.status(500).json({ message: err.message });
  }
};

/////////////////////////////////////////////////////
// REFRESH TOKEN
/////////////////////////////////////////////////////

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: 'Invalid session' });

    const session = user.refreshTokens.find((t) => t.token === token);
    if (!session) {
      user.refreshTokens = [];
      await user.save();
      return res
        .status(403)
        .json({ message: 'Session compromised. All sessions cleared.' });
    }

    // Rotate tokens
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

    res.json({ message: 'Token refreshed' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
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
      message: 'Google login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/////////////////////////////////////////////////////
// ENABLE 2FA
/////////////////////////////////////////////////////

export const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    const secret = speakeasy.generateSecret({
      name: `YourApp (${user.email})`,
    });
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();
    const qr = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qr, secret: secret.base32 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/////////////////////////////////////////////////////
// GET SESSIONS
/////////////////////////////////////////////////////

export const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.refreshTokens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/////////////////////////////////////////////////////
// LOGOUT SINGLE SESSION
/////////////////////////////////////////////////////

export const logoutSession = async (req, res) => {
  try {
    const { token } = req.body;
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { refreshTokens: { token } } },
    );
    res.json({ message: 'Session removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/////////////////////////////////////////////////////
// FORGOT PASSWORD
/////////////////////////////////////////////////////

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await queueEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `<a href="${resetUrl}">Reset Password</a>`,
    });
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshToken = null; // invalidate sessions
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
