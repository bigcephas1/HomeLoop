// import express from 'express';
// import asyncWrapper from '../utils/asyncHandler.js';
// import protect from '../middleware/auth.middleware.js';

// const router = express.Router();
// import {
//   getUserProfile,
//   authUser,
//   registerUser,
//   editUserProfile,
//   deleteUserProfile,
//   logoutUser,
//   getMe,
// } from '../modules/users/user.controller.js';

// router.get('/users/me', protect, asyncWrapper(getMe));
// router.get('/users/', asyncWrapper(getUserProfile));
// router.post('/users/auth', asyncWrapper(authUser));
// router.post('/users/register', asyncWrapper(registerUser));
// router.post('/users/logout', protect, asyncWrapper(logoutUser));
// router.patch('/users/:id', protect, asyncWrapper(editUserProfile));
// router.delete('/users/:id', protect, asyncWrapper(deleteUserProfile));

// export default router;

/////// backup final

// import express from 'express';
// import { register, login, logout } from './auth.controller.js';

// const router = express.Router();

// router.post('/register', register);
// router.post('/login', login);
// router.post('/logout', logout);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:token', resetPassword);

// router.get('/', (req, res) => {
//   res.json({ message: 'Auth route working' });
// });

// export default router;

import express from 'express';
import protect from '../../middleware/auth.middleware.js';

import {
  register,
  login,
  logout,
  verifyEmail,
  refreshToken,
  googleAuth,
  enable2FA,
  getSessions,
  logoutSession,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';

const router = express.Router();

/////////////////////////////////////////////////////
// BASIC AUTH
/////////////////////////////////////////////////////

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

/////////////////////////////////////////////////////
// EMAIL VERIFICATION
/////////////////////////////////////////////////////

router.get('/verify-email/:token', verifyEmail);

/////////////////////////////////////////////////////
// TOKEN MANAGEMENT
/////////////////////////////////////////////////////

router.post('/refresh-token', refreshToken);

/////////////////////////////////////////////////////
// GOOGLE AUTH
/////////////////////////////////////////////////////

router.post('/google-auth', googleAuth);

/////////////////////////////////////////////////////
// 2FA
/////////////////////////////////////////////////////

router.post('/2fa/enable', protect, enable2FA);

/////////////////////////////////////////////////////
// SESSIONS
/////////////////////////////////////////////////////

router.get('/sessions', protect, getSessions);
router.post('/sessions/logout', protect, logoutSession);

/////////////////////////////////////////////////////
// HEALTH CHECK
/////////////////////////////////////////////////////

router.get('/', (req, res) => {
  res.json({ message: 'Auth route working' });
});

export default router;
