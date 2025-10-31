import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserSalesStats,
  getAllUsersSalesStats
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(protect);
router.use(adminOnly);

// Rutas de usuarios
router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/sales-stats/all')
  .get(getAllUsersSalesStats);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/sales-stats')
  .get(getUserSalesStats);

export default router;
