import axios from 'axios';

import Payment from './payment.model.js';

import Booking from '../bookings/booking.model.js';

import { queueEmail } from '../../services/emailQueue.service.js';

import paymentSuccessTemplate from '../../templates/paymentSuccessTemplate.js';

import sendNotification from '../../services/notification.service.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/////////////////////////////////////////////////////
// INITIALIZE PAYMENT
/////////////////////////////////////////////////////

export const initializePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('property');

    if (!booking || booking.isDeleted) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    const reference = `PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    /////////////////////////////////////////////////////
    // CREATE PAYMENT
    /////////////////////////////////////////////////////

    await Payment.create({
      booking: booking._id,

      user: req.user._id,

      property: booking.property._id,

      amount: booking.totalPrice,

      reference,

      transactionId: reference,

      status: 'pending',

      paymentMethod: 'card',

      provider: 'paystack',
    });

    /////////////////////////////////////////////////////
    // PAYSTACK REQUEST
    /////////////////////////////////////////////////////

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',

      {
        email: req.user.email,

        amount: booking.totalPrice * 100,

        reference,

        callback_url: process.env.PAYSTACK_CALLBACK_URL,
      },

      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      },
    );

    res.status(200).json({
      authorization_url: response.data.data.authorization_url,

      reference,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// VERIFY PAYMENT
/////////////////////////////////////////////////////

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const payment = await Payment.findOne({
      reference,
    });

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found',
      });
    }

    /////////////////////////////////////////////////////
    // VERIFY PAYSTACK
    /////////////////////////////////////////////////////

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,

      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      },
    );

    const data = response.data.data;

    /////////////////////////////////////////////////////
    // PAYMENT SUCCESS
    /////////////////////////////////////////////////////

    if (data.status === 'success') {
      payment.status = 'successful';

      await payment.save();

      /////////////////////////////////////////////////////
      // UPDATE BOOKING
      /////////////////////////////////////////////////////

      const booking = await Booking.findByIdAndUpdate(
        payment.booking,

        {
          status: 'confirmed',

          paymentStatus: 'paid',
        },

        {
          new: true,
        },
      ).populate('property');

      /////////////////////////////////////////////////////
      // NOTIFICATION
      /////////////////////////////////////////////////////

      await sendNotification({
        user: payment.user,

        title: 'Payment Successful',

        message: 'Your booking payment was successful',

        type: 'payment',

        link: `/bookings/${booking._id}`,
      });

      /////////////////////////////////////////////////////
      // EMAIL USER
      /////////////////////////////////////////////////////

      await queueEmail({
        to: req.user.email,

        subject: 'Payment Successful',

        html: paymentSuccessTemplate({
          name: req.user.name,

          amount: payment.amount,

          propertyTitle: booking.property.title,
        }),
      });
    } else {
      payment.status = 'failed';

      await payment.save();
    }

    res.status(200).json({
      message: 'Payment verified',

      status: payment.status,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
