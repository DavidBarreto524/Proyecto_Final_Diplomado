require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API activa' });
});

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Error conectando MongoDB:', error.message);
    process.exit(1);
  });
