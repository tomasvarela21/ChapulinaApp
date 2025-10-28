import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

// @desc    Obtener todas las ventas
// @route   GET /api/sales
// @access  Private
export const getSales = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Construir query
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('product', 'name category')
      .populate('soldBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener una venta por ID
// @route   GET /api/sales/:id
// @access  Private
export const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('product', 'name category')
      .populate('soldBy', 'name email');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nueva venta
// @route   POST /api/sales
// @access  Private
export const createSale = async (req, res) => {
  try {
    const { product: productId, size, quantity } = req.body;

    // Verificar que el producto existe
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar stock disponible
    const sizeObj = product.sizes.find(s => s.size === size);
    if (!sizeObj || sizeObj.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente para esta talla'
      });
    }

    // Crear la venta
    const sale = await Sale.create({
      ...req.body,
      productName: product.name,
      soldBy: req.user._id
    });

    // Actualizar stock del producto
    const sizeIndex = product.sizes.findIndex(s => s.size === size);
    product.sizes[sizeIndex].quantity -= quantity;
    await product.save();

    res.status(201).json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar venta
// @route   PUT /api/sales/:id
// @access  Private
export const updateSale = async (req, res) => {
  try {
    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    // Si se cancela una venta, restaurar el stock
    if (req.body.status === 'cancelada' && sale.status !== 'cancelada') {
      const product = await Product.findById(sale.product);
      if (product) {
        const sizeIndex = product.sizes.findIndex(s => s.size === sale.size);
        if (sizeIndex !== -1) {
          product.sizes[sizeIndex].quantity += sale.quantity;
          await product.save();
        }
      }
    }

    sale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar venta
// @route   DELETE /api/sales/:id
// @access  Private/Admin
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    // Restaurar stock si la venta no estaba cancelada
    if (sale.status !== 'cancelada') {
      const product = await Product.findById(sale.product);
      if (product) {
        const sizeIndex = product.sizes.findIndex(s => s.size === sale.size);
        if (sizeIndex !== -1) {
          product.sizes[sizeIndex].quantity += sale.quantity;
          await product.save();
        }
      }
    }

    await sale.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Venta eliminada correctamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de ventas
// @route   GET /api/sales/stats
// @access  Private
export const getSalesStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = { status: 'vendida' };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || { totalSales: 0, totalOrders: 0, avgOrderValue: 0 }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
