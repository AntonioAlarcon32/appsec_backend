import express from 'express';
import { login, refreshToken, googleLogin, exchangeSingleUseToken, logout } from '../controllers/authController.js';
import passport from "../config/passport.js";

const router = express.Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }) ,googleLogin);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.post('/exchange-token', exchangeSingleUseToken);
router.post('/logout', logout);

export default router;