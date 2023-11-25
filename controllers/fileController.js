import multer from 'multer';
import File from '../models/fileModel.js';

// Set up Multer for file upload
const upload = multer().single('file');

export const uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Save file details and content in the database
    const newFile = new File({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer
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
      const file = await File.findOne({ filename: req.params.filename });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set Content-Type for the response
      res.setHeader('Content-Type', file.contentType);

      // Set Content-Disposition to suggest a filename
      res.setHeader('Content-Disposition', 'attachment; filename=' + file.filename);

      // Send the file data
      res.send(file.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

  
  export const deleteFile = async (req, res) => {
    try {
      const file = await File.findOne({ filename: req.params.filename });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      await File.deleteOne({ filename: req.params.filename });
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database operation error' });
    }
  };
  
  
