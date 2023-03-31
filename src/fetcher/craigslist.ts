import { CraigslistSearchDetails } from '../database/models/dbSearches';
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
