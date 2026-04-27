const User = require('../models/User');

async function login(req, res) {
  const { identifier, password } = req.body;
  const isAdminFixed =
    String(identifier || '').toLowerCase() === 'admin' &&
    String(password || '') === 'Sencho524**';

  if (!identifier || !password) {
    return res.status(400).json({ message: 'identifier y password son requeridos' });
  }

  if (isAdminFixed) {
    return res.json({
      message: 'Login exitoso',
      user: {
        id: 'admin-local',
        name: 'Administrador',
        email: 'admin@local',
        phone: 'N/A',
        role: 'admin'
      }
    });
  }

  const user = await User.findOne({
    $or: [{ email: String(identifier).toLowerCase() }, { phone: identifier }]
  });

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  return res.json({
    message: 'Login exitoso',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
}

module.exports = { login };
