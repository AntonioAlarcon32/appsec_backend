import express from 'express';
import { uploadFile, downloadFile, deleteFile } from '../controllers/fileController.js';
import passport from '../config/passport.js'; // Ensure this path is correct

const router = express.Router();

// Route for file upload with authentication
router.post('/upload', passport.authenticate('jwt', { session: false }), uploadFile);

// Route for downloading a file by filename with authentication
router.get('/download/:filename', passport.authenticate('jwt', { session: false }), downloadFile);

// Route for deleting a file by filename with authentication
router.delete('/delete/:filename', passport.authenticate('jwt', { session: false }), deleteFile);

export default router;
