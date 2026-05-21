// import Property from './property.model.js';
// import PropertyVisit from './propertyVisit.model.js';
// import ModerationLog from '../moderation/moderationLog.model.js';

// const sanitizeNumber = (value) => {
//   const num = Number(value);
//   return isNaN(num) ? undefined : num;
// };

// /////////////////////////////////////////////////////
// // CREATE PROPERTY
// /////////////////////////////////////////////////////

// export const createProperty = async (req, res) => {
//   try {
//     const property = await Property.create({
//       ...req.body,
//       landlord: req.user._id,
//     });

//     res.status(201).json({
//       message: 'Property created successfully',
//       property,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// /////////////////////////////////////////////////////
// // GET ALL PROPERTIES
// /////////////////////////////////////////////////////

// export const getProperties = async (req, res) => {
//   try {
//     const {
//       city,
//       state,
//       type,
//       purpose,
//       minPrice,
//       maxPrice,
//       search,
//       page = 1,
//       limit = 10,
//       sort = '-createdAt',
//     } = req.query;

//     /////////////////////////////////////////////////////
//     // BUILD FILTER OBJECT
//     /////////////////////////////////////////////////////

//     const filter = {
//       isDeleted: false,
//       isPublished: true,
//     };

//     if (city) {
//       filter.city = { $regex: city, $options: 'i' };
//     }

//     if (state) {
//       filter.state = { $regex: state, $options: 'i' };
//     }

//     if (type) filter.type = type;
//     if (purpose) filter.purpose = purpose;

//     const min = sanitizeNumber(minPrice);
//     const max = sanitizeNumber(maxPrice);

//     if (min !== undefined || max !== undefined) {
//       filter.price = {};
//       if (min !== undefined) filter.price.$gte = min;
//       if (max !== undefined) filter.price.$lte = max;
//     }

//     if (search) {
//       filter.$text = {
//         $search: search,
//       };
//     }

//     /////////////////////////////////////////////////////
//     // PAGINATION SETUP (SAFE)
//     /////////////////////////////////////////////////////

//     const pageNumber = sanitizeNumber(page) || 1;
//     const limitNumber = sanitizeNumber(limit) || 10;

//     const skip = (pageNumber - 1) * limitNumber;

//     const properties = await Property.find(filter)
//       .populate('landlord', 'name email phoneNumber')
//       .sort(sort)
//       .skip(skip)
//       .limit(limitNumber);

//     const total = await Property.countDocuments(filter);

//     res.status(200).json({
//       total,
//       page: pageNumber,
//       pages: Math.ceil(total / limitNumber),
//       count: properties.length,
//       properties,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// /////////////////////////////////////////////////////
// // GET SINGLE PROPERTY
// /////////////////////////////////////////////////////

// export const getSingleProperty = async (req, res) => {
//   try {
//     const propertyId = req.params.id;

//     const property = await Property.findById(propertyId).populate(
//       'landlord',
//       'name email phoneNumber',
//     );

//     if (!property || property.isDeleted) {
//       return res.status(404).json({
//         message: 'Property not found',
//       });
//     }

//     /////////////////////////////////////////////////////
//     // TRACK PROPERTY VISIT (ANTI-SPAM LOGIC ADDED)
//     /////////////////////////////////////////////////////

//     const visitExists = await PropertyVisit.findOne({
//       property: propertyId,
//       user: req.user?._id || null,
//       ipAddress: req.ip,
//       createdAt: {
//         $gte: new Date(Date.now() - 5 * 60 * 1000), // 5 min cooldown
//       },
//     });

//     if (!visitExists) {
//       await PropertyVisit.create({
//         property: propertyId,
//         user: req.user?._id || null,
//         ipAddress: req.ip,
//         device: req.headers['user-agent'],
//       });

//       /////////////////////////////////////////////////////
//       // INCREMENT VIEWS (ATOMIC - FIXED RACE CONDITION)
//       /////////////////////////////////////////////////////

//       await Property.findByIdAndUpdate(propertyId, {
//         $inc: { views: 1 },
//       });
//     }

