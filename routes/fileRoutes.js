import express from 'express';
import { uploadFile, downloadFile, deleteFile, listFiles} from '../controllers/fileController.js';
import passport from '../config/passport.js'; // Ensure this path is correct

const router = express.Router();

router.post('/upload', passport.authenticate('jwt', { session: false }), uploadFile);

router.get('/download/:filename', passport.authenticate('jwt', { session: false }), downloadFile);

router.delete('/delete/:filename', passport.authenticate('jwt', { session: false }), deleteFile);

router.get('/list', passport.authenticate('jwt', { session: false }), listFiles); 

export default router;
