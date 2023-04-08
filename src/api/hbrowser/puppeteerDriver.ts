import * as puppeteer from 'puppeteer';

import * as CraigslistDriver from './puppeteerDriverCraigslist';
import * as FacebookDriver from './puppeteerDriverFacebook';
import { logger } from '../../utils/logger/logger';
import { HBrowserInstance, HeadlessBrowserResults } from './HBrowser';
import { getRandomIntInclusive } from '../../utils/utils';
import { scrollToBottomOfPage } from './scroller';

let browser: puppeteer.Browser;

export const waitForNavigation = async (
  page: puppeteer.Page,
): Promise<void> => {
  await page.waitForNavigation({
    waitUntil: ['load', 'networkidle2'],
  });
};

export const waitForRandomTime = async (
  minMillis: number,
  maxMillis: number,
  short = false,
): Promise<void> => {
  const randWait = short
    ? getRandomIntInclusive(100, 200)
    : getRandomIntInclusive(minMillis, maxMillis);
  return new Promise((resolve) => {
    setTimeout(resolve, randWait);
  });
};

export const isPageScrolledToBottom = async (
  page: puppeteer.Page,
): Promise<boolean> => {
  const isScrolledToBottom = await page.evaluate(
    () =>
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2,
  );
  return Promise.resolve(isScrolledToBottom);
};

export const scrollToBottom = async (
  page: puppeteer.Page,
  sizePixels: number,
  delayMs: number,
  pg: number,
): Promise<void> => {
  // const myTimeoutId = timeoutId++;
  // logger.silly(
  //   `start scrolling [${myTimeoutId}], (sizePixels: ${sizePixels}, delayMs: ${delayMs})`,
  // );
  logger.silly(
    `-[${pg}]- start scrollin', scrollin', scrollin'..., at the bottom: ${await isPageScrolledToBottom(
      page,
    )}`,
  );
  // let isAtBottom = await isPageScrolledToBottom(page);
  // while (!isAtBottom) {
  await scrollToBottomOfPage(page, sizePixels, delayMs, pg);
  // await scrollPageToBottom(page, {
  //   size: sizePixels, // default 250
  //   delay: delayMs, // default 100
  // });
  // await waitForRandomTime(page, 50, 100);
  // isAtBottom = await isPageScrolledToBottom(page);
  // if (!isAtBottom) {
  //   logger.silly(`-[${pg}]- haven't hit rock bottom`);
  // }
  // }

  logger.silly(
    `-[${pg}]- finished scrollin', scrollin', scrollin'..., at the bottom: ${await isPageScrolledToBottom(
      page,
    )}`,
  );
  // Sometimes the page could have grown while scrolling to the bottom. So make sure we got there.
  // if (!(await isPageScrolledToBottom(page))) {
  //   logger.silly(
  //     chalk.red.bgCyan("darn, I didn't make it to the bottom, so trying again"),
  //   );
  //   await scrollToBottom(page, sizePixels, delayMs);
  // } else {
  //   logger.silly(chalk.green.bgCyanBright('made it to the bottom!'));
  // }

  // logger.silly(
  //   `done scrolling [${myTimeoutId}], (sizePixels: ${sizePixels}, delayMs: ${delayMs})`,
  // );
};

export default (): HBrowserInstance => {
  const launch = async (): Promise<void> => {
    // logger.silly(
    //   'launching a new browser launching a new browserlaunching a new browserlaunching a new browserlaunching a new browserlaunching a new browserlaunching a new browser',
    // );
    logger.info('launching new browser instance...');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        // '--incognito',
        '--window-size=900,800',
        '--window-position=800,50',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--shm-size=6gb',
      ],
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      defaultViewport: null,
    });
  };

  const unlaunch = async (): Promise<void> => {
    if (browser) {
      logger.debug('closing existing browser');
      await browser.close();
    }
  };

  const getHtmlPageCraigslist = (
    url: string,
    nextPageJavascript?: string,
  ): Promise<HeadlessBrowserResults> => {
    return CraigslistDriver.getHtmlPage(browser, url, nextPageJavascript);
  };

  const getHtmlPageFacebook = (
    url: string,
    searchTerm: string,
  ): Promise<HeadlessBrowserResults> => {
    return FacebookDriver.getHtmlPage(browser, url, searchTerm);
  };

  return { launch, unlaunch, getHtmlPageCraigslist, getHtmlPageFacebook };
};

/*
import {
  HeadlessBrowserInstance,
  HeadlessBrowserResults,
} from '../HeadlessBrowserInstance';

export default (): HeadlessBrowserInstance<T> => {
  const launch = async (): Promise<T> => {
    // do nothing
  };

  const unlaunch = async (): Promise<void> => {
    // do nothing
  };

  const getHtmlPageCraigslist = async (
    _url: string,
    _nextPageJavascript?: string,
  ): Promise<HeadlessBrowserResults> => {
    return new Promise((resolve, _reject) => {
      resolve({ html: '<html></html>' } as HeadlessBrowserResults);
    });
  };

  const getHtmlPageFacebook = async (
    _url: string,
    _searchTerm: string,
  ): Promise<HeadlessBrowserResults> => {
    return new Promise((resolve, _reject) => {
      resolve({ html: '<html></html>' } as HeadlessBrowserResults);
    });
  };

  return { launch, unlaunch, getHtmlPageCraigslist, getHtmlPageFacebook };
};
*/
