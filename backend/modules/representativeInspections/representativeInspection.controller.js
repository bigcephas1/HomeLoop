import RepresentativeInspection from './representativeInspection.model.js';
import Property from '../properties/property.model.js';
import ProviderProfile from '../providerProfiles/providerProfile.model.js';

const isVerifiedRepresentative = async (userId) => {
  const profile = await ProviderProfile.findOne({ user: userId });
  return profile && profile.isVerified && profile.providerTypes.includes('representative');
};

// Client books a representative for a property
export const bookRepresentative = async (req, res) => {
  try {
    const { propertyId, scheduledDate, notes } = req.body;
    const property = await Property.findById(propertyId);
    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }
    // Find a verified representative (simple version – picks first available)
    const representativeProfile = await ProviderProfile.findOne({
      providerTypes: 'representative',
      isVerified: true,
      isActive: true,
    }).populate('user');
    if (!representativeProfile) {
      return res.status(404).json({ message: 'No available representative at this time' });
    }
    const inspection = await RepresentativeInspection.create({
      property: propertyId,
      client: req.user._id,
      representative: representativeProfile.user._id,
      scheduledDate,
      notes,
    });
    res.status(201).json({ message: 'Inspection requested', inspection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Client gets their inspections
export const getMyInspections = async (req, res) => {
  try {
    const inspections = await RepresentativeInspection.find({ client: req.user._id, isDeleted: false })
      .populate('property', 'title address city state')
      .populate('representative', 'firstName lastName email phoneNumber');
    res.status(200).json(inspections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Representative gets assigned inspections
export const getRepresentativeInspections = async (req, res) => {
  try {
    const isRep = await isVerifiedRepresentative(req.user._id);
    if (!isRep) {
      return res.status(403).json({ message: 'Only verified representatives can view these' });
    }
    const inspections = await RepresentativeInspection.find({ representative: req.user._id, isDeleted: false })
      .populate('property', 'title address city state')
      .populate('client', 'firstName lastName email phoneNumber');
    res.status(200).json(inspections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Representative updates inspection status
export const updateInspectionStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const inspection = await RepresentativeInspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    if (inspection.representative.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['confirmed', 'completed', 'cancelled', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    inspection.status = status;
    if (status === 'completed') {
      inspection.representativeFeedback = feedback || '';
    }
    await inspection.save();
    res.status(200).json({ message: 'Inspection updated', inspection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Client cancels an inspection
export const cancelInspection = async (req, res) => {
  try {
    const inspection = await RepresentativeInspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    if (inspection.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (inspection.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending inspections can be cancelled' });
    }
    inspection.status = 'cancelled';
    await inspection.save();
    res.status(200).json({ message: 'Inspection cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
