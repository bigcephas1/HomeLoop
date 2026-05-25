import mongoose from 'mongoose';

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    providerTypes: [{
      type: String,
      enum: ['landlord', 'service_provider', 'representative'],
      default: [],
    }],
    bio: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    skills: [String],
    phoneNumber: { type: String, default: '' },
    
    verificationDocuments: [{
      type: { type: String, enum: ['id_card', 'passport', 'utility_bill', 'business_license', 'other'] },
      url: String,
      public_id: String,
      uploadedAt: { type: Date, default: Date.now },
    }],
    
    hasBusinessLicense: { type: Boolean, default: false },
    businessLicenseUrl: { type: String, default: '' },
    insuranceCertificateUrl: { type: String, default: '' },
    
    verificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected', 'suspended'],
      default: 'not_submitted',
    },
    isVerified: { type: Boolean, default: false },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    
    credibilityScore: { type: Number, default: 0, min: 0, max: 100 },
    trustScore: { type: Number, default: 0 },
    
    totalJobsCompleted: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    responseTimeAvg: { type: Number, default: 0 },
    
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: '' },
    suspendedAt: Date,
  },
  { timestamps: true }
);

// NO PRE-SAVE MIDDLEWARE - Remove or comment out entirely

providerProfileSchema.index({ verificationStatus: 1 });
providerProfileSchema.index({ credibilityScore: -1 });

const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);
export default ProviderProfile;
