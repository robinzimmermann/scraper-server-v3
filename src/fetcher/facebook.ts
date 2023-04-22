import fs from 'fs';
import * as cheerio from 'cheerio';
import { Parser } from 'fast-mhtml';

// import * as puppeteer from 'puppeteer';
// import { HeadlessBrowserInstance } from '../api/headlessBrowser/HeadlessBrowserInstance';
import { HBrowserInstance } from '../api/hbrowser/HBrowser';

import {
  FacebookRegion,
  FacebookSearchDetails,
  Search,
  Source,
  getFacebookLocation,
} from '../database/models/dbSearches';
import { logger } from '../utils/logger/logger';
import {
  FacebookCacheFileType,
  FacebookJobDetails,
  Job,
  buildCacheName,
} from './fetcher';
import * as fetcher from './fetcher';
import { upsertPost } from '../database/dbPosts';

const mhtmlParser = new Parser();

const figureOutFilesForJobs = (search: Search): void => {
  // Get the relevant jobs for this search, but only the first page.
  // We're going to decide if we should choose the HTML version or the MHTNL version.
  const jobs = fetcher
    .getJobs()
    .filter(
      (job) =>
        job.source === Source.facebook &&
        job.sid === search.sid &&
        job.pageNum === 1,
    );

  jobs.forEach((job) => {
    // Check whether to use HMTL or MHTML
    const htmlPath = buildCacheName(job);
    const mhtmlPath = htmlPath.replace('.html', '.mht');
    const htmlStats = fs.existsSync(htmlPath) ? fs.statSync(htmlPath) : null;
    const mhtmlStats = fs.existsSync(mhtmlPath) ? fs.statSync(mhtmlPath) : null;
    let useMhtmlfile = false;
    if (htmlStats) {
      if (mhtmlStats) {
        // Both exist, use the earliest
        useMhtmlfile = true;
        if (htmlStats.ctimeMs - mhtmlStats.ctimeMs > 0) {
          // The html file is newer
        } else {
          // The mhtml file is newer
        }
      } else {
        // Only the html version exist, use that.
        // No change necessary since html is the default.
      }
    } else {
      if (mhtmlStats) {
        // Only the mhtml version exist, use that.
        useMhtmlfile = true;
      } else {
        // Neither file exist. Stay with html configuration and let something else handle
        // the error in the future.
        // No change necessary since htmlo is the default.
      }
    }
    if (useMhtmlfile) {
      job.searchResultsFilename = job.searchResultsFilename.replace(
        '.html',
        '.mht',
      );
      (job.details as FacebookJobDetails).fileType = FacebookCacheFileType.MHT;
    }
  });
};

// For Facebook, there is a job for each searchTerm by each region buy each subCategory.
export const getJobs = (
  search: Search,
  callback: (facebookJobDetails: FacebookJobDetails) => void,
): Job[] => {
  // TODO Remove this variable and change return of function to void. Same for Craigslist version. The variable isn't used.
  const jobsDeleteMe: Job[] = [];
  const searchDetails = <FacebookSearchDetails>search.facebookSearchDetails;

  searchDetails.searchTerms.forEach((searchTerm, i) =>
    searchDetails.regionalDetails.forEach((regionalDetail) =>
      callback(<FacebookJobDetails>{
        searchTerm,
        searchTermNum: i + 1,
        region: regionalDetail.region,
        fileType: FacebookCacheFileType.HTML,
      }),
    ),
  );

  figureOutFilesForJobs(search);

  /*
  // Get the relevant jobs for this search, but only the first page.
  // We're going to decide if we should choose the HTML version or the MHTNL version.
  const jobs = fetcher
    .getJobs()
    .filter(
      (job) =>
        job.source === Source.facebook &&
        job.sid === search.sid &&
        job.pageNum === 1,
    );
  logger.verbose(
    `These are the Facebook jobs for sid ${search.sid} (${
      search.alias
    }):\n${JSON.stringify(jobs, null, 2)} (${jobs.length})`,
  );
  jobs.forEach((job) => {
    // Check whether to use HMTL or MHTML
    const htmlPath = buildCacheName(job);
    const mhtmlPath = htmlPath.replace('.html', '.mht');
    logger.verbose(`htmlPath=${htmlPath}`);
    logger.verbose(`mhtmlPath=${mhtmlPath}`);
    const htmlStats = fs.existsSync(htmlPath) ? fs.statSync(htmlPath) : null;
    const mhtmlStats = fs.existsSync(mhtmlPath) ? fs.statSync(mhtmlPath) : null;
    if (htmlStats) {
      if (mhtmlStats) {
        // Both exist, use the earliest
        logger.verbose(
          'both html and hmtml exist, pick the earliest (not yet implemented)',
        );
      } else {
        // Only the html version exist, use that.
        // No change necessary since html is the default.
        logger.verbose('only the hmtml file exists, so use that');
      }
    } else {
      if (mhtmlStats) {
        // Only the mhtml version exist, use that.
        logger.verbose('only the mhtml file exists, switching to that');
        job.searchResultsFilename = job.searchResultsFilename.replace(
          '.html',
          '.mht',
        );
        (job.details as FacebookJobDetails).fileType =
          FacebookCacheFileType.MHT;
      } else {
        // Neither file exist. Stay with html configuration and let something else handle
        // the error in the future.
        // No change necessary since htmlo is the default.
        logger.verbose(
          'neither html nor hmtml file exists, uh oh, this is bad...',
        );
      }
    }
  });
  */
  return jobsDeleteMe;
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
 * Just the filename + extension
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

export const processSearchResultsPage = (job: Job): void => {
  const cacheName = buildCacheName(job);

  const details = <FacebookJobDetails>job.details;

  if (!fs.existsSync(cacheName)) {
    logger.warn(`not found: ${cacheName}`);
    return;
  }

  let html: Buffer | string;
  const fileContents = fs.readFileSync(cacheName);

  if (
    (job.details as FacebookJobDetails).fileType === FacebookCacheFileType.HTML
  ) {
    html = fileContents;
  } else {
    const result = mhtmlParser
      .parse(fileContents) // parse file contents
      .rewrite() // rewrite all links
      .spit(); // return all contents

    html = result
      .filter((r) => r.type === 'text/html')
      .map((r) => r.content)[0];
  }

  // $ is cheerio root
  const $ = cheerio.load(html);

  const $results = $('.x3ct3a4');

  if ($results.length === 0) {
    logger.warn('no results on this Facebook page');
    return;
  }

  $results.each((_index: number, result: cheerio.Element) => {
    process.stdout.write(
      `\rjob ${job.jid}: [${_index + 1} / ${$results.length}]`,
    );
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
  // After printing the progress, move the next line
  process.stdout.write('\r');
  logger.debug(
    `processed ${$results.length} ${job.source} post${
      $results.length !== 1 ? 's' : ''
    } for job ${job.jid}`,
  );
};
