import express from 'express';
import { getHelloMessage } from '../controllers/helloController.js';
import passport from '../config/passport.js';

const router = express.Router();

router.get('/hello', passport.authenticate('jwt', { session: false }), getHelloMessage);

export default router;
