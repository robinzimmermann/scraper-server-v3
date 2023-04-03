import fs from 'fs';
import chalk from 'chalk';

import app from './app';
import { logger } from './utils/logger/logger';
import { port, cacheDir } from './globals';
import { initAllDbs } from './database/common';
import * as fetcher from './fetcher/fetcher';
// import cache from './api/cache/fsDriver';
// import puppeteerDriver from './api/headlessBrowser/puppeteerDriver';
import { doSearch } from './fetcher/fetcher';
import HBrowserInstance from './api/hbrowser/puppeteerDriver';

// const headlessBrowser = puppeteerDriver();
const hbrowser = HBrowserInstance();

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

    fetcher.init(hbrowser);
  });
};

const stopServer = async (): Promise<void> => {
  await hbrowser.unlaunch();
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
await Promise.all([hbrowser.launch(), startServer()]);
logger.info(chalk.green.bold('server ready'));

await doSearch(); // TODO This is temporary, browser user should start searches
