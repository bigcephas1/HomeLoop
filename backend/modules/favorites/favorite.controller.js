import Favorite from './favorite.model.js';
import Property from '../properties/property.model.js';

/////////////////////////////////////////////////////
// ADD TO FAVORITES
/////////////////////////////////////////////////////

export const addFavorite = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    /////////////////////////////////////////////////////
    // CHECK PROPERTY EXISTS
    /////////////////////////////////////////////////////

    const property = await Property.findById(propertyId);

    if (!property || property.isDeleted) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }

    /////////////////////////////////////////////////////
    // CHECK IF ALREADY FAVORITED
    /////////////////////////////////////////////////////

    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        message: 'Property already in favorites',
      });
    }

    /////////////////////////////////////////////////////
    // CREATE FAVORITE
    /////////////////////////////////////////////////////

    const favorite = await Favorite.create({
      user: req.user._id,
      property: propertyId,
    });

    /////////////////////////////////////////////////////
    // INCREMENT FAVORITE COUNT
    /////////////////////////////////////////////////////

    property.favoritesCount += 1;

    await property.save();

    res.status(201).json({
      message: 'Property added to favorites',
      favorite,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// GET MY FAVORITES
/////////////////////////////////////////////////////

export const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user._id,
    }).populate({
      path: 'property',
      populate: {
        path: 'landlord',
        select: 'name email phoneNumber',
      },
    });

    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// REMOVE FAVORITE
/////////////////////////////////////////////////////

export const removeFavorite = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const favorite = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (!favorite) {
      return res.status(404).json({
        message: 'Favorite not found',
      });
    }

    /////////////////////////////////////////////////////
    // DECREMENT FAVORITE COUNT
    /////////////////////////////////////////////////////

    const property = await Property.findById(propertyId);

    if (property && property.favoritesCount > 0) {
      property.favoritesCount -= 1;

      await property.save();
    }

    await favorite.deleteOne();

    res.status(200).json({
      message: 'Property removed from favorites',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
