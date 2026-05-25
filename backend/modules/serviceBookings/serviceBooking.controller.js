import ServiceBooking from './serviceBooking.model.js';
import Service from '../services/service.model.js';

export const createServiceBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, notes } = req.body;
    const service = await Service.findById(serviceId);
    if (!service || service.isDeleted) return res.status(404).json({ message: 'Service not found' });
    const booking = await ServiceBooking.create({
      service: serviceId,
      client: req.user._id,
      provider: service.provider,
      scheduledDate,
      duration: service.duration,
      totalPrice: service.price,
      notes,
    });
    res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyServiceBookings = async (req, res) => {
  try {
    const bookings = await ServiceBooking.find({ client: req.user._id, isDeleted: false })
      .populate('service', 'title price')
      .populate('provider', 'firstName lastName email');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await ServiceBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.client.toString() !== req.user._id.toString() && booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    booking.status = req.body.status;
    await booking.save();
    res.status(200).json({ message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
