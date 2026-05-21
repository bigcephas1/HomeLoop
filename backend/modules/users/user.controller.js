// import User from './user.model.js';
// import bcrypt from 'bcryptjs';

// /////////// GET USER PROFILE

// const getUserProfile = async (req, res) => {
//   try {
//     const { email, username } = req.query;

//     if (!email && !username) {
//       return res.status(400).json({
//         message: 'Provide email or username',
//       });
//     }

//     const query = {};

//     if (email) query.email = email;
//     if (username) query.username = username;

//     const user = await User.findOne(query).select('-password');

//     if (!user) {
//       return res.status(404).json({
//         message: 'User not found',
//       });
//     }

//     res.json(user);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// ////////// EDIT USER PROFILE

// const editUserProfile = async (req, res) => {
//   try {
//     const userIdFromParams = req.params.id;
//     const userIdFromToken = req.user.id; // assumes JWT middleware sets req.user

//     // Security check: ensure user is editing their own profile
//     if (userIdFromParams !== userIdFromToken) {
//       return res
//         .status(403)
//         .json({ message: 'You can only edit your own profile' });
//     }

//     const { name, oldPassword, newPassword } = req.body;

//     const user = await User.findById(userIdFromParams);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update name if provided
//     if (name) {
//       user.name = name;
//     }

//     // Update password if provided
//     if (newPassword) {
//       if (!oldPassword) {
//         return res.status(400).json({
//           message: 'Old password is required to set a new password',
//         });
//       }

//       const isMatch = await bcrypt.compare(oldPassword, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ message: 'Old password is incorrect' });
//       }

//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(newPassword, salt);
//     }

//     await user.save();

//     res.status(200).json({
//       message: 'User profile updated successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// ///////// DELETE USER PROFILE

// const deleteUserProfile = async (req, res) => {
//   try {
//     const userIdFromParams = req.params.id;
//     const userIdFromToken = req.user.id;

//     // Ensure user can only delete their own account
//     if (userIdFromParams !== userIdFromToken) {
//       return res
//         .status(403)
//         .json({ message: 'You can only delete your own account' });
//     }

//     const deletedUser = await User.findByIdAndDelete(userIdFromParams);

//     if (!deletedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Clear JWT cookie
//     res.cookie('token', '', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       expires: new Date(0),
//     });

//     res
//       .status(200)
//       .json({ message: 'User account deleted and logged out successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export { getUserProfile, editUserProfile, deleteUserProfile };

import User from './user.model.js';
import bcrypt from 'bcryptjs';

/////////// GET USER PROFILE (public by email or username)
const getUserProfile = async (req, res) => {
  try {
    const { email, username } = req.query;
    if (!email && !username) {
      return res.status(400).json({ message: 'Provide email or username' });
    }
    const query = {};
    if (email) query.email = email;
    if (username) query.username = username;

    const user = await User.findOne(query).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

////////// EDIT USER PROFILE
const editUserProfile = async (req, res) => {
  try {
    const userIdFromParams = req.params.id;
    const userIdFromToken = req.user.id;

    if (userIdFromParams !== userIdFromToken) {
      return res
        .status(403)
        .json({ message: 'You can only edit your own profile' });
    }

    const {
      firstName,
      lastName,
      avatar,
      oldPassword,
      newPassword,
      address,
      city,
      state,
      postalCode,
      country,
    } = req.body;
    const user = await User.findById(userIdFromParams);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update basic fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (avatar !== undefined) user.avatar = avatar;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (postalCode !== undefined) user.postalCode = postalCode;
    if (country !== undefined) user.country = country;

    // Update password if requested
    if (newPassword) {
      if (!oldPassword) {
        return res
          .status(400)
          .json({ message: 'Old password is required to set a new password' });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      message: 'User profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

////////// DELETE USER PROFILE
const deleteUserProfile = async (req, res) => {
  try {
    const userIdFromParams = req.params.id;
    const userIdFromToken = req.user.id;
    if (userIdFromParams !== userIdFromToken) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(userIdFromParams);
    if (!deletedUser)
      return res.status(404).json({ message: 'User not found' });

    // Clear JWT cookie (old 'token' cookie – for backward compatibility)
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });
    // Also clear newer cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res
      .status(200)
      .json({ message: 'User account deleted and logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getUserProfile, editUserProfile, deleteUserProfile };
