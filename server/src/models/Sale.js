import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El producto es requerido']
  },
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: false
  },
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  priceType: {
    type: String,
    enum: ['contado', 'lista'],
    default: 'contado'
  },
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: 0
  },
  status: {
    type: String,
    enum: ['vendida', 'reservada', 'retirada', 'cancelada'],
    default: 'vendida'
  },
  paymentMethod: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'none'],
    default: 'none'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Índices para mejorar búsquedas
saleSchema.index({ createdAt: -1 });
saleSchema.index({ status: 1 });
saleSchema.index({ product: 1 });

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
