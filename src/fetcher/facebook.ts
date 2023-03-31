import { FacebookSearchDetails } from '../database/models/dbSearches';
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
