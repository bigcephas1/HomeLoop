import mongoose from 'mongoose';

const moderationLogSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    action: {
      type: String,
      enum: ['approved', 'rejected', 'suspended', 'verified'],
      required: true,
    },

    reason: {
      type: String,
      default: '',
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const ModerationLog = mongoose.model('ModerationLog', moderationLogSchema);

export default ModerationLog;
