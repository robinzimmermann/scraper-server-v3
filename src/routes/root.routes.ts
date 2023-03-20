// console.log('loading src/routes/api.routes.ts');

import { Router } from 'express';

import { rootDeadHandler } from '../controllers/root.controllers';

const rootRouter = Router();

rootRouter.use('/', rootDeadHandler);

export { rootRouter };
