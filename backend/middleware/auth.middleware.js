// ✅ protectRoute middleware
import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from cookie
    if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token',
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Get user from DB (optional but recommended)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Not authorized, token failed',
    });
  }
};

export default protect;
