import mongoose from 'mongoose';

const userMediaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
      unique: true,
    },
    format: String,
    size: Number,
  },
  { timestamps: true },
);

export default mongoose.model('UserMedia', userMediaSchema);
