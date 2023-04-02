// import puppeteer from 'puppeteer';

import { HeadlessBrowserResults } from './HeadlessBrowser';
import { logger } from '../../utils/logger/logger';

export const getHtmlPage = async (
  url: string,
  nextPageJavascript?: string,
): Promise<HeadlessBrowserResults> => {
  logger.verbose('starting craigslistpage');
  logger.verbose(`url=${url}, nextPageJavascript=${nextPageJavascript}`);

  return new Promise((resolve, _reject) => {
    resolve(<HeadlessBrowserResults>{ html: '<html></html>' });
  });
};
