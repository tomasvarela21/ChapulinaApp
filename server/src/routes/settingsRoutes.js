import express from 'express';
import {
  getSettings,
  updateSettings
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
  .get(getSettings)
  .put(authorize('admin'), updateSettings);

export default router;
