const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI no configurada');
  }
  await mongoose.connect(mongoUri);
}

module.exports = { connectDB };
