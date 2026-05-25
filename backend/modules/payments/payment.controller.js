import Payment from './payment.model.js';
import Booking from '../bookings/booking.model.js';
import { createNotification } from '../notifications/notification.controller.js';

/////////////////////////////////////////////////////
// INITIATE PAYMENT
/////////////////////////////////////////////////////

export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('property user landlord');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment && existingPayment.status === 'success') {
      return res.status(400).json({ message: 'Payment already completed for this booking' });
    }
    
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      landlord: booking.landlord._id,
      property: booking.property._id,
      amount: booking.totalPrice,
      status: 'pending',
      reference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    });
    
    res.status(200).json({ 
      message: 'Payment initiated', 
      payment,
      authorization_url: `https://checkout.paystack.com/${payment.reference}` // Placeholder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// VERIFY PAYMENT
/////////////////////////////////////////////////////

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    const payment = await Payment.findOne({ reference }).populate('booking user landlord property');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Simulate payment verification (in production, verify with Paystack/Flutterwave)
    payment.status = 'success';
    await payment.save();
    
    // Update booking payment status
    await Booking.findByIdAndUpdate(payment.booking._id, { paymentStatus: 'paid' });
    
    // Notify the client about successful payment
    await createNotification(
      payment.user._id,
      'Payment Successful',
      `Your payment of ₦${payment.amount.toLocaleString()} for ${payment.property.title} has been processed successfully.`,
      'payment',
      '/dashboard/user/payments',
      { paymentId: payment._id, amount: payment.amount }
    );
    
    // Notify the landlord about payment received
    await createNotification(
      payment.landlord._id,
      'Payment Received',
      `You have received ₦${payment.amount.toLocaleString()} from ${payment.user.firstName} ${payment.user.lastName} for ${payment.property.title}.`,
      'payment',
      '/dashboard/landlord/payments',
      { paymentId: payment._id, amount: payment.amount }
    );
    
    res.status(200).json({ message: 'Payment verified', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// GET USER PAYMENTS
/////////////////////////////////////////////////////

export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('property', 'title')
      .populate('booking')
      .sort({ createdAt: -1 });
    
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// GET LANDLORD PAYMENTS
/////////////////////////////////////////////////////

export const getLandlordPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ landlord: req.user._id })
      .populate('property', 'title')
      .populate('booking')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
