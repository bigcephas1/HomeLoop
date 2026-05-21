import Booking from './booking.model.js';
import Property from '../properties/property.model.js';
import Payment from '../payments/payment.model.js';

import sendNotification from '../../services/notification.service.js';

import { queueEmail } from '../../services/emailQueue.service.js';

import bookingConfirmationTemplate from '../../templates/bookingConfirmationTemplate.js';

import refundProcessedTemplate from '../../templates/refundProcessedTemplate.js';

/////////////////////////////////////////////////////
// CREATE BOOKING
/////////////////////////////////////////////////////

export const createBooking = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const { startDate, endDate } = req.body;

    const property = await Property.findById(propertyId).populate(
      'landlord',
      'name email',
    );

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    /////////////////////////////////////////////////////
    // PREVENT LANDLORD BOOKING OWN PROPERTY
    /////////////////////////////////////////////////////

    if (property.landlord._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        message: 'You cannot book your own property',
      });
    }

    /////////////////////////////////////////////////////
    // VALIDATE DATES
    /////////////////////////////////////////////////////

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: 'Invalid booking dates',
      });
    }

    /////////////////////////////////////////////////////
    // CHECK OVERLAPPING BOOKINGS
    /////////////////////////////////////////////////////

    const overlapping = await Booking.findOne({
      property: propertyId,

      status: {
        $in: ['pending', 'confirmed'],
      },

      startDate: {
        $lte: new Date(endDate),
      },

      endDate: {
        $gte: new Date(startDate),
      },
    });

    if (overlapping) {
      return res.status(409).json({
        message: 'Property is already booked for selected dates',
      });
    }

    /////////////////////////////////////////////////////
    // CALCULATE PRICE
    /////////////////////////////////////////////////////

    const days =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

    const totalPrice = days * property.price;

    /////////////////////////////////////////////////////
    // CREATE BOOKING
    /////////////////////////////////////////////////////

    const booking = await Booking.create({
      property: propertyId,
      user: req.user._id,
      landlord: property.landlord._id,
      startDate,
      endDate,
      totalPrice,
    });

    /////////////////////////////////////////////////////
    // NOTIFY LANDLORD
    /////////////////////////////////////////////////////

    await sendNotification({
      user: property.landlord._id,

      title: 'New Booking Request',

      message: 'A user has requested to book your property',

      type: 'booking',

      link: `/bookings/${booking._id}`,
    });

    /////////////////////////////////////////////////////
    // NOTIFY USER
    /////////////////////////////////////////////////////

    await sendNotification({
      user: req.user._id,

      title: 'Booking Created',

      message: 'Your booking request was submitted successfully',

      type: 'booking',

      link: `/bookings/${booking._id}`,
    });

    /////////////////////////////////////////////////////
    // EMAIL USER
    /////////////////////////////////////////////////////

    await queueEmail({
      to: req.user.email,

      subject: 'Booking Created',

      html: bookingConfirmationTemplate({
        name: req.user.name,
        propertyTitle: property.title,
        startDate,
        endDate,
      }),
    });

    res.status(201).json({
      message: 'Booking created successfully',

      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// GET USER BOOKINGS
/////////////////////////////////////////////////////

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate('property', 'title address price')
      .sort({
        createdAt: -1,
      });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// GET LANDLORD BOOKINGS
/////////////////////////////////////////////////////

export const getLandlordBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      landlord: req.user._id,
    })
      .populate('property')
      .populate('user', 'name email')
      .sort({
        createdAt: -1,
      });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// UPDATE BOOKING STATUS
/////////////////////////////////////////////////////

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id).populate(
      'user',
      'name email',
    );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    /////////////////////////////////////////////////////
    // ONLY LANDLORD
    /////////////////////////////////////////////////////

    if (booking.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    booking.status = status;

    await booking.save();

    /////////////////////////////////////////////////////
    // NOTIFY USER
    /////////////////////////////////////////////////////

    await sendNotification({
      user: booking.user._id,

      title: 'Booking Updated',

      message: `Your booking status was updated to ${status}`,

      type: 'booking',

      link: `/bookings/${booking._id}`,
    });

    res.status(200).json({
      message: 'Booking updated',

      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// CANCEL BOOKING
/////////////////////////////////////////////////////

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('property', 'title');

    if (!booking || booking.isDeleted) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    /////////////////////////////////////////////////////
    // ONLY OWNER CAN CANCEL
    /////////////////////////////////////////////////////

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    /////////////////////////////////////////////////////
    // ALREADY CANCELLED
    /////////////////////////////////////////////////////

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        message: 'Booking already cancelled',
      });
    }

    /////////////////////////////////////////////////////
    // PREVENT CANCELLING PAST BOOKINGS
    /////////////////////////////////////////////////////

    if (new Date() >= new Date(booking.startDate)) {
      return res.status(400).json({
        message: 'Cannot cancel an ongoing or past booking',
      });
    }

    /////////////////////////////////////////////////////
    // CANCEL BOOKING
    /////////////////////////////////////////////////////

    booking.status = 'cancelled';

    booking.cancelledAt = new Date();

    /////////////////////////////////////////////////////
    // HANDLE REFUND
    /////////////////////////////////////////////////////

    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';

      await Payment.create({
        user: booking.user._id,

        property: booking.property._id,

        booking: booking._id,

        amount: booking.totalPrice,

        status: 'refunded',

        reference: `refund_${Date.now()}`,

        transactionId: `refund_${Date.now()}`,

        paymentMethod: 'card',

        provider: 'paystack',
      });

      /////////////////////////////////////////////////////
      // NOTIFY USER REFUND
      /////////////////////////////////////////////////////

      await sendNotification({
        user: booking.user._id,

        title: 'Refund Processed',

        message: 'Your booking payment has been refunded',

        type: 'payment',

        link: `/bookings/${booking._id}`,
      });

      /////////////////////////////////////////////////////
      // EMAIL USER REFUND
      /////////////////////////////////////////////////////

      await queueEmail({
        to: booking.user.email,

        subject: 'Refund Processed',

        html: refundProcessedTemplate({
          name: booking.user.name,
          amount: booking.totalPrice,
        }),
      });
    }

    await booking.save();

    /////////////////////////////////////////////////////
    // NOTIFY LANDLORD
    /////////////////////////////////////////////////////

    await sendNotification({
      user: booking.landlord,

      title: 'Booking Cancelled',

      message: 'A user cancelled their booking',

      type: 'booking',

      link: `/bookings/${booking._id}`,
    });

    /////////////////////////////////////////////////////
    // NOTIFY USER
    /////////////////////////////////////////////////////

    await sendNotification({
      user: booking.user._id,

      title: 'Booking Cancelled',

      message: 'Your booking was cancelled successfully',

      type: 'booking',

      link: `/bookings/${booking._id}`,
    });

    res.status(200).json({
      message: 'Booking cancelled successfully',

      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
