import express from 'express';
import { login, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/refreshToken', refreshToken);

export default router;