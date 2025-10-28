import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: [true, 'El nombre del cliente es requerido'],
    trim: true
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
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: 0
  },
  status: {
    type: String,
    enum: ['vendida', 'reservada', 'cancelada'],
    default: 'vendida'
  },
  paymentMethod: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia'],
    default: 'efectivo'
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
