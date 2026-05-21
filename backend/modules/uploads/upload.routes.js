import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.js';
import protect from '../../middleware/auth.middleware.js';
import { uploadMedia, deleteMedia, listMyMedia } from './upload.controller.js';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.mimetype.startsWith('image')) {
      return {
        folder: 'homeloop/properties/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        resource_type: 'image',
      };
    }
    if (file.mimetype.startsWith('video')) {
      return {
        folder: 'homeloop/properties/videos',
        resource_type: 'video',
      };
    }
    throw new Error('Unsupported file type');
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'), false);
    }
  },
});

router.post('/', protect, upload.array('media', 10), uploadMedia);
router.delete('/:id', protect, deleteMedia); // <-- delete by MongoDB _id
router.get('/', protect, listMyMedia);

export default router;
