// import mongoose from 'mongoose';

// const propertySchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200,
//     },

//     description: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 5000,
//     },

//     type: {
//       type: String,
//       enum: ['house', 'land'],
//       required: true,
//     },

//     purpose: {
//       type: String,
//       enum: ['rent', 'sale', 'lease', 'shortlet'],
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ['available', 'rented', 'sold', 'pending'],
//       default: 'available',
//     },

//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     bedrooms: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },

//     bathrooms: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },

//     parkingSpaces: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },

//     size: {
//       type: Number,
//       min: 0,
//     },

//     address: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     city: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     state: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     country: {
//       type: String,
//       default: 'Nigeria',
//     },

//     location: {
//       type: {
//         type: String,
//         enum: ['Point'],
//         default: 'Point',
//       },

//       coordinates: {
//         type: [Number],
//         required: true,
//       },
//     },

//     amenities: [String],

//     images: [
//       {
//         url: String,
//         public_id: String,
//       },
//     ],

//     documents: [
//       {
//         name: String,
//         url: String,
//       },
//     ],

//     landlord: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },

//     verifiedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },

//     views: {
//       type: Number,
//       default: 0,
//     },

//     favoritesCount: {
//       type: Number,
//       default: 0,
//     },

//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// /////////////////////////////////////////////////////
// // GEO INDEX
// /////////////////////////////////////////////////////

// propertySchema.index({ location: '2dsphere' });

// /////////////////////////////////////////////////////
// // SEARCH INDEXES
// /////////////////////////////////////////////////////

// propertySchema.index({ city: 1 });
// propertySchema.index({ state: 1 });
// propertySchema.index({ price: 1 });
// propertySchema.index({ type: 1 });
// propertySchema.index({ purpose: 1 });

// const Property = mongoose.model('Property', propertySchema);

// export default Property;

import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    /////////////////////////////////////////////////////
    // BASIC INFO
    /////////////////////////////////////////////////////

    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
      maxlength: 5000,
    },

    /////////////////////////////////////////////////////
    // PROPERTY TYPE & PURPOSE
    /////////////////////////////////////////////////////

    type: {
      type: String,
      enum: ['house', 'land'],
      required: [true, 'Property type is required'],
    },

    purpose: {
      type: String,
      enum: ['rent', 'sale', 'lease', 'shortlet'],
      required: [true, 'Property purpose is required'],
    },

    status: {
      type: String,
      enum: ['available', 'pending', 'rented', 'sold'],
      default: 'available',
    },

    /////////////////////////////////////////////////////
    // PRICING
    /////////////////////////////////////////////////////

    price: {
      type: Number,
      required: [true, 'Property price is required'],
      min: [0, 'Price cannot be negative'],
    },

    negotiable: {
      type: Boolean,
      default: false,
    },

    /////////////////////////////////////////////////////
    // PROPERTY DETAILS
    /////////////////////////////////////////////////////

    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    toilets: {
      type: Number,
      default: 0,
      min: 0,
    },

    parkingSpaces: {
      type: Number,
      default: 0,
      min: 0,
    },

    furnished: {
      type: Boolean,
      default: false,
    },

    size: {
      type: Number,
      min: 0,
    },

    sizeUnit: {
      type: String,
      enum: ['sqm', 'sqft', 'acre'],
      default: 'sqm',
    },

    /////////////////////////////////////////////////////
    // LOCATION
    /////////////////////////////////////////////////////

    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },

    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },

    country: {
      type: String,
      default: 'Nigeria',
    },

    postalCode: {
      type: String,
      trim: true,
    },

    /////////////////////////////////////////////////////
    // GEOLOCATION
    /////////////////////////////////////////////////////

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    /////////////////////////////////////////////////////
    // AMENITIES
    /////////////////////////////////////////////////////

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    /////////////////////////////////////////////////////
    // IMAGES
    /////////////////////////////////////////////////////

    // images: [
    //   {
    //     url: {
    //       type: String,
    //       required: true,
    //     },

    //     public_id: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],

    ///////////////////////////////////////////////////////
    // MEDIA- IMAGES & DOCUMENTS
    ///////////////////////////////////////////////////////

    media: [
      {
        type: {
          type: String,
          enum: ['image', 'video'],
          required: true,
        },

        url: {
          type: String,
          required: true,
        },

        public_id: {
          type: String,
          required: true,
        },

        thumbnail: {
          type: String,
        },
      },
    ],

    /////////////////////////////////////////////////////
    // DOCUMENTS
    /////////////////////////////////////////////////////

    documents: [
      {
        name: {
          type: String,
          trim: true,
        },

        url: {
          type: String,
        },
      },
    ],

    /////////////////////////////////////////////////////
    // PROPERTY OWNER
    /////////////////////////////////////////////////////

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord is required'],
    },

    /////////////////////////////////////////////////////
    // PROPERTY VERIFICATION
    /////////////////////////////////////////////////////

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    verificationDate: {
      type: Date,
    },

    /////////////////////////////////////////////////////
    // FEATURED PROPERTY
    /////////////////////////////////////////////////////

    isFeatured: {
      type: Boolean,
      default: false,
    },

    featuredUntil: {
      type: Date,
    },

    /////////////////////////////////////////////////////
    // ANALYTICS
    /////////////////////////////////////////////////////

    views: {
      type: Number,
      default: 0,
    },

    favoritesCount: {
      type: Number,
      default: 0,
    },

    contactCount: {
      type: Number,
      default: 0,
    },

    /////////////////////////////////////////////////////
    // PROPERTY VISIBILITY
    /////////////////////////////////////////////////////

    isPublished: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    averageRating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    /////////////////////////////////////////////////////
    // ADDITIONAL NOTES
    /////////////////////////////////////////////////////

    additionalInfo: {
      type: String,
      maxlength: 2000,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

/////////////////////////////////////////////////////
// GEO INDEX
/////////////////////////////////////////////////////

propertySchema.index({ location: '2dsphere' });

/////////////////////////////////////////////////////
// SEARCH & FILTER INDEXES
/////////////////////////////////////////////////////

propertySchema.index({ city: 1 });
propertySchema.index({ state: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ purpose: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ landlord: 1 });

/////////////////////////////////////////////////////
// TEXT SEARCH INDEX
/////////////////////////////////////////////////////

propertySchema.index({
  title: 'text',
  description: 'text',
  city: 'text',
  state: 'text',
});

/////////////////////////////////////////////////////
// AUTO REMOVE EMPTY IMAGES
/////////////////////////////////////////////////////

propertySchema.pre('save', function () {
  if (this.images) {
    this.images = this.images.filter((image) => image.url);
  }
});

/////////////////////////////////////////////////////
// AUTO REMOVE EMPTY DOCUMENTS
/////////////////////////////////////////////////////

propertySchema.pre('save', function () {
  if (this.documents) {
    this.documents = this.documents.filter((doc) => doc.url);
  }
});

/////////////////////////////////////////////////////
// VIRTUAL PROPERTY ID
/////////////////////////////////////////////////////

propertySchema.virtual('propertyId').get(function () {
  return this._id.toHexString();
});

/////////////////////////////////////////////////////
// INCLUDE VIRTUALS
/////////////////////////////////////////////////////

propertySchema.set('toJSON', {
  virtuals: true,
});

propertySchema.set('toObject', {
  virtuals: true,
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
