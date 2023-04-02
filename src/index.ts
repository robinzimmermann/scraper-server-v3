import fs from 'fs';
import chalk from 'chalk';

import app from './app';
import { logger } from './utils/logger/logger';
import { port, cacheDir } from './globals';
import { initAllDbs } from './database/common';
import * as fetcher from './fetcher/fetcher';
// import cache from './api/cache/fsDriver';
import { launch, unlaunch } from './api/headlessBrowser/puppeteerDriver';

const startServer = async (): Promise<void> => {
  // launch();

  app.listen(port, async () => {
    logger.info(
      `server is starting at ${chalk.bold(
        `http://localhost:${port}`,
      )} in ${chalk.bold(app.get('env'))} mode`,
    );

    if (!fs.existsSync(cacheDir)) {
      logger.warn(
        `The cache directory does not exist, creating it: ${cacheDir}`,
      );
      fs.mkdirSync(cacheDir);
    }

    // const craigslistCache = cache(cacheDir, craigslistCacheDir);
    // craigslistCache.createIfNotExists();

    // const facebookCache = cache(cacheDir, facebookCacheDir);
    // facebookCache.createIfNotExists();

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

    fetcher.init();
  });
};

const stopServer = async (): Promise<void> => {
  await unlaunch();
  process.exit(1);
};

// When Ctrl-C is pressed
process.on('SIGINT', async (_code) => {
  stopServer();
});

// When node restarts due to code change
process.on('SIGUSR2', async (_code) => {
  stopServer();
});

// startServer();
await Promise.all([launch(), startServer()]);
logger.info(chalk.green.bold('server ready'));

/*
const p1 = async (): Promise<number> => {
  const timeoutLength = 1000;
  const np = new Promise<number>((resolve) =>
    setTimeout(() => {
      console.log('p1 finished!!!');
      resolve(timeoutLength);
    }, timeoutLength),
  );
  return np;
};

const p2 = async (): Promise<number> => {
  console.log('p2 starting');
  const result = await p1();
  console.log('p2 finishing');
  return result;
};

const p3 = async (): Promise<number> => {
  console.log('p3 starting');
  const result = await p2();
  console.log('p3 finishing');
  return result;
};

const p4 = (): Promise<number> => {
  const timeoutLength = 10000;
  console.log('p4 starting');
  const np = new Promise<number>((resolve) =>
    setTimeout(() => {
      console.log('p4 finishing');
      resolve(timeoutLength);
    }, timeoutLength),
  );
  return np;
};

const longFunction = (): Promise<void> => {
  console.log('starting longFunction()');
  const np = new Promise<void>((resolve) =>
    setTimeout(() => {
      console.log('finished longFunction()');
      resolve();
    }, 5000),
  );
  return np;
};

const p11 = p1();
const p22 = p2();
const p44 = p4();

console.log('p1 about to start');
await longFunction();
console.log('starting Promise.all()');
const allPromises = Promise.all([p11, p22, p44]);
const result = await allPromises;
console.log('result:', result);
console.log('final message');
*/
