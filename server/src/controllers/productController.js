import Product from '../models/Product.js';

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;

    // Construir query
    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { detail: { $regex: search, $options: 'i' } }
      ];
    }

    // Construir sort
    let sort = {};
    if (sortBy === 'name') sort = { name: 1 };
    else if (sortBy === 'price') sort = { cashPrice: 1 };
    else if (sortBy === 'quantity') sort = { quantity: 1 };
    else sort = { createdAt: -1 };

    const products = await Product.find(query).sort(sort);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nuevo producto
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar producto (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      data: {},
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener productos con stock bajo
// @route   GET /api/products/low-stock
// @access  Private
export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = req.query.threshold || 5;

    const products = await Product.find({
      isActive: true,
      quantity: { $lt: parseInt(threshold) }
    }).sort({ quantity: 1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar precios lista de todos los productos
// @route   PUT /api/products/update-list-prices
// @access  Private/Admin
export const updateAllListPrices = async (req, res) => {
  try {
    const { priceMarkup } = req.body;

    if (typeof priceMarkup !== 'number' || priceMarkup < 0 || priceMarkup > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje de recargo debe ser un número entre 0 y 100'
      });
    }

    // Obtener todos los productos
    const products = await Product.find({});

    // Actualizar cada producto con el nuevo precio lista
    const updatePromises = products.map(async (product) => {
      const newListPrice = Math.round(product.cashPrice * (1 + priceMarkup / 100));
      product.listPrice = newListPrice;
      return product.save();
    });

    await Promise.all(updatePromises);

    // Obtener productos actualizados
    const updatedProducts = await Product.find({});

    res.json({
      success: true,
      message: `Se actualizaron los precios lista de ${products.length} productos`,
      count: updatedProducts.length,
      data: updatedProducts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
