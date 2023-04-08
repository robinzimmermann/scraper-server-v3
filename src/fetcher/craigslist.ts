import fs from 'fs';
import chalk from 'chalk';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';
// import * as puppeteer from 'puppeteer';

// import { HeadlessBrowserInstance } from '../api/headlessBrowser/HeadlessBrowserInstance';
import { HBrowserInstance } from '../api/hbrowser/HBrowser';
import {
  CraigslistSearchDetails,
  CraigslistSubcategory,
  CraigslistRegion,
  getCraigslistSubcategoryCode,
  getCraigslistBaseUrl,
} from '../database/models/dbSearches';
import { logger } from '../utils/logger/logger';
import {
  CraigslistJobDetails,
  Job,
  buildCacheName,
  printJob,
  addAnotherPageToJob,
} from './fetcher';
import { upsertPost } from '../database/dbPosts';

// For Craiglist, there is a job for each searchTerm by each region buy each subCategory.
export const getJobs = (
  searchDetails: CraigslistSearchDetails | undefined,
  callback: (craigslistJobDetails: CraigslistJobDetails) => void,
): Job[] => {
  const jobs: Job[] = [];
  if (!searchDetails) {
    // Can't assume we were legit given a parameter, must handle the undefined case
    return jobs;
  }
  searchDetails.searchTerms.forEach((searchTerm, i) =>
    searchDetails.regions.forEach((region) =>
      searchDetails.craigslistSubcategories.forEach((craigslistSubcategory) =>
        callback({
          searchTerm,
          searchTermNum: i + 1,
          region,
          craigslistSubcategory,
        }),
      ),
    ),
  );
  return jobs;
};

export const composeUrl = (
  region: CraigslistRegion,
  subCategory: CraigslistSubcategory,
  searchTerm: string,
  pageNum: number,
): string => {
  return `https://${getCraigslistBaseUrl(
    region,
  )}/search/${getCraigslistSubcategoryCode(
    subCategory,
  )}?query=${encodeURIComponent(searchTerm)}#search=1~gallery~${pageNum - 1}~0`;
};

/**
 * Just the directory name
 */
export const generateCacheDir = (
  cacheHome: string,
  alias: string,
  resultsDir: string,
  region: CraigslistRegion,
  subCategory: CraigslistSubcategory,
): string => {
  // const details = job.details as CraigslistJobDetails;
  return `${cacheHome}/${alias}/${resultsDir}/${region}/${subCategory}`;
};

/**
 * Just the filename
 */
export const generateCacheFilename = (
  searchTermNum: number,
  pageNum: number,
): string => {
  // const details = job.details as CraigslistJobDetails;
  // return `searchterm${details.searchTermNum}_pg${job.pageNum}.html`;
  return `searchterm${searchTermNum}_pg${pageNum}.html`;
};

/**
 * @returns true if there is a next page
 */
export const fetchSearchResults = async (
  browser: HBrowserInstance,
  job: Job,
): Promise<boolean> => {
  logger.silly(
    `craigslist.fetchSearchResults() job ${job.jid} about to contact the craigslist server`,
  );
  const results = await browser.getHtmlPageCraigslist(job.url);
  // logger.verbose(`got back from craigslist search: ${JSON.stringify(results)}`);

  if (results.html) {
    logger.verbose('looks like this craigslist page has a result to save');
    // const cacheDir = generateCacheDir(job);
    // const cacheFilename = generateCacheFilename(job);
    // const cacheLocation = `${cacheDir}/${cacheFilename}`;
    // const cacheLocation = `${job.searchResultsHomeDir}/${job.searchResultsFilename}`;
    const cacheLocation = buildCacheName(job);
    logger.verbose(`saving to filename=${chalk.bold(cacheLocation)}`);
    fs.mkdirSync(job.searchResultsHomeDir, { recursive: true });
    fs.writeFileSync(cacheLocation, results.html);
  } else {
    // This should never happen
    logger.verbose('looks like this craigslist page has no result to save');
  }

  if (results.nextPage) {
    return true;
  } else {
    return false;
  }
};

/**
 * Converts the Craigslist post date to a canonical post date.
 * Craigslist dates say either "Xhr ago" or "M/d".
 */
const getPostDate = (data: string | undefined): string => {
  if (!data || typeof data === 'undefined') {
    return '';
  }
  // Convert the Craiglist format to canonical.
  if (data.endsWith(' ago')) {
    return (
      DateTime.now()
        .minus({ hours: parseInt(data) })
        .toISODate() || ''
    );
  } else {
    return DateTime.fromFormat(`2023/${data}`, 'yyyy/M/d').toISODate() || '';
  }
};

