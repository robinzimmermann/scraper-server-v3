import { Router } from 'express';

import { v3Controllers } from '../../controllers/api.controllers';

const router = Router();

router.get('/', v3Controllers.rootHandler);

router.get('/searches', v3Controllers.getSearchesHandler);

router.put('/searches/upsert/:sid', v3Controllers.upsertSearchHandler);

// router.delete('/searches/searchTerm/:sid/:source/:index', v3Controllers.deleteSearchHandler);

router.get('/userPrefs', v3Controllers.getUserPrefsHandler);

router.use('/*', v3Controllers.deadHandler);

export { router };
