import mongoose from 'mongoose';

const representativeInspectionSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    representative: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    notes: String,
    clientFeedback: String,
    representativeFeedback: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const RepresentativeInspection = mongoose.model('RepresentativeInspection', representativeInspectionSchema);
export default RepresentativeInspection;
