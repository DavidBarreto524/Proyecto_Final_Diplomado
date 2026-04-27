const User = require('../models/User');
const bcrypt = require('bcryptjs');

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

async function createUser(req, res) {
  try {
    const payload = { ...req.body };
    if (payload.email) {
      payload.email = String(payload.email).toLowerCase().trim();
    }
    if (payload.phone) {
      payload.phone = normalizePhone(payload.phone);
    }
    if (!payload.phone || payload.phone.length < 10) {
      return res.status(400).json({ message: 'Celular inválido' });
    }
    const created = await User.create(payload);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getUsers(_req, res) {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
}

async function getUserById(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  return res.json(user);
}

async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const payload = { ...req.body };
    if (payload.email) {
      payload.email = String(payload.email).toLowerCase().trim();
    }
    if (payload.phone) {
      payload.phone = normalizePhone(payload.phone);
      if (payload.phone.length < 10) {
        return res.status(400).json({ message: 'Celular inválido' });
      }
    }
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    Object.assign(user, payload);
    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteUser(req, res) {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  return res.json({ message: 'Usuario eliminado' });
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
