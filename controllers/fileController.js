import multer from 'multer';
import File from '../models/fileModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';
import { encryptKey, decryptKey, encryptFile, decryptFile } from '../cipherUtils.js';

// Set up Multer for file upload
const upload = multer().single('file');

// fileController.js

export const uploadFile = (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Decrypt the user's encryption key using the stored iv and authTag
      const decryptedUserKey = decryptKey(req.user.encryptionKey, req.user.keyIv, req.user.authTag);

      // Encrypt the file data using the decrypted user's encryption key
      const { encryptedData, iv, authTag } = encryptFile(req.file.buffer, decryptedUserKey);

      const newFile = new File({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        data: encryptedData,
        iv,
        authTag,
        userShortId: req.user.shortId,
        accessList: [req.user.shortId]
      });

      try {
        await newFile.save();
        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
};

export const downloadFile = async (req, res) => {
  try {
      const file = await File.findOne({ filename: req.params.filename, accessList: req.user.shortId });
      if (!file) {
          return res.status(404).json({ error: 'File not found or access denied' });
      }

      // Check if the file has a shared key (indicating it's been shared)
      if (file.sharedKey && file.sharedKeyIv && file.sharedKeyAuthTag) {
          // Decrypt the shared key using the master key
          const decryptedSharedKey = decryptKey(file.sharedKey, file.sharedKeyIv, file.sharedKeyAuthTag);

          // Decrypt the file data using the decrypted shared key
          const decryptedData = decryptFile(file.data, decryptedSharedKey, file.iv, file.authTag);

          res.setHeader('Content-Type', file.contentType);
          res.setHeader('Content-Disposition', 'attachment; filename=' + file.filename);
          res.send(decryptedData);
      } else {
          // Fallback to original behavior if no shared key is found
          const decryptedUserKey = decryptKey(req.user.encryptionKey, req.user.keyIv, req.user.authTag);
          const decryptedData = decryptFile(file.data, decryptedUserKey, file.iv, file.authTag);

          res.setHeader('Content-Type', file.contentType);
          res.setHeader('Content-Disposition', 'attachment; filename=' + file.filename);
          res.send(decryptedData);
      }
  } catch (error) {
      console.error("Decryption error:", error); // Detailed error logging
      res.status(500).json({ error: error.message });
  }
};


  
export const deleteFile = async (req, res) => {
    try {
      const file = await File.findOne({ filename: req.params.filename, accessList: req.user.shortId });
      if (!file) {
        return res.status(404).json({ error: 'File not found or access denied' });
      }
  
      await File.deleteOne({ filename: req.params.filename });
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database operation error' });
    }
  };

  export const listFiles = async (req, res) => {
    try {
        const files = await File.find({ accessList: req.user.shortId });

        // Extract relevant file information for the response
        const fileList = files.map(file => {
            return {
                filename: file.filename,
                contentType: file.contentType,
                size: file.size,
                uploadDate: file.uploadDate
            };
        });

        // Send the list of files as a response
        res.json(fileList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const shareFile = async (req, res) => {
  try {
    // Find the file to be shared
    const file = await File.findOne({ filename: req.params.filename, accessList: req.user.shortId });
    if (!file) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    // Find the user to share the file with
    const userToShareWith = await User.findOne({ email: req.body.email });
    if (!userToShareWith) {
      return res.status(404).json({ error: 'User not found' });
    }

    let decryptedData;
    let sharedKey;

    // Check if the file has already been shared
    if (file.sharedKey && file.sharedKeyIv && file.sharedKeyAuthTag) {
      // Decrypt the shared key using the master key
      sharedKey = decryptKey(file.sharedKey, file.sharedKeyIv, file.sharedKeyAuthTag);
      decryptedData = decryptFile(file.data, sharedKey, file.iv, file.authTag);
    } else {
      // Decrypt the file data using the uploader's key
      const uploaderKey = decryptKey(req.user.encryptionKey, req.user.keyIv, req.user.authTag);
      decryptedData = decryptFile(file.data, uploaderKey, file.iv, file.authTag);

      // Generate a new shared key
      sharedKey = crypto.randomBytes(32).toString('hex');
    }

    // Re-encrypt the file with the shared key
    const { encryptedData, iv, authTag } = encryptFile(decryptedData, sharedKey);

    // Encrypt the shared key with the master key
    const encryptedSharedKey = encryptKey(sharedKey);

    // Update the file with new encryption and shared key
    file.data = encryptedData;
    file.iv = iv;
    file.authTag = authTag;
    file.sharedKey = encryptedSharedKey.encryptedData;
    file.sharedKeyIv = encryptedSharedKey.iv;
    file.sharedKeyAuthTag = encryptedSharedKey.authTag;

    // Add the user's shortId to the accessList of the file
    file.accessList.push(userToShareWith.shortId);

    await file.save();

    res.json({ message: 'File shared successfully' });
  } catch (error) {
    console.error("Error in file sharing:", error);
    res.status(500).json({ error: error.message });
  }
};

export const revokeFileAccess = async (req, res) => {
  try {
    // Find the file
    const file = await File.findOne({ filename: req.params.filename, accessList: req.user.shortId });
    if (!file) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    // Find the user whose access is to be revoked
    const userToRevoke = await User.findOne({ email: req.body.email });
    if (!userToRevoke) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user to revoke is not the file's original uploader
    if (userToRevoke.shortId !== file.userShortId) {
      // Remove the user's shortId from the accessList
      file.accessList = file.accessList.filter(shortId => shortId !== userToRevoke.shortId);
      await file.save();

      res.json({ message: 'Access revoked successfully' });
    } else {
      res.status(403).json({ error: 'Cannot revoke access from the file uploader' });
    }
  } catch (error) {
    console.error("Error in revoking file access:", error);
    res.status(500).json({ error: error.message });
  }
};





  
  
