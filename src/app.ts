import express from 'express';
// import MessageResponse from './interfaces/MessageResponse';
// import { fileURLToPath } from 'url';
// import path from 'path';

// const __filename = fileURLToPath(import.meta.url);
// console.log(`__filename=${__filename}`);
// export const __dirname =
//   path.dirname(fileURLToPath(import.meta.url)) + '/public';
// console.log(`__dirname=${__dirname}`);

// import { dotenvExists } from './utils/common/checkDotEnv';
// import { logger } from './utils/logger/logger';
import { configureExpressApp } from './config/express';
import { rootRouter } from './routes/root.routes';
import { apiRouter } from './routes/api.routes';
import * as middlewares from './middlewares';
import { failSaveHandler } from './middlewares/error.middleware';

// TODO Fix this
export const pubicDir = '';

// if (!dotenvExists('.env')) {
//   logger.error('exiting');
//   process.exit(1);
// }

// const __rootname = process.env.STATIC_HOME + '/public';
// console.log(`_r=${__rootname}`);
// export const __d = __rootname;
// console.log(`_d=${__d}`);

const app = express();

// import { __d as poo } from './app';
// console.log(`imported poo = ${poo}`);

//Express Configuration
configureExpressApp(app);

// app.use(express.static('public'));

app.use('/api', apiRouter);

app.use('/', rootRouter);

app.use(middlewares.notFound);
// app.use(middlewares.errorHandler);
app.use(failSaveHandler);

export default app;
