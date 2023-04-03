import * as puppeteer from 'puppeteer';

import { HeadlessBrowserInstance, HeadlessBrowserResults } from './HeadlessBrowserInstance';
import * as craigslist from './puppeteerDriverCraigslist';
import * as facebook from './puppeteerDriverFacebook';
import { logger } from '../../utils/logger/logger';

// let browser: puppeteer.Browser;
let browser: puppeteer.Browser;

export let sessionId = 0;

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

// export default <T>(file: string): JsonDb<T> => {

export default (): HeadlessBrowserInstance<puppeteer.Browser> => {
  const getBrowser = async (): Promise<puppeteer.Browser> => {
    return browser;
  };

  // export default <T>(): HeadlessBrowser<T> => {
  // export const launch = async (): Promise<puppeteer.Browser> => {
  const launch = async (): Promise<void> => {
    // logger.silly(
    //   'launching a new browser launching a new browserlaunching a new browserlaunching a new browserlaunching a new browserlaunching a new browserlaunching a new browser',
    // );
    browser = await puppeteer.launch({
      headless: false,
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

    // return browser;
    // logger.silly(
    // 'well it launched,  well it launched, well it launched, well it launched, well it launched',
    // );
    // logger.silly('well it launched, creating a new page');
    // await browser.newPage();
    // logger.silly('new page created');
    // return Promise.resolve(browser);
  };

  const unlaunch = async (): Promise<void> => {
    if (browser) {
      logger.debug('closing existing browser');
      await browser.close();
    }
  };

  const getHtmlPageCraigslist = async (
    url: string,
    nextPageJavascript?: string,
  ): Promise<HeadlessBrowserResults> => {
    startNewSession();
    return await craigslist.getHtmlPage(browser, url, nextPageJavascript);
  };

  const getHtmlPageFacebook = async (
    url: string,
    searchTerm: string,
  ): Promise<HeadlessBrowserResults> => {
    startNewSession();
    return await facebook.getHtmlPage(browser, url, searchTerm);
  };

  // return <JsonDb<T>>{ read, write };
  return <HeadlessBrowserInstance<puppeteer.Browser>{
    getBrowser
    launch,
    unlaunch,
    getHtmlPageCraigslist,
    getHtmlPageFacebook,
  };
};
