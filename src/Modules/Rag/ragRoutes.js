import { Router } from 'express';
import { RagController } from './ragController.js';

const router = Router();
const ragController = new RagController();

router.post('/ask', ragController.ask);

export const ragRoutes = router;
