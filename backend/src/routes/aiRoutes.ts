import { Router } from 'express';
import { askAiAssistant } from '../controllers/aiController';

const router = Router();

router.post('/chat', askAiAssistant);

export default router;
