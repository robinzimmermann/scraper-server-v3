import { Router } from 'express';
import { v1Controllers } from '../../controllers/api.controllers';

const router = Router();

router.get('/*', v1Controllers.v1Handler);

export { router };
