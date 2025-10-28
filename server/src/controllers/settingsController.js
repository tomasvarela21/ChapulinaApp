import Settings from '../models/Settings.js';

// @desc    Obtener configuración
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    // Siempre hay solo un documento de settings
    let settings = await Settings.findOne();

    // Si no existe, crear uno por defecto
    if (!settings) {
      settings = await Settings.create({
        priceMarkup: 30
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar configuración
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
