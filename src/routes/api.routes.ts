// console.log('loading src/routes/api.routes.ts');

import { Router } from 'express';

import { router as v1Router } from './v1/routes';
import { router as v2Router } from './v2/routes';
import { router as v3Router } from './v3/routes';
import { apiDeadHandler } from '../controllers/api.controllers';

const apiRouter = Router();

apiRouter.use('/v1', v1Router);
apiRouter.use('/v2', v2Router);
apiRouter.use('/v3', v3Router);

apiRouter.use('/', apiDeadHandler);

export { apiRouter };
