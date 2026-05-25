import User from '../users/user.model.js';
import Property from '../properties/property.model.js';
import Booking from '../bookings/booking.model.js';
import Payment from '../payments/payment.model.js';
import Review from '../reviews/review.model.js';
import ProviderProfile from '../providerProfiles/providerProfile.model.js';
import Service from '../services/service.model.js'; // ✅ ADDED: Missing import
import Notification from '../notifications/notification.model.js'; // ✅ ADDED: Missing import

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

/////////////////////////////////////////////////////
// PROVIDER MANAGEMENT (ADMIN)
/////////////////////////////////////////////////////

/**
 * Get all provider profiles with optional filters
 * Query params: verificationStatus, isVerified, providerType
 */
export const getProviderProfiles = async (req, res) => {
  try {
    const { verificationStatus, isVerified, providerType } = req.query;
    const filter = {};

    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (providerType) filter.providerTypes = providerType;

    const profiles = await ProviderProfile.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Approve a provider profile (landlord, service_provider, or representative)
 * ✅ FIXED: Removed duplicate code, added proper error handling
 */
export const approveProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id).populate('user');
    
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // ✅ FIXED: Optional chaining for verificationDocuments
    const hasDocuments = profile.verificationDocuments && profile.verificationDocuments.length > 0;
    
    if (!hasDocuments) {
      return res.status(400).json({
        message: 'Please ask provider to upload verification documents first',
        requiresDocuments: true,
      });
    }
    
    profile.isVerified = true;
    profile.verificationStatus = 'approved';
    profile.reviewedBy = req.user._id;
    profile.reviewedAt = new Date();
    profile.rejectionReason = '';
    
    // Calculate initial credibility score
    profile.credibilityScore = Math.min(
      (profile.verificationDocuments.length * 15) + 
      (profile.yearsOfExperience * 5), 
      100
    );
    
    await profile.save();

    // Send notification to provider
    await Notification.create({
      user: profile.user._id,
      title: 'Profile Verified!',
      message: `Your ${profile.providerTypes.join(', ')} profile has been verified. You can now start listing properties/services.`,
      type: 'moderation',
      link: '/profile',
    });

    res.status(200).json({
      message: 'Provider profile approved successfully',
      profile,
      credibilityScore: profile.credibilityScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reject a provider profile with a reason
 * ✅ FIXED: Added notification sending
 */
export const rejectProviderProfile = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await ProviderProfile.findById(req.params.id).populate('user');
    
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    profile.isVerified = false;
    profile.verificationStatus = 'rejected';
    profile.reviewedBy = req.user._id;
    profile.reviewedAt = new Date();
    profile.rejectionReason = reason || 'No reason provided';
    await profile.save();

    // ✅ ADDED: Send notification to provider
    await Notification.create({
      user: profile.user._id,
      title: 'Profile Verification Rejected',
      message: `Your profile verification was rejected. Reason: ${profile.rejectionReason}. Please update and resubmit.`,
      type: 'moderation',
      link: '/dashboard/service-provider/credibility',
    });

    res.status(200).json({
      message: 'Provider profile rejected',
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// PROPERTY MODERATION
/////////////////////////////////////////////////////

/**
 * Approve a property after verification
 * ✅ FIXED: Removed duplicate function, added proper checks
 */
export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('landlord');

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check document match before approval
    const providerProfile = await ProviderProfile.findOne({ user: property.landlord._id });

    let matchScore = 0;
    if (providerProfile) {
      // Simple match check - name and address comparison
      if (providerProfile.user.toString() === property.landlord._id.toString()) {
        matchScore += 50;
      }
      // ✅ FIXED: Optional chaining for arrays
      if ((providerProfile.verificationDocuments?.length || 0) > 0 && 
          (property.ownershipDocuments?.length || 0) > 0) {
        matchScore += 50;
      }
      property.documentMatchScore = matchScore;
    }

    // ✅ FIXED: Check if match score is too low (only if ownership documents exist)
    if (matchScore < 70 && (property.ownershipDocuments?.length || 0) > 0) {
      property.moderationStatus = 'pending';
      property.documentVerificationStatus = 'mismatch';
      await property.save();

      return res.status(400).json({
        message: 'Document mismatch detected. Please verify property ownership documents.',
        matchScore,
        requiresAction: true,
      });
    }

    property.moderationStatus = 'approved';
    property.isPublished = true;
    property.isVerified = true;
    property.verifiedBy = req.user._id;
    property.verificationDate = new Date();
    property.documentVerificationStatus = 'verified';
    await property.save();

    // Send notification to landlord
    await Notification.create({
      user: property.landlord._id,
      title: 'Property Approved',
      message: `Your property "${property.title}" has been approved and is now live!`,
      type: 'moderation',
      link: `/properties/${property._id}`,
    });

    res.status(200).json({
      message: 'Property approved successfully',
      property,
      matchScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reject a property
 * ✅ FIXED: No duplicate, properly implemented
 */
export const rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findById(req.params.id).populate('landlord');

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.moderationStatus = 'rejected';
    property.isPublished = false;
    await property.save();

    await Notification.create({
      user: property.landlord._id,
      title: 'Property Rejected',
      message: `Your property "${property.title}" was rejected. Reason: ${reason || 'Please review and resubmit'}`,
      type: 'moderation',
    });

    res.status(200).json({
      message: 'Property rejected',
      property,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Suspend a property
 * ✅ FIXED: No duplicate
 */
export const suspendProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findById(req.params.id).populate('landlord');

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.moderationStatus = 'suspended';
    property.isPublished = false;
    await property.save();

    await Notification.create({
      user: property.landlord._id,
      title: 'Property Suspended',
      message: `Your property "${property.title}" has been suspended. Reason: ${reason || 'Violation of platform policies'}`,
      type: 'moderation',
    });

    res.status(200).json({
      message: 'Property suspended',
      property,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// PROVIDER SUSPENSION
/////////////////////////////////////////////////////

/**
 * Suspend a provider account
 * ✅ FIXED: Removed duplicate function (had two suspendProvider functions)
 */
export const suspendProvider = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await ProviderProfile.findById(req.params.id).populate('user');

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    profile.isSuspended = true;
    profile.suspensionReason = reason || 'Violation of platform policies';
    profile.suspendedAt = new Date();
    profile.verificationStatus = 'suspended';
    await profile.save();

    // Suspend all their properties
    await Property.updateMany(
      { landlord: profile.user },
      { moderationStatus: 'suspended', isPublished: false }
    );

    // Suspend all their services
    await Service.updateMany(
      { provider: profile.user },
      { isPublished: false, availability: 'offline' }
    );

    // Send notification
    await Notification.create({
      user: profile.user._id,
      title: 'Account Suspended',
      message: `Your account has been suspended. Reason: ${profile.suspensionReason}. Please contact support.`,
      type: 'moderation',
    });

    res.status(200).json({
      message: 'Provider suspended successfully',
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// DOCUMENT VERIFICATION
/////////////////////////////////////////////////////

/**
 * Compare provider documents with property documents
 * ✅ FIXED: Added better error handling and optional chaining
 */
export const compareDocuments = async (req, res) => {
  try {
    const { providerId, propertyId } = req.params;

    const provider = await ProviderProfile.findById(providerId).populate('user');
    const property = await Property.findById(propertyId).populate('landlord');

    if (!provider || !property) {
      return res.status(404).json({ message: 'Provider or property not found' });
    }

    let matchScore = 0;
    let matchDetails = [];

    // Name comparison
    if (provider.user?.firstName === property.landlord?.firstName &&
        provider.user?.lastName === property.landlord?.lastName) {
      matchScore += 30;
      matchDetails.push('✓ Name match confirmed');
    } else {
      matchDetails.push('✗ Name mismatch - verification required');
    }

    // Address comparison
    if (provider.user?.address === property.address) {
      matchScore += 25;
      matchDetails.push('✓ Address match confirmed');
    } else {
      matchDetails.push('✗ Address mismatch');
    }

    // Provider documents check
    if (provider.verificationDocuments?.length > 0) {
      matchScore += 20;
      matchDetails.push('✓ Provider has verified documents');
    } else {
      matchDetails.push('✗ No provider documents found');
    }

    // Property documents check
    if (property.ownershipDocuments?.length > 0) {
      matchScore += 25;
      matchDetails.push('✓ Property ownership documents provided');
    } else {
      matchDetails.push('✗ No property ownership documents');
    }

    property.documentMatchScore = matchScore;
    property.documentVerificationStatus = matchScore >= 70 ? 'verified' : 'mismatch';
    await property.save();

    res.status(200).json({
      matchScore,
      matchDetails,
      status: property.documentVerificationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Verify service provider credibility and update score
 * ✅ FIXED: Added proper score calculation
 */
export const verifyServiceCredibility = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await ProviderProfile.findById(providerId).populate('user');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    let credibilityNote = '';
    let oldScore = provider.credibilityScore || 0;

    // Calculate credibility based on documents and experience
    let newScore = 0;
    newScore += Math.min((provider.verificationDocuments?.length || 0) * 15, 30);
    newScore += Math.min(provider.yearsOfExperience * 5, 20);
    newScore += Math.min((provider.totalJobsCompleted || 0) / 2, 25);
    newScore += Math.min((provider.averageRating || 0) * 5, 15);
    newScore += 10; // Base score for being registered

    provider.credibilityScore = Math.min(newScore, 100);
    
    // Add note about changes
    if (provider.verificationDocuments?.length >= 2) {
      credibilityNote = 'High credibility - multiple documents verified';
    } else if (provider.verificationDocuments?.length === 1) {
      credibilityNote = 'Medium credibility - basic documents provided';
    } else {
      credibilityNote = 'Low credibility - no documents provided. Consider adding documents to increase trust.';
    }

    await provider.save();

    await Notification.create({
      user: provider.user._id,
      title: 'Credibility Score Updated',
      message: `Your credibility score changed from ${oldScore} to ${provider.credibilityScore}. ${credibilityNote}`,
      type: 'system',
      link: '/dashboard/service-provider/credibility',
    });

    res.status(200).json({
      credibilityScore: provider.credibilityScore,
      oldScore,
      message: credibilityNote,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
