const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'client'], default: 'client' }
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(plainText) {
  return bcrypt.compare(plainText, this.password);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
