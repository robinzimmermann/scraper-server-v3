// import puppeteer from 'puppeteer';

import { logger } from '../../utils/logger/logger';
import { HeadlessBrowserResults } from './HeadlessBrowserInstance';

export const getHtmlPage = async (
  url: string,
  searchTerm: string,
): Promise<HeadlessBrowserResults> => {
  logger.verbose('starting facebook page');
  logger.verbose(`url=${url}, searchTerm=${searchTerm}`);

  return new Promise((resolve, _reject) => {
    resolve(<HeadlessBrowserResults>{
      html: '<html><h1>I am Facebook!</h1></html>',
    });
  });
};
