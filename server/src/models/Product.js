import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  detail: {
    type: String,
    trim: true,
    default: ''
  },
  sizes: {
    type: [sizeSchema],
    default: []
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  costPrice: {
    type: Number,
    required: [true, 'El precio de costo es requerido'],
    min: 0
  },
  cashPrice: {
    type: Number,
    required: [true, 'El precio de contado es requerido'],
    min: 0
  },
  listPrice: {
    type: Number,
    required: [true, 'El precio de lista es requerido'],
    min: 0
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/100'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calcular cantidad total automáticamente antes de guardar
productSchema.pre('save', function(next) {
  if (this.sizes && this.sizes.length > 0) {
    this.quantity = this.sizes.reduce((sum, sizeObj) => sum + sizeObj.quantity, 0);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
