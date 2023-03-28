import fs from 'fs';
// import express from 'express';
import chalk from 'chalk';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import R from 'ramda';

// const __filename = fileURLToPath(import.meta.url);
// console.log(`__filename=${__filename}`);
// const __dirname = path.dirname(__filename) + '/public';
// console.log(`__dirname=${__dirname}`);
// const __rootname = process.env.STATIC_HOME || '.';
// const __rootname = path.dirname(fileURLToPath(import.meta.url)) + '/public';
// console.log(`__rootname=${__rootname}`);
//
import app from './app';
import { logger } from './utils/logger/logger';
// import { dotenvExists } from './utils/common/checkDotEnv';
import {
  port,
  cacheDir,
  craigslistCacheDir,
  facebookCacheDir,
} from './globals';
import { initAllDbs } from './database/common';
import * as fetcher from './fetcher/fetcher';
import fsDriver from './api/cache/fsDriver';

// if (!dotenvExists('.env')) {
//   logger.error('exiting');
//   process.exit(1);
// }
// console.log('the dotenv file exists');
// console.log(`process.env.PORT=${process.env.PORT}`);
// console.log(`port=${port}`);
// console.log(`static_home=${static_home}`);
// export const shome = process.env.STATIC_HOME;

// app.use(express.static(path.join(__dirname, 'public')));

// export const __rootname = path.dirname(
//   fileURLToPath(import.meta.url + '/../..'),
// );
// console.log(`__rootname=${__rootname}`);

// const port = process.env.PORT || 5008;
// const port = app.get('port');
// console.log('da port is', port);

const startServer = (): void => {
  app.listen(port, () => {
    logger.info(
      `server is running at ${chalk.bold(
        `http://localhost:${port}`,
      )} in ${chalk.bold(app.get('env'))} mode`,
    );

    if (!fs.existsSync(cacheDir)) {
      logger.warn(
        `The cache directory does not exist, creating it: ${cacheDir}`,
      );
      fs.mkdirSync(cacheDir);
    }

    const craigslistCache = fsDriver(cacheDir, craigslistCacheDir);
    craigslistCache.createIfNotExists();

    const facebookCache = fsDriver(cacheDir, facebookCacheDir);
    facebookCache.createIfNotExists();

    const dbResult = initAllDbs();

    // if (dbResult.isOk()) {
    //   dbResult.value.forEach((msg) => logger.warn(chalk.yellow(msg)));
    // }

    if (dbResult.isErr()) {
      dbResult.mapErr((messages) =>
        messages.forEach((msg) => logger.error(chalk.red(msg))),
      );
      logger.error('initializing went pear-shaped, shutting down');
      return;
    }

    fetcher.init([craigslistCache, facebookCache]);

    logger.info(chalk.green.bold('server ready'));
  });
};

// logger.info('do it 1');
// const testRambda = (currentValues: number[]): number => {
//   const currentMax = currentValues.reduce(
//     (element, max) => (element > max ? element : max),
//     0,
//   );
//   if (!currentMax || currentMax < 0) {
//     return 10;
//   }

//   return currentMax + 10;
// };
// const cVals = [5, 10, 15];
// const newMax = testRambda(cVals);
// console.log(`newMax=${newMax}`);

startServer();
