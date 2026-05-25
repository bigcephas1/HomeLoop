import Booking from './booking.model.js';
import Property from '../properties/property.model.js';
import User from '../users/user.model.js';
import { createNotification, createBulkNotifications } from '../notifications/notification.controller.js';

/////////////////////////////////////////////////////
// CREATE BOOKING
/////////////////////////////////////////////////////

export const createBooking = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const { propertyId } = req.params;
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const booking = await Booking.create({
      property: propertyId,
      user: req.user._id,
      landlord: property.landlord,
      startDate,
      endDate,
      totalPrice: property.price * Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
      status: 'pending',
    });
    
    // Notify the user (client) that booking was created
    await createNotification(
      req.user._id,
      'Booking Request Sent',
      `Your booking request for ${property.title} has been sent to the landlord.`,
      'booking',
      '/dashboard/user/bookings'
    );
    
    // Notify the landlord about new booking request
    await createNotification(
      property.landlord,
      'New Booking Request',
      `${req.user.firstName} ${req.user.lastName} wants to book your property: ${property.title}.`,
      'booking',
      '/dashboard/landlord/bookings',
      { propertyId, bookingId: booking._id }
    );
    
    res.status(201).json({ message: 'Booking request sent', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// GET USER BOOKINGS
/////////////////////////////////////////////////////

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id, isDeleted: false })
      .populate('property', 'title address price media')
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// GET LANDLORD BOOKINGS
/////////////////////////////////////////////////////

export const getLandlordBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ landlord: req.user._id, isDeleted: false })
      .populate('property', 'title address price media')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// UPDATE BOOKING STATUS (Landlord only)
/////////////////////////////////////////////////////

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('property user');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only landlord can update status
    if (booking.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    booking.status = status;
    await booking.save();
    
    let title, message;
    if (status === 'confirmed') {
      title = 'Booking Confirmed';
      message = `Your booking for ${booking.property.title} has been confirmed by the landlord.`;
    } else if (status === 'cancelled') {
      title = 'Booking Cancelled';
      message = `Your booking for ${booking.property.title} has been cancelled by the landlord.`;
    } else if (status === 'completed') {
      title = 'Booking Completed';
      message = `Your stay at ${booking.property.title} has been marked as completed. Thank you!`;
    }
    
    // Notify the client about status change
    await createNotification(
      booking.user._id,
      title,
      message,
      'booking',
      '/dashboard/user/bookings',
      { bookingId: booking._id, status }
    );
    
    res.status(200).json({ message: `Booking ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// CANCEL BOOKING (Client only)
/////////////////////////////////////////////////////

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property user landlord');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only the client who made the booking can cancel
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Cannot cancel if already cancelled or completed
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    // Notify the client
    await createNotification(
      booking.user._id,
      'Booking Cancelled',
      `Your booking for ${booking.property.title} has been cancelled.`,
      'booking',
      '/dashboard/user/bookings',
      { bookingId: booking._id }
    );
    
    // Notify the landlord
    await createNotification(
      booking.landlord._id,
      'Booking Cancelled',
      `${booking.user.firstName} ${booking.user.lastName} has cancelled their booking for ${booking.property.title}.`,
      'booking',
      '/dashboard/landlord/bookings',
      { bookingId: booking._id }
    );
    
    res.status(200).json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
