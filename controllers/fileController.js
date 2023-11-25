import multer from 'multer';
import File from '../models/fileModel.js';
import { decryptUserKey, encryptFile, decryptFile } from '../cipherUtils.js';

// Set up Multer for file upload
const upload = multer().single('file');

// fileController.js

export const uploadFile = (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Decrypt the user's encryption key using the stored iv and authTag
      const decryptedUserKey = decryptUserKey(req.user.encryptionKey, req.user.keyIv, req.user.authTag);

      // Encrypt the file data using the decrypted user's encryption key
      const { encryptedData, iv, authTag } = encryptFile(req.file.buffer, decryptedUserKey);

      const newFile = new File({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        data: encryptedData,
        iv,
        authTag,
        userShortId: req.user.shortId
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
      const file = await File.findOne({ filename: req.params.filename, userShortId: req.user.shortId });
      if (!file) {
        return res.status(404).json({ error: 'File not found or access denied' });
      }

      // Decrypt the user's encryption key
      const decryptedUserKey = decryptUserKey(req.user.encryptionKey, req.user.keyIv, req.user.authTag);

      // Decrypt the file data using the stored iv and authTag
      const decryptedData = decryptFile(file.data, decryptedUserKey, file.iv, file.authTag);

      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Content-Disposition', 'attachment; filename=' + file.filename);

      res.send(decryptedData);
    } catch (error) {
        console.error("Decryption error:", error); // Detailed error logging
        res.status(500).json({ error: error.message });
      }
};

  
export const deleteFile = async (req, res) => {
    try {
      const file = await File.findOne({ filename: req.params.filename, userShortId: req.user.shortId });
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
        const files = await File.find({ userShortId: req.user.shortId });

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

  
  
