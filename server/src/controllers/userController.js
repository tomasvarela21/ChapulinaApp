import User from '../models/User.js';
import Sale from '../models/Sale.js';

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nuevo usuario (vendedor)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'vendedor'
    });

    // Retornar usuario sin password
    const userWithoutPassword = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, password } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;
    if (password) user.password = password; // Se encripta automáticamente con el pre-save hook

    await user.save();

    // Retornar usuario sin password
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que no sea el último admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el último administrador'
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de ventas por usuario
// @route   GET /api/users/:id/sales-stats
// @access  Private/Admin
export const getUserSalesStats = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verificar que el usuario existe
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener todas las ventas del usuario (solo vendidas, no reservas)
    const sales = await Sale.find({
      soldBy: userId,
      status: 'vendida'
    });

    // Calcular estadísticas
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

    // Ventas por método de pago
    const salesByPaymentMethod = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0
    };

    sales.forEach(sale => {
      if (salesByPaymentMethod.hasOwnProperty(sale.paymentMethod)) {
        salesByPaymentMethod[sale.paymentMethod] += sale.amount;
      }
    });

    // Ventas del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlySales = sales.filter(sale => new Date(sale.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.amount, 0);

    // Ventas del día actual
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dailySales = sales.filter(sale => new Date(sale.createdAt) >= startOfDay);
    const dailyRevenue = dailySales.reduce((sum, sale) => sum + sale.amount, 0);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        stats: {
          totalSales,
          totalRevenue,
          salesByPaymentMethod,
          monthly: {
            sales: monthlySales.length,
            revenue: monthlyRevenue
          },
          daily: {
            sales: dailySales.length,
            revenue: dailyRevenue
          }
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de todos los vendedores
// @route   GET /api/users/sales-stats/all
// @access  Private/Admin
export const getAllUsersSalesStats = async (req, res) => {
  try {
    const users = await User.find({ role: 'vendedor' }).select('-password');

    const statsPromises = users.map(async (user) => {
      const sales = await Sale.find({
        soldBy: user._id,
        status: 'vendida'
      });

      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

      // Ventas del mes actual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySales = sales.filter(sale => new Date(sale.createdAt) >= startOfMonth);
      const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.amount, 0);

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        totalSales,
        totalRevenue,
        monthlySales: monthlySales.length,
        monthlyRevenue
      };
    });

    const stats = await Promise.all(statsPromises);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
