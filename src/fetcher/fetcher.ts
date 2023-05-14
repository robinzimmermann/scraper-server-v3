import fs from 'fs';
import chalk from 'chalk';
import tinycolor from 'tinycolor2';

import { logger } from '../utils/logger/logger';
import { HBrowserInstance } from '../api/hbrowser/HBrowser';
import * as dbSearches from '../database/dbSearches';
import {
  CraigslistRegion,
  FacebookRegion,
  Source,
  CraigslistSubcategory,
  Search,
} from '../database/models/dbSearches';
import { getRandWaitTime } from './helper';
import { moveItemInArray, waitWithProgress } from '../utils/utils';
import * as craigslistFetcher from './craigslist';
import * as facebookFetcher from './facebook';
import { cacheDir, craigslistCacheDir, facebookCacheDir } from '../globals';
// import HeadlessBrowserInstance from '../api/headlessBrowser/HeadlessBrowserInstance';
// import * as puppeteer from 'puppeteer';

const craigslistDefaults = <CraigslistFetchOptions>{
  // Wait time between reqwests will be:
  //
  //   minWaitTimeBetweenRequests + random amount up to maxRandomExtraTimeBetweenRequest
  //
  minWaitTimeBetweenRequests: 2000, // milliseconds
  maxRandomExtraTimeBetweenRequest: 5000, // milliseconds
};

export const defaultOptions = <FetchOptions>{
  /**
   * If false, then fetch search results from Craigslist/Facebook rather than files.
   *
   * Prod should be false.
   */
  debugFetchSearchResultsFromFiles: true,

  /**
   * For debugging, instead of waiting the full random wait time, wait for a very short
   * time so things move along more quickly.
   *
   * Prod should be false.
   */
  debugUseShortRandomWaitTime: false,

  craigslistFetchOptions: craigslistDefaults,
};

export type CraigslistJobDetails = {
  searchTerm: string;
  searchTermNum: number;
  region: CraigslistRegion;
  craigslistSubcategory: CraigslistSubcategory;
};

export enum FacebookCacheFileType {
  HTML = 'html',
  MHT = 'mht',
}

export type FacebookJobDetails = {
  searchTerm: string;
  searchTermNum: number;
  region: FacebookRegion;
  fileType: FacebookCacheFileType;
};

export type Job = {
  jid: number;
  sid: string;
  source: Source;
  randomWaitTime: number;
  searchResultsHomeDir: string;
  searchResultsFilename: string;
  url: string;
  pageNum: number;
  details: CraigslistJobDetails | FacebookJobDetails;
};

export type CraigslistFetchOptions = {
  minWaitTimeBetweenRequests: number; // milliseconds
  maxRandomExtraTimeBetweenRequest: number; // milliseconds
};

export type FetchOptions = {
  debugUseShortRandomWaitTime?: boolean;

  debugFetchSearchResultsFromFiles?: boolean;

  craigslistFetchOptions: CraigslistFetchOptions;
};

const logPrefix = '[fetcher] ';

const warningColor = chalk.hex('#0000ff').bold.bgYellow;

export const dateFormat = 'yyyy-MM-dd';

let options: FetchOptions = defaultOptions;

let browser: HBrowserInstance;

const jobs = <Job[]>[];
let jobIdCounter = 1;

// let jobPointer: number;

// Only public for testing purposes.
export const getJobs = (): Job[] => {
  return jobs;
};

// Original version, keeping around as a backup
export const printJob2 = (job: Job): string => {
  if (!job) {
    return '';
  }
  let details: CraigslistJobDetails | FacebookJobDetails;
  let detailsStr: string;
  switch (job.source) {
    case Source.craigslist:
      details = <CraigslistJobDetails>job.details;
      detailsStr = `searchTerm=${chalk.dim(details.searchTerm)} (${chalk.dim(
        details.searchTermNum,
      )}),region=${chalk.dim(details.region)},subcategory=${chalk.dim(
        details.craigslistSubcategory,
      )}`;
      break;
    case Source.facebook:
      details = <FacebookJobDetails>job.details;
      detailsStr = `searchTerm=${chalk.dim(details.searchTerm)} (${chalk.dim(
        details.searchTermNum,
      )}),region=${chalk.dim(details.region)},fileType=${chalk.dim(details.fileType)}`;
      break;
  }
  return `{job=${chalk.dim(job.jid)},search=${chalk.dim(job.sid)},source=${chalk.dim(
    job.source,
  )},${chalk.bold('details={')}${detailsStr}},randomWaitTime=${chalk.dim(
    job.randomWaitTime,
  )},searchResultsHomeDir=${chalk.dim(job.searchResultsHomeDir)},filename=${chalk.dim(
    job.searchResultsFilename,
  )},url=${chalk.dim(job.url)}${chalk.bold('}')},pageNum=${chalk.dim(job.pageNum)}`;
};

