import { Router } from 'express';

import { v3Controllers } from '../../controllers/api.controllers';

const router = Router();

router.get('/', v3Controllers.rootHandler);

router.get('/searches', v3Controllers.getSearchesHandler);

router.put('/searches/:sid', v3Controllers.upsertSearchHandler);

router.delete('/searches/:sid', v3Controllers.deleteSearchHandler);

router.get('/posts', v3Controllers.getPostsHandler);

router.get('/userPrefs', v3Controllers.getUserPrefsHandler);

router.put('/userPrefs', v3Controllers.upsertUserPrefsHandler);

router.use('/*', v3Controllers.deadHandler);

export { router };
