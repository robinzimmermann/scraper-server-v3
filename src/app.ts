import express from 'express';

import { configureExpressApp } from './config/express';
import { rootRouter } from './routes/root.routes';
import { apiRouter } from './routes/api.routes';
import * as middlewares from './middlewares';
import { failSaveHandler } from './middlewares/error.middleware';

const app = express();

configureExpressApp(app);

app.use('/api', apiRouter);

app.use('/', rootRouter);

app.use(middlewares.notFound);

app.use(failSaveHandler);

export default app;
