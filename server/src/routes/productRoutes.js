import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  updateAllListPrices,
  uploadProductImage
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rutas públicas con protección
router.use(protect);

router.get('/low-stock', getLowStockProducts);
router.put('/update-list-prices', authorize('admin'), updateAllListPrices);
router.post(
  '/upload-image',
  authorize('admin'),
  (req, res, next) => {
    upload.single('image')(req, res, function(err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Error al subir la imagen'
        });
      }
      next();
    });
  },
  uploadProductImage
);

router.route('/')
  .get(getProducts)
  .post(authorize('admin'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(authorize('admin'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

export default router;