export const printJob = (job: Job, write = logger.debug): void => {
  if (!job) {
    return;
  }

  const baseColor = '#00fff6';
  const nameColor = tinycolor(baseColor).darken(15).toHex();
  const valColor = tinycolor(baseColor).darken(28).toHex();

  const intro = (str: string): string => chalk.bold.hex(baseColor)(str);
  const name = (name: string): string => chalk.hex(nameColor)(name);
  const val = (value: unknown): string => chalk.hex(valColor)(value);

  let details: CraigslistJobDetails | FacebookJobDetails;
  let detailsStr: string;
  switch (job.source) {
    case Source.craigslist:
      details = <CraigslistJobDetails>job.details;
      detailsStr = `${name('craigslistSearchDetails')}={${name('searchTerm')}=${val(
        details.searchTerm,
      )} (${val(details.searchTermNum)}), ${name('region')}=${val(details.region)}, ${name(
        'subcategory',
      )}=${val(details.craigslistSubcategory)}}`;
      break;
    case Source.facebook:
      details = <FacebookJobDetails>job.details;
      detailsStr = `${name('facebookSearchDetails')}={${name('searchTerm')}=${val(
        details.searchTerm,
      )} (${val(details.searchTermNum)}), ${name('region')}=${val(details.region)}, ${name(
        'fileType',
      )}=${val(details.fileType)}}`;
      break;
  }

  const search = dbSearches.getSearchBySid(job.sid);

  write(`${intro('┌')}${intro('─'.repeat(125))}`);
  write(
    `${intro('│')} ${name('jid')}=${val(job.jid)}, ${name('sid')}=${val(job.sid)} ${val(
      `(${search?.alias})`,
    )}, ${name('source')}=${val(job.source)},${name('randomWaitTime')}=${val(
      job.randomWaitTime,
    )}, ${name('pageNum')}=${val(job.pageNum)}, ${name('filename')}=${val(
      job.searchResultsFilename,
    )}`,
  );
  write(`${intro('│')} ${name('url')}=${val(job.url)}`);
  write(`${intro('│')} ${name('searchResultsHomeDir')}=${val(job.searchResultsHomeDir)}`);
  write(`${intro('└')} ${detailsStr}`);
};

/**
 *
 * @returns directory + filename
 */
export const buildCacheName = (job: Job): string =>
  `${job.searchResultsHomeDir}/${job.searchResultsFilename}`;

