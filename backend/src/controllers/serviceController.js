const Service = require('../models/Service');

const OFFICIAL_CATALOG = {
  basico: { 'bajo c.c.': 18000, 'alto c.c.': 25000 },
  medio: { 'bajo c.c.': 23000, 'alto c.c.': 30000 },
  completo: { 'bajo c.c.': 28000, 'alto c.c.': 35000 },
  deluxe: { 'bajo c.c.': 60000, 'alto c.c.': 70000 },
  ciclas: { bicicletas: 10000 }
};

function normText(value) {
  return String(value || '').trim().toLowerCase();
}

function applyCoupon(basePrice, couponCode) {
  if (normText(couponCode) === 'desc50') {
    return { discountPercent: 50, finalPrice: Math.round(Number(basePrice) * 0.5) };
  }
  return { discountPercent: 0, finalPrice: Number(basePrice) };
}

function validateBusinessRules(payload) {
  const nameKey = normText(payload.name);
  const variantKey = normText(payload.variant);
  const catalogByName = OFFICIAL_CATALOG[nameKey];
  if (!catalogByName) {
    throw new Error('Servicio no permitido por catálogo');
  }
  if (!catalogByName[variantKey]) {
    throw new Error('Variante no válida para el servicio');
  }
  const officialPrice = catalogByName[variantKey];
  if (Number(payload.price) !== officialPrice) {
    throw new Error(`Precio inválido. Precio oficial para ${payload.name} ${payload.variant}: ${officialPrice}`);
  }

  if (nameKey === 'ciclas') {
    if (payload.vehicleType !== 'bicicleta') {
      throw new Error('Para Ciclas el tipo de vehículo debe ser bicicleta');
    }
  } else if (payload.vehicleType !== 'moto') {
    throw new Error('Para servicios de moto, vehicleType debe ser moto');
  }

  if (!payload.identifier || String(payload.identifier).trim().length < 3) {
    throw new Error('Debes enviar placa o documento de referencia válido');
  }
}

function buildPayload(raw) {
  const payload = { ...raw };
  payload.name = String(payload.name || '').trim();
  payload.variant = String(payload.variant || '').trim();
  payload.description = String(payload.description || '').trim();
  payload.identifier = String(payload.identifier || '').trim();
  payload.couponCode = String(payload.couponCode || '').trim();
  payload.price = Number(payload.price);
  payload.vehicleType = payload.vehicleType || 'moto';
  payload.status = payload.status || 'pendiente';
  validateBusinessRules(payload);
  const pricing = applyCoupon(payload.price, payload.couponCode);
  payload.discountPercent = pricing.discountPercent;
  payload.finalPrice = pricing.finalPrice;
  return payload;
}

async function createService(req, res) {
  try {
    const created = await Service.create(buildPayload(req.body));
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getServices(_req, res) {
  const items = await Service.find().sort({ createdAt: -1 });
  res.json(items);
}

async function getServiceById(req, res) {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Servicio no encontrado' });
  }
  return res.json(service);
}

async function updateService(req, res) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    const merged = buildPayload({ ...service.toObject(), ...req.body });
    Object.assign(service, merged);
    await service.save();
    return res.json(service);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteService(req, res) {
  const deleted = await Service.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Servicio no encontrado' });
  }
  return res.json({ message: 'Servicio eliminado' });
}

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
};
