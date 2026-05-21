// middleware/upload.middleware.js

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');

    return {
      folder: 'homeloop-media',

      resource_type: isVideo ? 'video' : 'image',

      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi']
        : ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },

  fileFilter: (req, file, cb) => {
    const allowed =
      file.mimetype.startsWith('image') || file.mimetype.startsWith('video');

    if (!allowed) {
      return cb(new Error('Only images and videos allowed'));
    }

    cb(null, true);
  },
});

export default upload;
