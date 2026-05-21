import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    /////////////////////////////////////////////////////
    // USER
    /////////////////////////////////////////////////////

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /////////////////////////////////////////////////////
    // PROPERTY
    /////////////////////////////////////////////////////

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },

    /////////////////////////////////////////////////////
    // BOOKING
    /////////////////////////////////////////////////////

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },

    /////////////////////////////////////////////////////
    // AMOUNT
    /////////////////////////////////////////////////////

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'NGN',
    },

    /////////////////////////////////////////////////////
    // PAYMENT DETAILS
    /////////////////////////////////////////////////////

    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet'],
      default: 'card',
    },

    provider: {
      type: String,
      enum: ['paystack', 'flutterwave', 'stripe'],
      default: 'paystack',
    },

    /////////////////////////////////////////////////////
    // REFERENCES
    /////////////////////////////////////////////////////

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    transactionId: {
      type: String,
      default: '',
    },

    /////////////////////////////////////////////////////
    // STATUS
    /////////////////////////////////////////////////////

    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },

    /////////////////////////////////////////////////////
    // PURPOSE
    /////////////////////////////////////////////////////

    purpose: {
      type: String,
      enum: [
        'property_payment',
        'booking_fee',
        'featured_listing',
        'subscription',
      ],
      default: 'booking_fee',
    },
  },
  {
    timestamps: true,
  },
);

/////////////////////////////////////////////////////
// INDEXES
/////////////////////////////////////////////////////

paymentSchema.index({
  user: 1,
  createdAt: -1,
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