export const addJob = (
  search: Search,
  source: Source,
  jobDetails: CraigslistJobDetails | FacebookJobDetails,
  pageNum = 1,
): Job => {
  const craigslistJobDetails = <CraigslistJobDetails>jobDetails;
  const facebookJobDetails = <FacebookJobDetails>jobDetails;

  let randomWaitTime = 0;
  // For vendors that need random wait time, set it.
  const useShortWaitTime =
    options.debugUseShortRandomWaitTime || options.debugFetchSearchResultsFromFiles ? true : false;
  if (source === Source.craigslist) {
    randomWaitTime = getRandWaitTime(
      options.craigslistFetchOptions.minWaitTimeBetweenRequests,
      options.craigslistFetchOptions.maxRandomExtraTimeBetweenRequest,
      useShortWaitTime,
    );
  }

  let url: string;
  let searchResultsHomeDir = '';
  let searchResultsFilename = '';

  switch (source) {
    case Source.craigslist:
      url = craigslistFetcher.composeUrl(
        craigslistJobDetails.region,
        craigslistJobDetails.craigslistSubcategory,
        jobDetails.searchTerm,
        pageNum,
      );
      searchResultsHomeDir = craigslistFetcher.generateCacheDir(
        cacheDir,
        search.alias,
        craigslistCacheDir,
        craigslistJobDetails.region,
        craigslistJobDetails.craigslistSubcategory,
      );
      searchResultsFilename = craigslistFetcher.generateCacheFilename(
        craigslistJobDetails.searchTermNum,
        pageNum,
      );
      break;
    case Source.facebook:
      url = facebookFetcher.composeUrl(facebookJobDetails.region, facebookJobDetails.searchTerm);
      searchResultsHomeDir = facebookFetcher.generateCacheDir(
        cacheDir,
        search.alias,
        facebookCacheDir,
        facebookJobDetails.region,
      );
      searchResultsFilename = facebookFetcher.generateCacheFilename(
        facebookJobDetails.searchTermNum,
      );
      break;
  }

  const job = <Job>{
    jid: jobIdCounter++,
    sid: search.sid,
    source,
    alias: search.alias,
    details: jobDetails,
    randomWaitTime,
    searchResultsHomeDir,
    searchResultsFilename,
    url,
    pageNum,
  };

  jobs.push(job);

  return job;
};

// Called if it's discovered a page has additional pages
export const addAnotherPageToJob = (job: Job): void => {
  logger.verbose(`adding a new job after job ${job.jid}`);
  const pos = jobs.findIndex((j) => j.jid === job.jid);
  if (pos === -1) {
    logger.warn(`tried to add a next page for job ${job.jid} but it was not in my jobs list`);
    return;
  }
  const search = dbSearches.getSearchBySid(job.sid);
  if (!search) {
    logger.error(`search ${chalk.bold(job.sid)} does not exist`);
    return;
  }

  addJob(search, job.source, job.details, job.pageNum + 1); // Add a new job to the end
  logger.verbose(`creating a new job, then moving it ${jobs.indexOf(job) + 1}`);
  // Move the new job to one after the current job
  moveItemInArray(jobs, jobs.length - 1, jobs.indexOf(job) + 1);
  logger.verbose('new jobs!');
  // jobs.forEach((job) => {
  //   printJob(job);
  // });
};

/**
 * Does the search for each vendor and saves the result in a cache.
 *
 * @returns true if there is a next page
 */
const doJobSearch = async (job: Job): Promise<boolean> => {
  let nextPage = false;
  switch (job.source) {
    case Source.craigslist:
      nextPage = await craigslistFetcher.fetchSearchResults(browser, job);
      break;
    case Source.facebook:
      // Facebook doesn't do multiple pages. It's a single page you keep scrolling.
      await facebookFetcher.fetchSearchResults(browser, job);
      break;
  }

  // If there is a next page, then add it.
  if (nextPage) {
    addAnotherPageToJob(job);
  }
  return nextPage;
};

const getVendorJobs = async (source: Source, search: Search): Promise<void> => {
  // Within craigslist sources, there are individual jobs for search terms, and then individual jobs for regions within each search term
  // Within facebook sources, there are individual jobs for search terms, and regions
  switch (source) {
    case Source.craigslist:
      craigslistFetcher.getJobs(search, (craigslistJobDetails: CraigslistJobDetails) => {
        addJob(search, source, {
          searchTerm: craigslistJobDetails.searchTerm,
          searchTermNum: craigslistJobDetails.searchTermNum,
          region: craigslistJobDetails.region,
          craigslistSubcategory: craigslistJobDetails.craigslistSubcategory,
        });
      });
      break;
    case Source.facebook:
      await facebookFetcher.getJobs(search, (facebookJobDetails: FacebookJobDetails) => {
        addJob(search, source, {
          searchTerm: facebookJobDetails.searchTerm,
          searchTermNum: facebookJobDetails.searchTermNum,
          region: facebookJobDetails.region,
          fileType: FacebookCacheFileType.HTML,
        });
        // In the case of Facebook, the cache files may have been downloaded by node using Puppeteer.
        // Or they may have been downloaded by hand by a human, since Facebook is good at noticing the
        // automation of Puppeteer and blocking it.
        // In the case of manually saving the files, they are in MTHTML format, rather than Puppeteer's HTML
        // format.
      });
      break;
    default:
    // Should never get here.
  }
};

