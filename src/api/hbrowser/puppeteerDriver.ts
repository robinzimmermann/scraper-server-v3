import * as puppeteer from 'puppeteer';

import * as CraigslistDriver from './puppeteerDriverCraigslist';
import * as FacebookDriver from './puppeteerDriverFacebook';
import { logger } from '../../utils/logger/logger';
import { HBrowserInstance, HeadlessBrowserResults } from './HBrowser';

let browser: puppeteer.Browser;

export default (): HBrowserInstance => {
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
