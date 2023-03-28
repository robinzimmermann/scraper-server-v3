import fs from 'fs';
import chalk from 'chalk';

import app from './app';
import { logger } from './utils/logger/logger';
import {
  port,
  cacheDir,
  craigslistCacheDir,
  facebookCacheDir,
} from './globals';
import { initAllDbs } from './database/common';
import * as fetcher from './fetcher/fetcher';
import cache from './api/cache/fsDriver';

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

    const craigslistCache = cache(cacheDir, craigslistCacheDir);
    craigslistCache.createIfNotExists();

    const facebookCache = cache(cacheDir, facebookCacheDir);
    facebookCache.createIfNotExists();

    const dbResult = initAllDbs();

    // if (dbResult.isOk()) {
    //   dbResult.value.forEach((msg) => logger.warn(chalk.yellow(msg)));
    // }

    if (dbResult.isErr()) {
      dbResult.mapErr((messages: string[]) =>
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
