import cloudinary from '../../config/cloudinary.js';
import UserMedia from './userMedia.model.js';
import mongoose from 'mongoose';

export const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map((file) => ({
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      url: file.path,
      public_id: file.filename,
      format: file.mimetype,
      size: file.size,
    }));

    const savedMedia = await Promise.all(
      uploadedFiles.map((file) =>
        UserMedia.create({
          user: req.user._id,
          type: file.type,
          url: file.url,
          public_id: file.public_id,
          format: file.format,
          size: file.size,
        }),
      ),
    );

    res.status(200).json({
      message: 'Media uploaded successfully',
      count: savedMedia.length,
      media: savedMedia,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const listMyMedia = async (req, res) => {
  try {
    const media = await UserMedia.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ count: media.length, media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params; // MongoDB _id from URL

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid media ID' });
    }

    // Find the media record and check ownership
    const mediaRecord = await UserMedia.findOne({
      _id: id,
      user: req.user._id,
    });
    if (!mediaRecord) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to delete this media' });
    }

    const { public_id, type } = mediaRecord;
    const resourceType = type === 'video' ? 'video' : 'image';

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
      invalidate: true,
      resource_type: resourceType,
    });

    if (result.result !== 'ok') {
      return res.status(404).json({ message: 'Media not found on Cloudinary' });
    }

    // Remove database record
    await mediaRecord.deleteOne();

    res.json({ message: 'Media deleted successfully', id });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
};
