import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto'
import { encryptUserKey } from '../cipherUtils.js';

const userSchema = new mongoose.Schema({
  shortId: {
    type: String,
    unique: true,
    default: () => generateShortId(10) // 10-character long ID
  },
  username: String,
  email: String,
  password: String,
  encryptionKey: String,
  keyIv: String,
  authTag: String
});


userSchema.pre('save', async function(next) {
  if (this.isNew) {
    const hexKey = crypto.randomBytes(32).toString('hex');
    const encryptedKey = encryptUserKey(hexKey);
    this.encryptionKey = encryptedKey.encryptedData;
    this.keyIv = encryptedKey.iv;
    this.authTag = encryptedKey.authTag;
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.statics.generateShortId = function (length) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

userSchema.statics.createUserDTO = function(user) {
  return {
    shortId: user.shortId,
    username: user.username,
    email: user.email
  };
};

export default mongoose.model('User', userSchema);

