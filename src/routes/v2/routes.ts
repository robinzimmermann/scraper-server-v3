import { Router } from 'express';
import { v2Controllers } from '../../controllers/api.controllers';

const router = Router();

router.get('/*', v2Controllers.v2Handler);

export { router };
