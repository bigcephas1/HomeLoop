import ProviderProfile from './providerProfile.model.js';
import { createNotification } from '../notifications/notification.controller.js';
import User from '../users/user.model.js';

export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      providerTypes,
      bio,
      yearsOfExperience,
      skills,
      phoneNumber,
    } = req.body;

    // Check if profile exists
    let profile = await ProviderProfile.findOne({ user: req.user._id });
    
    if (profile) {
      // Update existing - don't change verification status
      profile.providerTypes = providerTypes || profile.providerTypes;
      profile.bio = bio !== undefined ? bio : profile.bio;
      profile.yearsOfExperience = yearsOfExperience !== undefined ? yearsOfExperience : profile.yearsOfExperience;
      profile.skills = skills || profile.skills;
      profile.phoneNumber = phoneNumber !== undefined ? phoneNumber : profile.phoneNumber;
      
      await profile.save();
      return res.status(200).json({ 
        success: true, 
        message: 'Profile updated successfully', 
        profile,
        note: profile.verificationStatus === 'pending' ? 'Your profile is pending admin approval' : null
      });
    }
    
    // Create new profile - set to pending, NOT approved
    profile = new ProviderProfile({
      user: req.user._id,
      providerTypes: providerTypes || [],
      bio: bio || '',
      yearsOfExperience: yearsOfExperience || 0,
      skills: skills || [],
      phoneNumber: phoneNumber || '',
      verificationStatus: 'pending', // ✅ Set to pending, not approved
      isVerified: false,              // ✅ Explicitly false until admin approves
      credibilityScore: 0,
    });
    
    await profile.save();
    
    // Send notification to the user that profile is pending approval
    const roleName = providerTypes.join(', ');
    await createNotification(
      req.user._id,
      'Profile Created - Pending Approval',
      `Your ${roleName} profile has been created and is pending admin approval. You will be notified once verified.`,
      'moderation',
      '/dashboard/landlord/credibility'
    );
    
    // Notify all admins about new profile registration
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'New Provider Registration',
        `${req.user.firstName} ${req.user.lastName} has registered as a ${roleName} and is pending approval.`,
        'system',
        '/admin/providers'
      );
    }
    
    console.log(`New provider profile created for user ${req.user._id} - pending approval`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Profile created successfully! Please wait for admin verification.', 
      profile,
      requiresVerification: true
    });
    
  } catch (error) {
    console.error('Create Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email role');
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found',
        userRole: req.user.role 
      });
    }
    
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitForVerification = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    if (!profile.verificationDocuments || profile.verificationDocuments.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload verification documents first' 
      });
    }
    
    if (profile.verificationStatus === 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Your profile is already pending verification' 
      });
    }
    
    if (profile.verificationStatus === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Your profile is already verified' 
      });
    }
    
    profile.verificationStatus = 'pending';
    await profile.save();
    
    // Notify user that documents are submitted
    await createNotification(
      req.user._id,
      'Documents Submitted',
      'Your verification documents have been submitted for review. You will be notified once approved.',
      'moderation',
      '/dashboard/landlord/credibility'
    );
    
    // Notify all admins about document submission
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'Documents Ready for Review',
        `${req.user.firstName} ${req.user.lastName} has uploaded verification documents and is ready for review.`,
        'system',
        '/admin/providers'
      );
    }
    
    console.log(`Profile ${profile._id} submitted for verification by user ${req.user._id}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Submitted for verification. Admin will review your documents.', 
      profile 
    });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
