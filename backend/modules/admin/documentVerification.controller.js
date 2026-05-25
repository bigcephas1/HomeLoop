import ProviderProfile from '../providerProfiles/providerProfile.model.js';
import Property from '../properties/property.model.js';
import Service from '../services/service.model.js';
import Notification from '../notifications/notification.model.js';

/**
 * Compare provider documents with property documents
 * Returns match score (0-100)
 */
export const compareDocuments = async (req, res) => {
  try {
    const { providerId, propertyId } = req.params;
    
    const provider = await ProviderProfile.findById(providerId);
    const property = await Property.findById(propertyId);
    
    if (!provider || !property) {
      return res.status(404).json({ message: 'Provider or property not found' });
    }
    
    let matchScore = 0;
    let matchDetails = [];
    
    // Compare name match
    const providerUser = await User.findById(provider.user);
    if (providerUser.firstName === property.landlord.firstName && 
        providerUser.lastName === property.landlord.lastName) {
      matchScore += 30;
      matchDetails.push('Name match confirmed');
    } else {
      matchDetails.push('Name mismatch - verification required');
    }
    
    // Compare address match
    if (providerUser.address === property.address) {
      matchScore += 25;
      matchDetails.push('Address match confirmed');
    }
    
    // Check if provider has documents
    if (provider.verificationDocuments.length > 0) {
      matchScore += 20;
      matchDetails.push('Provider has verified documents');
    }
    
    // Check if property has ownership documents
    if (property.ownershipDocuments.length > 0) {
      matchScore += 25;
      matchDetails.push('Property ownership documents provided');
    }
    
    // Update property with match score
    property.documentMatchScore = matchScore;
    property.documentVerificationStatus = matchScore >= 70 ? 'verified' : 'mismatch';
    await property.save();
    
    res.status(200).json({
      matchScore,
      matchDetails,
      status: property.documentVerificationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Verify service provider credibility
 */
export const verifyServiceCredibility = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await ProviderProfile.findById(providerId);
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Calculate credibility based on documents
    let credibilityNote = '';
    
    if (provider.verificationDocuments.length >= 2) {
      provider.credibilityScore += 20;
      credibilityNote = 'High credibility - multiple documents verified';
    } else if (provider.verificationDocuments.length === 1) {
      provider.credibilityScore += 10;
      credibilityNote = 'Medium credibility - basic documents provided';
    } else {
      credibilityNote = 'Low credibility - no documents provided. Consider adding documents to increase trust.';
    }
    
    await provider.save();
    
    // Send notification
    await Notification.create({
      user: provider.user,
      title: 'Credibility Score Updated',
      message: `Your credibility score is now ${provider.credibilityScore}. ${credibilityNote}`,
      type: 'system',
    });
    
    res.status(200).json({
      credibilityScore: provider.credibilityScore,
      message: credibilityNote,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
