import fs from 'fs';
import * as cheerio from 'cheerio';

// import * as puppeteer from 'puppeteer';
// import { HeadlessBrowserInstance } from '../api/headlessBrowser/HeadlessBrowserInstance';
import { HBrowserInstance } from '../api/hbrowser/HBrowser';

import {
  FacebookRegion,
  FacebookSearchDetails,
  getFacebookLocation,
} from '../database/models/dbSearches';
import { logger } from '../utils/logger/logger';
import {
  FacebookCacheFileType,
  FacebookJobDetails,
  Job,
  buildCacheName,
} from './fetcher';
import { upsertPost } from '../database/dbPosts';

// For Facebook, there is a job for each searchTerm by each region buy each subCategory.
export const getJobs = (
  searchDetails: FacebookSearchDetails | undefined,
  callback: (facebookJobDetails: FacebookJobDetails) => void,
): Job[] => {
  const jobs: Job[] = [];
  if (!searchDetails) {
    // Can't assume we were legit given a parameter, must handle the undefined case
    return jobs;
  }
  searchDetails.searchTerms.forEach((searchTerm, i) =>
    searchDetails.regionalDetails.forEach((regionalDetail) =>
      callback({
        searchTerm,
        searchTermNum: i + 1,
        region: regionalDetail.region,
        fileType: FacebookCacheFileType.HTML,
      }),
    ),
  );
  return jobs;
};

export const composeUrl = (
  region: FacebookRegion,
  searchTerm: string,
): string => {
  return `https://facebook.com/marketplace/${getFacebookLocation(
    region,
  )}/search/?query=${encodeURIComponent(searchTerm)}`;
};

/**
 * Just the directory name
 */
export const generateCacheDir = (
  cacheHome: string,
  alias: string,
  resultsDir: string,
  region: FacebookRegion,
): string => {
  return `${cacheHome}/${alias}/${resultsDir}/${region}`;
};

/**
 * Just the filename
 */
export const generateCacheFilename = (searchTermNum: number): string => {
  return `searchterm${searchTermNum}.html`;
};

export const fetchSearchResults = async (
  browser: HBrowserInstance,
  job: Job,
): Promise<void> => {
  logger.silly(
    `facebook.fetchSearchResults() job ${job.jid} about to contact the facebook server`,
  );
  const results = await browser.getHtmlPageFacebook(
    job.url,
    job.details.searchTerm,
  );
  logger.verbose(`got back from faceboook search: ${JSON.stringify(results)}`);
  // logger.silly(
  //   `facebook.fetchSearchResults() job ${job.jid} about to contact the server`,
  // );
  // return new Promise((resolve) => {
  //   // Simulate doing a search
  //   setTimeout(() => {
  //     logger.silly(
  //       `facebook.fetchSearchResults() job ${job.jid} got a response from server`,
  //     );
  //     resolve();
  //   }, 1000);
  // });
};

// Checks if there is an MHTML file. If there is, that means it was manually saved
// in the Chrome browser.
const processMhtFile = (job: Job): void => {
  logger.debug(
    `processMhtFile() ${job.searchResultsHomeDir}, ${job.searchResultsFilename}`,
  );
  const mhtmlFilename = buildCacheName(job).replace('.html', '.mht');
  if (fs.existsSync(mhtmlFilename)) {
    logger.debug(`${mhtmlFilename} exists!`);
  } else {
    logger.debug(`nup, there is no ${mhtmlFilename}`);
  }
};

export const processSearchResultsPage = (job: Job): void => {
  // If there is an MHT file in the directory then convert it to HTML and move it.
  // That way we always operated on the HTML files.
  processMhtFile(job);

  const details = <FacebookJobDetails>job.details;

  const cacheName = buildCacheName(job);

  const html = fs.readFileSync(cacheName);

  // $ is cheerio root
  const $ = cheerio.load(html);

  const $results = $('.x3ct3a4');

  if ($results.length === 0) {
    logger.warn('no results on this page');
    return;
  }

  $results.each((_index: number, result: cheerio.Element) => {
    process.stdout.write(`\r[${_index + 1} / ${$results.length}]`);
    const $result = $(result);

    let postUrl = $('a', $result).attr('href')?.split('?')[0];
    if (!postUrl) {
      logger.error('no post url');
      return;
    }
    if (postUrl.startsWith('/')) {
      postUrl = `https://facebook.com${postUrl}`;
    }

    const pids = postUrl.match(/.*item\/(\d*)\/.*/);
    if (!pids) {
      logger.error('no way to get pid');
      return;
    }
    const pid = pids[1];

    // If this post is in the ignore list, then, well, ignore it.
    // if (dbIgnore.shouldIgnore(pid)) {
    //   // ignoreCounter++; // TODO Add this back in?
    //   meta.postFetchResults[fetch.sid].ignored++;
    //   addLogWithWrite(pid, 'ignored');
    //   return;
    // }

    const thumbnailUrl = $('img', $result).attr('src');
    if (!thumbnailUrl) {
      logger.error('no thumbnail url');
      return;
    }

    const $priceSection = $(
      '.xkhd6sd.xjkvuk6.x4uap5.x1iorvi4.x1q0g3np.x78zum5',
      $result,
    );

    const price = Number(
      $('span', $priceSection)
        .first()
        .text()
        .replace(/[^0-9.-]+/g, ''),
    );

    // Lots of duplicate spaces, so remove them
    const hood = $('.x676frb span', $result)
      .first()
      .text()
      .replace(/\s+/g, ' ');

    const title = $('.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6', $result)
      .first()
      .text()
      .replace(/\s+/g, ' ');

    logger.debug(`upsertPosting!`);
    upsertPost(
      pid,
      job.sid,
      job.source,
      details.region,
      details.searchTerm,
      title,
      '', // Facebook doesn't include post dates on it's results page
      price,
      hood,
      thumbnailUrl,
    );
  });
};
