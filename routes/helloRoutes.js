import express from 'express';
import { getHelloMessage } from '../controllers/helloController.js';

const router = express.Router();

router.get('/', getHelloMessage);

export default router;
