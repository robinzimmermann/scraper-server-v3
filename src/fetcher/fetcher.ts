import { logger } from '../utils/logger/logger';
import * as dbSearches from '../database/dbSearches';
import chalk from 'chalk';
import {
  CraigslistRegion,
  FacebookRegion,
  Source,
  CraigslistSubcategory,
  Search,
} from '../database/models/dbSearches';
import { getRandWaitTime } from './helper';
import { waitWithProgress } from '../utils/utils';
import * as craigslistFetcher from './craigslist';
import * as facebookFetcher from './facebook';
import { cacheDir } from '../globals';

export type CraigslistJobDetails = {
  searchTerm: string;
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
  details: CraigslistJobDetails | FacebookJobDetails;
  randomWaitTime: number;
  searchResultsHomeDir: string;
  url: string;
};

export type CraigslistFetchOptions = {
  minWaitTimeBetweenRequests: number; // milliseconds
  maxRandomExtraTimeBetweenRequest: number; // milliseconds
};

export type FetchOptions = {
  debugUseShortRandomWaitTime?: boolean;

  craigslistFetchOptions: CraigslistFetchOptions;
};

const warningColor = chalk.yellow;

const craigslistDefaults = <CraigslistFetchOptions>{
  // Wait time between reqwests will be:
  //
  //   minWaitTimeBetweenRequests + random amount up to maxRandomExtraTimeBetweenRequest
  //
  minWaitTimeBetweenRequests: 2000, // milliseconds
  maxRandomExtraTimeBetweenRequest: 5000, // milliseconds
};

const defaults = <FetchOptions>{
  /**
   * For debugging, instead of waiting the full random wait time, wait for a very short
   * time so things move along more quickly.
   *
   * Prod should be false.
   */
  debugUseShortRandomWaitTime: true,

  craigslistFetchOptions: craigslistDefaults,
};

const logPrefix = '[fetcher] ';

let options: FetchOptions = defaults;

const jobs = <Job[]>[];
let jobIdCounter = 1;

let jobPointer: number;

const printJob = (job: Job): string => {
  if (!job) {
    return '';
  }
  let details: CraigslistJobDetails | FacebookJobDetails;
  let detailsStr: string;
  switch (job.source) {
    case Source.craigslist:
      details = <CraigslistJobDetails>job.details;
      detailsStr = `searchTerm=${chalk.dim(
        details.searchTerm,
      )},region=${chalk.dim(details.region)},subcategory=${chalk.dim(
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
  )},url=${chalk.dim(job.url)}${chalk.bold('}')}`;
};

const addJob = (
  search: Search,
  source: Source,
  jobDetails: CraigslistJobDetails | FacebookJobDetails,
): void => {
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

  switch (source) {
    case Source.craigslist:
      url = craigslistFetcher.composeUrl(
        craigslistJobDetails.region,
        craigslistJobDetails.craigslistSubcategory,
        jobDetails.searchTerm,
      );
      break;
    case Source.facebook:
      url = facebookFetcher.composeUrl(
        facebookJobDetails.region,
        facebookJobDetails.searchTerm,
      );
      break;
  }

  const job = <Job>{
    jid: jobIdCounter++,
    sid: search.sid,
    source,
    details: jobDetails,
    randomWaitTime,
    searchResultsHomeDir: `${cacheDir}/${search.alias}`,
    url,
  };

  jobs.push(job);
};

const doJobSearchResults = async (job: Job): Promise<void> => {
  // TIP: If not awaiting something with a promise, then create promise
  switch (job.source) {
    case Source.craigslist:
      await craigslistFetcher.fetchSearchResults(job);
      break;
    case Source.facebook:
      await facebookFetcher.fetchSearchResults(job);
      break;
  }
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
 */
const buildJobs = (): void => {
  // Create a job for each search. A search may result in multiple jobs
  const validSearches = dbSearches.getValidEnabledSearches();
  validSearches.forEach((search) => {
    // Add separate jobs for each source of a search
    search.sources.sort().forEach((source) => {
      getVendorJobs(source, search);
    });
  });
};

/**
 * Initiate a search
 */
export const doSearch = async (): Promise<void> => {
  logger.info(`fetching search results...`);

  // Initialize all variables that need it
  jobPointer = 0;
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

  while (jobPointer < jobs.length) {
    const job = jobs[jobPointer];

    const doTheFetch = doJobSearchResults(job);

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

/**
 * Perform one-time initialization when the server starts.
 */
export const init = (opts?: FetchOptions): void => {
  options = { ...defaults, ...(opts || {}) };

  if (options.debugUseShortRandomWaitTime) {
    logger.warn(warningColor(`${logPrefix}DEBUG: using short wait time!`));
  }
};
