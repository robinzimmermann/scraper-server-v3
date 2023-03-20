import { Router } from 'express';

import { v3Controllers } from '../../controllers/api.controllers';

const router = Router();

router.get('/', v3Controllers.rootHandler);

router.get('/isAlive', v3Controllers.isAliveHandler);

router.get('/example', v3Controllers.exampleHandler);

router.use('/*', v3Controllers.deadHandler);

export { router };
