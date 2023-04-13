// import puppeteer from 'puppeteer';

import * as puppeteer from 'puppeteer';

import { logger } from '../../utils/logger/logger';
import { HeadlessBrowserResults } from './HBrowser';

export const getHtmlPage = async (
  browser: puppeteer.Browser,
  url: string,
  searchTerm: string,
): Promise<HeadlessBrowserResults> => {
  logger.verbose('starting facebook page');
  logger.verbose(`url=${url}, searchTerm=${searchTerm}`);

  if (!browser) {
    return new Promise((_resolve, reject) => {
      reject(Error(''));
    });
  }

  let html: string;

  try {
    // return new Promise((resolve, _reject) => {
    //   setTimeout(() => {
    //     logger.silly('simulated a facebook page taking a while');
    //     resolve(<HeadlessBrowserResults>{
    //       html: '<html><h1>I am Facebook!</h1></html>',
    //     });
    //   }, 3000);
    // });
    const page = await browser.newPage();

    await page.goto('https://yahoo.com/');

    html = '<html><h1>I am Facebook!</h1></html>';
  } catch (err) {
    logger.error('aw, poop');
    return new Promise((_resolve, reject) => {
      reject(err);
    });
  }

  return new Promise((resolve, _reject) => {
    resolve(<HeadlessBrowserResults>{ html, nextPage: false });
  });
};
