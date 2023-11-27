import express from 'express';
import { uploadFile, downloadFile, deleteFile, listFiles, shareFile, revokeFileAccess} from '../controllers/fileController.js';
import passport from '../config/passport.js'; // Ensure this path is correct

const router = express.Router();

router.post('/upload', passport.authenticate('jwt', { session: false }), uploadFile);

router.get('/download/:filename', passport.authenticate('jwt', { session: false }), downloadFile);

router.delete('/delete/:filename', passport.authenticate('jwt', { session: false }), deleteFile);

router.get('/list', passport.authenticate('jwt', { session: false }), listFiles); 

router.post('/share/:filename', passport.authenticate('jwt', { session: false }), shareFile);

router.post('/revokeAccess/:filename', passport.authenticate('jwt', { session: false }), revokeFileAccess);


export default router;
