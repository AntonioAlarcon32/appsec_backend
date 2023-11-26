import express from 'express';
import { login, refreshToken, googleLogin } from '../controllers/authController.js';
import passport from "../config/passport.js";

const router = express.Router();

router.post('/login', login);
router.post('/refreshToken', refreshToken);
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }) ,googleLogin);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

export default router;