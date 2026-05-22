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

    /////////////////////////////////////////////////////
    // VALIDATE REQUIRED FIELDS
    /////////////////////////////////////////////////////

    const missingFields = [];

    if (!firstName?.trim()) missingFields.push('firstName');
    if (!lastName?.trim()) missingFields.push('lastName');
    if (!email?.trim()) missingFields.push('email');
    if (!password?.trim()) missingFields.push('password');
    if (!username?.trim()) missingFields.push('username');
    if (!address?.trim()) missingFields.push('address');
    if (!city?.trim()) missingFields.push('city');
    if (!country?.trim()) missingFields.push('country');

    /////////////////////////////////////////////////////
    // OPTIONAL FIELDS
    /////////////////////////////////////////////////////

    // Remove the comments below if you want them required

     if (!state?.trim()) missingFields.push('state');
    // if (!postalCode?.trim()) missingFields.push('postalCode');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields,
      });
    }

    /////////////////////////////////////////////////////
    // CHECK EXISTING EMAIL
    /////////////////////////////////////////////////////

    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    /////////////////////////////////////////////////////
    // CHECK EXISTING USERNAME
    /////////////////////////////////////////////////////

    const existingUsername = await User.findOne({
      username: username.trim(),
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    /////////////////////////////////////////////////////
    // CREATE EMAIL TOKEN
    /////////////////////////////////////////////////////

    const emailToken = crypto.randomBytes(32).toString('hex');

    /////////////////////////////////////////////////////
    // CREATE USER
    /////////////////////////////////////////////////////

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      username: username.trim(),

      address: address.trim(),
      city: city.trim(),
      state: state?.trim() || '',
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

    /////////////////////////////////////////////////////
    // SEND VERIFICATION EMAIL
    /////////////////////////////////////////////////////

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;

    await queueEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>

          <p>
            Thank you for registering. Click the button below to verify your account.
          </p>

          <a
            href="${verifyUrl}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              border-radius:6px;
              margin-top:10px;
            "
          >
            Verify Email
          </a>

          <p style="margin-top:20px;">
            If you did not create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    /////////////////////////////////////////////////////
    // RESPONSE
    /////////////////////////////////////////////////////

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

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/////////////////////////////////////////////////////
// LOGIN
/////////////////////////////////////////////////////

export const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    /////////////////////////////////////////////////////
    // VALIDATE INPUTS
    /////////////////////////////////////////////////////

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    /////////////////////////////////////////////////////
    // FIND USER
    /////////////////////////////////////////////////////

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password +twoFactorSecret');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    /////////////////////////////////////////////////////
    // VERIFY PASSWORD
    /////////////////////////////////////////////////////

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    /////////////////////////////////////////////////////
    // VERIFY EMAIL
    /////////////////////////////////////////////////////

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    /////////////////////////////////////////////////////
    // 2FA CHECK
    /////////////////////////////////////////////////////

    if (user.twoFactorEnabled) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid 2FA code',
        });
      }
    }

    /////////////////////////////////////////////////////
    // UPDATE LOGIN HISTORY
    /////////////////////////////////////////////////////

    user.lastLogin = new Date();

    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      date: new Date(),
    });

    /////////////////////////////////////////////////////
    // GENERATE TOKENS
    /////////////////////////////////////////////////////

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    /////////////////////////////////////////////////////
    // STORE SESSION
    /////////////////////////////////////////////////////

    user.refreshTokens.push({
      token: refreshToken,
      device: req.headers['user-agent'],
      ip: req.ip,
      createdAt: new Date(),
      lastUsed: new Date(),
    });

    await user.save();

    /////////////////////////////////////////////////////
    // SET COOKIES
    /////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////
    // RESPONSE
    /////////////////////////////////////////////////////

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

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