/**
 * Build up the jobs that will be required by searches.
 * Only public for testing purposes.
 */
export const buildJobs = async (): Promise<void> => {
  // Create a job for each search. A search may result in multiple jobs
  const validSearches = dbSearches.getValidEnabledSearches();
  for (let i = 0; i < validSearches.length; i++) {
    const search = validSearches[i];
    // Add separate jobs for each source of a search
    const sources = search.sources.sort();
    for (let j = 0; j <= sources.length; j++) {
      const source = sources[j];
      await getVendorJobs(source, search);
    }
  }
};

const fetchFilesFromServer = async (): Promise<void> => {
  if (options.debugFetchSearchResultsFromFiles) {
    logger.verbose('debug says go back');
    return;
  }

  logger.info(`fetching search results...`);

  // Remove cache directories. Add them to a set to make them unique
  const cleanupSet = new Set<string>();
  jobs.forEach((job) => {
    cleanupSet.add(job.searchResultsHomeDir);
  });
  Array.from(cleanupSet).forEach((value) => {
    fs.rmSync(value, { recursive: true, force: true });
  });

  let jobPointer = 0;

  while (jobPointer < jobs.length) {
    logger.verbose(`jobPointer=${jobPointer}, jobs.length=${jobs.length}`);
    const job = jobs[jobPointer];

    const doTheFetch = doJobSearch(job);

    const waitProgress = (_millisThisTick: number, _totalMillisSoFar: number): void => {
      // TODO Do progress update here
      // if (totalMillisSoFar >= job.randomWaitTime) {
      //   logger.silly(`job ${job.jid} finished waiting ${totalMillisSoFar} ms`);
      // }
    };
    const doTheWait = waitWithProgress(job.randomWaitTime, waitProgress);

    await Promise.all([doTheFetch, doTheWait]);
    // Don't care about the responses, just continue when all promises are done.

    jobPointer++;
  }
};

const readFilesFromCache = async (): Promise<void> => {
  let jobPointer = 0;

  while (jobPointer < jobs.length) {
    const job = jobs[jobPointer];
    logger.verbose(`readFilesFromCache() for job ${job.jid}`);

    switch (job.source) {
      case Source.craigslist:
        // logger.warn(`job: ${job.jid} temporarily ignoring craigslist files`);
        await craigslistFetcher.processSearchResultsPage(job);
        break;
      case Source.facebook:
        // logger.warn(`job: ${job.jid} temporarily ignoring facebook files`);
        await facebookFetcher.processSearchResultsPage(job);
        break;
    }
    jobPointer++;
  }
};

/**
 * Initiate a search
 */
export const doSearch = async (): Promise<void> => {
  // Initialize all variables that need it
  jobs.length = 0;

  await buildJobs();

  if (!jobs || jobs.length === 0) {
    logger.warn(warningColor('nothing to fetch!'));
    return;
  }

  // This is temporary until a better way is found to list the jobs
  // jobs.forEach((job) => {
  //   printJob(job);
  // });

  logger.verbose('STARTING TO FETCH FILES');
  await fetchFilesFromServer();

  logger.verbose('STARTING TO READ FROM CACHE');
  // Now process the downloaded results files
  await readFilesFromCache();

  logger.verbose('final jobs:');
  jobs.forEach((job) => {
    logger.debug(`job ${job.jid}, woot`);
    // printJob(job);
  });

  logger.info('searching complete');
};

/**
 * Perform one-time initialization when the server starts.
 */
export const init = (headlessBrowserDriver: HBrowserInstance, opts?: FetchOptions): void => {
  // Clear the list
  jobs.length = 0;

  browser = headlessBrowserDriver;

  options = { ...defaultOptions, ...(opts || {}) };

  if (options.debugFetchSearchResultsFromFiles) {
    logger.warn(warningColor(`${logPrefix}DEBUG: ignoring the servers, fetching from files!`));
  }
  if (options.debugUseShortRandomWaitTime) {
    logger.warn(warningColor(`${logPrefix}DEBUG: using short wait time!`));
  }
};
