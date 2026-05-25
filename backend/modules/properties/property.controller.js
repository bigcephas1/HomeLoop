import Property from './property.model.js';
import PropertyVisit from './propertyVisit.model.js';
import ModerationLog from '../moderation/moderationLog.model.js';
import sendNotification from '../../services/notification.service.js';
import ProviderProfile from '../providerProfiles/providerProfile.model.js';

import { queueEmail } from '../../services/emailQueue.service.js';

import propertyApprovedTemplate from '../../templates/propertyApprovedTemplate.js';

/////////////////////////////////////////////////////
// SANITIZE NUMBER HELPER
/////////////////////////////////////////////////////

const sanitizeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

/////////////////////////////////////////////////////
// CREATE PROPERTY
/////////////////////////////////////////////////////




export const createProperty = async (req, res) => {
  try {
    // Check landlord verification - STRICT CHECK
    const providerProfile = await ProviderProfile.findOne({
      user: req.user._id,
    });

    if (!providerProfile) {
      return res.status(403).json({
        message: 'You must create a landlord profile first',
        action: 'create_profile',
      });
    }

    if (!providerProfile.isVerified || providerProfile.verificationStatus !== 'approved') {
      return res.status(403).json({
        message: 'Your landlord profile must be verified by admin before listing properties',
        status: providerProfile.verificationStatus,
        action: 'wait_verification',
      });
    }

    if (providerProfile.isSuspended) {
      return res.status(403).json({
        message: 'Your account has been suspended. Contact admin for details.',
        action: 'contact_admin',
      });
    }

    // Create property with pending moderation
    const property = await Property.create({
      ...req.body,
      landlord: req.user._id,
      moderationStatus: 'pending',
      documentVerificationStatus: 'pending',
    });

    // Notify admin
    await Notification.create({
      user: 'admin_system',
      title: 'New Property Pending Review',
      message: `${req.user.firstName} ${req.user.lastName} has submitted a property for review: ${property.title}`,
      type: 'moderation',
      link: `/admin/properties/${property._id}`,
    });

    // Notify landlord
    await Notification.create({
      user: req.user._id,
      title: 'Property Submitted for Review',
      message: 'Your property has been submitted for admin review. You will be notified once approved.',
      type: 'moderation',
    });

    res.status(201).json({
      message: 'Property submitted for admin review',
      property,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/////////////////////////////////////////////////////
// GET ALL PROPERTIES
/////////////////////////////////////////////////////

export const getProperties = async (req, res) => {
  try {
    const {
      city,
      state,
      type,
      purpose,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    /////////////////////////////////////////////////////
    // BUILD FILTER
    /////////////////////////////////////////////////////

    const filter = {
      isDeleted: false,
      isPublished: true,
    };

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (purpose) {
      filter.purpose = purpose;
    }

    /////////////////////////////////////////////////////
    // PRICE FILTER
    /////////////////////////////////////////////////////

    const min = sanitizeNumber(minPrice);
    const max = sanitizeNumber(maxPrice);

    if (min !== undefined || max !== undefined) {
      filter.price = {};

      if (min !== undefined) {
        filter.price.$gte = min;
      }

      if (max !== undefined) {
        filter.price.$lte = max;
      }
    }

    /////////////////////////////////////////////////////
    // TEXT SEARCH
    /////////////////////////////////////////////////////

    if (search) {
      filter.$text = {
        $search: search,
      };
    }

    /////////////////////////////////////////////////////
    // PAGINATION
    /////////////////////////////////////////////////////

    const pageNumber = sanitizeNumber(page) || 1;
    const limitNumber = sanitizeNumber(limit) || 10;

    const skip = (pageNumber - 1) * limitNumber;

    /////////////////////////////////////////////////////
    // QUERY DATABASE
    /////////////////////////////////////////////////////

    const properties = await Property.find(filter)
      .populate('landlord', 'name email phoneNumber')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    const total = await Property.countDocuments(filter);

    /////////////////////////////////////////////////////
    // RESPONSE
    /////////////////////////////////////////////////////

    res.status(200).json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
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
// GET SINGLE PROPERTY
/////////////////////////////////////////////////////

export const getSingleProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId).populate(
      'landlord',
      'name email phoneNumber',
    );

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    /////////////////////////////////////////////////////
    // ANTI-SPAM VIEW TRACKING
    /////////////////////////////////////////////////////

    const visitExists = await PropertyVisit.findOne({
      property: propertyId,
      user: req.user?._id || null,
      ipAddress: req.ip,
      createdAt: {
        $gte: new Date(Date.now() - 5 * 60 * 1000),
      },
    });

    /////////////////////////////////////////////////////
    // TRACK VISIT + INCREMENT VIEW
    /////////////////////////////////////////////////////

    if (!visitExists) {
      await PropertyVisit.create({
        property: propertyId,
        user: req.user?._id || null,
        ipAddress: req.ip,
        device: req.headers['user-agent'],
      });

      await Property.findByIdAndUpdate(
        propertyId,
        {
          $inc: { views: 1 },
        },
        { new: true },
      );
    }

    /////////////////////////////////////////////////////
    // RETURN UPDATED PROPERTY
    /////////////////////////////////////////////////////

    const updatedProperty = await Property.findById(propertyId).populate(
      'landlord',
      'name email phoneNumber',
    );

    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// UPDATE PROPERTY
/////////////////////////////////////////////////////

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    /////////////////////////////////////////////////////
    // OWNERSHIP CHECK
    /////////////////////////////////////////////////////

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    Object.assign(property, req.body);

    await property.save();

    res.status(200).json({
      message: 'Property updated successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// DELETE PROPERTY
/////////////////////////////////////////////////////

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    /////////////////////////////////////////////////////
    // OWNERSHIP CHECK
    /////////////////////////////////////////////////////

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    property.isDeleted = true;

    await property.save();

    res.status(200).json({
      message: 'Property deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// GEO SEARCH
/////////////////////////////////////////////////////

export const getNearbyProperties = async (req, res) => {
  try {
    const { lng, lat, radius = 5 } = req.query;

    /////////////////////////////////////////////////////
    // VALIDATION
    /////////////////////////////////////////////////////

    if (!lng || !lat) {
      return res.status(400).json({
        message: 'Longitude and latitude are required',
      });
    }

    const longitude = Number(lng);
    const latitude = Number(lat);
    const distanceInMeters = Number(radius) * 1000;

    /////////////////////////////////////////////////////
    // GEO QUERY
    /////////////////////////////////////////////////////

    const properties = await Property.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distance',
          maxDistance: distanceInMeters,
          spherical: true,
        },
      },
      {
        $match: {
          isDeleted: false,
          isPublished: true,
        },
      },
      {
        $sort: {
          distance: 1,
        },
      },
    ]);

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
// ADMIN - GET ALL PROPERTIES
/////////////////////////////////////////////////////

export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      isDeleted,
      landlord,
    } = req.query;

    const query = {};

    /////////////////////////////////////////////////////
    // OPTIONAL FILTERS
    /////////////////////////////////////////////////////

    if (status) {
      query.moderationStatus = status;
    }

    if (isDeleted !== undefined) {
      query.isDeleted = isDeleted === 'true';
    }

    if (landlord) {
      query.landlord = landlord;
    }

    /////////////////////////////////////////////////////
    // PAGINATION
    /////////////////////////////////////////////////////

    const skip = (Number(page) - 1) * Number(limit);

    const properties = await Property.find(query)
      .populate('landlord', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
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
// APPROVE PROPERTY
/////////////////////////////////////////////////////

export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'landlord',
      'name email',
    );

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    property.moderationStatus = 'approved';
    property.isPublished = true;
    property.isVerified = true;
    property.verifiedBy = req.user._id;
    property.verificationDate = new Date();

    await property.save();

    /////////////////////////////////////////////////////
    // AUDIT LOG
    /////////////////////////////////////////////////////

    await ModerationLog.create({
      property: property._id,
      admin: req.user._id,
      action: 'approved',
      reason: req.body.reason || '',
    });

    /////////////////////////////////////////////////////
    // SEND NOTIFICATION
    /////////////////////////////////////////////////////

    await sendNotification({
      user: property.landlord._id,
      title: 'Property Approved',
      message: 'Your property has been approved successfully',
      type: 'property',
      link: `/properties/${property._id}`,
    });

    /////////////////////////////////////////////////////
    // SEND EMAIL
    /////////////////////////////////////////////////////

    await queueEmail({
      to: property.landlord.email,
      subject: 'Property Approved',
      html: propertyApprovedTemplate({
        name: property.landlord.name,
        propertyTitle: property.title,
      }),
    });

    res.status(200).json({
      message: 'Property approved successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// REJECT PROPERTY
/////////////////////////////////////////////////////

export const rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;

    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    property.moderationStatus = 'rejected';
    property.isPublished = false;

    await property.save();

    /////////////////////////////////////////////////////
    // AUDIT LOG
    /////////////////////////////////////////////////////

    await ModerationLog.create({
      property: property._id,
      admin: req.user._id,
      action: 'rejected',
      reason,
    });

    res.status(200).json({
      message: 'Property rejected',
      property,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// SUSPEND PROPERTY
/////////////////////////////////////////////////////

export const suspendProperty = async (req, res) => {
  try {
    const { reason } = req.body;

    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    property.moderationStatus = 'suspended';
    property.isPublished = false;

    await property.save();

    /////////////////////////////////////////////////////
    // AUDIT LOG
    /////////////////////////////////////////////////////

    await ModerationLog.create({
      property: property._id,
      admin: req.user._id,
      action: 'suspended',
      reason: reason || 'No reason provided',
    });

    res.status(200).json({
      message: 'Property suspended',
      property,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// VERIFY PROPERTY
/////////////////////////////////////////////////////

export const verifyLandlordProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    property.isVerified = true;
    property.verifiedBy = req.user._id;
    property.verificationDate = new Date();

    await property.save();

    /////////////////////////////////////////////////////
    // AUDIT LOG
    /////////////////////////////////////////////////////

    await ModerationLog.create({
      property: property._id,
      admin: req.user._id,
      action: 'verified',
      reason: req.body.reason || '',
    });

    res.status(200).json({
      message: 'Property verified successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// GET MODERATION LOGS
/////////////////////////////////////////////////////

export const getModerationLogs = async (req, res) => {
  try {
    const logs = await ModerationLog.find()
      .populate('property', 'title')
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
