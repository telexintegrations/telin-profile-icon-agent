import { Router } from 'express';
import { targetUrlController } from '../controllers/targetUrlController';

const router = Router();

router.post('/target-url', targetUrlController);

export default router;