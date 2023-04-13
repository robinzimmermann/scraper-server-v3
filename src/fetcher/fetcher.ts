import fs from 'fs';
import chalk from 'chalk';

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
import { cacheDir, craigslistCacheDir } from '../globals';
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

export type FacebookJobDetails = {
  searchTerm: string;
  region: FacebookRegion;
};

export type Job = {
  jid: number;
  sid: string;
  source: Source;
  alias: string;
  details: CraigslistJobDetails | FacebookJobDetails;
  randomWaitTime: number;
  searchResultsHomeDir: string;
  searchResultsFilename: string;
  url: string;
  pageNum: number;
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

const warningColor = chalk.yellow;

export const dateFormat = 'yyyy-MM-dd';

let options: FetchOptions = defaultOptions;

let browser: HBrowserInstance;

const jobs = <Job[]>[];
let jobIdCounter = 1;

// let jobPointer: number;

// Only puboic for testing purposes.
export const getJobs = (): Job[] => {
  return jobs;
};

export const printJob = (job: Job): string => {
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
      detailsStr = `searchTerm=${chalk.dim(
        details.searchTerm,
      )},region=${chalk.dim(details.region)}`;
      break;
  }
  return `{job=${chalk.dim(job.jid)},search=${chalk.dim(
    job.sid,
  )},source=${chalk.dim(job.source)},${chalk.bold(
    'details={',
  )}${detailsStr}},randomWaitTime=${chalk.dim(
    job.randomWaitTime,
  )},searchResultsHomeDir=${chalk.dim(
    job.searchResultsHomeDir,
  )},filename=${chalk.dim(job.searchResultsFilename)},url=${chalk.dim(
    job.url,
  )}${chalk.bold('}')},pageNum=${chalk.dim(job.pageNum)}`;
};

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
  if (source === Source.craigslist) {
    randomWaitTime = getRandWaitTime(
      options.craigslistFetchOptions.minWaitTimeBetweenRequests,
      options.craigslistFetchOptions.maxRandomExtraTimeBetweenRequest,
      options.debugUseShortRandomWaitTime,
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
      url = facebookFetcher.composeUrl(
        facebookJobDetails.region,
        facebookJobDetails.searchTerm,
      );
      searchResultsHomeDir = '/tmp/ggg';
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

export const addAnotherPageToJob = (job: Job): void => {
  logger.verbose(`adding a new job after job ${job.jid}`);
  const pos = jobs.findIndex((j) => (j.jid = job.jid));
  if (pos === -1) {
    logger.warn(
      `tried to add a next page for job ${job.jid} but it was not in my jobs list`,
    );
    return;
  }

  const search = dbSearches.getSearchBySid(job.sid);
  if (!search) {
    logger.error(`search ${chalk.bold(job.sid)} does not exist`);
    return;
  }
  addJob(search, job.source, job.details, job.pageNum + 1);
  logger.verbose(`creating a new job, them moving it ${jobs.indexOf(job) + 1}`);
  // Move the new job to one after the current job
  moveItemInArray(jobs, jobs.length - 1, jobs.indexOf(job) + 1);
  logger.verbose('new jobs!');
  jobs.forEach((job) => {
    logger.debug(`${printJob(job)}`);
  });
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

const getVendorJobs = (source: Source, search: Search): void => {
  // Within craigslist sources, there are individual jobs for search terms, and then individual jobs for regions within each search term
  // Within facebook sources, there are individual jobs for search terms, and regions
  switch (source) {
    case Source.craigslist:
      craigslistFetcher.getJobs(
        search.craigslistSearchDetails,
        (craigslistJobDetails: CraigslistJobDetails) => {
          addJob(search, source, {
            searchTerm: craigslistJobDetails.searchTerm,
            searchTermNum: craigslistJobDetails.searchTermNum,
            region: craigslistJobDetails.region,
            craigslistSubcategory: craigslistJobDetails.craigslistSubcategory,
          });
        },
      );
      break;
    case Source.facebook:
      facebookFetcher.getJobs(
        search.facebookSearchDetails,
        (facebookJobDetails: FacebookJobDetails) => {
          addJob(search, source, {
            searchTerm: facebookJobDetails.searchTerm,
            region: facebookJobDetails.region,
          });
        },
      );
      break;
    default:
    // Should never get here.
  }
};

/**
 * Build up the jobs that will be required by searches.
 * Only public for testing purposes.
 */
export const buildJobs = (): void => {
  // Create a job for each search. A search may result in multiple jobs
  const validSearches = dbSearches.getValidEnabledSearches();
  validSearches.forEach((search) => {
    // Add separate jobs for each source of a search
    search.sources.sort().forEach((source) => {
      getVendorJobs(source, search);
    });
  });
};

const fetchFilesFromServer = async (): Promise<void> => {
  if (options.debugFetchSearchResultsFromFiles) {
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

    const waitProgress = (
      _millisThisTick: number,
      _totalMillisSoFar: number,
    ): void => {
      // TODO Do progress update here
      // if (totalMillisSoFar >= job.randomWaitTime) {
      //   logger.silly(`job ${job.jid} finished waiting ${totalMillisSoFar} ms`);
      // }
    };
    const doTheWait = waitWithProgress(job.randomWaitTime, waitProgress);

    const response = await Promise.all([doTheFetch, doTheWait]);
    // Don't care about the responses, just continue when all promises are done.
    logger.silly(`job ${job.jid} finished. response=${response.join(', ')}`);

    jobPointer++;
  }
};

const readFilesFromCache = (): void => {
  logger.debug('process files in cache here');

  let jobPointer = 0;

  while (jobPointer < jobs.length) {
    const job = jobs[jobPointer];

    // job.searchResultsHomeDir
    const cacheName = buildCacheName(job);

    logger.verbose(`reading ${cacheName}`);
    logger.verbose(`url: ${job.url}`);
    switch (job.source) {
      case Source.craigslist:
        craigslistFetcher.processSearchResultsPage(job);
        break;
      case Source.facebook:
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

  buildJobs();

  if (!jobs || jobs.length === 0) {
    logger.warn(warningColor('nothing to fetch!'));
    return;
  }

  // This is temporary until a better way is found to list the jobs
  jobs.forEach((job) => {
    logger.debug(`${printJob(job)}`);
  });

  await fetchFilesFromServer();

  // Now process the downloaded results files
  readFilesFromCache();

  logger.info('searching complete');
};

/**
 * Perform one-time initialization when the server starts.
 */
export const init = (
  headlessBrowserDriver: HBrowserInstance,
  opts?: FetchOptions,
): void => {
  // Clear the list
  jobs.length = 0;

  logger.debug('headlessBrowserDriver:', headlessBrowserDriver);
  browser = headlessBrowserDriver;

  options = { ...defaultOptions, ...(opts || {}) };

  if (options.debugFetchSearchResultsFromFiles) {
    logger.warn(
      warningColor(
        `${logPrefix}DEBUG: ignoring the servers, fetching from files!`,
      ),
    );
  }
  if (options.debugUseShortRandomWaitTime) {
    logger.warn(warningColor(`${logPrefix}DEBUG: using short wait time!`));
  }
};
