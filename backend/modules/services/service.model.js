import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, default: 60 }, // minutes
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    media: [
      {
        type: { type: String, enum: ['image', 'video'] },
        url: String,
        public_id: String,
      },
    ],
    availability: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
    ratingAverage: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    /////////////////////////////////////////////////////
    // OPTIONAL SERVICE DOCUMENTS (for credibility)
    /////////////////////////////////////////////////////

    serviceDocuments: [
      {
        type: { 
          type: String, 
          enum: ['certificate', 'license', 'training', 'insurance', 'other'] 
        },
        url: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now },
      }
    ],

    hasCertification: { type: Boolean, default: false },
    credibilityBoost: { type: Boolean, default: false }, // If documents provided
  },
  { timestamps: true }
);

serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ title: 'text', description: 'text', category: 'text' });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
