import {
  CraigslistSearchDetails,
  CraigslistSubcategory,
  CraigslistRegion,
  getCraigslistSubcategoryCode,
  getCraigslistBaseUrl,
} from '../database/models/dbSearches';
import { logger } from '../utils/logger/logger';
import { CraigslistJobDetails, Job } from './fetcher';

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
  searchDetails.searchTerms.forEach((searchTerm) =>
    searchDetails.regions.forEach((region) =>
      searchDetails.craigslistSubcategories.forEach((craigslistSubcategory) =>
        callback({ searchTerm, region, craigslistSubcategory }),
      ),
    ),
  );
  return jobs;
};

export const composeUrl = (
  region: CraigslistRegion,
  subCategory: CraigslistSubcategory,
  searchTerm: string,
): string => {
  return `https://${getCraigslistBaseUrl(
    region,
  )}/search/${getCraigslistSubcategoryCode(
    subCategory,
  )}?query=${encodeURIComponent(searchTerm)}`;
};

export const fetchSearchResults = async (job: Job): Promise<void> => {
  logger.silly(
    `craigslist.fetchSearchResults() job ${job.jid} about to contact the server`,
  );
  return new Promise((resolve) => {
    // Simulate doing a search
    setTimeout(() => {
      logger.silly(
        `craigslist.fetchSearchResults() job ${job.jid} got a response from server`,
      );
      resolve();
    }, 1000);
  });
};
