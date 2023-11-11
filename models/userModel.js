import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto'
import { encryptUserKey } from '../cipherUtils.js';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  encryptionKey: String,
  keyIv: String
});

userSchema.pre('save', async function(next) {
  if (this.isNew) {
    const hexKey = crypto.randomBytes(32).toString('hex');
    const encryptedKey = encryptUserKey(hexKey);
    this.encryptionKey = encryptedKey.encryptedData;
    this.keyIv = encryptedKey.iv;
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.statics.createUserDTO = function(user) {
  return {
    username: user.username,
    email: user.email
    // Add other fields you want to include
  };
};

export default mongoose.model('User', userSchema);

