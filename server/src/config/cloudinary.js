import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Asegurar que las variables de entorno estén cargadas incluso si este módulo
// se importa antes que server.js
dotenv.config();

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️ Cloudinary environment variables are missing. Image uploads will fail until CLOUDINARY_* are set.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

export default cloudinary;
