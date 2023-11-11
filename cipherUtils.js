import crypto from 'crypto';

function encryptUserKey(userKey) {
  const masterKey = process.env.MASTER_KEY
  const masterKeyBuffer = Buffer.from(masterKey,'hex')
  const iv = crypto.randomBytes(16); // Initialization vector for AES
  const cipher = crypto.createCipheriv('aes-256-cbc', masterKeyBuffer, iv);
  let encrypted = cipher.update(userKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

export {encryptUserKey}