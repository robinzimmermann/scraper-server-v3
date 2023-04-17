import fs from 'fs';
import chalk from 'chalk';
// import * as cheerio from 'cheerio';

import app from './app';
import { logger } from './utils/logger/logger';
import { port, cacheDir } from './globals';
import { initAllDbs } from './database/common';
import * as fetcher from './fetcher/fetcher';
// import * as fetcher2 from './fetcher/fetcher2';
// import { defaultOptions, doSearch } from './fetcher/fetcher';
import HBrowserInstance from './api/hbrowser/puppeteerDriver';
// import { DateTime } from 'luxon';

const startBrowser = fetcher.defaultOptions.debugFetchSearchResultsFromFiles
  ? false
  : true;

const hbrowser = HBrowserInstance();

const startServer = async (): Promise<void> => {
  return new Promise((resolve) => {
    app.listen(port, async () => {
      logger.info(
        `server is starting at ${chalk.bold(
          `http://localhost:${port}`,
        )} in ${chalk.bold(app.get('env'))} mode...`,
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

      resolve();
    });
  });
};

if (startBrowser) {
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
}

if (startBrowser) {
  await Promise.all([hbrowser.launch(), startServer()]);
} else {
  await Promise.all([startServer()]);
}
logger.info(chalk.green.bold('server ready'));

fetcher.init(hbrowser);
await fetcher.doSearch(); // TODO This is temporary, browser user should start searches

/*
const $ = cheerio.load(
  `<div class="meta1">4/5<span class="separator">·</span>Reno</div>
  <div class="meta2">4/5<span class="separator">·</span></div>
  <div class="meta3">6hr ago<span class="separator">·</span>Reno</div>
  <div class="meta4">6hr ago<span class="separator">·</span></div>`,
);

// const contents = $('div').contents();
// logger.debug(`contents length: ${contents.length}`);

const metaDiv1 = $('.meta1');
logger.verbose(`metaDiv=${metaDiv1}`);
const metaChildren1 = metaDiv1.contents().filter((_node) => true);
for (const node of metaChildren1) {
  if (node.type === 'text') {
    logger.verbose(`=> ${node.type}, ${$(node)}`);
  }
}
metaChildren1.each((i: number, el: cheerio.Element) => {
  if (el.type === 'text') {
    if (i === 0) {
      logger.verbose(`TIME: ${el.data} ${getPostDate(el.data)}`);
    } else {
      logger.verbose(`HOOD: ${el.data}`);
    }
  }
});

const metaDiv2 = $('.meta2');
logger.verbose(`metaDiv=${metaDiv2}`);
const metaChildren2 = metaDiv2.contents().filter((_node) => true);
for (const node of metaChildren2) {
  if (node.type === 'text') {
    logger.verbose(`=> ${node.type}, ${$(node)}`);
  }
}
metaChildren2.each((i: number, el: cheerio.Element) => {
  if (el.type === 'text') {
    if (i === 0) {
      logger.verbose(`TIME: ${el.data} ${getPostDate(el.data)}`);
    } else {
      logger.verbose(`HOOD: ${el.data}`);
    }
  }
});

const metaDiv3 = $('.meta3');
logger.verbose(`metaDiv=${metaDiv3}`);
const metaChildren3 = metaDiv3.contents().filter((_node) => true);
for (const node of metaChildren3) {
  if (node.type === 'text') {
    logger.verbose(`=> ${node.type}`);
  }
}
metaChildren3.each((i: number, el: cheerio.Element) => {
  if (el.type === 'text') {
    if (i === 0) {
      logger.verbose(`TIME: ${el.data} ${getPostDate(el.data)}`);
    } else {
      logger.verbose(`HOOD: ${el.data}`);
    }
  }
});

const metaDiv4 = $('.meta4');
logger.verbose(`metaDiv=${metaDiv4}`);
const metaChildren4 = metaDiv4.contents().filter((_node) => true);
for (const node of metaChildren4) {
  if (node.type === 'text') {
    logger.verbose(`=> ${node.type}, ${$(node)}`);
  }
}
metaChildren4.each((i: number, el: cheerio.Element) => {
  if (el.type === 'text') {
    if (i === 0) {
      logger.verbose(`TIME: ${el.data} ${getPostDate(el.data)}`);
    } else {
      logger.verbose(`HOOD: ${el.data}`);
    }
  }
});
*/
