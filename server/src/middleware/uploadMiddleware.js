import multer from 'multer';
import path from 'path';

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(extension) && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no permitido. Usa PNG o JPG.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export default upload;
