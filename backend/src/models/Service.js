const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    variant: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ['moto', 'bicicleta'], required: true, default: 'moto' },
    identifier: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    couponCode: { type: String, trim: true, default: '' },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    finalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pendiente', 'en_proceso', 'finalizado', 'entregado'],
      default: 'pendiente'
    },
    active: { type: Boolean, default: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Service', serviceSchema);
