// import express from 'express';
// import {
//   getUserProfile,
//   editUserProfile,
//   deleteUserProfile,
// } from './user.controller.js';
// import protect from '../../middleware/auth.middleware.js';

// const router = express.Router();

// ////// GET CURRENT USER

// router.get('/me', protect, async (req, res) => {
//   res.json(req.user);
// });

// // TEST ROUTE
// router.get('/', (req, res) => {
//   res.json({ message: 'Users route working' });
// });

// // PROFILE ROUTES
// router.get('/profile', getUserProfile);
// router.put('/:id', editUserProfile);
// router.delete('/:id', deleteUserProfile);

// export default router;

import express from 'express';

import protect from '../../middleware/auth.middleware.js';

import {
  getUserProfile,
  editUserProfile,
  deleteUserProfile,
} from './user.controller.js';

const router = express.Router();

// GET CURRENT USER

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// GET USER PROFILE
router.get('/profile', getUserProfile);

// UPDATE USER
router.patch('/:id', protect, editUserProfile);

// DELETE USER
router.delete('/:id', protect, deleteUserProfile);

export default router;
