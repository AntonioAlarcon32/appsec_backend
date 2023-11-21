import crypto from 'crypto';

function encryptUserKey(userKey) {
  const masterKey = process.env.MASTER_KEY;
  const masterKeyBuffer = Buffer.from(masterKey, 'hex');
  const iv = crypto.randomBytes(16); // Initialization vector for AES

  const cipher = crypto.createCipheriv('aes-256-gcm', masterKeyBuffer, iv);
  let encrypted = cipher.update(userKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex') // Get the authentication tag
  };
}

function decryptUserKey(encryptedData, iv, authTag) {
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


export {encryptUserKey, decryptUserKey}