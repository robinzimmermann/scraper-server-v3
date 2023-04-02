import * as puppeteer from 'puppeteer';
// import { scrollPageToBottom } from 'puppeteer-autoscroll-down';

import { HeadlessBrowser, HeadlessBrowserResults } from './HeadlessBrowser';
import * as craigslist from './puppeteerDriverCraigslist';
import * as facebook from './puppeteerDriverFacebook';
import { logger } from '../../utils/logger/logger';

let browser: puppeteer.Browser;

export let sessionId = 0;

// export const launch = async (): Promise<puppeteer.Browser> => {
export const launch = async (): Promise<void> => {
  // logger.silly(
  //   'launching a new browser launching a new browserlaunching a new browserlaunching a new browserlaunching a new browserlaunching a new browserlaunching a new browser',
  // );
  browser = await puppeteer.launch({
    headless: true,
    args: [
      // '--incognito',
      '--window-size=300,400',
      '--window-position=900,50',
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
  // logger.silly(
  // 'well it launched,  well it launched, well it launched, well it launched, well it launched',
  // );
  // logger.silly('well it launched, creating a new page');
  // await browser.newPage();
  // logger.silly('new page created');
  // return Promise.resolve(browser);
};

export const unlaunch = async (): Promise<void> => {
  if (browser) {
    logger.debug('closing existing browser');
    await browser.close();
  }
};

export const waitForNavigation = async (
  page: puppeteer.Page,
): Promise<void> => {
  await page.waitForNavigation({
    waitUntil: ['load', 'networkidle2'],
  });
};

const startNewSession = (): void => {
  sessionId++;
  logger.debug('*************************************************************');
  logger.debug('*************************************************************');
  logger.debug('*************************************************************');
  logger.debug(`start session ${sessionId}`);
};

export default (): HeadlessBrowser => {
  const getHtmlPageCraigslist = async (
    url: string,
    nextPageJavascript?: string,
  ): Promise<HeadlessBrowserResults> => {
    startNewSession();
    return await craigslist.getHtmlPage(url, nextPageJavascript);
  };

  const getHtmlPageFacebook = async (
    url: string,
    searchTerm: string,
  ): Promise<HeadlessBrowserResults> => {
    startNewSession();
    return await facebook.getHtmlPage(url, searchTerm);
  };

  return { getHtmlPageCraigslist, getHtmlPageFacebook };
};
