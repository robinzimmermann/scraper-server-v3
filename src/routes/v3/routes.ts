import { Router } from 'express';

import { v3Controllers } from '../../controllers/api.controllers';

const router = Router();

router.get('/', v3Controllers.rootHandler);

router.get('/isAlive', v3Controllers.isAliveHandler);

router.get('/searches', v3Controllers.getSearchesHandler);

router.put('/searches/upsert/:sid', v3Controllers.upsertSearchHandler);

router.get('/userPrefs', v3Controllers.getUserPrefsHandler);

router.get('/startScan', v3Controllers.startScanHandler);

router.get('/example', v3Controllers.exampleHandler);

router.use('/*', v3Controllers.deadHandler);

export { router };
