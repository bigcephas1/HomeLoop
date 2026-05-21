import User from '../users/user.model.js';
import Property from '../properties/property.model.js';
import Booking from '../bookings/booking.model.js';
import Payment from '../payments/payment.model.js';
import Review from '../reviews/review.model.js';

/////////////////////////////////////////////////////
// DASHBOARD OVERVIEW
/////////////////////////////////////////////////////

export const getDashboardOverview = async (req, res) => {
  try {
    /////////////////////////////////////////////////////
    // COUNTS
    /////////////////////////////////////////////////////

    const totalUsers = await User.countDocuments();

    const totalLandlords = await User.countDocuments({
      role: 'landlord',
    });

    const totalAdmins = await User.countDocuments({
      role: 'admin',
    });

    const totalProperties = await Property.countDocuments({
      isDeleted: false,
    });

    const totalBookings = await Booking.countDocuments({
      isDeleted: false,
    });

    const totalReviews = await Review.countDocuments();

    /////////////////////////////////////////////////////
    // PENDING MODERATION
    /////////////////////////////////////////////////////

    const pendingModeration = await Property.countDocuments({
      moderationStatus: 'pending',
    });

    /////////////////////////////////////////////////////
    // TOTAL REVENUE
    /////////////////////////////////////////////////////

    const revenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'success',
        },
      },

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: '$amount',
          },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    /////////////////////////////////////////////////////
    // RESPONSE
    /////////////////////////////////////////////////////

    res.status(200).json({
      overview: {
        totalUsers,
        totalLandlords,
        totalAdmins,
        totalProperties,
        totalBookings,
        totalReviews,
        totalRevenue,
        pendingModeration,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// RECENT BOOKINGS
/////////////////////////////////////////////////////

export const getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('property', 'title')
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// RECENT PAYMENTS
/////////////////////////////////////////////////////

export const getRecentPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('property', 'title')
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// MOST VIEWED PROPERTIES
/////////////////////////////////////////////////////

export const getTopProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      isDeleted: false,
    })
      .sort({
        views: -1,
        favoritesCount: -1,
      })
      .limit(10)
      .populate('landlord', 'name email');

    res.status(200).json({
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// RECENT USERS
/////////////////////////////////////////////////////

export const getRecentUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
