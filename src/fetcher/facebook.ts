// import * as puppeteer from 'puppeteer';
// import { HeadlessBrowserInstance } from '../api/headlessBrowser/HeadlessBrowserInstance';
import { HBrowserInstance } from '../api/hbrowser/HBrowser';

import {
  FacebookRegion,
  FacebookSearchDetails,
  getFacebookLocation,
} from '../database/models/dbSearches';
import { logger } from '../utils/logger/logger';
import { FacebookJobDetails, Job } from './fetcher';

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
  searchDetails.searchTerms.forEach((searchTerm) =>
    searchDetails.regionalDetails.forEach((regionalDetail) =>
      callback({ searchTerm, region: regionalDetail.region }),
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
