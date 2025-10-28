import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  priceMarkup: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 30
  },
  businessName: {
    type: String,
    default: 'Chapulina'
  },
  businessPhone: {
    type: String,
    default: ''
  },
  businessEmail: {
    type: String,
    default: ''
  },
  businessAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
