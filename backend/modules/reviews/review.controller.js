import Review from './review.model.js';
import Property from '../properties/property.model.js';
import PropertyVisit from '../properties/propertyVisit.model.js';
import Favorite from '../favorites/favorite.model.js';

const canUserReview = async (userId, propertyId) => {
  const visited = await PropertyVisit.findOne({
    user: userId,
    property: propertyId,
  });

  const favorited = await Favorite.findOne({
    user: userId,
    property: propertyId,
  });

  return Boolean(visited || favorited);
};

export const createReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;

    const property = await Property.findById(propertyId);

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    /* 🚨 self-review protection */
    if (property.landlord.toString() === req.user._id.toString()) {
      return res.status(403).json({
        message: 'You cannot review your own property',
      });
    }

    /* 🚦 rate limit */
    const recentReview = await Review.findOne({
      user: req.user._id,
      property: propertyId,
      createdAt: {
        $gte: new Date(Date.now() - 10 * 60 * 1000),
      },
    });

    if (recentReview) {
      return res.status(429).json({
        message: 'You are reviewing too frequently',
      });
    }

    /* 🎯 eligibility check */
    const visited = await PropertyVisit.findOne({
      user: req.user._id,
      property: propertyId,
    });

    const favorited = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (!visited && !favorited) {
      return res.status(403).json({
        message: 'Interact with property before reviewing',
      });
    }

    const review = await Review.create({
      property: propertyId,
      user: req.user._id,
      rating,
      comment,
    });

    await updatePropertyRating(propertyId);

    res.status(201).json({
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.find({
      property: propertyId,
      isDeleted: false,
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review || review.isDeleted) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    await review.save();

    await updatePropertyRating(review.property);

    res.status(200).json({
      message: 'Review updated',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review || review.isDeleted) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.isDeleted = true;
    await review.save();

    await updatePropertyRating(review.property);

    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePropertyRating = async (propertyId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        property: propertyId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$property',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  await Property.findByIdAndUpdate(propertyId, {
    averageRating: stats[0]?.avgRating || 0,
    reviewsCount: stats[0]?.count || 0,
  });
};

export const adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isDeleted = true;
    await review.save();

    res.status(200).json({
      message: 'Review removed by admin',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const flagReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isFlagged = true;
    await review.save();

    res.status(200).json({
      message: 'Review flagged',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
