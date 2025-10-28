import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
  .get(getCategories)
  .post(authorize('admin'), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(authorize('admin'), updateCategory)
  .delete(authorize('admin'), deleteCategory);

export default router;
