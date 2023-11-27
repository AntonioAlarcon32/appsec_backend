import crypto from 'crypto';

function encryptKey(Key) {
  const masterKey = process.env.MASTER_KEY;
  const masterKeyBuffer = Buffer.from(masterKey, 'hex');
  const iv = crypto.randomBytes(16); // Initialization vector for AES

  const cipher = crypto.createCipheriv('aes-256-gcm', masterKeyBuffer, iv);
  let encrypted = cipher.update(Key);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex') // Get the authentication tag
  };
}

function decryptKey(encryptedData, iv, authTag) { 
  const masterKey = process.env.MASTER_KEY;
  const masterKeyBuffer = Buffer.from(masterKey, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedBuffer = Buffer.from(encryptedData, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKeyBuffer, ivBuffer);
  decipher.setAuthTag(authTagBuffer);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

function encryptFile(buffer, decryptedKey) {
  const iv = crypto.randomBytes(16); // Initialization vector for AES
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(decryptedKey, 'hex'), iv);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: cipher.getAuthTag().toString('hex') // authTag is generated here
  };
}

function decryptFile(encryptedData, decryptedKey, iv, authTag) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(decryptedKey, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

export { encryptKey, decryptKey, encryptFile, decryptFile };