//     // reload updated property (so response is accurate)
//     const updatedProperty = await Property.findById(propertyId).populate(
//       'landlord',
//       'name email phoneNumber',
//     );

//     res.status(200).json(updatedProperty);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// /////////////////////////////////////////////////////
// // UPDATE PROPERTY
// /////////////////////////////////////////////////////

// export const updateProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property || property.isDeleted) {
//       return res.status(404).json({
//         message: 'Property not found',
//       });
//     }

//     if (property.landlord.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         message: 'Not authorized',
//       });
//     }

//     Object.assign(property, req.body);

//     await property.save();

//     res.status(200).json({
//       message: 'Property updated successfully',
//       property,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// /////////////////////////////////////////////////////
// // DELETE PROPERTY
// /////////////////////////////////////////////////////

// export const deleteProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property || property.isDeleted) {
//       return res.status(404).json({
//         message: 'Property not found',
//       });
//     }

//     if (property.landlord.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         message: 'Not authorized',
//       });
//     }

//     property.isDeleted = true;

//     await property.save();

//     res.status(200).json({
//       message: 'Property deleted successfully',
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// export const getNearbyProperties = async (req, res) => {
//   try {
//     const { lng, lat, radius = 5 } = req.query;

//     if (!lng || !lat) {
//       return res.status(400).json({
//         message: 'Longitude and latitude are required',
//       });
//     }

//     const longitude = Number(lng);
//     const latitude = Number(lat);
//     const distanceInMeters = Number(radius) * 1000;

//     const properties = await Property.aggregate([
//       {
//         $geoNear: {
//           near: {
//             type: 'Point',
//             coordinates: [longitude, latitude],
//           },
//           distanceField: 'distance',
//           maxDistance: distanceInMeters,
//           spherical: true,
//         },
//       },

//       {
//         $match: {
//           isDeleted: false,
//           isPublished: true,
//         },
//       },

//       {
//         $sort: { distance: 1 },
//       },
//     ]);

//     res.status(200).json({
//       count: properties.length,
//       properties,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// export const getAllPropertiesAdmin = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, status, isDeleted, landlord } = req.query;

//     const query = {};

//     // optional filters for admin
//     if (status) query.status = status;

//     if (isDeleted !== undefined) {
//       query.isDeleted = isDeleted === 'true';
//     }

//     if (landlord) {
//       query.landlord = landlord;
//     }

//     const skip = (Number(page) - 1) * Number(limit);

//     const properties = await Property.find(query)
//       .populate('landlord', 'name email role')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     const total = await Property.countDocuments(query);

//     res.status(200).json({
//       total,
//       page: Number(page),
//       pages: Math.ceil(total / limit),
//       count: properties.length,
//       properties,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// export const approveProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property || property.isDeleted) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     property.moderationStatus = 'approved';
//     property.isPublished = true;
//     property.isVerified = true;
//     property.verifiedBy = req.user._id;
//     property.verificationDate = new Date();

//     await property.save();

//     res.status(200).json({
//       message: 'Property approved successfully',
//       property,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const rejectProperty = async (req, res) => {
//   try {
//     const { reason } = req.body;

//     const property = await Property.findById(req.params.id);

//     if (!property || property.isDeleted) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     property.moderationStatus = 'rejected';
//     property.isPublished = false;
//     property.additionalInfo = reason || 'No reason provided';

//     await property.save();

//     res.status(200).json({
//       message: 'Property rejected',
//       property,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const suspendProperty = async (req, res) => {
//   try {
//     const { reason } = req.body;

//     const property = await Property.findById(req.params.id);

//     if (!property || property.isDeleted) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     property.moderationStatus = 'suspended';
//     property.isPublished = false;
//     property.additionalInfo = reason || 'Suspended by admin';

//     await property.save();

//     res.status(200).json({
//       message: 'Property suspended',
//       property,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const verifyLandlordProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property || property.isDeleted) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     property.isVerified = true;
//     property.verifiedBy = req.user._id;
//     property.verificationDate = new Date();

//     await property.save();

//     res.status(200).json({
//       message: 'Property verified successfully',
//       property,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const approveProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property || property.isDeleted) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     property.moderationStatus = 'approved';
//     property.isPublished = true;
//     property.isVerified = true;
//     property.verifiedBy = req.user._id;
//     property.verificationDate = new Date();

