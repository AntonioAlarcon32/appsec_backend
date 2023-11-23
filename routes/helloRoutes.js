import express from 'express';
import { getHelloMessage } from '../controllers/helloController.js';
import passport from '../passport.js';

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), getHelloMessage);

export default router;
