import { Router } from 'express';
import { integrationConfig } from '../controllers/integrationConfig';

const router = Router();

router.get('/integration-config', integrationConfig);

export default router;
