// import puppeteer from 'puppeteer';

import * as puppeteer from 'puppeteer';

import {
  HeadlessBrowserInstance,
  HeadlessBrowserResults,
} from './HeadlessBrowserInstance';
import { logger } from '../../utils/logger/logger';

export const getHtmlPage = async (
  browser: HeadlessBrowserInstance<puppeteer.Browser>,
  url: string,
  nextPageJavascript?: string,
): Promise<HeadlessBrowserResults> => {
  logger.verbose(
    `starting craigslist fetch, url=${url}, nextPageJavascript=${nextPageJavascript}`,
  );
  if (!browser) {
    return new Promise((_resolve, reject) => {
      reject(new Error(''));
    });
  }

  try {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        logger.silly('simulating a craigslist page taking a while');
        resolve(<HeadlessBrowserResults>{
          html: '<html><h1>I am Craigslist!</h1></html>',
        });
      }, 3000);
    });
  } catch (err) {
    logger.error('aw, poop');
    return new Promise((_resolve, reject) => {
      reject(err);
    });
  }
};
