// import jwt from 'jsonwebtoken';
// import User from '../modules/users/user.model.js';

// const protect = async (req, res, next) => {
//   try {
//     let token;

//     // FROM COOKIE
//     if (req.cookies.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({
//         message: 'Not authorized',
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = await User.findById(decoded.id);

//     next();
//   } catch (error) {
//     res.status(401).json({
//       message: 'Invalid token',
//     });
//   }
// };

// export default protect;

import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default protect;
