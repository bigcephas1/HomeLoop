import Service from './service.model.js';
import ProviderProfile from '../providerProfiles/providerProfile.model.js';

const isVerifiedServiceProvider = async (userId) => {
  const profile = await ProviderProfile.findOne({ user: userId });
  return profile && profile.isVerified && profile.providerTypes.includes('service_provider');
};


export const createService = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({
      user: req.user._id,
    });

    if (!providerProfile) {
      return res.status(403).json({
        message: 'You must create a service provider profile first',
        action: 'create_profile',
      });
    }

    if (!providerProfile.isVerified || providerProfile.verificationStatus !== 'approved') {
      return res.status(403).json({
        message: 'Your service provider profile must be verified by admin before listing services',
        status: providerProfile.verificationStatus,
        action: 'wait_verification',
      });
    }

    // Create service - no moderation needed but credibility score affects visibility
    const service = await Service.create({
      ...req.body,
      provider: req.user._id,
      isPublished: true,
      hasCertification: providerProfile.verificationDocuments.length > 0,
      credibilityBoost: providerProfile.credibilityScore >= 70,
    });

    // Update provider's total jobs
    providerProfile.totalJobsCompleted += 1;
    await providerProfile.save();

    res.status(201).json({
      message: 'Service created successfully',
      service,
      credibilityScore: providerProfile.credibilityScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;
    const filter = { isDeleted: false, isPublished: true };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };
    const skip = (Number(page) - 1) * Number(limit);
    const services = await Service.find(filter)
      .populate('provider', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Service.countDocuments(filter);
    res.status(200).json({ total, page: Number(page), pages: Math.ceil(total / limit), count: services.length, services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'firstName lastName email avatar phoneNumber');
    if (!service || service.isDeleted) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service || service.isDeleted) return res.status(404).json({ message: 'Service not found' });
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(service, req.body);
    await service.save();
    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service || service.isDeleted) return res.status(404).json({ message: 'Service not found' });
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    service.isDeleted = true;
    await service.save();
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