export const processSearchResultsPage = (job: Job): void => {
  const cacheName = buildCacheName(job);

  const html = fs.readFileSync(cacheName);

  // $ is cheerio root
  const $ = cheerio.load(html);

  // Make sure it's the right Craigslist page. Craigslist pages have gone through multiple versions.
  if ($('#search-results-page-1').length === 0) {
    logger.error('this is the wrong type of craigslist page!');
    return;
  }

  // If there are no results, nothing to do
  const hasNoResults = $('main.no-results').length > 0;
  if (hasNoResults) {
    logger.warn('no results on this Craigslist page');
    return;
  }

  // Check if there are more paginated search pages.
  const $range1 = $('.cl-page-number');
  const rangeStr = $range1.first().text().trim();
  const pageCountRegex = /([\d,]*)\s*-\s*([\d,]*)\s*of\s*([\d,]*)/; // e.g. "601 - 719 of 719"
  const matches = rangeStr.match(pageCountRegex);

  if (!matches) {
    logger.error(
      'the following fetch did not have a match for the page post numbers:',
    );
    printJob(job);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_ignore, rangeFromStr, rangeToStr, totalCountStr] = matches;

  const rangeFrom = parseInt(rangeFromStr.replace(/,/g, ''));
  const rangeTo = parseInt(rangeToStr.replace(/,/g, ''));
  const totalCount = parseInt(totalCountStr.replace(/,/g, ''));

  // If the page total does not match the overall total then we have to keep going
  if (rangeTo !== totalCount) {
    addAnotherPageToJob(job);
  }

  const $results = $('.results');

  const $galleries = $('.cl-gallery', $results); // browser: $results[0].querySelectorAll('.cl-gallery')
  if ($galleries.length !== rangeTo - rangeFrom + 1) {
    logger.warn(
      `\nnum galleries (${chalk.yellow(
        $galleries.length,
      )}) does not match num posts on this page (${chalk.yellow(
        rangeTo - rangeFrom + 1,
      )} (pageTo - pageFrom + 1 [${rangeTo} - ${rangeFrom} + 1])), fetch: ${chalk.yellow(
        job.jid,
      )}`,
    );
    printJob(job);
  }

  const results = $('.cl-search-result[title]');
  results.each((_index: number, elem: cheerio.Element) => {
    const $result = $(elem);

    const pid = $result.attr('data-pid') || '';
    if (pid.length === 0) {
      logger.error('pid is blank');
      return;
    }

    const postUrl = $('.cl-gallery a.main', $result).attr('href');
    if (!postUrl) {
      logger.error('postUrl is blank');
      return;
    }

    // If this post is in the ignore list, then, well, ignore it.
    // if (dbIgnore.shouldIgnore(pid)) {
    //   // ignoreCounter++; // TODO Add this back in?
    //   meta.postFetchResults[fetch.sid].ignored++;
    //   addLogWithWrite(pid, 'ignored');
    //   return;
    // }

    let thumbnailUrl =
      'https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png';
    const multiImage = $('.cl-gallery .main:not(.singleton, .empty)', $result);
    const logMissingImage = (): void => {
      logger.warn(
        `${chalk.bold(pid)} missing image from [${chalk.bold(
          job.source,
        )}|${chalk.bold(job.details.region)}|${chalk.bold(
          job.alias,
        )}], ${buildCacheName(job)}`,
      );
      // thumbnailUrl =
      //   'https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png';
    };
    if (multiImage.length === 1) {
      const multiImageImg = $('img', multiImage).attr('src');
      if (!multiImageImg) {
        logMissingImage();
      } else {
        thumbnailUrl = multiImageImg.trim();
      }
    } else {
      const singletonImage = $('.cl-gallery .main.singleton', $result);
      if (singletonImage.length === 1) {
        const singletonImageImg = $('img', singletonImage).attr('src');
        if (!singletonImageImg) {
          logMissingImage();
        } else {
          thumbnailUrl = singletonImageImg.trim();
        }
      } else {
        const emptyImage = $('.cl-gallery .main.empty', $result);
        if (emptyImage.length === 1) {
          // No thumbnail, do nothing
        } else {
          logger.warn(
            `post ${chalk.yellow(
              pid,
            )} does not have a thumbnail, but was expected to`,
          );
        }
      }
    }

    const price = Number(
      $('.priceinfo', $result)
        .text()
        .replace(/[^0-9.-]+/g, ''),
    );

    const metaDiv = $('.meta', $result);
    if (!metaDiv) {
      logger.error('this page contains no .meta element');
      return;
    }
    let postDate = '';
    let hood = '';
    const metaChildren = metaDiv.contents().filter((_node) => true);
    metaChildren.each((i: number, el: cheerio.Element) => {
      if (el.type === 'text') {
        if (i === 0) {
          postDate = getPostDate(el.data);
        } else {
          hood = el.data || '';
        }
      }
    });

    // for (const node of metaChildren) {
    //   if (node.type === 'text') {
    //     logger.verbose(`=> ${node.type}, ${$(node)}`);
    //     hood = $(node).text().trim();
    //   }
    // }

    // Mon Nov 07 2022 10:44:01 GMT-0800 (Pacific Standard Time)
    // const postDateTime = $('.when span', $result).attr('title');
    // const postDateTime = metaDiv.children().first().attr('title')?.trim();
    // if (!postDateTime) {
    //   logger.error("the postDateTime on this page isn't right");
    //   return;
    // }
    // logger.debug(`${price}, ${hood} ${postDateTime}`);
    // const postDate = DateTime.fromJSDate(new Date(postDateTime)).toFormat(
    //   dateFormat,
    // );

    const title = $('.titlestring', $result).text();

    upsertPost(pid, job.sid, title, postDate, price, hood, thumbnailUrl);
  });
};