//     await property.save();

//     // 🧾 AUDIT LOG
//     await ModerationLog.create({
//       property: property._id,
//       admin: req.user._id,
//       action: 'approved',
//       reason: '',
//     });

//     res.status(200).json({
//       message: 'Property approved successfully',
//       property,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const rejectProperty = async (req, res) => {
//   try {
//     const { reason } = req.body;

//     const property = await Property.findById(req.params.id);

//     if (!property || property.isDeleted) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     property.moderationStatus = 'rejected';
//     property.isPublished = false;

//     await property.save();

//     // 🧾 AUDIT LOG
//     await ModerationLog.create({
//       property: property._id,
//       admin: req.user._id,
//       action: 'rejected',
//       reason,
//     });

//     res.status(200).json({
//       message: 'Property rejected',
//       property,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// await ModerationLog.create({
//   property: property._id,
//   admin: req.user._id,
//   action: 'suspended',
//   reason,
// });

// await ModerationLog.create({
//   property: property._id,
//   admin: req.user._id,
//   action: 'verified',
// });

// export const getModerationLogs = async (req, res) => {
//   try {
//     const logs = await ModerationLog.find()
//       .populate('property', 'title')
//       .populate('admin', 'name email role')
//       .sort({ createdAt: -1 });

//     res.status(200).json(logs);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

////////

import Property from './property.model.js';
import PropertyVisit from './propertyVisit.model.js';
import ModerationLog from '../moderation/moderationLog.model.js';

/* CREATE PROPERTY */
export const createProperty = async (req, res) => {
  try {
    const property = await Property.create({
      ...req.body,
      landlord: req.user._id,
    });

    res.status(201).json({
      message: 'Property created successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ALL */
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      isDeleted: false,
      isPublished: true,
    }).populate('landlord', 'name email');

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ONE */
export const getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'landlord',
      'name email',
    );

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await PropertyVisit.create({
      property: property._id,
      user: req.user?._id || null,
      ipAddress: req.ip,
      device: req.headers['user-agent'],
    });

    await Property.findByIdAndUpdate(property._id, {
      $inc: { views: 1 },
    });

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE */
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(property, req.body);
    await property.save();

    res.status(200).json({ message: 'Updated', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* DELETE */
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    property.isDeleted = true;
    await property.save();

    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GEO SEARCH */
export const getNearbyProperties = async (req, res) => {
  try {
    const { lng, lat, radius = 5 } = req.query;

    const properties = await Property.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: 'distance',
          maxDistance: Number(radius) * 1000,
          spherical: true,
        },
      },
      {
        $match: {
          isDeleted: false,
          isPublished: true,
        },
      },
    ]);

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ADMIN */
export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('landlord', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* MODERATION */

////// Approve PROPERTY

export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.moderationStatus = 'approved';
    property.isPublished = true;
    property.isVerified = true;
    property.verifiedBy = req.user._id;
    property.verificationDate = new Date();

    await property.save();

    await ModerationLog.create({
      property: property._id,
      admin: req.user._id,
      action: 'approved',
      reason: req.body.reason || '',
    });

    res.status(200).json({
      message: 'Property approved successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//////// Reject PROPERTY

export const rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;

    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.moderationStatus = 'rejected';
    property.isPublished = false;

    await property.save();

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
    res.status(500).json({ message: error.message });
  }
};

///////// Suspend PROPERTY

export const suspendProperty = async (req, res) => {
  try {
    const { reason } = req.body;

    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.moderationStatus = 'suspended';
    property.isPublished = false;

    await property.save();

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
    res.status(500).json({ message: error.message });
  }
};

////// Verify Landlord's Property

export const verifyLandlordProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.isVerified = true;
    property.verifiedBy = req.user._id;
    property.verificationDate = new Date();

    await property.save();

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
    res.status(500).json({ message: error.message });
  }
};

export const getModerationLogs = async (req, res) => {
  try {
    const logs = await ModerationLog.find()
      .populate('property')
      .populate('admin', 'name email');

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
