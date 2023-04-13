// import puppeteer from 'puppeteer';

import * as puppeteer from 'puppeteer';

import { HeadlessBrowserResults } from './HBrowser';
import { logger } from '../../utils/logger/logger';
import { getRandomIntInclusive } from '../../utils/utils';
import {
  scrollToBottom,
  waitForNavigation,
  waitForRandomTime,
} from './puppeteerDriver';

export const getHtmlPage = async (
  browser: puppeteer.Browser,
  url: string,
  nextPageJavascript?: string,
): Promise<HeadlessBrowserResults> => {
  logger.verbose(
    `starting craigslist fetch, url=${url}, nextPageJavascript=${nextPageJavascript}`,
  );
  if (!browser) {
    return new Promise((_resolve, reject) => {
      reject(Error(''));
    });
  }

  let html: string;

  let nextPage = false;

  try {
    // return new Promise((resolve, _reject) => {
    //   setTimeout(() => {
    //     logger.silly('simulated a craigslist page taking a while');
    //     resolve(<HeadlessBrowserResults>{
    //       html: '<html><h1>I am Craigslist!</h1></html>',
    //     });
    //   }, 3000);
    // });
    const page = await browser.newPage();

    // const moorl = 'https://developer.chrome.com/';
    const moorl = url;

    await Promise.all([
      await page.goto(moorl, {
        waitUntil: 'networkidle0',
      }),
      waitForNavigation,
    ]);

    await waitForRandomTime(0, getRandomIntInclusive(2000, 3000));

    const galleryCounts = await page.evaluate(() => [
      document.querySelectorAll('.cl-gallery .main:not(.singleton, .empty)')
        .length,
      document.querySelectorAll('.cl-gallery .main.singleton').length,
      document.querySelectorAll('.cl-gallery .main.empty').length,
      document.querySelectorAll('.cl-next-page.bd-disabled').length,
    ]);

    const [multis, singletons, empties, isLastPage] = galleryCounts;
    logger.verbose(
      `multis=${multis}, singletons=${singletons}, empties=${empties}, total=${
        multis + singletons + empties
      }, isLastPage=${
        isLastPage ? 'this is the last page' : 'there is another page'
      } (${isLastPage})`,
    );
    if (!isLastPage) {
      nextPage = true;
    }

    await scrollToBottom(page, 500, 50, -2);

    await waitForRandomTime(0, getRandomIntInclusive(2000, 3000));

    // try {
    //   // wait for all multi images
    //   await page.waitForFunction(
    //     (target: number) =>
    //       document.querySelectorAll(
    //         '.cl-gallery .main:not(.singleton, .empty) div[data-index="0"]',
    //       ).length >= target,
    //     { timeout: 5000 },
    //     multis,
    //   );
    // } catch (err) {
    //   logger.warn('took too long to wait for multi images');
    // }

    // try {
    //   // wait for all singleton images
    //   await page.waitForFunction(
    //     (target: number) =>
    //       document.querySelectorAll('.cl-gallery .main.singleton').length >=
    //       target,
    //     { timeout: 5000 },
    //     singletons,
    //   );
    // } catch (err) {
    //   logger.warn('took too long to wait for singleton images');
    // }

    // try {
    //   // wait for all empty images
    //   await page.waitForFunction(
    //     (target: number) =>
    //       document.querySelectorAll('.cl-gallery .main.empty').length >= target,
    //     { timeout: 5000 },
    //     empties,
    //   );
    // } catch (err) {
    //   logger.warn('took too long to wait for empty images');
    // }

    // const waitMultis = page.waitForFunction(
    //   (numMultis: number) =>
    //     document.querySelectorAll(
    //       '.cl-gallery .main:not(.singleton, .empty) div[data-index="0"]',
    //     ).length >=
    //     numMultis,
    //   { timeout: 5000 },
    //   multis,
    // );
    // const waitSingletons = page.waitForFunction(
    //   (numSingletons: number) =>
    //     document.querySelectorAll('.cl-gallery .main.singleton').length >=
    //     numSingletons,
    //   { timeout: 5000 },
    //   singletons,
    // );
    // const waitEmpties = page.waitForFunction(
    //   (numEmpties: number) =>
    //     document.querySelectorAll('.cl-gallery .main.empty').length >=
    //     numEmpties,
    //   { timeout: 5000 },
    //   empties,
    // );

    try {
      // await Promise.all([waitMultis, waitSingletons, waitEmpties]);
      // Wait until images for each category have donwnloaded and loaded
      await page.waitForFunction(
        (numMultis: number, numSingletons: number, numEmpties: number) => {
          return (
            document.querySelectorAll(
              '.cl-gallery .main:not(.singleton, .empty) div[data-index="0"]',
            ).length >= numMultis &&
            document.querySelectorAll('.cl-gallery .main.singleton').length >=
              numSingletons &&
            document.querySelectorAll('.cl-gallery .main.empty').length >=
              numEmpties
          );
        },
        { timeout: 5000 },
        multis,
        singletons,
        empties,
      );
    } catch (err) {
      logger.warn('took too long to wait for images');
    }

    html = await page.content();

    await page.close();
  } catch (err) {
    logger.error('aw, poop');
    return new Promise((_resolve, reject) => {
      reject(err);
    });
  }

  return new Promise((resolve, _reject) => {
    resolve(<HeadlessBrowserResults>{ html, nextPage });
  });
};
