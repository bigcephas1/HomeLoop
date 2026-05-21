import mongoose from 'mongoose';

const propertyVisitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    ipAddress: String,

    device: String,

    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const PropertyVisit = mongoose.model('PropertyVisit', propertyVisitSchema);

export default PropertyVisit;
